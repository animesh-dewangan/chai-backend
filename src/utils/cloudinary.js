import {v2 as cloudinary} from "cloudinary"
// file system is a node built in library used for file operations read, delete etc.
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

// we try to create method for upload.
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
    // upload the file on cloudinary.
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : auto
        })
    // file has been uploaded successfully..
        console.log("File is uploaded on cloudinary", response.url) // url upload hone k bad ka
        return response;
    } catch (error) {
        fs.unlink(localFilePath) // remove the locally saved temperory file as the upload operation got failed
        console.log("error file can not be uploaded on cloudinary", error)
        return null
    }
}

export {uploadOnCloudinary}
