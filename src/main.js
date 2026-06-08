const {
  app,
  BrowserWindow,
  ipcMain,
  session
} = require('electron');
const path = require('path');

const { URL } = require('node:url')

const isDev = !app.isPackaged;

function mainWindow() {
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
  mainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) mainWindow();
  });
});

ipcMain.handle('open-roblox', (event, placeId) => {
  const win = new BrowserWindow({
    width: 800,
    height: 300
  });
  win.loadURL("https://apis.roblox.com/oauth/v1/authorize?client_id=8424212320330349269&code_challenge=PLEKKVCjdD1V_07wOKlAm7P02NC-LZ_1hQfdu5XSXEI&code_challenge_method=S256&redirect_uri=https://ro-find.vercel.app/redirect.html&scope=openid%20profile&response_type=code");
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

if (!isDev) {
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
      event.preventDefault();
    }
  });
}

// Session Secuityr
// idk what does do ngl
try {
  if (session?.defaultSession) {
    session.defaultSession
      .setPermissionRequestHandler((webContents, permission, callback) => {
        const parsedUrl = new URL(webContents.getURL());

        if (['notifications', 'media', 'location'].includes(permission)) {
          return callback(false);
        }

        if (parsedUrl.protocol !== 'https:') {
          return callback(false);
        }

        callback(true);
      });
  }
} catch (error) {
  console.error("Error:", error)
}