// errorHandler.js

import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    // Log the error for debugging purposes
    console.error(err.stack);

    // Set a default error status
    let statusCode = 500;
    
    // If the error is an instance of ApiError, use its status code
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
    }

    // Send a JSON response with the error details
    res.status(statusCode).json({
        error: {
            message: err.message || "Internal Server Error"
        }
    });
};

export default errorHandler;
