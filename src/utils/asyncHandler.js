// Method-1
const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((error) => next(error))
    }
};
// cleaner code 
// const asyncHandler = (requestHandler) =>(req,res,next) => {
//     Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err));
// }

export {asyncHandler}

// Method-2
// const asyncHandler = () => {}
// const asyncHandler = (func) => {() => {}}
// const asyncHandler = (func) => () => {}

// asynchandler is a higher order function it also takes funct as input.
// const asyncHandler = (func) => async(req,res,next) => {
//     try {
//         await func(req,res,next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message:err.message
//         })
//     }
// };

// export {asyncHandler};

// this is what i have written in asynnc handler above conceptually.
// const asyncHandler = (func) => {
//     return async (req,res,next) => {
//         try {
//             await func(req,res,next)
//         } catch (error) {
//             res.status(error.code||500).json({
//                 success:false,
//             })
//         }
//     } 
// }