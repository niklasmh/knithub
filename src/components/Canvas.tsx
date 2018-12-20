import React, { Component, EventHandler } from 'react'
import './Canvas.css'
import { Grid } from '../models/grid'
import { Layer } from '../models/layer'
import { Modes } from '../models/modes'
import { Color } from '../models/color'
import { Point } from '../models/point'

interface IProps {
  mode: Modes
  grid: Grid
  width: number
  height: number
}

type RenderGridElement = Color | null
type RenderGrid = RenderGridElement[][]

interface Rect {
  start: Point
  end: Point
}

interface IState {
  renderGrid: RenderGrid
  selectedRect: Rect
  mousePosition: Point
  mouseDownPosition: Point
  mouseUpPosition: Point
  mouseDown: boolean
  mouseHover: boolean
}

export default class Canvas extends Component<IProps, IState> {
  public canvas: any = null
  public ctx: CanvasRenderingContext2D | null = null
  private showControlPoints: boolean = false

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
      renderGrid,
      selectedRect: { start: { x: -1, y: -1 }, end: { x: -1, y: -1 } },
      mousePosition: { x: -1, y: -1 },
      mouseHover: false,
      mouseDown: false,
      mouseDownPosition: { x: -1, y: -1 },
      mouseUpPosition: { x: -1, y: -1 }
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

  getPositionFromMouse(evt: any): Point {
    const rect: any = evt.target.getBoundingClientRect()
    const stepSizeX: number = this.props.width / this.props.grid.width
    const stepSizeY: number = this.props.height / this.props.grid.height
    const x: number = Math.floor((evt.clientX - rect.left) / stepSizeX)
    const y: number = Math.floor((evt.clientY - rect.top) / stepSizeY)

    return { x, y }
  }

  handleMouseMove(evt: any) {
    const position: Point = this.getPositionFromMouse(evt)
    const x: number = position.x
    const y: number = position.y

    const posChanged: boolean =
      this.state.mousePosition.x != x || this.state.mousePosition.y != y
    if (posChanged) {
      const end =
        this.props.mode === Modes.SELECT && this.state.mouseDown
          ? { x, y }
          : this.state.selectedRect.end

      this.setState({
        ...this.state,
        selectedRect: { start: this.state.selectedRect.start, end },
        mousePosition: { x, y },
        mouseHover: true
      })
    }
  }

  handleMouseEnter() {
    this.setState({ ...this.state, mouseHover: true })
  }

  handleMouseExit() {
    this.setState({ ...this.state, mouseHover: false })
  }

  handleMouseDown(evt: any) {
    const position: Point = this.getPositionFromMouse(evt)
    const x: number = position.x
    const y: number = position.y

    if (evt.button === 0) {
      const selectedRect: Rect =
        this.props.mode === Modes.SELECT
          ? { start: { x, y }, end: { x, y } }
          : this.state.selectedRect

      this.setState({
        ...this.state,
        selectedRect,
        mouseDown: true,
        mouseDownPosition: { x, y }
      })
    }
  }

  handleMouseUp(evt: any) {
    const position: Point = this.getPositionFromMouse(evt)
    const x: number = position.x
    const y: number = position.y

    if (evt.button === 0) {
      const selectedRect: Rect =
        this.props.mode === Modes.SELECT
          ? { start: this.state.selectedRect.start, end: { x, y } }
          : this.state.selectedRect

      this.setState({
        ...this.state,
        selectedRect,
        mouseDown: false,
        mouseUpPosition: { x, y }
      })
    }
  }

  handleRightClick(evt: any) {
    //evt.preventDefault()
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

  drawMousePointer() {
    if (this.ctx !== null && this.state.mouseHover) {
      this.ctx.beginPath()
      this.ctx.fillStyle = '#fff2'

      const stepSizeX: number = this.props.width / this.props.grid.width
      const stepSizeY: number = this.props.height / this.props.grid.height
      const position: Point = this.state.mousePosition
      this.ctx.rect(
        position.x * stepSizeX,
        position.y * stepSizeY,
        stepSizeX,
        stepSizeY
      )

      this.ctx.fill()
    }
  }

  drawControlPoints() {
    if (this.ctx !== null) {
      const stepSizeX: number = this.props.width / this.props.grid.width
      const stepSizeY: number = this.props.height / this.props.grid.height
      const { mouseDownPosition, mouseUpPosition, selectedRect } = this.state

      if (this.showControlPoints) {
        this.ctx.beginPath()
        this.ctx.fillStyle = '#666'
        if (mouseDownPosition.x >= 0 && mouseDownPosition.y >= 0) {
          const downPosition: Point = mouseDownPosition
          this.ctx.rect(
            downPosition.x * stepSizeX,
            downPosition.y * stepSizeY,
            stepSizeX,
            stepSizeY
          )
        }
        if (mouseUpPosition.x >= 0 && mouseUpPosition.y >= 0) {
          const upPosition: Point = mouseUpPosition
          this.ctx.rect(
            upPosition.x * stepSizeX,
            upPosition.y * stepSizeY,
            stepSizeX,
            stepSizeY
          )
        }
        this.ctx.fill()
      }

      if (selectedRect.start.x >= 0) {
        this.ctx.beginPath()
        this.ctx.strokeStyle = '#ddd'
        this.ctx.lineWidth = 3
        const width: number = selectedRect.end.x - selectedRect.start.x
        const offsetWidth: number = width >= 0 ? 1 : 0
        const height: number = selectedRect.end.y - selectedRect.start.y
        const offsetHeight: number = height >= 0 ? 1 : 0
        this.ctx.rect(
          (selectedRect.start.x + 1 - offsetWidth) * stepSizeX,
          (selectedRect.start.y + 1 - offsetHeight) * stepSizeY,
          (width + offsetWidth * 2 - 1) * stepSizeX,
          (height + offsetHeight * 2 - 1) * stepSizeY
        )
        this.ctx.stroke()
      }
    }
  }

  draw() {
    if (this.ctx !== null) {
      this.ctx.fillStyle = 'black'
      this.ctx.fillRect(0, 0, this.props.width, this.props.height)
      this.drawMasks(this.props.grid, this.state.renderGrid)
      this.drawGrid(this.props.grid)
      this.drawControlPoints()
      this.drawMousePointer()
    }
  }

  render() {
    const { width, height } = this.props

    return (
      <div className="Canvas">
        <canvas
          ref={e => (this.canvas = e)}
          width={width}
          height={height}
          onMouseMove={this.handleMouseMove.bind(this)}
          onMouseEnter={this.handleMouseEnter.bind(this)}
          onMouseLeave={this.handleMouseExit.bind(this)}
          onMouseOut={this.handleMouseExit.bind(this)}
          onMouseDown={this.handleMouseDown.bind(this)}
          onMouseUp={this.handleMouseUp.bind(this)}
          onContextMenu={this.handleRightClick.bind(this)}
        />
      </div>
    )
  }
}
