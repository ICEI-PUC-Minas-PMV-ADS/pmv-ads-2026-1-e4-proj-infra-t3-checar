import PDFDocument from "pdfkit";

const formatDateTime = (value) => {
  if (!value) return "Data não informada";

  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return "Data inválida";
  }
};

const generateInspectionReportPdf = (res, placa, inspecoes) => {
  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
  });

  const safePlate = placa.toUpperCase();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="relatorio-inspecoes-${safePlate}.pdf"`
  );

  doc.pipe(res);

  doc.fontSize(18).text("CHECAR - Relatório de Inspeções", {
    align: "center",
  });

  doc.moveDown();
  doc.fontSize(12).text(`Placa: ${safePlate}`);
  doc.text(`Total de inspeções encontradas: ${inspecoes.length}`);
  doc.moveDown();

  inspecoes.forEach((inspecao, index) => {
    doc.fontSize(13).text(`Inspeção ${index + 1}`, {
      underline: true,
    });

    doc.moveDown(0.5);
    doc.fontSize(11).text(`Data da inspeção: ${formatDateTime(inspecao.dataInspecao)}`);
    doc.text(`Foto frente: ${inspecao.fotos?.frente || "Não informada"}`);
    doc.text(`Foto traseira: ${inspecao.fotos?.traseira || "Não informada"}`);
    doc.text(
      `Foto lateral esquerda: ${inspecao.fotos?.lateralEsquerda || "Não informada"}`
    );
    doc.text(
      `Foto lateral direita: ${inspecao.fotos?.lateralDireita || "Não informada"}`
    );
    doc.text(`Foto topo: ${inspecao.fotos?.topo || "Não informada"}`);

    if (index < inspecoes.length - 1) {
      doc.moveDown();
      doc.moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke();
      doc.moveDown();
    }
  });

  doc.end();
};

export { generateInspectionReportPdf };