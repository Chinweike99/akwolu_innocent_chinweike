import { Employee, LeaveRequest } from "../models";
import { BaseRepository } from "./BaseRepository";


export class LeaveRequestRepository extends BaseRepository<LeaveRequest> {
    constructor() {
        super(LeaveRequest);
    }

    async findByEmployeeId(employeeId: string): Promise<LeaveRequest[]>{
        return LeaveRequest.findAll({ 
            where: { employeeId },
            order: [['createdAt', 'DESC']]
        });
    }

    async findByIdempotencyKey(idempotencyKey: string): Promise<LeaveRequest> {
        return LeaveRequest.findOne({ where: { idempotencyKey } }) as Promise<LeaveRequest>;
    }

    async updateStatus(id: string, status: "APPROVED" | "REJECTED" | "PENDING_APPROVAL", processedAt: Date = new Date()): Promise<[number]> {
        return LeaveRequest.update(
            { status, processedAt},
            { where: { id }}
        )
    }

    async getPendingRequests(): Promise<LeaveRequest[]> {
        return LeaveRequest.findAll({
            where: { status: "PENDING" },
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['id', 'name', 'email']    
            }],
            order: [['createdAt', 'DESC']]
        })
    }

}