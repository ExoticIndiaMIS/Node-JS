export class AppWarning {
    constructor(message) {
        this.message = message;
        this.status = true;
    }

    static missingInput(message = 'No input provided') {
        return new AppWarning(message);
    }

    static noData(message = 'No data found') {
        return new AppWarning(message);
    }
}

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = true;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message = 'Bad Request') {
        return new AppError(message, 400);
    }

    static missingInput(message = 'No input provided') {
        return new AppError(message, 400);
    }

    static unauthorized(message = 'Unauthorized') {
        return new AppError(message, 401);
    }

    static forbidden(message = 'Forbidden') {
        return new AppError(message, 403);
    }

    static notFound(message = 'Not Found') {
        return new AppError(message, 404);
    }

    static internal(message = 'Internal Server Error') {
        return new AppError(message, 500);
    }
}

export default AppError;