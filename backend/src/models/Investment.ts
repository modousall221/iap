import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

class Investment extends Model {
  public id!: string;
  public projectId!: string;
  public investorId!: string;
  public amount!: number;
  public status!: 'pending' | 'payment_confirmed' | 'contract_signed' | 'completed';
  public paymentReference!: string;
  public paymentMethod!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Investment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'id',
      },
    },
    investorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'payment_confirmed', 'contract_signed', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentReference: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'e.g., orange_money, mtn_money, bank_transfer, card',
    },
  },
  {
    sequelize,
    modelName: 'Investment',
    tableName: 'Investments',
  }
);

export default Investment;
