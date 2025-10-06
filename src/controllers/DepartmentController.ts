import { Request, Response } from "express";
import { DepartmentService } from "../services/DepartmentService";
import { BaseController } from "./BaseController";
import { createDepartmentSchema, paginationSchema } from "../validations/schemas";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";




export class DepartmentController extends BaseController {
    private departmentService: DepartmentService;

    constructor(){
        super();
        this.departmentService = new DepartmentService();
    }
    
    createDepartment =  async(req: Request, res: Response): Promise<Response> => {
        try {
            const validateData = createDepartmentSchema.parse(req.body);
            const department = await this.departmentService.createDepartment(validateData);
            return this.sendSuccess(res, department)
        } catch (error) {
            if(error instanceof ZodError){
                return this.handleValidationError(res, error)
            }
            if(error instanceof AppError){ return this.sendError(res, error.message, error.code, error.statusCode)};
            console.error('Create department error: ', error);
            return this.sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500)
        }
    }

    getDepartmentEmplyees = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const pagination = paginationSchema.parse(req.query);
            
            const response = await this.departmentService.getDepartmentEmployees(id, pagination.page, pagination.limit);
            return this.sendSuccess(res, response.employees, {
                page: pagination.page,
                limit: pagination.limit,
                total: response.pagination.totalEmployees,
                totalPages: response.pagination.totalPages
            });    
        } catch (error) {
            if(error instanceof ZodError){ return this.handleValidationError(res, error) };
            if(error instanceof AppError){ return this.sendError(res, error.message, error.code, error.statusCode) };
            console.error('Get department employees error:', error);
            return this.sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
        }
    }

}

