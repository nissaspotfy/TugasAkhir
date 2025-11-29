class BaseError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ConflictError extends BaseError {
    constructor(message = 'Conflict') {
        super(409, message);
    }
}
class NotFoundError extends BaseError {
    constructor(message = 'Not Found') {
        super(404, message);
    }
}

module.exports = {
    BaseError,
    ConflictError,
    NotFoundError
};
