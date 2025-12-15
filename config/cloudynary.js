 const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config(); 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const claudynaryUpload=async (filepath)=>{
    try {
        const result = await cloudinary.uploader.upload(filepath,{ folder: "blog-usersids",resource_type:"raw" });
        return result;
    } catch (error) {
        throw new Error("Cloudinary upload failed");
    }
}

module.exports = { claudynaryUpload };
