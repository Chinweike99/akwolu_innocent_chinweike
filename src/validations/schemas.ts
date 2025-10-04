import { z } from "zod";


export const createDepartmentSchema = z.object({
  name: z.string().min(1).max(255),
});

export const createEmployeeSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  departmentId: z.string().uuid(),
});

export const createLeaveRequestSchema = z.object({
  employeeId: z.string().uuid(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  idempotencyKey: z.string().optional(),
}).refine(data => data.startDate <= data.endDate, {
  message: "Start date must be before or equal to end date",
});

export const paginationSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});


export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

