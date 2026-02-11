import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

interface KYCDocumentAttributes {
  id?: string;
  userId: string;
  documentType: 'id' | 'rib' | 'kbis' | 'proof_of_address';
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class KYCDocument extends Model<KYCDocumentAttributes> implements KYCDocumentAttributes {
  public id!: string;
  public userId!: string;
  public documentType!: 'id' | 'rib' | 'kbis' | 'proof_of_address';
  public fileName!: string;
  public fileUrl!: string;
  public status!: 'pending' | 'approved' | 'rejected';
  public rejectionReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

KYCDocument.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    documentType: {
      type: DataTypes.ENUM('id', 'rib', 'kbis', 'proof_of_address'),
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'KYCDocument',
    tableName: 'kyc_documents',
    timestamps: true,
  }
);

export default KYCDocument;
