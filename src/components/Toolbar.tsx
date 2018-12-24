import React, { Component } from 'react'
import './Toolbar.css'

import { Modes } from '../models/modes'
import { Color } from '../models/color'
import { Grid } from '../models/grid'
import { Point } from '../models/point'
import { Settings } from '../App'
import { Transformation, Transformations } from '../models/transformations'

interface IProps {
  mode: Modes
  grid: Grid
  settings: Settings
  changeMode(mode: Modes): void
  changeColor(color: Color): void
  changeGrid(grid: Grid): void
  changeSettings(settings: Settings): void
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

  handleShowGrid(evt: any) {
    this.props.changeSettings({
      ...this.props.settings,
      showGrid: evt.target.checked
    })
  }

  handleGridColor(evt: any) {
    this.props.changeSettings({
      ...this.props.settings,
      gridColor: { value: evt.target.value }
    })
  }

  render() {
    const { grid, settings } = this.props

    const drawSettings: any = (
      <>
        <input
          type="color"
          defaultValue="#dddddd"
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
    const generalSettings: any = (
      <>
        <div className="input-group">
          <div className="input-element">
            <label htmlFor="show-grid">Vis rutenett</label>
            <input
              id="show-grid"
              defaultChecked={settings.showGrid}
              onChange={this.handleShowGrid.bind(this)}
              type="checkbox"
            />
          </div>
          <div className="input-element">
            <input
              type="color"
              defaultValue={settings.gridColor.value}
              onChange={this.handleGridColor.bind(this)}
            />
          </div>
        </div>
        <div className="input-group">
          <div className="input-element">
            <label htmlFor="count-x">Telling x:</label>
            <input
              id="count-x"
              value={grid.width.toString()}
              onChange={this.handleGridWidth.bind(this)}
              type="number"
            />
          </div>
          <div className="input-element">
            <label htmlFor="count-y">Telling y:</label>
            <input
              id="count-y"
              value={grid.height.toString()}
              onChange={this.handleGridHeight.bind(this)}
              type="number"
            />
          </div>
        </div>
      </>
    )

    return (
      <div className="Toolbar">
        {generalSettings}
        <button
          className={this.props.mode === Modes.DRAW ? 'selected' : ''}
          onClick={() => this.props.changeMode(Modes.DRAW)}
        >
          Tegn
        </button>
        <button
          className={this.props.mode === Modes.SELECT ? 'selected' : ''}
          onClick={() => this.props.changeMode(Modes.SELECT)}
        >
          Velg område
        </button>
        {this.props.mode === Modes.DRAW && drawSettings}
        {this.props.mode === Modes.SELECT && selectSettings}
      </div>
    )
  }
}
