import PDFDocument from 'pdfkit';

// ── Constantes de layout ──────────────────────────────────────────────────────
const BRAND   = '#004aad';
const SUCCESS = '#16a34a';
const DANGER  = '#dc2626';
const GRAY    = '#6b7280';
const BLACK   = '#111827';

const formatDateTime = (value) => {
  if (!value) return 'Não informada';
  try { return new Date(value).toLocaleString('pt-BR'); } catch { return 'Inválida'; }
};

const formatDate = (value) => {
  if (!value) return 'Não informada';
  try { return new Date(value).toLocaleDateString('pt-BR'); } catch { return 'Inválida'; }
};

// ── Helpers de desenho ────────────────────────────────────────────────────────

const drawHeader = (doc, title, subtitle) => {
  doc.rect(0, 0, doc.page.width, 70).fill(BRAND);
  doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold')
     .text('CHECAR', 50, 20, { continued: true })
     .fontSize(11).font('Helvetica').text(`  — ${title}`, { align: 'left' });
  if (subtitle) {
    doc.fontSize(9).fillColor('rgba(255,255,255,0.8)').text(subtitle, 50, 46);
  }
  doc.fillColor(BLACK);
  doc.y = 90;
};

const sectionTitle = (doc, text) => {
  doc.moveDown(0.5);
  doc.rect(50, doc.y, doc.page.width - 100, 22).fill('#e5e7eb');
  doc.fillColor(BRAND).font('Helvetica-Bold').fontSize(10)
     .text(text, 56, doc.y - 18);
  doc.fillColor(BLACK).font('Helvetica').fontSize(10);
  doc.moveDown(0.3);
};

const field = (doc, label, value, y) => {
  const labelW = 140;
  const x = 50;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(GRAY).text(label, x, y, { width: labelW });
  doc.font('Helvetica').fontSize(9).fillColor(BLACK).text(String(value || '—'), x + labelW, y, { width: 340 });
};

const twoFields = (doc, l1, v1, l2, v2) => {
  const y = doc.y;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(GRAY).text(l1, 50, y, { width: 80 });
  doc.font('Helvetica').fontSize(9).fillColor(BLACK).text(String(v1 || '—'), 130, y, { width: 160 });
  doc.font('Helvetica-Bold').fillColor(GRAY).text(l2, 310, y, { width: 80 });
  doc.font('Helvetica').fillColor(BLACK).text(String(v2 || '—'), 390, y, { width: 155 });
  doc.moveDown(0.7);
};

const divider = (doc) => {
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#d1d5db').stroke();
  doc.moveDown(0.3);
};

const conformidadeBadge = (doc, conforme) => {
  const x = doc.page.width - 160;
  const y = 26;
  const color = conforme ? SUCCESS : DANGER;
  const text  = conforme ? '✓  CONFORME' : '✗  NÃO CONFORME';
  doc.rect(x, y, 110, 22).fill(color);
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
     .text(text, x, y + 7, { width: 110, align: 'center' });
  doc.fillColor(BLACK).font('Helvetica');
};

// ── Gerador de PDF de inspeções fotográficas (existente) ──────────────────────

const generateInspectionReportPdf = (res, placa, inspecoes) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const safePlate = placa.toUpperCase();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="inspecoes-${safePlate}.pdf"`);
  doc.pipe(res);

  drawHeader(doc, 'Relatório de Inspeções', `Placa: ${safePlate} — Total: ${inspecoes.length}`);

  inspecoes.forEach((inspecao, i) => {
    if (i > 0) {
      if (doc.y > doc.page.height - 160) doc.addPage();
      divider(doc);
    }

    sectionTitle(doc, `Inspeção ${i + 1}`);
    const y0 = doc.y;
    field(doc, 'Data:', formatDateTime(inspecao.dataInspecao), y0); doc.moveDown(0.7);
    field(doc, 'Frente:',          inspecao.fotos?.frente          || '—', doc.y); doc.moveDown(0.7);
    field(doc, 'Traseira:',        inspecao.fotos?.traseira        || '—', doc.y); doc.moveDown(0.7);
    field(doc, 'Lateral Esq.:',   inspecao.fotos?.lateralEsquerda || '—', doc.y); doc.moveDown(0.7);
    field(doc, 'Lateral Dir.:',   inspecao.fotos?.lateralDireita  || '—', doc.y); doc.moveDown(0.7);
    field(doc, 'Topo:',            inspecao.fotos?.topo            || '—', doc.y); doc.moveDown(0.7);
  });

  doc.end();
};

// ── Gerador de PDF de checklist completo (RF-009) ─────────────────────────────

/**
 * @param {object} res        — Express response
 * @param {object} checklist  — documento Checklist (Mongoose lean)
 * @param {object} veiculo    — documento Vehicle (lean)
 * @param {object} motorista  — documento Usuario do motorista (lean)
 * @param {Array}  itens      — array de ItemChecklist (lean)
 */
const generateChecklistReportPdf = (res, { checklist, veiculo, motorista, itens }) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="checklist-${checklist._id}.pdf"`
  );
  doc.pipe(res);

  const conforme = checklist.conformidade;

  // ── Cabeçalho ─────────────────────────────────────────────────────────────
  drawHeader(doc, 'Relatório de Checklist', formatDateTime(checklist.data));
  if (conforme !== null && conforme !== undefined) {
    conformidadeBadge(doc, conforme);
  }

  // ── 1. Dados do veículo ───────────────────────────────────────────────────
  sectionTitle(doc, '1. Dados do Veículo');
  twoFields(doc, 'Placa:', veiculo?.plate, 'Modelo:', veiculo?.model);
  twoFields(doc, 'Marca:', veiculo?.marca, 'Cor:', veiculo?.cor);
  twoFields(doc, 'Ano:', veiculo?.year, 'Tipo:', veiculo?.vehicleType);
  twoFields(doc, 'Status:', veiculo?.operationalStatus, 'Km:', veiculo?.mileage);

  // ── 2. Motorista ──────────────────────────────────────────────────────────
  sectionTitle(doc, '2. Motorista');
  const y2 = doc.y;
  field(doc, 'Nome:', motorista?.nome, y2); doc.moveDown(0.7);
  field(doc, 'E-mail:', motorista?.email, doc.y); doc.moveDown(0.7);
  field(doc, 'Data:', formatDate(checklist.data), doc.y); doc.moveDown(0.7);

  // ── 3. Conformidade ───────────────────────────────────────────────────────
  sectionTitle(doc, '3. Conformidade Geral');
  const y3 = doc.y;
  const conformeText = conforme === true
    ? 'CONFORME — Todos os itens estão em ordem.'
    : conforme === false
      ? 'NÃO CONFORME — Há itens com problemas identificados.'
      : 'Aguardando avaliação.';
  const conformeColor = conforme === true ? SUCCESS : conforme === false ? DANGER : GRAY;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(conformeColor)
     .text(conformeText, 50, y3); doc.fillColor(BLACK).font('Helvetica');
  doc.moveDown(0.7);

  // ── 4. Itens do checklist ─────────────────────────────────────────────────
  sectionTitle(doc, '4. Itens Avaliados');

  if (itens.length === 0) {
    doc.fontSize(9).fillColor(GRAY).text('Nenhum item registrado.', 50);
    doc.fillColor(BLACK);
  } else {
    itens.forEach((item, idx) => {
      if (doc.y > doc.page.height - 100) doc.addPage();

      const confItem = item.status === 'Conforme';
      const circleColor = confItem ? SUCCESS : DANGER;
      const cx = 57, cy = doc.y + 5;

      doc.circle(cx, cy, 5).fill(circleColor);

      doc.font('Helvetica-Bold').fontSize(9).fillColor(BLACK)
         .text(`${idx + 1}. ${item.descricao}`, 68, doc.y - 2, { continued: true });
      doc.font('Helvetica').fillColor(confItem ? SUCCESS : DANGER)
         .text(`  [${item.status}]`);
      doc.fillColor(BLACK);

      if (item.observacao) {
        doc.font('Helvetica').fontSize(8).fillColor(GRAY)
           .text(`   Obs: ${item.observacao}`, 68, doc.y);
        doc.fillColor(BLACK);
      }
      doc.moveDown(0.4);
    });
  }

  // ── 5. Observações gerais ─────────────────────────────────────────────────
  if (checklist.observacao) {
    sectionTitle(doc, '5. Observações Gerais');
    doc.fontSize(9).fillColor(BLACK).text(checklist.observacao, 50, doc.y, {
      width: doc.page.width - 100,
    });
    doc.moveDown(0.7);
  }

  // ── 6. Assinatura ─────────────────────────────────────────────────────────
  if (doc.y > doc.page.height - 160) doc.addPage();

  sectionTitle(doc, '6. Assinatura do Motorista');
  const sig = checklist.assinatura;
  if (sig && sig.startsWith('data:image')) {
    // Base64 inline — embed image
    try {
      const raw    = sig.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(raw, 'base64');
      doc.image(buffer, 50, doc.y, { width: 200, height: 80 });
      doc.y += 90;
    } catch {
      doc.fontSize(9).fillColor(GRAY).text('[Assinatura não pôde ser carregada]');
    }
  } else if (sig) {
    // URL do Azure Blob
    doc.fontSize(9).fillColor(GRAY)
       .text(`Assinatura disponível em: ${sig}`, 50, doc.y, { width: doc.page.width - 100 });
  } else {
    doc.fontSize(9).fillColor(GRAY).text('Assinatura não disponível.', 50, doc.y);
  }
  doc.fillColor(BLACK);
  doc.moveDown(0.7);

  // ── Rodapé ────────────────────────────────────────────────────────────────
  const footerY = doc.page.height - 40;
  doc.fontSize(7).fillColor(GRAY)
     .text(
       `Documento gerado em ${formatDateTime(new Date())} — CHECAR Sistema de Gestão de Frotas`,
       50, footerY, { align: 'center', width: doc.page.width - 100 }
     );

  doc.end();
};

export { generateInspectionReportPdf, generateChecklistReportPdf };
