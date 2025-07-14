const {
  app,
  BrowserWindow,
  ipcMain
} = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    icon: './core/icon.ico',
    webPreferences: {
      preload: path.join(__dirname, 'core', 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: false
    },
    titleBarStyle: 'hiddenInset',
    fullscreenable: true,
  });

  win.loadFile(path.join(__dirname, 'pages', 'index.html'));

  win.setMenuBarVisibility(false)
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

ipcMain.handle('open-roblox', (event, placeId) => {
  const win = new BrowserWindow({
    width: 800,
    height: 300
  });
  win.loadURL('https://google.com');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});