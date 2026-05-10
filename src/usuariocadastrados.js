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
        select: false // 🔒 não retorna a senha automaticamente
    },
    tipoUsuario: {
        type: String,
        enum: ["Motorista", "Gestor"],
        required: true
    }
}, {
    timestamps: true // ⏱️ cria createdAt e updatedAt
});


// 🔐 HASH AUTOMÁTICO DA SENHA (SEM next)
usuarioSchema.pre("save", async function () {
    if (!this.isModified("senha")) return;

    this.senha = await bcrypt.hash(this.senha, 10);
});


// 🔑 MÉTODO PARA COMPARAR SENHA (LOGIN)
usuarioSchema.methods.compararSenha = async function (senhaDigitada) {
    return await bcrypt.compare(senhaDigitada, this.senha);
};


export default mongoose.model("Usuario", usuarioSchema);