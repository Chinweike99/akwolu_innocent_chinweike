import { v4 as uuidv4 } from "uuid";
import { LeaveRequestRepository } from "../repositories/LeaveRequestRepository";
import { AppError } from "../utils/errors";
import { CreateLeaveRequestInput } from "../validations/schemas";
import { EmployeeService } from "./EmployeeService";
import { QueueService } from "./QueueService";


export class LeaveRequestServices {
    private leaveRequestRepository: LeaveRequestRepository;
    private employeeService: EmployeeService;
    private queueService: QueueService;

    constructor(){
        this.leaveRequestRepository = new LeaveRequestRepository();
        this.employeeService = new EmployeeService();
        this.queueService = new QueueService();
    }

    async createLeaveRequest(input: CreateLeaveRequestInput) {
        if(input.idempotencyKey){
            const existingRequest = await this.leaveRequestRepository.findByIdempotencyKey(input.idempotencyKey);
            if(existingRequest){
                return existingRequest;
            }
        }

        // Verify employee exists
        const employeeExists = await this.employeeService.getEmployeeById(input.employeeId);
        if(!employeeExists){
            throw new AppError("Employee not found", 404);
        }

        const leaveRequestData = await this.leaveRequestRepository.create({
            ...input,
            status: 'PENDING' as const,
            idempotencyKey: input.idempotencyKey || uuidv4(),
        });

        // Publish to queue for async processing
        await this.queueService.publishLeaveRequest({
            id: leaveRequestData.id,
            employeeId: leaveRequestData.employeeId,
            startDate: leaveRequestData.startDate,
            endDate: leaveRequestData.endDate,
            idempotencyKey: leaveRequestData.idempotencyKey!,
        })
        
        return leaveRequestData;
    }

    async processLeaveRequest(leaveRequestData: {
        id: string;
        employeeId: string;
        startDate: Date;
        endDate: Date;
        idempotencyKey: string;
        retryCount?: number;
    }){
        try {
            // Convert to Date objects (in case they are strings)
            const startDate = new Date(leaveRequestData.startDate);
            const endDate = new Date(leaveRequestData.endDate);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error('Invalid date values received in leaveRequestData');
            }

            // Calculate leave duration in days
            const durationMs = endDate.getTime() - startDate.getTime();
            const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1;
            let status: 'APPROVED' | 'PENDING_APPROVAL' = 'PENDING_APPROVAL';
            if(durationDays <= 2){
                status = 'APPROVED'
            };

            await this.leaveRequestRepository.updateStatus(
                leaveRequestData.id,
                status,
                new Date()
            )
        console.log(`Leave request ${leaveRequestData.id} processed with status: ${status}`);
        } catch (error) {
            console.error('Error processing leave request:', error);
            throw error;
        }
    }
}