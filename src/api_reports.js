import express from "express";
import mongoose from "mongoose";
import Vehicle from "./models/Vehicle.js";
import Inspecao from "./models/Inspecao.js";
import Checklist from "./checklist.js";
import ItemChecklist from "./itemchecklist.js";
import Usuario from "./models/Usuario.js";
import { toCsv } from "./utils/csv.js";
import { generateInspectionReportPdf, generateChecklistReportPdf } from "./utils/reportPdf.js";

const router = express.Router();

const VEHICLE_CSV_HEADERS = [
  "id",
  "plate",
  "model",
  "year",
  "marca",
  "cor",
  "mileage",
  "vehicleType",
  "operationalStatus",
  "observation",
  "createdAt",
  "updatedAt",
];

const INSPECTION_CSV_HEADERS = [
  "id",
  "placa",
  "dataInspecao",
  "fotoFrente",
  "fotoTraseira",
  "fotoLateralEsquerda",
  "fotoLateralDireita",
  "fotoTopo",
  "createdAt",
  "updatedAt",
];

// ==========================================
// EXPORTAÇÃO CSV DE VEÍCULOS
// ==========================================
router.get("/exportacoes/vehicles/csv", async (_req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ plate: 1 }).lean();

    const rows = vehicles.map((vehicle) => ({
      id: vehicle._id,
      plate: vehicle.plate,
      model: vehicle.model,
      year: vehicle.year,
      marca: vehicle.marca || "",
      cor: vehicle.cor || "",
      mileage: vehicle.mileage,
      vehicleType: vehicle.vehicleType,
      operationalStatus: vehicle.operationalStatus,
      observation: vehicle.observation || "",
      createdAt: vehicle.createdAt ? new Date(vehicle.createdAt).toISOString() : "",
      updatedAt: vehicle.updatedAt ? new Date(vehicle.updatedAt).toISOString() : "",
    }));

    const csv = toCsv(rows, { headers: VEHICLE_CSV_HEADERS });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="veiculos.csv"'
    );

    return res.status(200).send(`﻿${csv}`);
  } catch (error) {
    console.error("Erro ao exportar CSV de veículos:", error);
    return res.status(500).json({
      status: "error",
      message: "Erro ao exportar CSV de veículos",
    });
  }
});

// ==========================================
// EXPORTAÇÃO CSV DE INSPEÇÕES
// ==========================================
router.get("/exportacoes/inspecoes/csv", async (req, res) => {
  try {
    const placa = req.query.placa?.trim()?.toUpperCase();
    const filtro = placa ? { placa } : {};

    const inspecoes = await Inspecao.find(filtro)
      .sort({ dataInspecao: -1 })
      .lean();

    if (placa && !inspecoes.length) {
      return res.status(404).json({
        status: "error",
        message: "Nenhuma inspeção encontrada para esta placa",
      });
    }

    const rows = inspecoes.map((inspecao) => ({
      id: inspecao._id,
      placa: inspecao.placa,
      dataInspecao: inspecao.dataInspecao
        ? new Date(inspecao.dataInspecao).toISOString()
        : "",
      fotoFrente: inspecao.fotos?.frente || "",
      fotoTraseira: inspecao.fotos?.traseira || "",
      fotoLateralEsquerda: inspecao.fotos?.lateralEsquerda || "",
      fotoLateralDireita: inspecao.fotos?.lateralDireita || "",
      fotoTopo: inspecao.fotos?.topo || "",
      createdAt: inspecao.createdAt ? new Date(inspecao.createdAt).toISOString() : "",
      updatedAt: inspecao.updatedAt ? new Date(inspecao.updatedAt).toISOString() : "",
    }));

    const csv = toCsv(rows, { headers: INSPECTION_CSV_HEADERS });
    const fileName = placa ? `inspecoes-${placa}.csv` : "inspecoes.csv";

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    return res.status(200).send(`﻿${csv}`);
  } catch (error) {
    console.error("Erro ao exportar CSV de inspeções:", error);
    return res.status(500).json({
      status: "error",
      message: "Erro ao exportar CSV de inspeções",
    });
  }
});


// ==========================================
// RELATÓRIO PDF DE INSPEÇÕES POR PLACA
// ==========================================
router.get("/relatorios/inspecoes/:placa/pdf", async (req, res) => {
  try {
    const placa = req.params.placa?.trim()?.toUpperCase();

    if (!placa) {
      return res.status(400).json({
        status: "error",
        message: "Placa obrigatória",
      });
    }

    const inspecoes = await Inspecao.find({ placa })
      .sort({ dataInspecao: -1 })
      .lean();

    if (!inspecoes.length) {
      return res.status(404).json({
        status: "error",
        message: "Nenhuma inspeção encontrada para esta placa",
      });
    }

    return generateInspectionReportPdf(res, placa, inspecoes);
  } catch (error) {
    console.error("Erro ao gerar PDF de inspeções:", error);
    return res.status(500).json({
      status: "error",
      message: "Erro ao gerar relatório PDF",
    });
  }
});




// ==========================================
// RELATÓRIO PDF DE CHECKLIST COMPLETO (RF-009)
// ==========================================
router.get("/relatorios/checklists/:id/pdf", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "error", message: "ID inválido" });
    }

    const checklist = await Checklist.findById(id).lean();
    if (!checklist) {
      return res.status(404).json({ status: "error", message: "Checklist não encontrado" });
    }

    const [veiculo, motorista, itens] = await Promise.all([
      checklist.veiculoId ? Vehicle.findById(checklist.veiculoId).lean() : null,
      checklist.usuarioId ? Usuario.findById(checklist.usuarioId).lean() : null,
      ItemChecklist.find({ checklistId: id }).lean(),
    ]);

    return generateChecklistReportPdf(res, { checklist, veiculo, motorista, itens });
  } catch (error) {
    console.error("Erro ao gerar PDF de checklist:", error);
    return res.status(500).json({ status: "error", message: "Erro ao gerar relatório PDF" });
  }
});

export default router;
