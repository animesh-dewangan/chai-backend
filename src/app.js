import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// .use function is used for middle_ware and configurations.
app.use(cors({  // this is used for custome setting the CORS(Cross Origin Resource Sharing).
    origin: process.env.CORS_ORIGIN,
    credentials:true
}));
app.use(cookieParser());




// Method-1 Named export.
export { app };

// Method-2
// export default app;