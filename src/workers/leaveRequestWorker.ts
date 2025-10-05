import { LeaveRequestServices } from "../services/LeaveRequestService";
import { QueueService } from "../services/QueueService";


export class LeaveRequestWorker {
    private leaveRequestService: LeaveRequestServices;
    private queueService: QueueService;

    constructor(){
        this.leaveRequestService = new LeaveRequestServices();
        this.queueService = new QueueService();
    };

    async start(): Promise<void> {
        console.log('Starting leave Request Worker ...');

        await this.queueService.consumeLeaveRequests(async (message) => {
            console.log('Processing leav request: ', message.id);
            await this.leaveRequestService.processLeaveRequest(message)
        });
        console.log('Leave Request Worker started and listening for messages');
    }

    async stop(): Promise<void> {
        await this.queueService.close();
        console.log('Leave Request Worker stopped')
    }
}