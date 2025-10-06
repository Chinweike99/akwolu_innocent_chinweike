import express from 'express';
import { DepartmentController } from '../controllers/DepartmentController';
import { EmployeeController } from '../controllers/EmployeeController';
import { LeaveRequestController } from '../controllers/LeaveRequestController';
import {
  createDepartmentRateLimiter,
  createEmployeeRateLimiter,
  createLeaveRequestRateLimiter,
} from '../middlewares/rateLimit';

const router = express.Router();

// Instantiate controllers
const departmentController = new DepartmentController();
const employeeController = new EmployeeController();
const leaveRequestController = new LeaveRequestController();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Department routes
router.post('/departments', createDepartmentRateLimiter, departmentController.createDepartment);
router.get('/departments/:id/employees', departmentController.getDepartmentEmplyees);

// Employee routes
router.post('/employees', createEmployeeRateLimiter, employeeController.createEmployee);
router.get('/employees/:id', employeeController.getEmployee);

// Leave request routes
router.post('/leave-requests', createLeaveRequestRateLimiter, leaveRequestController.createLeaveRequest);

export default router;
