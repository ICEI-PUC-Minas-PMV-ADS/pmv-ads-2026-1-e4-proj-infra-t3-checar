const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return '""';
  }

  const normalizedValue = String(value).replace(/"/g, '""');
  return `"${normalizedValue}"`;
};

const toCsv = (rows, options = {}) => {
  const headers = options.headers || (rows.length ? Object.keys(rows[0]) : []);

  if (!headers.length) {
    return "";
  }

  const headerLine = headers.map(escapeCsvValue).join(",");
  const dataLines = rows.map((row) =>
    headers.map((header) => escapeCsvValue(row[header])).join(",")
  );

  return [headerLine, ...dataLines].join("\n");
};

export { toCsv };