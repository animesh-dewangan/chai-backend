import mongoose, {Schema} from "mongoose"
// const {Schema} = moongose
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


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

// we use (pre) middle-ware which will execute before each save operation on DB in user model schema.
// save is the event on userSchema on which this function run before it will be saved in DB.
// we don't use arrow func here because the function need refrence that we want to do this operation on which data and arrow func don't have refrence.
userSchema.pre("save", function(next){
    // we only want to run this password encryption when password is modified.
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password, 10) // the number here is salt value.
    next()
})

// checking credentials from db the password user gave is that similar from what stored in db.
// but our db stored the hash password so we gave this task to bcypt to compare both the password.
// so basically whenever a mongoose document is creadted from userSchema this methods will be attached in it's object.
// when we want to check credential we use findOne method this gives mongoose document that document have this function and we call it from his refrence.
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = async function(){
    return await jwt.sign(
        { // payload
            _id : this._id,
            username : this.username,
            email : this.email
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : porcess.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = await function(){
    return await jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema)