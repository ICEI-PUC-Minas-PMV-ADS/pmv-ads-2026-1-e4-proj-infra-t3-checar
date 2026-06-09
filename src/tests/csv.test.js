import { toCsv } from '../utils/csv.js';

describe('utils/csv — toCsv', () => {
  // ── empty cases ───────────────────────────────────────────────────

  it('retorna string vazia quando rows está vazio e sem headers', () => {
    expect(toCsv([])).toBe('');
  });

  it('retorna somente o header quando rows está vazio mas headers são fornecidos', () => {
    const result = toCsv([], { headers: ['id', 'nome'] });
    expect(result).toBe('"id","nome"');
  });

  // ── single row ────────────────────────────────────────────────────

  it('gera CSV correto a partir de um objeto simples', () => {
    const rows = [{ id: '1', nome: 'João', email: 'joao@test.com' }];
    const result = toCsv(rows);
    const lines = result.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('"id","nome","email"');
    expect(lines[1]).toBe('"1","João","joao@test.com"');
  });

  // ── multiple rows ─────────────────────────────────────────────────

  it('gera CSV correto para múltiplas linhas', () => {
    const rows = [
      { placa: 'ABC1234', modelo: 'Fiat' },
      { placa: 'XYZ9999', modelo: 'VW' },
    ];
    const result = toCsv(rows);
    const lines = result.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe('"ABC1234","Fiat"');
    expect(lines[2]).toBe('"XYZ9999","VW"');
  });

  // ── null / undefined values ───────────────────────────────────────

  it('substitui null por string vazia entre aspas', () => {
    const rows = [{ nome: null }];
    const result = toCsv(rows);
    expect(result).toContain('""');
  });

  it('substitui undefined por string vazia entre aspas', () => {
    const rows = [{ nome: undefined }];
    const result = toCsv(rows);
    expect(result).toContain('""');
  });

  // ── quotes escaping ───────────────────────────────────────────────

  it('escapa aspas duplas dentro dos valores', () => {
    const rows = [{ descricao: 'diz "olá"' }];
    const result = toCsv(rows);
    expect(result).toContain('"diz ""olá"""');
  });

  // ── custom headers ────────────────────────────────────────────────

  it('usa headers personalizados e ignora colunas extras da linha', () => {
    const rows = [{ id: '1', nome: 'João', extra: 'descartado' }];
    const result = toCsv(rows, { headers: ['id', 'nome'] });
    const lines = result.split('\n');
    expect(lines[0]).toBe('"id","nome"');
    expect(lines[1]).toBe('"1","João"');
  });

  it('preenche com string vazia quando header não existe na linha', () => {
    const rows = [{ id: '1' }];
    const result = toCsv(rows, { headers: ['id', 'inexistente'] });
    expect(result).toContain('""');
  });
});
