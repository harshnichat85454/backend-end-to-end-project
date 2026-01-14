const asyncHandler = async (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((error) => next(error))
    }
}

export {asyncHandler};

// const asyncHandler = () => {}
// const asyncHandler = (funct) => {}
// const asyncHandler = (funct) => async () => {}

// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }


