import React, { Component } from 'react'

import { Modes } from '../models/modes'
import { Transformation, Transformations } from '../models/transformations'

interface IProps {
  changeMode(mode: Modes): void
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
      case 'TRANSLATE_X':
        this.props.transformation({
          type: Transformations.TRANSLATE_X,
          value: 1
        })
        break
      case 'TRANSLATE_Y':
        this.props.transformation({
          type: Transformations.TRANSLATE_Y,
          value: 1
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
        <button onClick={() => this.transformation('TRANSLATE_X')}>
          Flytt 1 X
        </button>
        <button onClick={() => this.transformation('TRANSLATE_Y')}>
          Flytt 1 Y
        </button>
      </div>
    )
  }
}
