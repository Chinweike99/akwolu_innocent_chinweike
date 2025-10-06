import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { databaseConfig } from "../config/database";



export const sequelize = new Sequelize(
    databaseConfig.database,
    databaseConfig.username,
    databaseConfig.password,
    databaseConfig
);

// Department Model
interface DepartmentAttributes {
    id: string;
    name: string;
    createdAt?: Date;
};

interface DepartmentCreationAttributes extends Optional<DepartmentAttributes, 'id'> {}

export class Department extends Model<DepartmentAttributes, DepartmentCreationAttributes>{
    declare id: string;
    declare name: string;
    declare createdAt: Date;
}

Department.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        createdAt:{
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
    {
        sequelize,
        tableName: 'departments',
        timestamps: false,
    }
);

// Employee Model
interface EmployeeAttributes {
    id: string;
    name: string;
    email: string;
    departmentId?: string;
    createdAt?: Date;
};

interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, 'id'> {}

export class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes>{
    declare id: string;
    declare name: string;
    declare email: string;
    declare departmentId?: string;
    declare createdAt: Date;
}

Employee.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            }
        },
        departmentId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Department,
                key: 'id',
            },
        },
        createdAt:{
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
    {
        sequelize,
        tableName: 'employees',
        timestamps: false,
    }
);



// LeaveRequest Model
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "PENDING_APPROVAL";

interface LeaveRequestAttributes {
    id: string;
    employeeId: string;
    startDate: Date;
    endDate: Date;
    status: LeaveStatus;
    createdAt?: Date;
    updatedAt?: Date;
    processedAt?: Date;
    idempotencyKey?: string | null;
}

interface LeaveRequestCreationAttributes extends Optional<LeaveRequestAttributes, 'id' | 'status'> {}

export class LeaveRequest extends Model<LeaveRequestAttributes, LeaveRequestCreationAttributes>{
  declare id: string;
  declare employeeId: string;
  declare startDate: Date;
  declare endDate: Date;
  declare status: LeaveStatus;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare processedAt?: Date;
  declare idempotencyKey?: string | null;
} 

LeaveRequest.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        employeeId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Employee,
                key: 'id',
            },
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED", "PENDING_APPROVAL"),
            allowNull: false,
            defaultValue: "PENDING",
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        processedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        idempotencyKey: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        }
    },
    {
        sequelize,
        tableName: 'leave_requests',
        timestamps: false,
        updatedAt: 'updatedAt',
        createdAt: 'createdAt',
    }
);


// Define associations
Department.hasMany(Employee, {foreignKey: 'departmentId', as: 'employees'});
Employee.belongsTo(Department, {foreignKey: 'departmentId', as: 'department', onDelete: 'RESTRICT'});

Employee.hasMany(LeaveRequest, {foreignKey: 'employeeId', as: 'leaveRequests'});
LeaveRequest.belongsTo(Employee, {foreignKey: 'employeeId', as: 'employee'});

// Export initialized models
export const models = {
  Department,
  Employee,
  LeaveRequest,
};

// Sync function for development
export const syncDatabase = async (force: boolean = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error(' Database synchronization failed:', error);
    throw error;
  }
};

// Initialize associations
export const initializeAssociations = () => {
  Department.hasMany(Employee, { foreignKey: 'departmentId', as: 'employees' });
  Employee.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
  Employee.hasMany(LeaveRequest, { foreignKey: 'employeeId', as: 'leaveRequests' });
  LeaveRequest.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
  
  console.log('Database associations initialized');
};