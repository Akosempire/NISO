// src/utils/csv.ts

export function parseCSV(content: string): Record<string, any>[] {
  const lines = content.split('\n').filter((line) => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    return headers.reduce(
      (obj, header, index) => {
        obj[header] = values[index];
        return obj;
      },
      {} as Record<string, any>
    );
  });

  return rows;
}

export function generateCSV(data: Record<string, any>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) => headers.map((h) => JSON.stringify(row[h])).join(',')),
  ].join('\n');

  return csvContent;
}
