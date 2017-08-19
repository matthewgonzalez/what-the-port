import React, { Component } from 'react'
import processes from 'listening-processes'
import classNames from 'classnames'

class ProcessesList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      processing: false,
      showDialog: false
    }
  }

  toggleDialog () {
    this.setState({ showDialog: !this.state.showDialog })
  }

  killPort () {
    const { pid } = this.props.process
    this.setState({ processing: true, showDialog: false }, () => {
      let results = processes.kill(pid)
      if (results.fail.includes(pid)) {
        this.setState({ processing: true, showDialog: false })
      }
    })
  }

  renderAreYouSureDialog () {
    if (this.state.showDialog) {
      return (
        <div className="are-you-sure-dialog">
          <div>
            Woah there. Really? Kill the process at PID {this.props.process.pid}?
            <br/>
            <span className="dialog-button confirm-kill" onClick={this.killPort.bind(this)}>It's time has come</span>
            <span className="dialog-button cancel-kill" onClick={this.toggleDialog.bind(this)}>Hah, j/k!</span>
          </div>
        </div>
      )
    }
  }

  render () {
    let wrapperClass = classNames(
      'process-deets-wrapper',
      {'processing': this.state.processing}
    )

    return (
      <div className={wrapperClass} style={{borderColor: this.props.accentColor}}>
        {this.renderAreYouSureDialog()}
        <div className="process-deets inline">
          <span className="label">URL: </span>
          <span className="deet">
            <a target="_blank" href={'http://localhost:' + this.props.process.port}>
              <span className="local-host">http://localhost:</span>
              <span className="port-number">{this.props.process.port}</span>
            </a>
          </span>
        </div>
        <div className="process-deets inline">
          <span className="label">PID: </span>
          <span className="deet">{this.props.process.pid}</span>
          <a className="deet kill" onClick={this.toggleDialog.bind(this)} title="Kill Process">x</a>
        </div>
        <div className="process-deets">
          <span className="label">Invoking Command: </span>
          <span className="deet process-invoking-command">
            {this.props.process.invokingCommand}
          </span>
        </div>
      </div>
    )
  }
}

export default ProcessesList
