const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

// Detectar si estamos en desarrollo
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  // IMPORTANTE: Configuración para producción
  if (isDev) {
    // En desarrollo: carga el servidor de React
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    // En producción: carga el archivo index.html correctamente
    const indexPath = path.join(__dirname, '../build/index.html');
    win.loadURL(url.format({
      pathname: indexPath,
      protocol: 'file:',
      slashes: true
    }));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});