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

interface IState {
  showHelp: boolean
}

export default class Toolbar extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      showHelp: false
    }
  }
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

  handleGridBGColor(evt: any) {
    this.props.changeSettings({
      ...this.props.settings,
      gridBGColor: { value: evt.target.value }
    })
  }

  showHelp() {
    this.setState({ ...this.state, showHelp: !this.state.showHelp })
  }

  render() {
    const { grid, settings } = this.props

    const drawSettings: any = (
      <>
        <div className="input-group">
          <div className="input-element">
            <input
              type="color"
              defaultValue="#dddddd"
              onChange={evt =>
                this.props.changeColor({ value: evt.target.value })
              }
            />
          </div>
        </div>
      </>
    )
    const selectSettings: any = (
      <>
        <div className="input-group">
          <div className="input-element">
            <button onClick={() => this.transformation('FLIP_X')}>
              Flip X
            </button>
          </div>
          <div className="input-element">
            <button onClick={() => this.transformation('FLIP_Y')}>
              Flip Y
            </button>
          </div>
          <div className="input-element">
            <button onClick={() => this.transformation('ROTATION')}>
              Rotate 90 deg
            </button>
          </div>
        </div>
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
          {settings.showGrid ? (
            <>
            <div className="input-element">
              <label htmlFor="grid-color">Rutenettfarge</label>
              <input
                id="grid-color"
                type="color"
                defaultValue={settings.gridColor.value}
                onChange={this.handleGridColor.bind(this)}
              />
            </div>
              <div className="input-element">
                <label htmlFor="grid-bgcolor">Bakgrunnsfarge</label>
                <input
                  id="grid-bgcolor"
                  type="color"
                  defaultValue={settings.gridBGColor.value}
                  onChange={this.handleGridBGColor.bind(this)}
                />
              </div>
            </>
          ) : null}
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
        <div className="input-group">
          <button
            className={this.props.mode === Modes.DRAW ? 'selected' : ''}
            onClick={() => this.props.changeMode(Modes.DRAW)}
          >
            Tegn
          </button>
          {this.props.mode === Modes.DRAW && drawSettings}
        </div>
        <div className="input-group">
          <button
            className={this.props.mode === Modes.SELECT ? 'selected' : ''}
            onClick={() => this.props.changeMode(Modes.SELECT)}
          >
            Marker område
          </button>
          {this.props.mode === Modes.SELECT && selectSettings}
        </div>
        <button
          className={this.state.showHelp ? ' selected' : ''}
          onClick={this.showHelp.bind(this)}
          title="Info"
        >
          ⓘ
        </button>
        {this.state.showHelp ? (
          <p className="help">
            <b>Ctrl + marker:</b> <i>Legg nytt område til eksisterende</i>
            <br />
            <b>Ctrl + C:</b> <i>Kopier område</i>
            <br />
            <b>Ctrl + V:</b> <i>Lim inn (fra kopi)</i>
            <br />
            <b>Del:</b> <i>Fjern område</i>
            <br />
            <b>+:</b> <i>Zoom inn</i>
            <br />
            <b>-:</b> <i>Zoom ut</i>
            <br />
            <b>Piler(←↑→↓):</b> <i>Flytt område / rutenett</i>
            <br />
          </p>
        ) : null}
      </div>
    )
  }
}
