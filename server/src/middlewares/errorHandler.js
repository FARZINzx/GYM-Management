export const errorHandler = (err, req, res, next) => {
     console.error(err.stack);
   
     const statusCode = err.statusCode || 500;
     const message = err.message || 'Internal Server Error';
   
     res.status(statusCode).json({
       success: false,
       error: {
         code: statusCode,
         message,
         ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
       }
     });
   };
   
   export const notFound = (req, res) => {
     res.status(404).json({
       success: false,
       error: {
         code: 404,
         message: 'Endpoint not found'
       }
     });
   };