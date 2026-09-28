import {v2 as cloudinary} from "cloudinary"
// file system is a node built in library used for file operations read, delete etc.
import fs from "fs"
import asyncHandler from "./asyncHandler.js"

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
            resource_type : "auto"
        })
    // file has been uploaded successfully..
        console.log("File is uploaded on cloudinary", response.url) // url upload hone k bad ka
        fs.unlinkSync(localFilePath, (err) => {
            if(err){
                console.log("Failed to Delete temp files after uploading !!", err)
            } else {
                console.log("Files deleted Succesfully after uploading")
            }
        })
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath, (err) => {
            if(err){
                console.log("Error in deleting the files")
            } else {
                console.log("Files deleated Succesfully..!!!")
            }
        }) // remove the locally saved temperory file as the upload operation got failed
        console.log("error file can not be uploaded on cloudinary", error)
        return null
    }
}

const deleteFromCloudinary = asyncHandler(async (avatarURL) => {
    // "https://res.cloudinary.com/demo/image/upload/v1712345678/myapp/avatars/user123.jpg" we get this 
    // apublic id = myapp/avatars/user123 

    if(!avatarURL) return null

    const parts = avatarURL.split("/")

    const uploadIndex = parts.indexOf("upload")

    const publicIdParts  = parts.slice(uploadIndex+1)

    if(publicIdParts?.[0]?.startsWith("v")){ // the version number part is not always true.
        publicIdParts.shift()
    }

    const extendedPublicId = publicIdParts.join("/")

    const publicId = extendedPublicId.substring(0, extendedPublicId.lastIndexOf("."))

    return result = await cloudinary.uploader.destroy(publicId, {resource_type: "auto"})
})

export {uploadOnCloudinary, deleteFromCloudinary}
