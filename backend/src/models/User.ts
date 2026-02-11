import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  phone?: string;
  role: 'investor' | 'entrepreneur' | 'admin';
  kycStatus: 'pending' | 'approved' | 'rejected';
  amlStatus: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public phone?: string;
  public role!: 'investor' | 'entrepreneur' | 'admin';
  public kycStatus!: 'pending' | 'approved' | 'rejected';
  public amlStatus!: 'pending' | 'approved' | 'rejected';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance method to set password (hashed)
  public async setPassword(password: string): Promise<void> {
    const hashedPassword = await bcryptjs.hash(password, 10);
    this.password = hashedPassword;
  }

  // Instance method to validate password
  public async validatePassword(password: string): Promise<boolean> {
    return bcryptjs.compare(password, this.password);
  }

  // Instance method to hide sensitive data
  public toJSON() {
    const { password, ...rest } = this.toJSON() as Record<string, any>;
    return rest;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('investor', 'entrepreneur', 'admin'),
      defaultValue: 'investor',
      allowNull: false,
    },
    kycStatus: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
    amlStatus: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    defaultScope: {
      attributes: {
        exclude: ['password'],
      },
    },
  }
);

export default User;
