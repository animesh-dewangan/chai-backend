import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async function() {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\n DataBase iis Connected !! DB Host : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("DataBase Connection Error:", error);
        // Method-1 
        // throw error 

        // Method-2
        process.exit(1);
        // process is a nodejs property it is provided by nodejs it help to exit or change instance of current process learn it.
    }
}

export default connectDB;