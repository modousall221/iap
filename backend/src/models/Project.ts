import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

interface ProjectAttributes {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  longDescription?: string;
  targetAmount: number;
  raisedAmount: number;
  category: string;
  country: string;
  contractType: 'mudarabah' | 'musharaka' | 'conventional_loan';
  shariaCompliant: boolean;
  status: 'draft' | 'submitted' | 'approved' | 'funding' | 'funded' | 'closed';
  deadline: Date;
  expectedReturn?: number;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt?: Date;
  updatedAt?: Date;
}

class Project extends Model<ProjectAttributes> implements ProjectAttributes {
  public id!: string;
  public ownerId!: string;
  public title!: string;
  public description!: string;
  public longDescription?: string;
  public targetAmount!: number;
  public raisedAmount!: number;
  public category!: string;
  public country!: string;
  public contractType!: 'mudarabah' | 'musharaka' | 'conventional_loan';
  public shariaCompliant!: boolean;
  public status!: 'draft' | 'submitted' | 'approved' | 'funding' | 'funded' | 'closed';
  public deadline!: Date;
  public expectedReturn?: number;
  public riskLevel!: 'low' | 'medium' | 'high';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getFundingPercentage(): number {
    return (this.raisedAmount / this.targetAmount) * 100;
  }

  public isActive(): boolean {
    return this.status === 'funding' && new Date() < this.deadline;
  }
}

Project.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    longDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    targetAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    raisedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contractType: {
      type: DataTypes.ENUM('mudarabah', 'musharaka', 'conventional_loan'),
      allowNull: false,
    },
    shariaCompliant: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'approved', 'funding', 'funded', 'closed'),
      defaultValue: 'draft',
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    expectedReturn: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
  },
  {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    timestamps: true,
  }
);

export default Project;
