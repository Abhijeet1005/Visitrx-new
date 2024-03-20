import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

//Needed to do this otherwise the envs were not accessible with process.env
import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
})


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localPath) => {
    try {
        if (!localPath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localPath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        if(response){
            fs.unlinkSync(localPath)
        }
        console.log("file uploaded on cloudinary ", response.url);
        return response;

    } catch (error) {
        fs.unlinkSync(localPath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const removeFromCloudinary = async (url)=>{
    try {
        if(!url) return null

        //Regex for public ID extraction 
        //It takes the ID between last / and . that way all extensions are supported
        const regex = /\/v\d+\/([^\/]+)\.[^\/]+$/;
        const match = url.match(regex);
        console.log(match)
        const assetDetails = await cloudinary.api.resource(match[1]) // Need to fetch the details because for response below the resource_type: auto doesnt work properly
        const response = await cloudinary.uploader.destroy(assetDetails.public_id,{resource_type: assetDetails.resource_type})
        if(response){
            console.log("Old file removed")
        }
    } catch (error) {
        return null
    }

}



export {uploadOnCloudinary,removeFromCloudinary}