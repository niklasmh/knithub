import React, { Component } from 'react'
import './App.css'

import Toolbar from './components/Toolbar'
import Canvas from './components/Canvas'
import Layers from './components/Layers'

import { Grid } from './models/grid'
import { Modes } from './models/modes'
import { Color } from './models/color'
import { Layer } from './models/layer'
import { Transformation } from './models/transformations'

interface IProps {}

interface IState {
  scale: Scale
  mode: Modes
  color: Color
  layers: Layer[]
  settings: Settings
}

export interface Settings {
  gridColor: Color
  showGrid: boolean
  lineWidth: number
  invertColors: boolean
  hueRotation: number
}

export type Scale = [number, number]

class App extends Component<IProps, IState> {
  private canvas: React.RefObject<Canvas> = React.createRef()

  constructor(props: IProps) {
    super(props)

    const grid: Grid = {
      start: { x: 0, y: 0 },
      width: 40,
      height: 20
    }

    this.state = {
      scale: [20, 20],
      mode: Modes.DRAW,
      color: { value: 'white' },
      layers: [{ grid, selected: true }],
      settings: {
        gridColor: { value: '#8800aa' },
        showGrid: true,
        lineWidth: 1,
        invertColors: false,
        hueRotation: 0
      }
    }
  }

  changeMode(mode: Modes) {
    this.setState({ ...this.state, mode })
  }

  changeColor(color: Color) {
    this.setState({ ...this.state, color })
  }

  changeGrid(grid: Grid) {
    const layers: Layer[] = this.state.layers
    const layer: Layer = { ...layers[0] }
    layers[0] = {
      ...layer,
      grid
    }
    this.setState({ ...this.state, layers })
  }

  transformation(operation: Transformation) {
    if (this.canvas.current !== null) {
      this.canvas.current.transformation(operation)
    }
  }

  addLayer(layer: Layer) {
    const layers: Layer[] = this.state.layers
    layers.push(layer)
    this.setState({ ...this.state, layers })
  }

  deleteLayer(index: number) {
    const layers: Layer[] = this.state.layers
    this.setState({
      ...this.state,
      layers: layers.slice(0, index).concat(layers.slice(index + 1))
    })
  }

  selectLayer(index: number, unselectOthers: boolean = true) {
    const layers: Layer[] = this.state.layers
    if (unselectOthers) {
      layers.forEach((layer: Layer) => (layer.selected = false))
    }
    layers[index].selected = true
    this.setState({ ...this.state, layers })
  }

  moveLayer(index: number, steps: number) {
    const beforeIndex: Layer[] = this.state.layers.slice(0, index)
    const atIndex: Layer = this.state.layers[index]
    const afterIndex: Layer[] = this.state.layers.slice(index + 1)
    const newIndex = Math.min(Math.max(0, index + steps))
    const correctedSteps: number = newIndex - index
    if (correctedSteps < 0) {
      const startLayers: Layer[] = beforeIndex.slice(0, newIndex)
      const endLayers: Layer[] = beforeIndex.slice(newIndex)
      const layers: Layer[] = startLayers
        .concat([atIndex])
        .concat(endLayers)
        .concat(afterIndex)
      this.setState({ ...this.state, layers })
    } else if (correctedSteps > 0) {
      const startLayers: Layer[] = afterIndex.slice(0, newIndex - index)
      const endLayers: Layer[] = afterIndex.slice(newIndex - index)
      const layers: Layer[] = beforeIndex
        .concat(startLayers)
        .concat([atIndex])
        .concat(endLayers)
      this.setState({ ...this.state, layers })
    }
  }

  updateLayers(layers: Layer[]) {
    this.setState({ ...this.state, layers })
  }

  changeScale(scale: Scale) {
    this.setState({ ...this.state, scale })
  }

  changeSettings(settings: Settings) {
    this.setState({ ...this.state, settings })
  }

  render() {
    const {
      scale: [width, height],
      mode,
      color,
      layers,
      settings
    } = this.state

    const grid: Grid = layers[0].grid

    return (
      <div className="App">
        <Toolbar
          mode={mode}
          grid={grid}
          settings={settings}
          changeGrid={(grid: Grid) => this.changeGrid(grid)}
          transformation={(operation: Transformation) =>
            this.transformation(operation)
          }
          changeColor={(color: Color) => this.changeColor(color)}
          changeMode={(mode: Modes) => this.changeMode(mode)}
          changeSettings={(settings: Settings) => this.changeSettings(settings)}
        />
        {/*<Layers
          layers={layers}
          addLayer={(layer: Layer) => this.addLayer(layer)}
          deleteLayer={(index: number) => this.deleteLayer(index)}
          selectLayer={(index: number, unselect?: boolean) =>
            this.selectLayer(index, unselect)
          }
          moveLayer={(index: number, steps: number) =>
            this.moveLayer(index, steps)
          }
        />*/}
        <Canvas
          ref={this.canvas}
          scale={{ x: width, y: height }}
          width={width * grid.width}
          height={height * grid.height}
          grid={grid}
          mode={mode}
          color={color}
          settings={settings}
          layers={layers}
          updateLayers={(layers: Layer[]) => this.updateLayers(layers)}
          changeGrid={(grid: Grid) => this.changeGrid(grid)}
          changeScale={(scale: Scale) => this.changeScale(scale)}
        />
      </div>
    )
  }
}

export default App
