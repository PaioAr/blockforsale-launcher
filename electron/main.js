const { app, BrowserWindow, ipcMain, protocol, net } = require('electron')
const path = require('path')
const { Auth } = require('msmc')

const isDev = !app.isPackaged
let mainWindow

app.whenReady().then(() => {
  protocol.handle('media', (req) => {
    const filePath = req.url.replace('media://', '')
    return net.fetch('file://' + decodeURIComponent(filePath))
  })
  createWindow()
})

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 600,
    minWidth: 960,
    minHeight: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

ipcMain.handle('microsoft-login', async () => {
  try {
    const authManager = new Auth('select_account')
    const xboxManager = await authManager.launch('electron')
    const token = await xboxManager.getMinecraft()
    return {
      success: true,
      profile: {
        name: token.profile.name,
        uuid: token.profile.id,
        accessToken: token.mcToken,
      }
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.on('window-close', () => mainWindow.close())
ipcMain.handle('get-app-path', () => {
  return path.join(__dirname, '..')
})
ipcMain.on('window-minimize', () => mainWindow.minimize())
ipcMain.on('window-maximize', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
