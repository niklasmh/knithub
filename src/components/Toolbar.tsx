import React, { Component } from 'react'
import './Toolbar.css'

import { Modes } from '../models/modes'
import { Color } from '../models/color'
import { Grid } from '../models/grid'
import { Point } from '../models/point'
import { Transformation, Transformations } from '../models/transformations'

interface IProps {
  mode: Modes
  grid: Grid
  changeMode(mode: Modes): void
  changeColor(color: Color): void
  changeGrid(grid: Grid): void
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

  handleGridWidth(evt: any) {
    const grid: Grid = { ...this.props.grid }
    grid.width = parseInt(evt.target.value || '0')
    this.props.changeGrid(grid)
  }

  handleGridHeight(evt: any) {
    const grid: Grid = { ...this.props.grid }
    grid.height = parseInt(evt.target.value || '0')
    this.props.changeGrid(grid)
  }

  handleGridStartX(evt: any) {
    const grid: Grid = { ...this.props.grid }
    const start: Point = {
      x: parseInt(evt.target.value || '0'),
      y: grid.start.y
    }
    this.props.changeGrid({ ...grid, start })
  }

  handleGridStartY(evt: any) {
    const grid: Grid = { ...this.props.grid }
    const start: Point = {
      y: parseInt(evt.target.value || '0'),
      x: grid.start.x
    }
    this.props.changeGrid({ ...grid, start })
  }

  render() {
    const { grid } = this.props

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
            <input
              id="count-x"
              defaultValue={grid.width.toString()}
              onChange={this.handleGridWidth.bind(this)}
              type="number"
            />
          </div>
          <div className="input-element">
            <label htmlFor="count-y">Telling y:</label>
            <input
              id="count-y"
              defaultValue={grid.height.toString()}
              onChange={this.handleGridHeight.bind(this)}
              type="number"
            />
          </div>
        </div>
        <div className="input-group">
          <div className="input-element">
            <label htmlFor="start-x">Start x:</label>
            <input
              id="start-x"
              defaultValue={grid.start.x.toString()}
              onChange={this.handleGridStartX.bind(this)}
              type="number"
            />
          </div>
          <div className="input-element">
            <label htmlFor="start-y">Start y:</label>
            <input
              id="start-y"
              defaultValue={grid.start.y.toString()}
              onChange={this.handleGridStartY.bind(this)}
              type="number"
            />
          </div>
        </div>
      </div>
    )
  }
}
