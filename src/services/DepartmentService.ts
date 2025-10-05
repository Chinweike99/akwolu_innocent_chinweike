import { DepartmentRepository } from "../repositories/DepartmentRepository";
import { AppError } from "../utils/errors";
import { CreateDepartmentInput } from "../validations/schemas";



export class DepartmentService {
    private departmentRepository: DepartmentRepository;

    constructor(){
        this.departmentRepository = new DepartmentRepository();
    }

    async createDepartment(input: CreateDepartmentInput){
        const existingDepartment = await this.departmentRepository.findByName(input.name);
        if(existingDepartment){
            throw new AppError("Department with this name already exists", 409);
        }
        return this.departmentRepository.create(input);
    }

    async getDepartmentEmployees(departmentId: string, page: number, limit: number){
        if(page < 1)throw new AppError("Page number must be greater than 0", 400);
        if(limit < 1 || limit > 50) throw new AppError("Limit must be greater than 0", 400);
        const department = await this.departmentRepository.getEmployeesWithPagination(
            departmentId, page, limit
        )

        if(!department){
            throw new AppError("Department not found", 404);
        }

        const totalEmployees = await this.departmentRepository.getEmployeesCount(departmentId);
        const totalPages = Math.ceil(totalEmployees / limit);
        return {
            department:{
                id: department.id,
                name: department.name
            },
            employees: department.employees || [],
            pagination:{
                currentPage: page,
                totalPages,
                totalEmployees,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            }
        }

    }

}



