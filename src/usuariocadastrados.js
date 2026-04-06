import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
    /*id: {
        type: Number,
        required: true
    },*/
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        required: true
    },
    tipoUsuario: {
        type: String,
        enum: ["Motorista", "Gestor"],
        required: true
    }
});

export default mongoose.model("Usuario", usuarioSchema);