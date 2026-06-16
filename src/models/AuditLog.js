import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: String,
      default: null,
    },
    acao: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE'],
      required: true,
    },
    entidade: {
      type: String,
      required: true,
    },
    entidadeId: {
      type: String,
      default: null,
    },
    metodo: {
      type: String,
    },
    rota: {
      type: String,
    },
    statusCode: {
      type: Number,
    },
    dados: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

auditLogSchema.index({ entidade: 1, createdAt: -1 });
auditLogSchema.index({ usuarioId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
