import { Response } from "express";
import { ZodError } from "zod";


export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?:{
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

export abstract class BaseController {
    protected sendSuccess<T>(res: Response, data: T, meta?: any): Response{
        const response: ApiResponse<T> = {
            success: true,
            data,
            meta
        };
        return res.status(200).json(response);
    }   

    protected sendError(res: Response, message: string, code: string = 'ERROR', statusCode: number = 400, details?: any): Response {
        const response: ApiResponse = {
            success: false,
            error: {
                code,
                message,
                details
            }
        }
        return res.status(statusCode).json(response)
    };

    protected handleValidationError(res: Response, error: ZodError): Response {
        const details = error.errors.map(err => ({
            // field: err.path.join('.') || 'general',
            message: err.message
        }));

        return this.sendError (
            res,
            'validation failed',
            'VALIDATION_ERROR',
            422,
            details
        );
    }
}
