export class AppError extends Error {
    public readonly statusCode!: number;
    public readonly isOperational!: boolean;
    public readonly code!: string;

    constructor(
        message: string,
        statusCode: number,
        code: string = 'APPLICATION_ERROR',
        isOperational: boolean = true,
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        
        Error.captureStackTrace(this, this.constructor)
    }

}