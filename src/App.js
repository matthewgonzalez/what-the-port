import React, { Component } from 'react'
import _ from 'lodash'
import ReactList from 'react-list'
import processes from 'listening-processes'
import classNames from 'classnames'
import CommandsList from './components/CommandsList'
import { ipcRenderer } from 'electron'
const { systemPreferences, shell, app } = require('electron').remote
class App extends Component {
  constructor (props) {
    super(props)
    let processArray = this.getProcesses()

    this.state = {
      'commands': processArray,
      'app': {
        version: process.env.npm_package_version || app.getVersion(),
        isDarkMode: systemPreferences.isDarkMode()
      }
    }
  }

  componentWillMount () {
    this.processesUpdate()

    // Subscribe to macOS theme change listener sent from ipcMain
    ipcRenderer.on('theme-changed', () => {
      let newState = {
        ...this.state,
        app: {
          ...this.state.app,
          isDarkMode: systemPreferences.isDarkMode()
        }
      }
      this.setState(newState)
    })
  }

  getProcesses () {
    const processArray = _.map(processes(), (processes, command) => {
      return {
        processes,
        command: command
      }
    })

    processArray.sort(function (a, b) {
      var commandA = a.command.toLowerCase()
      var commandB = b.command.toLowerCase()
      if (commandA < commandB) return -1
      if (commandA > commandB) return 1
      return 0
    })

    return processArray
  }

  processesUpdate () {
    let processArray = this.getProcesses()
    this.setState({
      'commands': processArray
    }, () => {
      window.setTimeout(this.processesUpdate.bind(this), 2000)
    })
  }

  hideApp () {
    app.hide()
  }

  quitApp () {
    app.quit()
  }

  renderCommand (index, key) {
    return <CommandsList command={this.state.commands[index]} key={this.state.commands[index].command} isDarkMode={this.state.app.isDarkMode} />
  }

  render () {
    let appClass = classNames(
      'App',
      {'dark-theme': this.state.app.isDarkMode}
    )
    return (
      <div className={appClass}>
        <div className="floating-info">
          <div className="floating-info-section logo" onClick={() => shell.openExternal('https://matthewgonzalez.github.io/what-the-port/')}>wtp? <span className="version">v{this.state.app.version}</span></div>
          <div className="floating-info-section hide-app" onClick={this.hideApp.bind(this)}>–</div>
          <div className="floating-info-section power-off" onClick={this.quitApp.bind(this)}>X</div>
        </div>
        <div className="header">
          <span className="search-bar">filter</span>
        </div>
        <div className="App-list">
          <ReactList
            itemRenderer={this.renderCommand.bind(this)}
            length={this.state.commands.length}
            type='simple'
          />
        </div>
      </div>
    )
  }
}

export default App
