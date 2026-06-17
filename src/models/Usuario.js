import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Email inválido"]
    },
    senha: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    tipoUsuario: {
        type: String,
        enum: ["Motorista", "Gestor"],
        required: true,
        default: "Motorista"
    },
    aceitouTermos: { type: Boolean, default: false },
    dataAceiteTermos: { type: Date, default: null },
    versaoTermos: { type: String, default: null },
}, {
    timestamps: true
});

// Hash da senha antes de salvar
usuarioSchema.pre("save", async function () {
    if (!this.isModified("senha")) return;
    this.senha = await bcrypt.hash(this.senha, 10);
});

// Método para comparar senha
usuarioSchema.methods.compararSenha = async function (senhaDigitada) {
    return await bcrypt.compare(senhaDigitada, this.senha);
};

const Usuario = mongoose.models.Usuario || mongoose.model("Usuario", usuarioSchema);
export default Usuario;