import * as amqp from "amqplib";
import { Channel, Connection } from "amqplib";
import { rabbitMQConfig } from "../config/rabbitmq";
import { AppError } from "../utils/errors";


export interface LeaveRequestMessage {
    id: string;
    employeeId: string;
    startDate: Date;
    endDate: Date;
    idempotencyKey: string;
    retryCount?: number;
}

export class QueueService {
    private connection!: Connection | any;
    private channel!: Channel;
    private isConnected: boolean = false;

    async connect(){
        try {
            this.connection = await amqp.connect(rabbitMQConfig.url);
            this.channel = await this.connection.createChannel();

            
            // Assert main queue with dead-letter exchang
            await this.channel.assertQueue(rabbitMQConfig.queues.leaveRequests, {
                durable: true,
                deadLetterExchange: '',
                deadLetterRoutingKey: rabbitMQConfig.queues.deadLetter
            });

            // Assert dead-letter queue
            await this.channel.assertQueue(rabbitMQConfig.queues.deadLetter, {
                durable: true
            });
            
            this.isConnected = true;
            console.log("Connected to RabbitMQ");

        } catch (error) {
            console.error("Failed to connect to RabbitMQ", error);
            throw new AppError('Queue connection error', 500);
        }
    }


    async publishLeaveRequest(message: LeaveRequestMessage): Promise<boolean>{
        if(!this.isConnected || !this.channel){
            await this.connect();
        }

        try {
            return this.channel.sendToQueue(
                rabbitMQConfig.queues.leaveRequests,
                Buffer.from(JSON.stringify(message)),
                { persistent: true }
            )
        } catch (error) {
            console.error("Failed to publish message", error);
            throw new AppError('Failed to publish message', 500);
        }
    }

    async consumeLeaveRequests(callback: (message: LeaveRequestMessage) => Promise<void>): Promise<void> {
        if(!this.isConnected || !this.channel) {
            await this.connect();
        }

        await this.channel.consume(
            rabbitMQConfig.queues.leaveRequests,
            async (msg) => {
                if(!msg) return

                try {
                    const message: LeaveRequestMessage = JSON.parse(msg.content.toString());
                    await callback(message);
                    this.channel.ack(msg)
                } catch (error) {
                    console.log("Error Porcessing message:", error);
                    // Check retry count
                    const retryCount = (msg.properties.headers?.['x-retry-count'] || 0) as number;
                    if(retryCount < rabbitMQConfig.retryPolicy.maxRetries){
                        setTimeout(() => {
                            this.channel!.nack(msg, false, true);
                        }, rabbitMQConfig.retryPolicy.backoffMs)
                    }else{
                        this.channel!.nack(msg, false, true)
                    }
                }

            },
            {noAck: false}
        )
    }

    async close(): Promise<void>{
        if(this.channel) await this.channel.close();
        if(this.connection) await this.connection.close();
        this.isConnected = false
    }

}