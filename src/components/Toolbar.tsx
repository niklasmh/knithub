import React, { Component } from 'react'

import { Modes } from '../models/modes'
import { Color } from '../models/color'
import { Transformation, Transformations } from '../models/transformations'

interface IProps {
  changeMode(mode: Modes): void
  changeColor(color: Color): void
  transformation(operation: Transformation): void
}

export default class Toolbar extends Component<IProps, {}> {
  transformation(type: string) {
    switch (type) {
      case 'FLIP_X':
        this.props.transformation({ type: Transformations.FLIP_X })
        break
      case 'FLIP_Y':
        this.props.transformation({ type: Transformations.FLIP_Y })
        break
      case 'ROTATION':
        this.props.transformation({
          type: Transformations.ROTATION,
          value: Math.PI / 2
        })
        break
    }
  }

  render() {
    return (
      <div>
        <button onClick={() => this.props.changeMode(Modes.DRAW)}>Draw</button>
        <button onClick={() => this.props.changeMode(Modes.SELECT)}>
          Select
        </button>
        <button onClick={() => this.transformation('FLIP_X')}>Flip X</button>
        <button onClick={() => this.transformation('FLIP_Y')}>Flip Y</button>
        <button onClick={() => this.transformation('ROTATION')}>
          Rotate 90 deg
        </button>
        <input
          type="color"
          onChange={evt => this.props.changeColor({ value: evt.target.value })}
        />
      </div>
    )
  }
}
