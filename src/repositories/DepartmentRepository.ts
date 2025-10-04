import { Department, Employee } from "../models";
import { BaseRepository } from "./BaseRepository";


export class DepartmentRepository extends BaseRepository<Department> {
    constructor() {
        super(Department);
    }

    async findByName(name: string): Promise<Department | null>{
        return Department.findOne({ where: { name } });
    }

    async getEmployeesWithPagination(departmentId: string, page: number, limit: number){
        const offset = (page - 1) * limit;
        const department = await Department.findByPk(departmentId);
        if(!department) return null;

        // get employees with pagination
        const employees = await Employee.findAll({
            where: { departmentId },
            limit,
            offset,
        })

        return {
            ...department.get({plain: true}),
            employees
        }
    }

    async getEmployeesCount(departmentId: string): Promise<number>{
        return Employee.count({where: { departmentId }});
    }

}