import Papa from 'papaparse';
import { Workbook } from 'exceljs';

export interface ParsedData {
  headers: string[];
  rows: Record<string, any>[];
  fileName: string;
}

export interface FileParser {
  parse(file: File): Promise<ParsedData>;
  supports(mimeType: string): boolean;
}

// CSV Parser
export const csvParser: FileParser = {
  supports: (mimeType: string) => mimeType === 'text/csv' || mimeType === 'application/vnd.ms-excel',
  parse: (file: File): Promise<ParsedData> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length === 0) {
            reject(new Error('CSV file is empty'));
            return;
          }
          const headers = Object.keys(results.data[0] as Record<string, any>);
          resolve({
            headers,
            rows: results.data as Record<string, any>[],
            fileName: file.name,
          });
        },
        error: (error) => reject(error),
      });
    });
  },
};

// Excel Parser
export const excelParser: FileParser = {
  supports: (mimeType: string) =>
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel',
  parse: (file: File): Promise<ParsedData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result as ArrayBuffer;
          const workbook = new Workbook();
          await workbook.xlsx.load(data);
          
          const worksheet = workbook.worksheets[0];
          if (!worksheet) {
            reject(new Error('Excel file has no worksheets'));
            return;
          }

          const rows: Record<string, any>[] = [];
          let headers: string[] = [];
          
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
              headers = [];
              for (let i = 1; i < (row.values as any[]).length; i++) {
                headers.push(String((row.values as any[])[i]));
              }
            } else {
              const rowData: Record<string, any> = {};
              for (let i = 1; i < (row.values as any[]).length; i++) {
                if (headers[i - 1]) {
                  rowData[headers[i - 1]] = (row.values as any[])[i];
                }
              }
              rows.push(rowData);
            }
          });

          if (rows.length === 0) {
            reject(new Error('Excel file is empty'));
            return;
          }

          resolve({
            headers,
            rows,
            fileName: file.name,
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  },
};

const parsers: FileParser[] = [csvParser, excelParser];

export async function parseFile(file: File): Promise<ParsedData> {
  const parser = parsers.find((p) => p.supports(file.type));
  if (!parser) {
    throw new Error(`Unsupported file type: ${file.type}. Supported formats: CSV, XLSX`);
  }
  return parser.parse(file);
}
