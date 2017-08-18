import { app, BrowserWindow, ipcMain, Tray, Menu, shell } from 'electron'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'
import { enableLiveReload } from 'electron-compile'
const path = require('path')

// module to auto-reload
const electronReload = require('electron-reload')

let mainWindow
let tray
app.dock.hide()
const isDevMode = process.execPath.match(/[\\/]electron/)

enableLiveReload({strategy: 'react-hmr'})

console.log('isDevMode', isDevMode)

const createWindow = async () => {
  tray = new Tray(path.join(__dirname, '/assets/icon.png'))

  tray.on('click', function (event) {
    toggleWindow()

    if (mainWindow.isVisible() && process.defaultApp && event.metaKey) {
      mainWindow.openDevTools({mode: 'detach'})
    }
  })

  const contextMenu = Menu.buildFromTemplate([
    { label: 'What the Port?',
      click: () => {
        shell.openExternal('http://github.com/matthewgonzalez/what-the-port')
      }
    },
    {type: 'separator'},
    {label: 'Quit', click: () => app.quit()}
  ])

  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu)
  })

  tray.setToolTip('What the port?')

  mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    show: false,
    frame: false,
    resizable: false,
    transparent: true,
    alwaysOnTop: true
  })

  mainWindow.loadURL(`file://${__dirname}/index.html`)

  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS)
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('show', () => {
    cycleIcons()
  })

  mainWindow.on('hide', () => {
    uncycleIcons()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('blur', () => {
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide()
    }
  })

  mainWindow.webContents.on('new-window', function (e, url) {
    e.preventDefault()
    shell.openExternal(url)
  })
}

let iconTimer
let iconArray = ['icon', 'icon-blue', 'icon-green', 'icon-orange', 'icon-purple', 'icon-yellow', 'icon-red']

const cycleIcons = () => {
  tray.setHighlightMode('never')
  iconTimer = setInterval(() => {
    let icon = iconArray[Math.floor(Math.random() * iconArray.length)]
    tray.setImage(path.join(__dirname, `/assets/icon-color-cycle/${icon}.png`))
  }, 100)
}

const uncycleIcons = () => {
  clearInterval(iconTimer)
  tray.setImage(path.join(__dirname, `/assets/icon-color-cycle/icon.png`))
}

const toggleWindow = () => {
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const trayPos = tray.getBounds()
  const windowPos = mainWindow.getBounds()
  let x = 0
  let y = 0
  if (process.platform === 'darwin') {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height)
  } else {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height * 10)
  }

  mainWindow.setPosition(x, y, false)
  mainWindow.show()
  mainWindow.focus()
}

ipcMain.on('show-window', () => {
  showWindow()
})

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * listen to specific folders to watch
 */
electronReload(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
})
