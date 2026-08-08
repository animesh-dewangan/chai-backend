import mongoose, {Schema} from "mongoose"
// const {Schema} = moongose

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    }, 

    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    avatar: {
        type: String,  //Cloudinary url
        required: true,
    }, 

    coverImage: {
        type: String,
    },

    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],

    password: {     //password should not be saved directly on the DB as data get's leek it's a threat and
        // we can not have encripted pass in Db as it makes hard to match while login credentials
        type: String,
        required: [true, "Password is required"]
    },

    refreshToken: {
        type: String
    }

}, {timestamps: true}
)

export const User = mongoose.model("User", userSchema)