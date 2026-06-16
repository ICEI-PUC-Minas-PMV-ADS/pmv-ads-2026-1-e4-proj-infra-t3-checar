import mongoose from 'mongoose';

const fcmTokenSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    plataforma: {
      type: String,
      enum: ['android', 'ios', 'web'],
      default: 'android',
    },
  },
  { timestamps: true, versionKey: false }
);

// Um usuário pode ter múltiplos dispositivos; token é único
fcmTokenSchema.index({ token: 1 }, { unique: true });
fcmTokenSchema.index({ usuarioId: 1 });

const FcmToken = mongoose.models.FcmToken || mongoose.model('FcmToken', fcmTokenSchema);
export default FcmToken;
