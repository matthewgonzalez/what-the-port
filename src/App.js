import React, { Component } from 'react'
import _ from 'lodash'
import ReactList from 'react-list'
import processes from 'listening-processes'
import CommandsList from './components/CommandsList'

class App extends Component {
  constructor (props) {
    super(props)
    let processArray = this.getProcesses()

    this.state = {
      'commands': processArray,
      'app': {
        version: process.env.npm_package_version || window.require('electron').remote.app.getVersion()
      }
    }
  }

  componentWillMount () {
    this.processesUpdate()
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
      window.setTimeout(this.processesUpdate.bind(this), 10000)
    })
  }
  renderCommand (index, key) {
    return <CommandsList command={this.state.commands[index]} key={this.state.commands[index].command} divider={(this.state.commands.length - 1) === index ? false : true} />
  }

  render () {
    return (
      <div className="App">
        <div className="logo">wtp? <span className="version">beta {this.state.app.version}</span></div>
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
