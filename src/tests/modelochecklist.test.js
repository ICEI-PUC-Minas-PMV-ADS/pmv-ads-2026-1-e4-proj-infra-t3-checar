import { test, mock } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";

import router from "../api_modelochecklist.js";
import ModeloChecklist from "../modelochecklist.js";

const modeloChecklistId = "507f1f77bcf86cd799439011";

const createApp = () => {
    const app = express();
    app.use(router);
    return app;
};

test("/modelochecklists - post", async () => {
    mock.restoreAll();

    const body = {
        nome: "Checklist Motor Criado",
        tipo: "saida",
        descricao: "Checklist revisado"
    };

    const modeloChecklistCriado = {
        _id: modeloChecklistId,
        ...body
    };

    mock.method(
        ModeloChecklist,
        "create",
        async () => modeloChecklistCriado
    );

    const response = await request(createApp()).post("/modelochecklists").send(body);

    assert.equal(response.status, 201);
    assert.deepEqual(response.body, modeloChecklistCriado);
});

test("/modelochecklists - get", async () => {
    mock.restoreAll();

    const modelosChecklist = [
        { nome: "Checklist Motor", tipo: "entrada" }
    ];

    mock.method(ModeloChecklist, "find", async () => modelosChecklist);

    const response = await request(createApp()).get("/modelochecklists").query({ tipo: "entrada", nome: "motor" });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, modelosChecklist);
});

test("/modelochecklists/:id - get", async () => {
    mock.restoreAll();

    const modeloChecklist = {
        _id: modeloChecklistId,
        nome: "Checklist Motor",
        tipo: "entrada"
    };

    mock.method(ModeloChecklist, "findById", async () => modeloChecklist);

    const response = await request(createApp()).get("/modelochecklists/" + modeloChecklistId);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, modeloChecklist);
});

test("/modelochecklists/:id - put", async () => {
    mock.restoreAll();

    const body = {
        nome: "Checklist Motor Atualizado",
        tipo: "saida",
        descricao: "Checklist revisado"
    };
    const modeloChecklistAtualizado = {
        _id: modeloChecklistId,
        ...body
    };

    mock.method(
        ModeloChecklist,
        "findByIdAndUpdate",
        async () => modeloChecklistAtualizado
    );

    const response = await request(createApp()).put("/modelochecklists/" + modeloChecklistId).send(body);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, modeloChecklistAtualizado);
});

test("/modelochecklists/:id - delete", async () => {
    mock.restoreAll();

    const modeloChecklistDeletado = {
        _id: modeloChecklistId,
        nome: "Checklist Motor",
        tipo: "entrada",
        descricao: "Checklist revisado"
    };

    mock.method(
        ModeloChecklist,
        "findByIdAndDelete",
        async () => modeloChecklistDeletado
    );

    const response = await request(createApp()).delete("/modelochecklists/" + modeloChecklistId);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { mensagem: "Modelo de checklist deletado com sucesso" });
});

test("/modelochecklists - post error", async () => {
    mock.restoreAll();

    const body = {
        nome: "Checklist Motor Criado",
        tipo: "saida",
        descricao: "Checklist revisado"
    };
    const erro = "Erro ao criar modelo de checklist";

    mock.method(ModeloChecklist, "create", async () => {
        throw new Error(erro);
    });

    const response = await request(createApp()).post("/modelochecklists").send(body);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});

test("/modelochecklists - get error", async () => {
    mock.restoreAll();

    const erro = "Erro ao listar modelos de checklist";

    mock.method(ModeloChecklist, "find", async () => {
        throw new Error(erro);
    });

    const response = await request(createApp()).get("/modelochecklists").query({ tipo: "entrada", nome: "motor" });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});

test("/modelochecklists/:id - get error", async () => {
    mock.restoreAll();

    const erro = "Erro ao buscar modelo de checklist";

    mock.method(ModeloChecklist, "findById", async () => {
        throw new Error(erro);
    });

    const response = await request(createApp()).get("/modelochecklists/" + modeloChecklistId);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});

test("/modelochecklists/:id - put error", async () => {
    mock.restoreAll();

    const body = {
        nome: "Checklist Motor Atualizado",
        tipo: "saida",
        descricao: "Checklist revisado"
    };
    const erro = "Erro ao atualizar modelo de checklist";

    mock.method(ModeloChecklist, "findByIdAndUpdate", async () => {
        throw new Error(erro);
    });

    const response = await request(createApp()).put("/modelochecklists/" + modeloChecklistId).send(body);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});

test("/modelochecklists/:id - delete error", async () => {
    mock.restoreAll();

    const erro = "Erro ao deletar modelo de checklist";

    mock.method(ModeloChecklist, "findByIdAndDelete", async () => {
        throw new Error(erro);
    });

    const response = await request(createApp()).delete("/modelochecklists/" + modeloChecklistId);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});
