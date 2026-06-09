import mongoose from "mongoose";

const campoModeloChecklistSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    ordem: {
        type: Number,
        min: 0,
        default: 0
    },
    ativo: {
        type: Boolean,
        default: true
    }
});

const secaoModeloChecklistSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    descricao: {
        type: String,
        trim: true,
        default: ""
    },
    ordem: {
        type: Number,
        min: 0,
        default: 0
    },
    campos: {
        type: [campoModeloChecklistSchema],
        default: [],
        validate: {
            validator: (campos) => Array.isArray(campos) && campos.length > 0,
            message: "Secao deve conter pelo menos um campo"
        }
    },
    ativo: {
        type: Boolean,
        default: true
    }
});

const modeloChecklistSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    tipo: {
        type: String,
        required: true,
        trim: true
    },
    descricao: {
        type: String,
        required: true,
        trim: true
    },
    secoes: {
        type: [secaoModeloChecklistSchema],
        default: []
    },
    ativo: {
        type: Boolean,
        default: true
    }
});

export default mongoose.model("ModeloChecklist", modeloChecklistSchema, "ModeloChecklist");
