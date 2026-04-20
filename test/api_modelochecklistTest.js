import { test, mock } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";

import router from "../src/api_modelochecklist.js";
import ModeloChecklist from "../src/modelochecklist.js";

const modeloChecklistId = "507f1f77bcf86cd799439011";

test("/modelochecklists/:id - post", async () => {
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

    const app = express();
    app.use(router);

    const response = await request(app).post("/modelochecklists").send(body);

    assert.equal(response.status, 201);
    assert.deepEqual(response.body, modeloChecklistCriado);
});

test("/modelochecklists - get", async () => {
    const modelosChecklist = [
        { nome: "Checklist Motor", tipo: "entrada" }
    ];

    mock.method(ModeloChecklist, "find", async () => modelosChecklist);

    const app = express();
    app.use(router);

    const response = await request(app).get("/modelochecklists").query({ tipo: "entrada", nome: "motor" });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, modelosChecklist);
});

test("/modelochecklists/:id - get", async () => {
    const modeloChecklist = {
        _id: modeloChecklistId,
        nome: "Checklist Motor",
        tipo: "entrada"
    };

    mock.method(ModeloChecklist, "findById", async () => modeloChecklist);

    const app = express();
    app.use(router);

    const response = await request(app).get("/modelochecklists/"+modeloChecklistId);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, modeloChecklist);
});

test("/modelochecklists/:id - put", async () => {
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

    const app = express();
    app.use(router);

    const response = await request(app).put("/modelochecklists/"+modeloChecklistId).send(body);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, modeloChecklistAtualizado);
});

test("/modelochecklists/:id - delete", async () => {
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

    const app = express();
    app.use(router);

    const response = await request(app).delete("/modelochecklists/"+modeloChecklistId);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { mensagem: "Modelo de checklist deletado com sucesso" });
});

test("/modelochecklists - post error", async () => {
    const body = {
        nome: "Checklist Motor Criado",
        tipo: "saida",
        descricao: "Checklist revisado"
    };
    const erro = "Erro ao criar modelo de checklist";

    mock.method(ModeloChecklist, "create", async () => {
        throw new Error(erro);
    });

    const app = express();
    app.use(router);

    const response = await request(app).post("/modelochecklists").send(body);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});

test("/modelochecklists - get error", async () => {
    const erro = "Erro ao listar modelos de checklist";

    mock.method(ModeloChecklist, "find", async () => {
        throw new Error(erro);
    });

    const app = express();
    app.use(router);

    const response = await request(app).get("/modelochecklists").query({ tipo: "entrada", nome: "motor" });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});

test("/modelochecklists/:id - get error", async () => {
    const erro = "Erro ao buscar modelo de checklist";

    mock.method(ModeloChecklist, "findById", async () => {
        throw new Error(erro);
    });

    const app = express();
    app.use(router);

    const response = await request(app).get("/modelochecklists/"+modeloChecklistId);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});

test("/modelochecklists/:id - put error", async () => {
    const body = {
        nome: "Checklist Motor Atualizado",
        tipo: "saida",
        descricao: "Checklist revisado"
    };
    const erro = "Erro ao atualizar modelo de checklist";

    mock.method(ModeloChecklist, "findByIdAndUpdate", async () => {
        throw new Error(erro);
    });

    const app = express();
    app.use(router);

    const response = await request(app).put("/modelochecklists/"+modeloChecklistId).send(body);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});

test("/modelochecklists/:id - delete error", async () => {
    const erro = "Erro ao deletar modelo de checklist";

    mock.method(ModeloChecklist, "findByIdAndDelete", async () => {
        throw new Error(erro);
    });

    const app = express();
    app.use(router);

    const response = await request(app).delete("/modelochecklists/"+modeloChecklistId);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});
