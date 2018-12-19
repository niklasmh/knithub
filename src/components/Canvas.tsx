import React, { Component } from 'react'
import './Canvas.css'
import { Grid } from '../models/grid'

interface IProps {
  grid: Grid
  width: number
  height: number
}

export default class Canvas extends Component<IProps, {}> {
  public canvas: any = null
  public ctx: any = null

  constructor(props: IProps) {
    super(props)
  }

  componentDidMount() {
    this.ctx = this.canvas.getContext('2d')
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.props.width, this.props.height)
    this.drawGrid(this.props.grid)
  }

  componentWillUnmount() {
    this.canvas = null
    this.ctx = null
  }

  drawGrid(grid: Grid, color: string = '#ff880088', width: number = 1) {
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

  render() {
    const { width, height, grid } = this.props

    return (
      <div className="Canvas">
        <canvas ref={e => (this.canvas = e)} width={width} height={height} />
      </div>
    )
  }
}
