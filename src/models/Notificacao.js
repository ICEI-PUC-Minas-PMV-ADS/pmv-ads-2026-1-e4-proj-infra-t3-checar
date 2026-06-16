import mongoose from 'mongoose';

const notificacaoSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ['FALHA_CRITICA', 'ALERTA', 'INFO'],
      required: true,
      default: 'ALERTA',
    },
    mensagem: {
      type: String,
      required: true,
      trim: true,
    },
    checklistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Checklist',
    },
    veiculoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
    },
    lida: {
      type: Boolean,
      default: false,
    },
    pushEnviado: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

notificacaoSchema.index({ usuarioId: 1, lida: 1 });
notificacaoSchema.index({ createdAt: -1 });

const Notificacao = mongoose.models.Notificacao || mongoose.model('Notificacao', notificacaoSchema);
export default Notificacao;
