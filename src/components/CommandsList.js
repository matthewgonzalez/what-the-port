import React, { Component } from 'react'
import ReactList from 'react-list'
import ProcessesList from './ProcessesList'

class CommandsList extends Component {
  constructor (props) {
    super(props)
    this.borderColor = this.randomHex()
  }

  renderProcesses (index, key) {
    return <ProcessesList
      borderColor={this.borderColor}
      process={this.props.command.processes[index]}
      key={this.props.command.processes[index].port}
    />
  }

  randomHex () {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16)
  }

  renderDivider () {
    if (this.props.divider) {
      return <hr />
    }
  }

  render () {
    return (
      <div>
        <div className="process-command" style={{color: this.borderColor}}>{this.props.command.command}</div>
        <ReactList
          itemRenderer={this.renderProcesses.bind(this)}
          length={this.props.command.processes.length}
          type='simple'
        />
        {this.renderDivider()}
      </div>
    )
  }
}

export default CommandsList
