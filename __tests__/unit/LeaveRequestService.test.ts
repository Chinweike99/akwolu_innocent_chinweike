import { LeaveRequestServices } from "../../src/services/LeaveRequestService";
import { LeaveRequestRepository } from "../../src/repositories/LeaveRequestRepository";
import { EmployeeService } from "../../src/services/EmployeeService";
import { QueueService } from "../../src/services/QueueService";
import { AppError } from "../../src/utils/errors";

jest.mock("../../src/repositories/LeaveRequestRepository");
jest.mock("../../src/services/EmployeeService");
jest.mock("../../src/services/QueueService");

describe("LeaveRequestServices", () => {
  let leaveRequestService: LeaveRequestServices;
  let mockLeaveRequestRepository: jest.Mocked<LeaveRequestRepository>;
  let mockEmployeeService: jest.Mocked<EmployeeService>;
  let mockQueueService: jest.Mocked<QueueService>;

  beforeEach(() => {
    mockLeaveRequestRepository =
      new LeaveRequestRepository() as jest.Mocked<LeaveRequestRepository>;
    mockEmployeeService = new EmployeeService() as jest.Mocked<EmployeeService>;
    mockQueueService = new QueueService() as jest.Mocked<QueueService>;
    leaveRequestService = new LeaveRequestServices();
    (leaveRequestService as any).leaveRequestRepository =
      mockLeaveRequestRepository;
    (leaveRequestService as any).employeeService = mockEmployeeService;
    (leaveRequestService as any).queueService = mockQueueService;
  });

  describe("createLeaveRequest", () => {
    it("Should create a leave request and publish to queue", async () => {
      const input = {
        employeeId: "emp-123",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-02"),
      };

    //   mockEmployeeService.employeeExists.mockResolvedValue(true);
      mockEmployeeService.getEmployeeById.mockResolvedValue({ id: "emp-123" } as any);
      mockLeaveRequestRepository.create.mockResolvedValue({
        id: "lr-123",
        ...input,
        status: "PENDING",
        idempotencyKey: "key-123",
      } as any);

      const result = await leaveRequestService.createLeaveRequest(input);

      expect(result.id).toBe("lr-123");
      expect(mockQueueService.publishLeaveRequest).toHaveBeenCalled();
    });

    it("should throw error for non-existent employee", async () => {
      const input = {
        employeeId: "emp-999",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-02"),
      };

    //   mockEmployeeService.employeeExists.mockResolvedValue(false);
    mockEmployeeService.getEmployeeById.mockResolvedValue(null as any);

      await expect(
        leaveRequestService.createLeaveRequest(input)
      ).rejects.toThrow(AppError);
    });
  });

  describe("processLeaveRequest", () => {
    it("should auto-approve leaves ≤ 2 days", async () => {
      const leaveRequestData = {
        id: "lr-123",
        employeeId: "emp-123",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-02"), // 2 days
        idempotencyKey: "key-123",
      };

      await leaveRequestService.processLeaveRequest(leaveRequestData);

      expect(mockLeaveRequestRepository.updateStatus).toHaveBeenCalledWith(
        "lr-123",
        "APPROVED",
        expect.any(Date)
      );
    });
    it("should mark leaves > 2 days as pending approval", async () => {
      const leaveRequestData = {
        id: "lr-123",
        employeeId: "emp-123",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-05"), // 5 days
        idempotencyKey: "key-123",
      };

      await leaveRequestService.processLeaveRequest(leaveRequestData);

      expect(mockLeaveRequestRepository.updateStatus).toHaveBeenCalledWith(
        "lr-123",
        "PENDING_APPROVAL",
        expect.any(Date)
      );
    });
  });
});
