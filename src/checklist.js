import mongoose from "mongoose";

const checklistSchema = new mongoose.Schema({
    data: {
        type: Date,
        required: true
    },
    conformidade: {
        type: Boolean,
        default: null,
    },
    observacao: {
        type: String,
        trim: true,
        default: ""
    },
    status: {
        type: [String],
        enum: ["em utilizacao", "em utilização", "com problema", "disponivel", "disponível"],
        required: true,
        validate: {
            validator: (status) => Array.isArray(status) && status.length > 0,
            message: "Status deve conter pelo menos um valor"
        }
    },
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario"
    },
    veiculoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle"
    },
    modeloId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ModeloChecklist"
    },
    assinatura: {
        type: String,
        required: true,
    }
});

checklistSchema.index({ veiculoId: 1, data: -1 });
checklistSchema.index({ conformidade: 1 });
checklistSchema.index({ data: -1 });

export default mongoose.model("Checklist", checklistSchema, "Checklist");
