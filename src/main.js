const {
  app,
  BrowserWindow,
  ipcMain,
  session
} = require('electron');

const path = require('path');
const { sendToDiscord } = require('./core/hook/submissionHook');
const robloxOAuth = require('./core/oauth/robloxOAuth');
const { URL } = require('node:url');

const isDev = !app.isPackaged;

app.on('web-contents-created', (_, contents) => {
  contents.setWindowOpenHandler(() => ({ action: 'deny' }));
});

app.on('open-url', (event, url) => {
  event.preventDefault();
});

function handleOAuthCallback(url) {
  const parsed = new URL(url);
  const code = parsed.searchParams.get('code');
  if (code && mainWindow) {
    mainWindow.webContents.send('oauth-code', code);
  }
}

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

  win.loadFile(path.join(__dirname, 'pages', 'startup.html'));
  win.setMenuBarVisibility(true);

  if (!isDev) {
    win.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
        event.preventDefault();
        win.setMenuBarVisibility(false);
      }
    });
  }
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('oauth:roblox', () => robloxOAuth.start());

  ipcMain.handle('send-to-discord', async (event, payload) => {
    return await sendToDiscord(payload);
  });

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const parsedUrl = new URL(webContents.getURL());

    if (['notifications', 'media', 'location'].includes(permission)) {
      return callback(false);
    }

    if (parsedUrl.protocol !== 'https:') {
      return callback(false);
    }

    callback(true);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});