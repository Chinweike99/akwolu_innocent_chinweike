import { Department, Employee, LeaveRequest } from "../models";
import { BaseRepository } from "./BaseRepository";



export class EmployeeRepository extends BaseRepository<Employee> {
    constructor() {
        super(Employee);
    }

    async findByEmail(email: string): Promise<Employee | null>{
        return Employee.findOne({ where: { email } });
    }

    async findByDepartment(departmentId: string): Promise<Employee[]>{
        return Employee.findAll({ where: { departmentId } });
    }

    async findByIdWithLeaveHistory(id: string): Promise<Employee | null>{
        return Employee.findByPk(id,{
            include:[ {
                model: Department,
                as: 'department',
                attributes: ['id', 'name']
            },
            {
                model: LeaveRequest,
                as: 'leaveHistories',
                attributes: ['id', 'startDate', 'endDate', 'status', 'reason'],
                order: [['createdAt', 'DESC']],
                limit: 10
            }]
        })
    }

    async exists(id: string): Promise<boolean>{
        const count = await Employee.count({ where: { id } });
        return count > 0;
    }

}