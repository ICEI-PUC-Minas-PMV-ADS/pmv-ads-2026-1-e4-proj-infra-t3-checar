import mongoose from "mongoose";

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
    }
});

export default mongoose.model("ModeloChecklist", modeloChecklistSchema);
