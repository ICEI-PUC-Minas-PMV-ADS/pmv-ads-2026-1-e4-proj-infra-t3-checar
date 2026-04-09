import mongoose from "mongoose";

const itemChecklistSchema = new mongoose.Schema({
    checklistId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Checklist"
    },
    descricao: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["Conforme", "Nao Conforme"],
        required: true
    }
});

export default mongoose.model("ItemChecklist", itemChecklistSchema);
