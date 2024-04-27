import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Inward } from "../models/inward.model.js";
import { generateToken } from "../utils/tokenizer.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { emailer } from "../utils/emailer.js";

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

//Need to take and store the values in the form similar to the form for addAsset
//Then we can just pass a single inward reference and proceed with the asset addition 
//and need to have some extra inward fields as per the old inward form and a reference array to store all the asset reference 
const addInward = asyncHandler(async(req,res)=>{

    const { type, details, returnType, assetType, broughtByContact, companyName, invoiceNo, invoiceAmount, returnDate, condition, tags, buyingDate, expiryDate } = req.body;
    let assets;

    if (!(req.body.assets && type)) {
        throw new ApiError(400, "Fill the essential fields");
    }

    if(req.headers["user-agent"].startsWith("PostmanRuntime")){
        assets = JSON.parse(req.body.assets)

    }else{
        assets = req.body.assets;
    }
    

    if (assets.length === 0) {
        throw new ApiError(400, "Assets cannot be empty");
    }

    // let allInwards = [];
    // let detailsForEmail = []

    let cloudinaryInvoiceImage = null;
    let cloudinaryProductImage = null;

    if (req.files?.productImage && req.files?.productImage[0] && req.files?.productImage[0]?.path) {
        const productImagePath = req.files.productImage[0].path;
        cloudinaryProductImage = await uploadOnCloudinary(productImagePath);
    }
    
    if (req.files?.invoiceImage && req.files?.invoiceImage[0] && req.files?.invoiceImage[0]?.path) {
        const invoiceImagePath = req.files.invoiceImage[0].path;
        cloudinaryInvoiceImage = await uploadOnCloudinary(invoiceImagePath);
    }

    const inward = await Inward.create({
        assets,
        returnType,
        type,
        details,
        invoiceImage: cloudinaryInvoiceImage?.url || null,
        productImage: cloudinaryProductImage?.url || null,
        assetType,
        broughtByContact,
        companyName,
        invoiceNo,
        invoiceAmount,
        returnDate,
        condition,
        tags,
        buyingDate,
        expiryDate,
        createdBy: req.user._id,
    })

    if(!inward){
        throw new ApiError(500, "Unable to create inward entry")
    }

    const data = {
        inwardId: inward._id
    }

    //Check from here to token to asset store
    const token = generateToken(data)
    
    const user = await User.findOne({
        role: "AssetAdmin"
    }).select("-password -refreshToken")


    let emailContent = `<h1>To verify the addition of the following assets from security: </h1>`

    assets.forEach(product => {
        emailContent += `<p>Product: ${product.productName}, Quantity: ${product.quantityTotal} ${product.unit}</p>`;
    })
    emailContent += `<br><a href="${process.env.SECURITY_TO_ASSET}/?token=${token}">Click Here</a>`;
    
    const emailSubject = "Inward to asset addition verification email";


    const emailSent = await emailer(user.email, emailSubject, emailContent);
    
    if (emailSent) {
        // Email sent successfully
        return res.status(200).json(new ApiResponse(200, "Email sent successfully", inward));
    } else {
        // Failed to send email
        throw new ApiError(500, "Something happened on our end while sending the email");
    }
})

export {getAllInward,addInward}

