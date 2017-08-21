import { app, BrowserWindow, ipcMain, Tray, Menu, shell, systemPreferences } from 'electron'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'
import { enableLiveReload } from 'electron-compile'
const path = require('path')

let mainWindow
let tray

let icons = {
  defaultIcon: null,
  defaultIconPath: null,
  iconArray: null,
  iconTimer: null
}

// Hide the dock icon right away
app.dock.hide()

const isDevMode = process.execPath.match(/[\\/]electron/)

if (isDevMode) {
  // enableLiveReload({strategy: 'react-hmr'})
  enableLiveReload()
}

function getWhichIcon () {
  return systemPreferences.isDarkMode() ? 'icon' : 'icon-transparent'
}

const setDefaultIcon = () => {
  icons.defaultIcon = getWhichIcon()
  icons.iconArray = [getWhichIcon(), 'icon-blue', 'icon-green', 'icon-orange', 'icon-purple', 'icon-yellow', 'icon-red']
  icons.defaultIconPath = path.join(__dirname, `/assets/icon-color-cycle/${icons.defaultIcon}.png`)
  if (tray) {
    tray.setImage(icons.defaultIconPath)
  }
}

const createWindow = async () => {
  setDefaultIcon()
  tray = new Tray(icons.defaultIconPath)

  systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', () => {
    setDefaultIcon()
    mainWindow.webContents.send('theme-changed')
  })

  tray.on('click', function (event) {
    toggleWindow()

    if (mainWindow.isVisible() && process.defaultApp && event.metaKey) {
      mainWindow.openDevTools({mode: 'detach'})
    }
  })

  const contextMenu = Menu.buildFromTemplate([
    { label: 'What the Port?',
      click: () => {
        shell.openExternal('https://matthewgonzalez.github.io/what-the-port/')
      }
    },
    {type: 'separator'},
    {label: 'Quit', click: () => app.quit()}
  ])

  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu)
  })

  // Enable Ctrl+C
  let appMenuTemplate = [{
    label: 'Edit',
    submenu: [
      {
        label: 'Copy',
        accelerator: 'Command+C',
        selector: 'copy:'
      }
    ]
  }]

  let appMenu = Menu.buildFromTemplate(appMenuTemplate)
  Menu.setApplicationMenu(appMenu)

  tray.setToolTip('What the port?')

  mainWindow = new BrowserWindow({
    width: 350,
    height: 400,
    show: false,
    frame: false,
    resizable: false,
    transparent: true,
    alwaysOnTop: true,
    icon: path.join(__dirname, 'assets/system-icons/png/64x64.png')
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

const cycleIcons = () => {
  tray.setHighlightMode('never')
  icons.iconTimer = setInterval(() => {
    let icon = icons.iconArray[Math.floor(Math.random() * icons.iconArray.length)]
    tray.setImage(path.join(__dirname, `/assets/icon-color-cycle/${icon}.png`))
  }, 100)
}

const uncycleIcons = () => {
  clearInterval(icons.iconTimer)
  tray.setImage(path.join(__dirname, `/assets/icon-color-cycle/${icons.defaultIcon}.png`))
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
