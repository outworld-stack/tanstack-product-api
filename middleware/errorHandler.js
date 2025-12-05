export const errorHandler = (err, req, res, next) => {
    // Make sure we always respond with JSON
    res.setHeader('Content-Type', 'application/json');
    
    const statusCode = res.statusCode === res.statusCode ? res.statusCode : 500;
    res.status(statusCode).json({ 
        success: false,
        message: err.message, 
        stack: process.env.NODE_ENV === 'production' ? null : err.stack 
    });
}