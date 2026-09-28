// import mongoose, { schema } from "mongoose";

import mongoose from "mongoose";
// mongoose is an object which provide various methods and properties to inherit from mongooose Library.
// so we deconstruct the Schema property from mongoose object to use it in our code.
const {Schema} = mongoose; // now Schema = mongoose.Schema

const subscriptionSchema = new Schema({ // we defined the schema 

    subscriber: { // subscriber is the user who subscribe to the channel owner. and it stores object id of User instance.
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    channel:{ // channel is the user who is the owner of the channel. and it stores object id of User instance.
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true }
)

export const Subscription = mongoose.model("Subscription", subscriptionSchema) // created and exported it