class AppError extends Error {  //built-in Error Class
    constructor(message, statusCode) {
        super(message); // call to parent constructer
        //super will only take message bcz built in error handler will take only one parameter i.e. message
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
        this.isOperational = true
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;