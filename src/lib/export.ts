import * as XLSX from 'xlsx';

/**
 * A generic utility to export an array of objects to an .xlsx file.
 * @param data The array of data to export.
 * @param fileName The name of the file to be downloaded (without extension).
 * @param sheetName The name of the worksheet within the Excel file.
 */
export function exportToXLSX(data: any[], fileName: string, sheetName: string = 'Sheet1'): void {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error("Error exporting to XLSX:", error);
    throw new Error("Failed to generate Excel file.");
  }
}
