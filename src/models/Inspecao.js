import mongoose from 'mongoose';

const InspecaoSchema = new mongoose.Schema({
    // RF-011: Busca por placa
    placa: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },

    // RF-004: Relacionamento com checklist (fotos ligadas ao checklist)
    checklistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Checklist',
        default: null,
    },

    dataInspecao: {
        type: Date,
        default: Date.now
    },

    // RF-005: Fotos organizadas por posição
    fotos: {
        frente: { type: String, required: true },
        traseira: { type: String, required: true },
        lateralEsquerda: { type: String, required: true },
        lateralDireita: { type: String, required: true },
        topo: { type: String, required: true }
    }
}, {
    timestamps: true,
    versionKey: false
});

InspecaoSchema.index({ placa: 1 });
InspecaoSchema.index({ dataInspecao: -1 });
InspecaoSchema.index({ placa: 1, dataInspecao: -1 });
InspecaoSchema.index({ checklistId: 1 });

// Evitar OverwriteModelError - verifica se o modelo já existe
const Inspecao = mongoose.models.Inspecao || mongoose.model('Inspecao', InspecaoSchema);

export default Inspecao;
