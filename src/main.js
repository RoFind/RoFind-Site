const {
  app,
  BrowserWindow,
  ipcMain,
  session
} = require('electron');

const path = require('path');

const robloxOAuth = require('./core/oauth/robloxOAuth');

const { URL } = require('node:url')

const isDev = !app.isPackaged;

// app.setAsDefaultProtocolClient('rofind');

app.on('web-contents-created', (_, contents) => {
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
});

app.on('open-url', (event, url) => {
  event.preventDefault();
});

// const gotLock = app.requestSingleInstanceLock();
// if (!gotLock) {
//   app.quit();
// } else {
//   app.on('second-instance', (event, commandLine) => {
//     const url = commandLine.find(arg => arg.startsWith('rofind://'));
//     if (url) handleOAuthCallback(url);
//   });
// }

function handleOAuthCallback(url) {
  const parsed = new URL(url);
  const code = parsed.searchParams.get('code');
  if (code && mainWindow) {
    mainWindow.webContents.send('oauth-code', code);
  }
}

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

  win.loadFile(path.join(__dirname, 'pages', 'startup.html'));

  win.setMenuBarVisibility(true)
}

app.whenReady().then(() => {
  mainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) mainWindow();
  });
});

ipcMain.handle('oauth:roblox', () => {
  return robloxOAuth.start();
});
// let authWin;

// ipcMain.handle('RobloxOAUTH', async () => {
//   console.log("RobloxOAUTH Requested");

//   authWin = new BrowserWindow({
//     width: 600,
//     height: 800,
//     show: true,
//     webPreferences: {
//       nodeIntegration: false,
//       contextIsolation: true
//     }
//   });

//   const state = crypto.randomUUID()
//   const authUrl = `https://apis.roblox.com/oauth/v1/authorize?client_id=8424212320330349269&code_challenge=PLEKKVCjdD1V_07wOKlAm7P02NC-LZ_1hQfdu5XSXEI&code_challenge_method=S256&redirect_uri=https://ro-find.vercel.app/redirect.html&scope=openid%20profile&response_type=code&state=${state}`

//   authWin.loadURL(authUrl);

//   return new Promise((resolve) => {
//     authWin.webContents.on('will-redirect', (event, url) => {
//       const u = new URL(url);
//       const code = u.searchParams.get('code');

//       if (code) {
//         resolve(code);
//         authWin.close();
//         authWin = null;
//       }
//     });
//   });
// });


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

if (!isDev) {
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
      event.preventDefault();
      win.setMenuBarVisibility(false)
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