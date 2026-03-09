const { contextBridge } = require('electron');

// Exponer APIs seguras al frontend (si las necesitas)
contextBridge.exposeInMainWorld('electronAPI', {
  // Aquí puedes añadir funciones para comunicar frontend con sistema
  // Ejemplo: getVersion: () => process.version
});