import React, { Component } from 'react'
import './Canvas.css'
import { Grid } from '../models/grid'
import { Layer } from '../models/layer'
import { Color } from '../models/color'

interface IProps {
  grid: Grid
  width: number
  height: number
}

type RenderGridElement = Color | null
type RenderGrid = RenderGridElement[][]

interface IState {
  renderGrid: RenderGrid
}

export default class Canvas extends Component<IProps, IState> {
  public canvas: any = null
  public ctx: CanvasRenderingContext2D | null = null

  constructor(props: IProps) {
    super(props)

    const renderGrid: RenderGrid = []
    for (let y = 0; y < props.height; y++) {
      const row: RenderGridElement[] = []
      for (let x = 0; x < props.width; x++) {
        row.push(null)
      }
      renderGrid.push(row)
    }

    renderGrid[2][2] = { value: 'green' }

    this.state = {
      renderGrid
    }
  }

  componentDidMount() {
    this.ctx = this.canvas.getContext('2d')
    this.draw()
  }

  componentDidUpdate() {
    this.draw()
  }

  componentWillUnmount() {
    this.canvas = null
    this.ctx = null
  }

  drawGrid(grid: Grid, color: string = '#884400', width: number = 1) {
    if (this.ctx !== null) {
      this.ctx.strokeStyle = color
      this.ctx.lineWidth = width

      this.ctx.beginPath()

      const stepSizeX: number = this.props.width / grid.width
      for (
        let x: number = stepSizeX * grid.start.x;
        x <= this.props.width;
        x += stepSizeX
      ) {
        this.ctx.moveTo(x, 0)
        this.ctx.lineTo(x, this.props.height)
      }

      const stepSizeY: number = this.props.height / grid.height
      for (
        let y: number = stepSizeY * grid.start.y;
        y <= this.props.height;
        y += stepSizeY
      ) {
        this.ctx.moveTo(0, y)
        this.ctx.lineTo(this.props.width, y)
      }

      this.ctx.stroke()
    }
  }

  generateColor(color: Color | null): string {
    if (color === null) {
      return 'black'
    }

    if (color.value) {
      return color.value
    }

    return `rgba(${color.red || '0'}, ${color.green || '0'}, ${color.blue ||
      '0'}, ${color.opacity || '1'})`
  }

  drawMasks(grid: Grid, renderGrid: RenderGrid) {
    if (this.ctx !== null) {
      this.ctx.beginPath()

      const stepSizeX: number = this.props.width / grid.width
      const stepSizeY: number = this.props.height / grid.height
      for (let x: number = 0; x <= grid.width; x++) {
        for (let y: number = 0; y <= grid.height; y++) {
          if (renderGrid[y][x] !== null) {
            this.ctx.fillStyle = this.generateColor(renderGrid[y][x])
            this.ctx.rect(x * stepSizeX, y * stepSizeY, stepSizeX, stepSizeY)
          }
        }
      }

      this.ctx.fill()
    }
  }

  draw() {
    if (this.ctx !== null) {
      this.ctx.fillStyle = 'black'
      this.ctx.fillRect(0, 0, this.props.width, this.props.height)
      this.drawMasks(this.props.grid, this.state.renderGrid)
      this.drawGrid(this.props.grid)
    }
  }

  render() {
    const { width, height } = this.props

    return (
      <div className="Canvas">
        <canvas ref={e => (this.canvas = e)} width={width} height={height} />
      </div>
    )
  }
}
