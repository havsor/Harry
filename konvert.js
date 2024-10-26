const fs = require('fs');
const XLSX = require('xlsx');

const workbook = XLSX.readFile('data.xlsx'); // Les data fra Excel-filen
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Konverter til JSON-format

fs.writeFileSync('data.json', JSON.stringify(jsonData, null, 2)); // Lagre som data.json
console.log('Data ble konvertert og lagret som data.json');
