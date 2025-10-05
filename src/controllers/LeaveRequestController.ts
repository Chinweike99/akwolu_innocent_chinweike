import { Request, Response } from "express";
import { LeaveRequestServices } from "../services/LeaveRequestService";
import { BaseController } from "./BaseController";
import { createLeaveRequestSchema } from "../validations/schemas";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";



export class LeaveRequestController extends BaseController {
    private leaveRequestService: LeaveRequestServices;

    constructor(){
        super();
        this.leaveRequestService = new LeaveRequestServices();
    }

    createLeaveRequest = async(req: Request, res: Response) => {
        try {
            const validateData = createLeaveRequestSchema.parse(req.body);
            const result = await this.leaveRequestService.createLeaveRequest(validateData);
            return this.sendSuccess(res, result)
        } catch (error) {
              if (error instanceof ZodError) {
                return this.handleValidationError(res, error);
            }
            
            if (error instanceof AppError) {
                return this.sendError(res, error.message, error.code, error.statusCode);
            }

            console.error('Create leave request error:', error);
            return this.sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
        }
    }

}