import React, { Component } from 'react'
import './Toolbar.css'

import { Modes } from '../models/modes'
import { Color } from '../models/color'
import { Transformation, Transformations } from '../models/transformations'

interface IProps {
  mode: Modes
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
    const drawSettings: any = (
      <>
        <input
          type="color"
          onChange={evt => this.props.changeColor({ value: evt.target.value })}
        />
      </>
    )
    const selectSettings: any = (
      <>
        <button onClick={() => this.transformation('FLIP_X')}>Flip X</button>
        <button onClick={() => this.transformation('FLIP_Y')}>Flip Y</button>
        <button onClick={() => this.transformation('ROTATION')}>
          Rotate 90 deg
        </button>
      </>
    )

    return (
      <div className="Toolbar">
        <button
          className={this.props.mode === Modes.DRAW ? 'selected' : ''}
          onClick={() => this.props.changeMode(Modes.DRAW)}
        >
          Draw
        </button>
        <button
          className={this.props.mode === Modes.SELECT ? 'selected' : ''}
          onClick={() => this.props.changeMode(Modes.SELECT)}
        >
          Select
        </button>
        {this.props.mode === Modes.DRAW && drawSettings}
        {this.props.mode === Modes.SELECT && selectSettings}
        <div className="input-group">
          <div className="input-element">
            <label htmlFor="count-x">Telling x:</label>
            <input type="number" />
          </div>
          <div className="input-element">
            <label htmlFor="count-x">Telling y:</label>
            <input type="number" />
          </div>
        </div>
      </div>
    )
  }
}
