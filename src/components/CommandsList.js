import React, { Component } from 'react'
import ReactList from 'react-list'
import ProcessesList from './ProcessesList'
import Please from 'pleasejs'
import {color, lightness} from 'kewler'

class CommandsList extends Component {
  constructor (props) {
    super(props)
    let accentColor = Please.make_color({saturation: '.9', value: '1', format: 'hex'})
    this.state = {
      accentColor,
      accentColorDark: color(`${accentColor}`, lightness(-18))
    }
  }

  renderProcesses (index, key) {
    const { processes } = this.props.command
    return <ProcessesList
      accentColor={ this.props.isDarkMode ? this.state.accentColor : this.state.accentColorDark }
      process={processes[index]}
      key={`${processes[index].pid}/${processes[index].port}`}
    />
  }

  render () {
    return (
      <div>
        <div className="process-command"
          style={{
            color: this.props.isDarkMode ? this.state.accentColor : this.state.accentColorDark
          }}>{this.props.command.command}</div>
        <ReactList
          itemRenderer={this.renderProcesses.bind(this)}
          length={this.props.command.processes.length}
          type='simple'
        />
      </div>
    )
  }
}

export default CommandsList
