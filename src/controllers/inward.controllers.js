import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Inward } from "../models/inward.model.js";
import { generateToken } from "../utils/tokenizer.js";
import { User } from "../models/user.model.js";

const getAllInward = asyncHandler(async(req,res)=>{

    const inwards = await Inward.find()

    if(!inwards){
        throw new ApiError(401,"Unable to fetch inward entries")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Inwards fetched successfully",
            inwards
        )
    )
})

const addInward = asyncHandler(async(req,res)=>{

    const { type, details, returnType } = req.body;
    let assets;

    if(req.headers["user-agent"] === "PostmanRuntime/7.37.0"){
        assets = JSON.parse(req.body.assets)

    }else{
        assets = req.body.assets;
    }
    



    if (!(assets && type)) {
        throw new ApiError(400, "Fill the essential fields");
    }

    if (assets.length === 0) {
        throw new ApiError(400, "Assets cannot be empty");
    }

    let allInwards = [];
    let detailsForEmail = []

    const invoicePhotoPath = req.files?.invoicePhoto[0]?.path;
    const productImagePath = req.files?.productImage[0]?.path;
    let cloudinaryInvoiceImage = null;
    let cloudinaryProductImage = null;


    if (invoicePhotoPath && productImagePath) {
        cloudinaryInvoiceImage = await uploadOnCloudinary(invoicePhotoPath);
        cloudinaryProductImage = await uploadOnCloudinary(productImagePath);
    }
    else{
        throw new ApiError(400,"Invoice and product images are needed")
    }

    for (const element of assets) {
        const { productName, quantityTotal, unit } = element;

        const newInward = await Inward.create({
            productName,
            returnType,
            type,
            details,
            quantityTotal,
            unit,
            invoiceImage: cloudinaryInvoiceImage?.url,
            productImage: cloudinaryProductImage?.url,
            createdBy: req.user._id,
        });

        allInwards.push(newInward);

        let detail = {
            name: newInward.productName,
            quantity: newInward.quantityTotal
        }
        detailsForEmail.push(detail)
    }

    /*
      - now we will have the array of inward entries
      - we will send that array in token (need to fetch all the name and quantity to display to asset admin)
      - on verify we create a new asset entry with details from the inward documents (then reference the asset to correponding inward)
    */
    const data = {
        allInwards,
        detailsForEmail,
    }
    const token = generateToken(data)
    
    const user = await User.find({
        role: "SecurityAdmin"
    }).select("-password -refreshToken")

    const emailContent = `<h1>To verify the addition of the following assets from security: </h1>`

    detailsForEmail.forEach(detail => {
        emailContent += `<p>Product: ${detail.name}, Quantity: ${detail.quantity}</p>`;
    })
    emailContent += `<br><a href="${process.env.SECURITY_TO_ASSET}/?token=${token}">Click Here</a>`;
    
    const emailSubject = "Security Inward Email";

    const emailSent = await emailer(user.email, emailSubject, emailContent);
    
    if (emailSent) {
        // Email sent successfully
        return res.status(200).json(new ApiResponse(200, "Email sent successfully", null));
    } else {
        // Failed to send email
        throw new ApiError(500, "Something happened on our end while sending the email");
    }
})

export {getAllInward,addInward}