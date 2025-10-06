import { App } from '../../src/app'
import { sequelize } from '../../src/models';
import request from 'supertest';

describe('API INtegration Tests', () => {
    let app: App;

    beforeAll(async () => {
        app = new App();
        await sequelize.sync({force: true})
    }, 30000);

    afterAll(async () => {
        await sequelize.close();
    })
describe('Department API', () => {
    it('should create a department', async () => {
      const response = await request(app.app)
        .post('/api/departments')
        .send({ name: 'Engineering' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Engineering');
    }, 10000);

    it('should return validation error for invalid department data', async () => {
      const response = await request(app.app)
        .post('/api/departments')
        .send({ name: '' })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Employee API', () => {
    let departmentId: string;

    beforeAll(async () => {
      // Create a department first
      const deptResponse = await request(app.app)
        .post('/api/departments')
        .send({ name: 'HR' });
        if (!deptResponse.body?.data?.id) {
        throw new Error('Failed to create department for test setup');
      }
      departmentId = deptResponse.body.data.id; 
    }, 10000);

    it('should create an employee', async () => {
      const response = await request(app.app)
        .post('/api/employees')
        .send({
          name: 'John Doe',
          email: 'john.doe@company.com',
          departmentId,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('John Doe');
    });
  });
});