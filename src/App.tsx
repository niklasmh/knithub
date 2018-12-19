import React, { Component } from 'react'
import './App.css'

import Toolbar from './components/Toolbar'
import Canvas from './components/Canvas'
import Layers from './components/Layers'

import { Grid } from './models/grid'

interface IProps {}

interface IState {
  grid: Grid
  scale: [number, number]
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
      scale: [80, 80]
    }
  }

  render() {
    const {
      grid,
      scale: [width, height]
    } = this.state

    return (
      <div className="App">
        <Toolbar />
        <Layers />
        <Canvas
          width={width * grid.width}
          height={height * grid.height}
          grid={grid}
        />
      </div>
    )
  }
}

export default App
