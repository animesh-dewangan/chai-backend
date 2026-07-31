// first thing to load is dotenv file 

// Method-1
//required("dotenv").config({path: "./env"}); // this will run perfactily fine but it disturb's the consistency of code so it's less preferable. 

// Method-2
import dotenv from "dotenv";
dotenv.config();
// dotenv.config({path: "./env"});
// this one is better and new method it hold consistency while both of them work's fine.
// this one is not even in dotenv website it's an experimental feature.

// import mongoose from "mongoose";
// import DB_NAME from "./constants"
import express from "express";
import connectDB from "./db/index.js";



connectDB();









/* 
Approach One
const app = express();

// this is a common approach to connect to a database 
// create function and call it
// function connectDB(){};  

// connectDB();

// more professional approach use iffe.
// IIFE stands for Immediately Invoked Function Expression.
// It is a function that is created and executed immediately after it is defined.

( async() => {
    try {
        await mongoose.connect(`${process.env.MONNGODB_URL}/${DB_NAME}`);

        app.on("error", (error) => {
            console.error("error :", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on Port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error(error);
        //throw error
    }
})()
*/