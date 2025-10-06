import rateLimit from "express-rate-limit"


export const createLimiter = (windowMs: number, max: number, message: string) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message
            },
        },
        standardHeaders: true,
        legacyHeaders: false
    });
}

export const generalRateLimiter = createLimiter(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per windows
    'Too many requests from this IP, please try again after 15 minutes.'
);

export const createEmployeeRateLimiter = createLimiter(
    15 * 60 * 1000,
    10,
    'Too many employee creation attempts, please try again later'
);

export const createDepartmentRateLimiter = createLimiter(
    60 * 60 * 1000, // 1 hour
    10, // 10 requests per window
    'Too many department creation attempts, please try again after an hour.'
);

export const createLeaveRequestRateLimiter = createLimiter(
    15 * 60 * 1000, // 15 minutes
    10, // 10 requests per window
    'Too many leave request attempts, please try again after 15 minutes.'
)

