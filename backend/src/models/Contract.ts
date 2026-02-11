import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

class Contract extends Model {
  public id!: string;
  public investmentId!: string;
  public contractType!: string;
  public termsJSON!: string; // terms as JSON: { profitShare%, duration, conditions }
  public contractPdfUrl!: string;
  public status!: 'draft' | 'active' | 'signed' | 'completed' | 'cancelled';
  public investorSignedAt?: Date;
  public entrepreneurSignedAt?: Date;
  public adminSignedAt?: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Contract.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    investmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'Investments',
        key: 'id',
      },
    },
    contractType: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'mudarabah, musharaka, or conventional_loan',
    },
    termsJSON: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'JSON string containing contract terms',
      get() {
        const raw = this.getDataValue('termsJSON');
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      },
      set(value: any) {
        this.setDataValue('termsJSON', typeof value === 'string' ? value : JSON.stringify(value));
      },
    },
    contractPdfUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'S3 URL to the generated PDF contract',
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'signed', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'draft',
    },
    investorSignedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    entrepreneurSignedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    adminSignedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Contract',
    tableName: 'Contracts',
  }
);

export default Contract;
