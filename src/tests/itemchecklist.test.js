import { test, mock } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";

import router from "../api_itemchecklist.js";
import ItemChecklist from "../itemchecklist.js";

const checklistId = "507f1f77bcf86cd799439011";
const itemChecklistId = "507f1f77bcf86cd799439012";

const createApp = () => {
    const app = express();
    app.use(router);
    return app;
};

test("/itemchecklists - post", async () => {
    mock.restoreAll();

    const itensChecklist = {
        checklistId,
        descricao: "Descricao",
        status: "Conforme"
    };

    const itemChecklistCriado = {
        _id: itemChecklistId,
        ...itensChecklist
    };

    mock.method(ItemChecklist, "create", async () => itemChecklistCriado);

    const response = await request(createApp()).post("/itemchecklists").send(itensChecklist);

    assert.equal(response.status, 201);
    assert.deepEqual(response.body, itemChecklistCriado);
});

test("/itemchecklists - get", async () => {
    mock.restoreAll();

    const itensChecklist = [
        { checklistId, descricao: "Descricao", status: "Conforme" }
    ];

    mock.method(ItemChecklist, "find", async () => itensChecklist);

    const response = await request(createApp()).get("/itemchecklists").query({ checklistId, status: "Conforme" });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, itensChecklist);
});

test("/itemchecklists/:id - get", async () => {
    mock.restoreAll();

    const itemChecklist = {
        _id: itemChecklistId,
        checklistId,
        descricao: "Descricao",
        status: "Conforme"
    };

    mock.method(ItemChecklist, "findById", async () => itemChecklist);

    const response = await request(createApp()).get("/itemchecklists/" + itemChecklistId);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, itemChecklist);
});

test("/itemchecklists/:id - put", async () => {
    mock.restoreAll();

    const body = {
        checklistId,
        descricao: "Descricao atualizada",
        status: "Nao Conforme"
    };
    const itemChecklistAtualizado = {
        _id: itemChecklistId,
        ...body
    };

    mock.method(
        ItemChecklist,
        "findByIdAndUpdate",
        async () => itemChecklistAtualizado
    );

    const response = await request(createApp()).put("/itemchecklists/" + itemChecklistId).send(body);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, itemChecklistAtualizado);
});

test("/itemchecklists/:id - delete", async () => {
    mock.restoreAll();

    const itemChecklistDeletado = {
        _id: itemChecklistId,
        checklistId,
        descricao: "Descricao",
        status: "Conforme"
    };

    mock.method(
        ItemChecklist,
        "findByIdAndDelete",
        async () => itemChecklistDeletado
    );

    const response = await request(createApp()).delete("/itemchecklists/" + itemChecklistId);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { mensagem: "Item de checklist deletado com sucesso" });
});

test("/itemchecklists - post error", async () => {
    mock.restoreAll();

    const itensChecklist = {
        checklistId,
        descricao: "Descricao",
        status: "Conforme"
    };
    const erro = "Erro ao criar item de checklist";

    mock.method(ItemChecklist, "create", async () => {
        throw new Error(erro);
    });

    const response = await request(createApp()).post("/itemchecklists").send(itensChecklist);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});

test("/itemchecklists - get error", async () => {
    mock.restoreAll();

    const erro = "Erro ao listar itens de checklist";

    mock.method(ItemChecklist, "find", async () => {
        throw new Error(erro);
    });

    const response = await request(createApp()).get("/itemchecklists").query({ status: "Conforme" });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});

test("/itemchecklists/:id - get error", async () => {
    mock.restoreAll();

    const erro = "Erro ao buscar item de checklist";

    mock.method(ItemChecklist, "findById", async () => {
        throw new Error(erro);
    });

    const response = await request(createApp()).get("/itemchecklists/" + itemChecklistId);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});

test("/itemchecklists/:id - put error", async () => {
    mock.restoreAll();

    const body = {
        checklistId,
        descricao: "Descricao atualizada",
        status: "Nao Conforme"
    };
    const erro = "Erro ao atualizar item de checklist";

    mock.method(ItemChecklist, "findByIdAndUpdate", async () => {
        throw new Error(erro);
    });

    const response = await request(createApp()).put("/itemchecklists/" + itemChecklistId).send(body);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});

test("/itemchecklists/:id - delete error", async () => {
    mock.restoreAll();

    const erro = "Erro ao deletar item de checklist";

    mock.method(ItemChecklist, "findByIdAndDelete", async () => {
        throw new Error(erro);
    });

    const response = await request(createApp()).delete("/itemchecklists/" + itemChecklistId);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});
