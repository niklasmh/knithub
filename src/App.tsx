import React, { Component } from 'react'
import './App.css'

import Toolbar from './components/Toolbar'
import Canvas from './components/Canvas'
import Layers from './components/Layers'

import { Grid } from './models/grid'
import { Modes } from './models/modes'
import { Color } from './models/color'

interface IProps {}

interface IState {
  grid: Grid
  scale: [number, number]
  mode: Modes
  color: Color
}

class App extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    const grid: Grid = {
      start: { x: 0, y: 0 },
      width: 10,
      height: 5
    }

    this.state = {
      grid,
      scale: [80, 80],
      mode: Modes.DRAW,
      color: { value: 'white' }
    }
  }

  changeMode(mode: Modes) {
    this.setState({ ...this.state, mode })
  }

  render() {
    const {
      grid,
      scale: [width, height],
      mode,
      color
    } = this.state

    return (
      <div className="App">
        <Toolbar changeMode={(mode: Modes) => this.changeMode(mode)} />
        <Layers />
        <Canvas
          width={width * grid.width}
          height={height * grid.height}
          grid={grid}
          mode={mode}
          color={color}
        />
      </div>
    )
  }
}

export default App
