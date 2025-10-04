export interface RabbitMQConfig {
    url: string;
    queues: {
        leaveRequests: string;
        deadLetter: string;
    };
    retryPolicy: {
        maxRetries: number;
        backoffMs: number;
    }
};


export  const rabbitMQConfig: RabbitMQConfig = {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    queues: {
        leaveRequests: 'leave.requests',
        deadLetter: 'leave.requests.dlq',
    },
    retryPolicy: {
        maxRetries: 3,
        backoffMs: 5000,
    },
}

