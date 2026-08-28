import {asyncHandler} from "../utils/asyncHandler.js" // curly braces are for named export.


const registerUser = asyncHandler( async(req, res) => {
    return res.status(200).json({
        message: "ok"
    })
})

export {registerUser}