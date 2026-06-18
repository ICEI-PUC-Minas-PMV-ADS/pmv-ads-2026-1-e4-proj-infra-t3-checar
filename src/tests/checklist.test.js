import { test, mock } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";

import router from "../api_checklist.js";
import Checklist from "../checklist.js";

const checklistId = "507f1f77bcf86cd799439011";
const usuarioId = "507f1f77bcf86cd799439012";
const veiculoId = "507f1f77bcf86cd799439013";
const modeloId = "507f1f77bcf86cd799439014";
const assinatura = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const createApp = () => {
    const app = express();
    app.use(router);
    return app;
};

test("/checklists - post", async () => {
    mock.restoreAll();

    const body = {
        data: "2026-05-10T12:00:00.000Z",
        conformidade: true,
        observacao: "Observacao",
        status: ["disponivel"],
        usuarioId,
        veiculoId,
        modeloId,
        assinatura,
    };

    const checklistCriado = {
        _id: checklistId,
        ...body
    };

    mock.method(Checklist, "create", async () => checklistCriado);

    const response = await request(createApp()).post("/checklists").send(body);

    assert.equal(response.status, 201);
    assert.deepEqual(response.body, checklistCriado);
});

test("/checklists - post: retorna 400 sem assinatura", async () => {
    mock.restoreAll();

    const body = {
        data: "2026-05-10T12:00:00.000Z",
        status: ["disponivel"],
        usuarioId,
        veiculoId,
        modeloId,
    };

    const response = await request(createApp()).post("/checklists").send(body);

    assert.equal(response.status, 400);
    assert.equal(response.body.erro, "Assinatura do motorista é obrigatória.");
});

test("/checklists - get", async () => {
    mock.restoreAll();

    const checklists = [
        { _id: checklistId, conformidade: true, status: ["disponivel"], veiculoId, modeloId }
    ];

    mock.method(Checklist, "find", async () => checklists);

    const response = await request(createApp()).get("/checklists").query({
        usuarioId,
        veiculoId,
        modeloId,
        conformidade: "true",
        status: "disponivel"
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { status: 'success', data: checklists });
});

test("/checklists/:id - get", async () => {
    mock.restoreAll();

    const checklist = {
        _id: checklistId,
        conformidade: true,
        status: ["disponivel"],
        veiculoId,
        modeloId
    };

    mock.method(Checklist, "findById", async () => checklist);

    const response = await request(createApp()).get("/checklists/" + checklistId);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, checklist);
});

test("/checklists/:id - put", async () => {
    mock.restoreAll();

    const body = {
        conformidade: false,
        observacao: "Atualizado",
        status: ["com problema"]
    };
    const checklistAtualizado = {
        _id: checklistId,
        ...body
    };

    mock.method(
        Checklist,
        "findByIdAndUpdate",
        async () => checklistAtualizado
    );

    const response = await request(createApp()).put("/checklists/" + checklistId).send(body);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, checklistAtualizado);
});

test("/checklists/:id - delete", async () => {
    mock.restoreAll();

    const checklistDeletado = {
        _id: checklistId,
        conformidade: true,
        status: ["disponivel"]
    };

    mock.method(
        Checklist,
        "findByIdAndDelete",
        async () => checklistDeletado
    );

    const response = await request(createApp()).delete("/checklists/" + checklistId);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { mensagem: "Checklist deletado com sucesso" });
});

// ── GET /checklists/historico ────────────────────────────────────

const makePaginatedChain = (data) => ({
    sort: () => ({
        skip: () => ({
            limit: async () => data,
        }),
    }),
});

test("/checklists/historico - get: retorna histórico paginado", async () => {
    mock.restoreAll();

    const checklists = [{ _id: checklistId, data: new Date().toISOString(), status: ["disponivel"], veiculoId }];
    mock.method(Checklist, "find", () => makePaginatedChain(checklists));
    mock.method(Checklist, "countDocuments", async () => 1);

    const response = await request(createApp()).get("/checklists/historico").query({ veiculoId });

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.data));
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.total, 1);
    assert.equal(response.body.page, 1);
    assert.equal(response.body.totalPages, 1);
});

test("/checklists/historico - get: filtra por data", async () => {
    mock.restoreAll();

    mock.method(Checklist, "find", () => makePaginatedChain([]));
    mock.method(Checklist, "countDocuments", async () => 0);

    const response = await request(createApp())
        .get("/checklists/historico")
        .query({ startDate: "2026-01-01", endDate: "2026-12-31" });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body.data, []);
    assert.equal(response.body.total, 0);
});

test("/checklists/historico - get: retorna 400 para veiculoId inválido", async () => {
    mock.restoreAll();

    const response = await request(createApp())
        .get("/checklists/historico")
        .query({ veiculoId: "invalido" });

    assert.equal(response.status, 400);
    assert.ok(response.body.erro.includes("veiculoId"));
});

test("/checklists - post error", async () => {
    mock.restoreAll();

    const body = {
        data: "2026-05-10T12:00:00.000Z",
        conformidade: true,
        status: ["disponivel"],
        assinatura,
    };
    const erro = "Erro ao criar checklist";

    mock.method(Checklist, "create", async () => {
        throw new Error(erro);
    });

    const response = await request(createApp()).post("/checklists").send(body);

    assert.equal(response.status, 500);
    assert.deepEqual(response.body, { erro: 'Erro interno ao criar checklist.' });
});

test("/checklists - get error", async () => {
    mock.restoreAll();

    const erro = "Erro ao listar checklists";

    mock.method(Checklist, "find", async () => {
        throw new Error(erro);
    });

    const response = await request(createApp()).get("/checklists").query({ status: "disponivel" });

    assert.equal(response.status, 500);
    assert.deepEqual(response.body, { erro: 'Erro interno ao listar checklists.' });
});

test("/checklists/:id - get error", async () => {
    mock.restoreAll();

    const erro = "Erro ao buscar checklist";

    mock.method(Checklist, "findById", async () => {
        throw new Error(erro);
    });

    const response = await request(createApp()).get("/checklists/" + checklistId);

    assert.equal(response.status, 500);
    assert.deepEqual(response.body, { erro: 'Erro interno ao buscar checklist.' });
});

test("/checklists/:id - put error", async () => {
    mock.restoreAll();

    const body = {
        conformidade: false,
        status: ["com problema"]
    };
    const erro = "Erro ao atualizar checklist";

    mock.method(Checklist, "findByIdAndUpdate", async () => {
        throw new Error(erro);
    });

    const response = await request(createApp()).put("/checklists/" + checklistId).send(body);

    assert.equal(response.status, 500);
    assert.deepEqual(response.body, { erro: 'Erro interno ao atualizar checklist.' });
});

test("/checklists/:id - delete error", async () => {
    mock.restoreAll();

    const erro = "Erro ao deletar checklist";

    mock.method(Checklist, "findByIdAndDelete", async () => {
        throw new Error(erro);
    });

    const response = await request(createApp()).delete("/checklists/" + checklistId);

    assert.equal(response.status, 500);
    assert.deepEqual(response.body, { erro: 'Erro interno ao deletar checklist.' });
});
