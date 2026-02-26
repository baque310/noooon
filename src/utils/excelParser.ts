import * as XLSX from "xlsx";

export const getJsonFromExcel = (
  file: File | null
): Promise<Record<string, string>[]> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file provided"));
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer) {
          return reject(new Error("Failed to load file content"));
        }

        const data = new Uint8Array(arrayBuffer as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json<(string | null)[]>(worksheet, {
          header: 1,
        });

        if (!Array.isArray(rawData) || rawData.length < 2) {
          return reject(
            new Error("Excel file must contain at least one data row")
          );
        }

        const headers = rawData[0].map((h: any) => String(h ?? "").trim());
        const rows = rawData.slice(1);

        const result = rows
          .filter(
            (row) =>
              Array.isArray(row) &&
              row.some((cell) => cell !== null && cell !== "")
          )
          .map((row) => {
            const obj: Record<string, string> = {};
            headers.forEach((key, index) => {
              obj[key] = String(row[index] ?? "").trim();
            });
            return obj;
          });

        resolve(result);
      } catch (error) {
        reject(
          new Error("Failed to parse Excel file: " + (error as Error).message)
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Export any array of objects to an Excel file.
 *
 * @param data - Array of objects (must be JSON-serializable)
 * @param fileName - Optional filename without extension (default: export_<timestamp>)
 * @param sheetName - Optional sheet name (default: Sheet1)
 */
export const exportJsonToExcel = ({
  data,
  fileName = "export",
  sheetName = "Sheet1",
}: {
  data: Record<string, any>[];
  fileName?: string;
  sheetName?: string;
}) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const finalFileName = `${fileName || "export"}_${timestamp}.xlsx`;

  XLSX.writeFile(wb, finalFileName);
};
