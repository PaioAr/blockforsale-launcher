const { app, BrowserWindow, ipcMain, protocol, net } = require('electron')
const path = require('path')
const os = require('os')
const fs = require('fs')
const https = require('https')
const { spawn } = require('child_process')
const { Auth } = require('msmc')

require('events').EventEmitter.defaultMaxListeners = 50

const isDev = !app.isPackaged
let mainWindow

const rootDir = path.join(os.homedir(), '.blockforsale')
const jreDir = path.join(rootDir, 'jre')
if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true })

// ─── VENTANA ────────────────────────────────────────────────────────────────

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

// ─── HELPERS ────────────────────────────────────────────────────────────────

function log(msg) {
  console.log('[BFS]', msg)
  if (mainWindow) mainWindow.webContents.send('launch-log', msg)
}

function progress(current, total, file = '') {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  console.log(`[BFS] Progreso: ${pct}% (${current}/${total}) ${file}`)
  if (mainWindow) mainWindow.webContents.send('launch-progress', { current, total, pct, file })
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpsGet(res.headers.location).then(resolve).catch(reject)
      }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => { try { resolve(JSON.parse(data)) } catch(e) { reject(e) } })
      res.on('error', reject)
    }).on('error', reject)
  })
}

function downloadFile(url, dest, label = '') {
  return new Promise((resolve, reject) => {
    const doRequest = (url) => {
      https.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return doRequest(res.headers.location)
        }
        const total = parseInt(res.headers['content-length'] || '0')
        let current = 0
        const file = fs.createWriteStream(dest)
        res.on('data', chunk => {
          current += chunk.length
          file.write(chunk)
          progress(current, total, label)
        })
        res.on('end', () => { file.end(); resolve() })
        res.on('error', reject)
      }).on('error', reject)
    }
    doRequest(url)
  })
}

// ─── JAVA ────────────────────────────────────────────────────────────────────

function findJava() {
  if (!fs.existsSync(jreDir)) return null
  const exe = process.platform === 'win32' ? 'java.exe' : 'java'
  try {
    for (const entry of fs.readdirSync(jreDir)) {
      const p = path.join(jreDir, entry, 'bin', exe)
      if (fs.existsSync(p)) return p
    }
  } catch {}
  return null
}

async function ensureJava() {
  const cached = findJava()
  if (cached) {
    log(`Java encontrado: ${cached}`)
    return cached
  }

  log('Java no encontrado. Descargando Java 21...')
  if (!fs.existsSync(jreDir)) fs.mkdirSync(jreDir, { recursive: true })

  const url = 'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.2%2B13/OpenJDK21U-jre_x64_windows_hotspot_21.0.2_13.zip'
  const tempZip = path.join(rootDir, 'java_temp.zip')

  log('Descargando Java 21 portable...')
  await downloadFile(url, tempZip, 'Java 21')

  log('Extrayendo Java...')
  const extract = require('extract-zip')
  await extract(tempZip, { dir: jreDir })
  try { fs.unlinkSync(tempZip) } catch {}

  const javaPath = findJava()
  if (!javaPath) throw new Error('No se encontró java.exe tras la extracción')

  log(`Java instalado: ${javaPath}`)
  return javaPath
}

// ─── MINECRAFT ───────────────────────────────────────────────────────────────

async function installMinecraft(gameDir, version) {
  const { install, installLibraries, installAssets } = require('@xmcl/installer')

  log('Obteniendo manifest de versiones de Mojang...')
  const manifest = await httpsGet('https://launchermeta.mojang.com/mc/game/version_manifest.json')

  const versionInfo = manifest.versions.find(v => v.id === version)
  if (!versionInfo) throw new Error(`Versión ${version} no encontrada`)

  log(`Instalando Minecraft ${version}...`)
  const resolved = await install(versionInfo, gameDir)
  log(`Versión ${version} instalada.`)

  log('Descargando librerías...')
  await installLibraries(resolved, { maxConcurrency: 4 })
  log('Librerías descargadas.')

  log('Descargando assets...')
  let assetsOk = false
  let attempts = 0
  while (!assetsOk && attempts < 3) {
    try {
      attempts++
      log(`Descargando assets (intento ${attempts}/3)...`)
      await installAssets(resolved, {
        maxConcurrency: 4,
        assetsDownloadConcurrency: 4,
      })
      assetsOk = true
      log('Assets descargados correctamente.')
    } catch (err) {
      log(`Assets fallaron en intento ${attempts}: ${err.message?.slice(0, 80)}`)
      if (attempts >= 3) throw new Error('No se pudieron descargar los assets después de 3 intentos.')
      log('Reintentando...')
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  return resolved
}

async function installFabric(gameDir, mcVersion, fabricVersion) {
  const { installFabric } = require('@xmcl/installer')

  log(`Instalando Fabric ${fabricVersion} para Minecraft ${mcVersion}...`)
  await installFabric(gameDir, {
    minecraftVersion: mcVersion,
    loader: fabricVersion
  })
  log('Fabric instalado.')
}

// ─── HANDLER PRINCIPAL ───────────────────────────────────────────────────────

ipcMain.handle('launch-minecraft', async (event, { profile, settings, event: ev }) => {
  const { launch } = require('@xmcl/core')
  const axios = require('axios')
  const extract = require('extract-zip')

  const gameDir = path.join(rootDir, ev.name)
  const versionId = '1.21.11-0.18.6'
  const zipUrl = ev.zipUrl
  const zipPath = path.join(rootDir, `${ev.name}_temp.zip`)
  const versionCheck = path.join(gameDir, 'versions', versionId)

  log(`=== Lanzando ${ev.name} ===`)
  log(`Directorio: ${gameDir}`)

  try {
    // PASO 1: Java
    const javaPath = await ensureJava()
    log(`Java: ${javaPath}`)

    // PASO 2: Descargar instancia si no existe
    if (!fs.existsSync(versionCheck)) {
      log('Instancia no encontrada. Descargando...')
      progress(0, 100, 'Iniciando descarga...')

      if (!fs.existsSync(gameDir)) fs.mkdirSync(gameDir, { recursive: true })

      // Descargar con progreso
      const response = await axios({
        url: zipUrl,
        method: 'GET',
        responseType: 'stream',
        maxRedirects: 5,
      })

      const totalSize = parseInt(response.headers['content-length'] || '0')
      let downloaded = 0

      const writer = fs.createWriteStream(zipPath)
      response.data.on('data', chunk => {
        downloaded += chunk.length
        const pct = totalSize > 0 ? Math.round((downloaded / totalSize) * 80) : 0
        const mb = (downloaded / 1024 / 1024).toFixed(1)
        const total = (totalSize / 1024 / 1024).toFixed(1)
        progress(pct, 100, `Descargando... ${mb}MB / ${total}MB`)
        mainWindow.webContents.send('launch-log', `Descargando ${mb}MB / ${total}MB`)
      })
      response.data.pipe(writer)

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
      })

      log('Descarga completa. Extrayendo...')
      progress(82, 100, 'Extrayendo archivos...')

      await extract(zipPath, { dir: gameDir })

      try { fs.unlinkSync(zipPath) } catch {}

      log('Extracción completa.')
      progress(95, 100, 'Preparando...')

    } else {
      log('Instancia ya instalada, saltando descarga.')
      progress(95, 100, 'Preparando...')
    }

    // PASO 3: Lanzar
    log('Lanzando Minecraft...')
    progress(100, 100, 'Iniciando...')

    const isOffline = profile.offline || !profile.accessToken
    const playerUUID = profile.uuid || '00000000-0000-0000-0000-000000000000'
    const playerToken = isOffline ? '0' : profile.accessToken

    log(`Jugador: ${profile.name} (${isOffline ? 'offline' : 'online'})`)

    const gameProcess = await launch({
      gamePath: gameDir,
      javaPath,
      version: versionId,
      gameProfile: { id: playerUUID, name: profile.name },
      accessToken: playerToken,
      maxMemory: (settings?.ramMax || 4) * 1024,
      minMemory: (settings?.ramMin || 2) * 1024,
      width: settings?.resWidth || 1280,
      height: settings?.resHeight || 720,
    })

    log(`Minecraft lanzado. PID: ${gameProcess.pid}`)

    gameProcess.stdout?.on('data', d => log('[MC] ' + d.toString().trim()))
    gameProcess.stderr?.on('data', d => log('[MC] ' + d.toString().trim()))
    gameProcess.on('error', err => log('[MC ERROR] ' + err.message))

    mainWindow.hide()
    gameProcess.on('close', (code) => {
      log(`Minecraft cerrado con código: ${code}`)
      mainWindow.webContents.send('launch-closed')
      mainWindow.show()
    })

    return { success: true }

  } catch (err) {
    console.error('[ERROR]', err)
    log(`Error: ${err.message}`)
    try { if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath) } catch {}
    return { success: false, error: err.message }
  }
})

// ─── OTROS HANDLERS ──────────────────────────────────────────────────────────

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

ipcMain.handle('get-app-path', () => path.join(__dirname, '..'))

ipcMain.handle('check-java', async () => {
  return { found: findJava() !== null }
})

ipcMain.on('window-close', () => mainWindow.close())
ipcMain.on('window-minimize', () => mainWindow.minimize())
ipcMain.on('window-maximize', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })