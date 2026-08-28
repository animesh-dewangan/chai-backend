import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// .use function is used for middle_ware and configurations.
app.use(cors({  // this is used for custome setting the CORS(Cross Origin Resource Sharing).
    origin: process.env.CORS_ORIGIN,
    credentials:true
}));

app.use(express.json({limit: "10kb"}));
app.use(express.urlencoded({
        extended: "true",
        limit: "10kb"
    }));
    
// If someone request a static file that dosen't need server side processing before sending
// serve them directly from public folder and (express can handle that himself).
app.use(express.static("public"));
app.use(cookieParser());


// routes import
import userRouter from "./routes/user.routes.js";


// rooutes declaration
// we created an api were we req when we want do do operations related to users.
// we added /api/v1 to let us know it's v1 and if we did someupdates or created another version it helps.
app.use("/api/v1/users", userRouter)

//example - https://localhost:8000/api/v1/users/register

// Method-1 Named export.
export { app };

// Method-2
// export default app;