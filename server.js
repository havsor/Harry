const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const WebSocket = require('ws');
const http = require('http');

const filePath = path.join(__dirname, 'data.xlsx'); // Excel-filens plassering
let previousData = null;

// Funksjon for å lese Excel-filen
function readExcelData() {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
}

// Initialiser data ved oppstart
previousData = readExcelData();

// Start HTTP-serveren for å levere data fra Excel-filen ved sideinnlasting
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/data') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(previousData));
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Start WebSocket-serveren
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  // Send eksisterende data til ny klient ved tilkobling
  ws.send(JSON.stringify(previousData));
});

// Overvåk Excel-filen for endringer og oppdater klienter ved behov
fs.watchFile(filePath, { interval: 1000 }, () => {
  const newData = readExcelData();

  // Sjekk om dataene har endret seg
  if (JSON.stringify(newData) !== JSON.stringify(previousData)) {
    previousData = newData;

    // Send oppdaterte data til alle WebSocket-klienter
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(previousData));
      }
    });
  }
});

// Start serveren på port 8080
server.listen(8080, () => {
  console.log('Server kjører på http://localhost:8080 og WebSocket på ws://localhost:8080');
});
