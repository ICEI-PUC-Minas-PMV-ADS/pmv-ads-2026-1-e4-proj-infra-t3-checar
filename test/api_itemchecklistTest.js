import { test, mock } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";

import router from "../src/api_itemchecklist.js";
import ItemChecklist from "../src/itemchecklist.js";

const checklistId = "507f1f77bcf86cd799439011";
const itemChecklistId = "507f1f77bcf86cd799439012";

test("/itemchecklists - post", async () => {
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

    const app = express();
    app.use(router);

    const response = await request(app).post("/itemchecklists").send(itensChecklist);

    assert.equal(response.status, 201);
    assert.deepEqual(response.body, itemChecklistCriado);
});

test("/itemchecklists - get", async () => {
    const itensChecklist = [
        { checklistId, descricao: "Descricao", status: "Conforme" }
    ];

    mock.method(ItemChecklist, "find", async () => itensChecklist);

    const app = express();
    app.use(router);

    const response = await request(app).get("/itemchecklists").query({ checklistId, status: "Conforme" });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, itensChecklist);
});

test("/itemchecklists/:id - get", async () => {
    const itemChecklist = {
        _id: itemChecklistId,
        checklistId,
        descricao: "Descricao",
        status: "Conforme"
    };

    mock.method(ItemChecklist, "findById", async () => itemChecklist);

    const app = express();
    app.use(router);

    const response = await request(app).get("/itemchecklists/"+itemChecklistId);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, itemChecklist);
});

test("/itemchecklists/:id - put", async () => {
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

    const app = express();
    app.use(router);

    const response = await request(app).put("/itemchecklists/"+itemChecklistId).send(body);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, itemChecklistAtualizado);
});

test("/itemchecklists/:id - delete", async () => {
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

    const app = express();
    app.use(router);

    const response = await request(app).delete("/itemchecklists/"+itemChecklistId);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { mensagem: "Item de checklist deletado com sucesso" });
});

test("/itemchecklists - post error", async () => {
    const itensChecklist = {
        checklistId,
        descricao: "Descricao",
        status: "Conforme"
    };
    const erro = "Erro ao criar item de checklist";

    mock.method(ItemChecklist, "create", async () => {
        throw new Error(erro);
    });

    const app = express();
    app.use(router);

    const response = await request(app).post("/itemchecklists").send(itensChecklist);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});

test("/itemchecklists - get error", async () => {
    const erro = "Erro ao listar itens de checklist";

    mock.method(ItemChecklist, "find", async () => {
        throw new Error(erro);
    });

    const app = express();
    app.use(router);

    const response = await request(app).get("/itemchecklists").query({ status: "Conforme" });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});

test("/itemchecklists/:id - get error", async () => {
    const erro = "Erro ao buscar item de checklist";

    mock.method(ItemChecklist, "findById", async () => {
        throw new Error(erro);
    });

    const app = express();
    app.use(router);

    const response = await request(app).get("/itemchecklists/"+itemChecklistId);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});

test("/itemchecklists/:id - put error", async () => {
    const body = {
        checklistId,
        descricao: "Descricao atualizada",
        status: "Nao Conforme"
    };
    const erro = "Erro ao atualizar item de checklist";

    mock.method(ItemChecklist, "findByIdAndUpdate", async () => {
        throw new Error(erro);
    });

    const app = express();
    app.use(router);

    const response = await request(app).put("/itemchecklists/"+itemChecklistId).send(body);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});

test("/itemchecklists/:id - delete error", async () => {
    const erro = "Erro ao deletar item de checklist";

    mock.method(ItemChecklist, "findByIdAndDelete", async () => {
        throw new Error(erro);
    });

    const app = express();
    app.use(router);

    const response = await request(app).delete("/itemchecklists/"+itemChecklistId);

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { erro });
});
