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
    public id!: string;
    public name!: string;
    public createdAt!: Date;
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
    public id!: string;
    public name!: string;
    public email!: string;
    public departmentId?: string;
    public createdAt!: Date;
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
            allowNull: true,
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
    idempotencyKey: string;
}

interface LeaveRequestCreationAttributes extends Optional<LeaveRequestAttributes, 'id' | 'status'> {}

export class LeaveRequest extends Model<LeaveRequestAttributes, LeaveRequestCreationAttributes>{
  public id!: string;
  public employeeId!: string;
  public startDate!: Date;
  public endDate!: Date;
  public status!: LeaveStatus;
  public createdAt!: Date;
  public updatedAt!: Date;
  public processedAt?: Date;
  public idempotencyKey?: string;
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
            allowNull: false,
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
Employee.belongsTo(Department, {foreignKey: 'departmentId', as: 'department'});

Employee.hasMany(LeaveRequest, {foreignKey: 'employeeId', as: 'leaveRequests'});
LeaveRequest.belongsTo(Employee, {foreignKey: 'employeeId', as: 'employee'});

