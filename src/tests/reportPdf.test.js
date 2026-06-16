import { jest } from '@jest/globals';

// Mock PDFKit before importing the module under test
const mockDoc = {
  pipe: jest.fn(),
  fontSize: jest.fn().mockReturnThis(),
  font: jest.fn().mockReturnThis(),
  text: jest.fn().mockReturnThis(),
  moveDown: jest.fn().mockReturnThis(),
  moveTo: jest.fn().mockReturnThis(),
  lineTo: jest.fn().mockReturnThis(),
  stroke: jest.fn().mockReturnThis(),
  strokeColor: jest.fn().mockReturnThis(),
  rect: jest.fn().mockReturnThis(),
  fill: jest.fn().mockReturnThis(),
  fillColor: jest.fn().mockReturnThis(),
  circle: jest.fn().mockReturnThis(),
  image: jest.fn().mockReturnThis(),
  addPage: jest.fn().mockReturnThis(),
  end: jest.fn(),
  page: { margins: { left: 50, right: 50 }, width: 595, height: 842 },
  y: 200,
};

jest.mock('pdfkit', () => jest.fn(() => mockDoc));

import PDFDocument from 'pdfkit';
import { generateInspectionReportPdf } from '../utils/reportPdf.js';

const buildRes = () => ({
  setHeader: jest.fn(),
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
});

const baseInspecao = {
  dataInspecao: '2024-01-15T10:00:00.000Z',
  fotos: {
    frente: 'uploads/frente.jpg',
    traseira: 'uploads/traseira.jpg',
    lateralEsquerda: 'uploads/esquerda.jpg',
    lateralDireita: 'uploads/direita.jpg',
    topo: 'uploads/topo.jpg',
  },
};

describe('utils/reportPdf — generateInspectionReportPdf', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('define os headers corretos de Content-Type e Content-Disposition', () => {
    const res = buildRes();

    generateInspectionReportPdf(res, 'ABC1234', [baseInspecao]);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="inspecoes-ABC1234.pdf"'
    );
  });

  it('conecta o documento ao response via pipe', () => {
    const res = buildRes();

    generateInspectionReportPdf(res, 'ABC1234', [baseInspecao]);

    expect(mockDoc.pipe).toHaveBeenCalledWith(res);
  });

  it('finaliza o documento com end()', () => {
    const res = buildRes();

    generateInspectionReportPdf(res, 'ABC1234', [baseInspecao]);

    expect(mockDoc.end).toHaveBeenCalled();
  });

  it('processa múltiplas inspeções e adiciona separador entre elas', () => {
    const res = buildRes();
    const inspecoes = [baseInspecao, { ...baseInspecao, dataInspecao: '2024-02-01T00:00:00.000Z' }];

    generateInspectionReportPdf(res, 'XYZ9999', inspecoes);

    // Com 2 inspeções deve haver separador (stroke) entre elas
    expect(mockDoc.stroke).toHaveBeenCalled();
  });

  it('trata graciosamente fotos ausentes (null/undefined)', () => {
    const res = buildRes();
    const inspecaoSemFotos = {
      dataInspecao: '2024-01-15T10:00:00.000Z',
      fotos: {},
    };

    expect(() =>
      generateInspectionReportPdf(res, 'ABC1234', [inspecaoSemFotos])
    ).not.toThrow();
    expect(mockDoc.end).toHaveBeenCalled();
  });

  it('trata graciosamente data ausente (null/undefined)', () => {
    const res = buildRes();
    const inspecaoSemData = {
      dataInspecao: null,
      fotos: baseInspecao.fotos,
    };

    expect(() =>
      generateInspectionReportPdf(res, 'ABC1234', [inspecaoSemData])
    ).not.toThrow();
    expect(mockDoc.end).toHaveBeenCalled();
  });
});
