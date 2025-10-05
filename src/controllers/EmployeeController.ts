import { Request, Response } from "express";
import { EmployeeService } from "../services/EmployeeService";
import { BaseController } from "./BaseController";
import { createEmployeeSchema } from "../validations/schemas";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";


export class EmployeeController extends BaseController {
    private employeeService: EmployeeService;

    constructor(){
        super()
        this.employeeService = new EmployeeService();
    };

    createEmployee = async(req: Request, res: Response): Promise<Response> =>{
        try {
            const validateData = createEmployeeSchema.parse(req.body);
            const result = await this.employeeService.createEmployee(validateData);

            return this.sendSuccess(res, result)
        } catch (error) {

            if (error instanceof ZodError){
                return this.handleValidationError(res, error)
            };
            if (error instanceof AppError) {
                return this.sendError(res, error.message, error.code, error.statusCode)
            };

            console.error('Create employee error:', error);
            return this.sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
        }
    };

    getEmployee = async(req: Request, res: Response): Promise<Response> => {
        try {
            const {id} = req.params;
            const employee = await this.employeeService.getEmployeeWithLeaveHistory(id);

            return this.sendSuccess(res, employee)
        } catch (error) {
            if (error instanceof AppError) {
                return this.sendError(res, error.message, error.code, error.statusCode);
            }
            console.error('Get employee error:', error);
            return this.sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
        }
    }
};