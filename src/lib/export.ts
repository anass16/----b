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

/**
 * A utility to export an array of objects to a .csv file.
 * @param data The array of objects to export, where keys match the headers.
 * @param headers The array of strings for the header row, in the desired order.
 * @param fileName The name of the file to be downloaded (with extension).
 */
export function exportToCSV(data: any[], headers: string[], fileName: string): void {
  try {
    const csvRows = [];
    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const item of data) {
      const values = headers.map(header => {
        const value = item[header] === null || item[header] === undefined ? '' : item[header];
        const escaped = ('' + value).replace(/"/g, '""'); // Escape double quotes
        return `"${escaped}"`; // Wrap every value in double quotes
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    throw new Error("Failed to generate CSV file.");
  }
}
