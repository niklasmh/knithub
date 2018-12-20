import React, { Component } from 'react'

import { Modes } from '../models/modes'

interface IProps {
  changeMode(mode: Modes): void
}

export default class Toolbar extends Component<IProps, {}> {
  render() {
    return (
      <div>
        <button onClick={() => this.props.changeMode(Modes.DRAW)}>Draw</button>
        <button onClick={() => this.props.changeMode(Modes.SELECT)}>
          Select
        </button>
      </div>
    )
  }
}
