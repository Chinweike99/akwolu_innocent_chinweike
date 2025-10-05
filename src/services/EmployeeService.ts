import { DepartmentRepository } from "../repositories/DepartmentRepository";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { AppError } from "../utils/errors";
import { CreateEmployeeInput } from "../validations/schemas";

export class EmployeeService {
    private employeeRepository: EmployeeRepository;
    private departmentRepository: DepartmentRepository;

    constructor(){
        this.employeeRepository = new EmployeeRepository();
        this.departmentRepository = new DepartmentRepository(); 
    }

    async createEmployee(input: CreateEmployeeInput){
        const existingEmployee = await this.employeeRepository.findByEmail(input.email);
        if(existingEmployee){
            throw new AppError("Employee with this email already exists", 409);
        }

        const department = await this.departmentRepository.findById(input.departmentId);
        if(!department){
            throw new AppError("Department not found", 404);
        }
        return this.employeeRepository.create(input)
    }

    async getEmployeeById(id: string){
        return this.employeeRepository.exists(id)
    }

    async getEmployeeWithLeaveHistory(id: string) {
        const employee = await this.employeeRepository.findByIdWithLeaveHistory(id);
        
        if (!employee) {
        throw new AppError('Employee not found', 404);
        }

        return employee;
    }

    async employeeExists(id: string): Promise<boolean> {
        return this.employeeRepository.exists(id);
    }

}