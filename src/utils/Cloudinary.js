import { v2 as cloudinary} from "cloudinary";
import fs from 'fs'

const uplodonCloudinary= async(localFilePath)=>{
    try {
        if (!localFilePath) return null

        const response= await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" 
        })
        console.log("file is upload", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
 }


cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET
});


export{uplodonCloudinary}