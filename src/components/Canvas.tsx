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
  color: Color
}

type RenderGridElement = Color | null
type RenderGrid = RenderGridElement[][]

interface Rect {
  start: Point
  end: Point
}

interface IState {
  cursor: string
  ctrlDown: boolean
  shiftDown: boolean
  renderGrid: RenderGrid
  drawColor: RenderGridElement
  selectedRect: Rect
  selectedGrid: RenderGrid
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

    const selectedGrid: RenderGrid = []
    for (let y = 0; y < props.height; y++) {
      const row: RenderGridElement[] = []
      for (let x = 0; x < props.width; x++) {
        row.push(null)
      }
      selectedGrid.push(row)
    }

    renderGrid[2][2] = { value: 'green' }

    this.state = {
      cursor: 'default',
      ctrlDown: false,
      shiftDown: false,
      renderGrid,
      drawColor: props.color,
      selectedRect: { start: { x: -1, y: -1 }, end: { x: -1, y: -1 } },
      selectedGrid,
      mousePosition: { x: -1, y: -1 },
      mouseHover: false,
      mouseDown: false,
      mouseDownPosition: { x: -1, y: -1 },
      mouseUpPosition: { x: -1, y: -1 }
    }
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (nextProps.mode !== this.props.mode) {
      let cursor: string = 'default'
      switch (nextProps.mode) {
        case Modes.SELECT:
          cursor = 'crosshair'
          break
        default:
          cursor = 'default'
      }
      this.setState({ ...this.state, cursor })
    }
  }

  componentDidMount() {
    this.ctx = this.canvas.getContext('2d')
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    document.addEventListener('keyup', this.handleKeyUp.bind(this))
    this.draw()
  }

  componentDidUpdate() {
    this.draw()
  }

  componentWillUnmount() {
    this.canvas = null
    this.ctx = null
    document.removeEventListener('keydown', this.handleKeyDown.bind(this))
    document.removeEventListener('keyup', this.handleKeyUp.bind(this))
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

      const renderGrid: RenderGrid = this.state.renderGrid.slice()
      if (this.props.mode === Modes.DRAW && this.state.mouseDown) {
        renderGrid[y][x] = this.state.drawColor
      }

      this.setState({
        ...this.state,
        renderGrid,
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

      const renderGrid: RenderGrid = this.state.renderGrid.slice()
      const selectedGrid: RenderGrid = this.state.selectedGrid.slice()
      let drawColor: RenderGridElement = this.state.drawColor
      if (this.props.mode === Modes.DRAW) {
        if (renderGrid[y][x] === this.props.color) {
          drawColor = null
        } else {
          drawColor = this.props.color
        }

        renderGrid[y][x] = drawColor
      } else if (this.props.mode === Modes.SELECT) {
        if (this.state.ctrlDown) {
        } else {
          this.mergeLayers(renderGrid, true, selectedGrid)
        }
      }

      this.setState({
        ...this.state,
        renderGrid,
        drawColor,
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

      const { renderGrid } = this.state
      const selectedGrid: RenderGrid = this.state.selectedGrid.slice()
      if (this.props.mode === Modes.SELECT) {
        const start: Point = {
          x: Math.min(selectedRect.start.x, selectedRect.end.x),
          y: Math.min(selectedRect.start.y, selectedRect.end.y)
        }
        const end: Point = {
          x: Math.max(selectedRect.start.x, selectedRect.end.x),
          y: Math.max(selectedRect.start.y, selectedRect.end.y)
        }

        if (selectedGrid[selectedRect.start.y][selectedRect.start.x] !== null) {
          for (let y: number = start.y; y <= end.y; y++) {
            for (let x: number = start.x; x <= end.x; x++) {
              if (selectedGrid[y][x] !== null) {
                renderGrid[y][x] = selectedGrid[y][x]
                selectedGrid[y][x] = null
              }
            }
          }
        } else {
          for (let y: number = start.y; y <= end.y; y++) {
            for (let x: number = start.x; x <= end.x; x++) {
              if (renderGrid[y][x] !== null) {
                selectedGrid[y][x] = renderGrid[y][x]
                renderGrid[y][x] = null
              }
            }
          }
        }
        selectedRect.start.x = -1
      }

      this.setState({
        ...this.state,
        selectedRect,
        selectedGrid,
        mouseDown: false,
        mouseUpPosition: { x, y }
      })
    }
  }

  handleRightClick(evt: any) {
    //evt.preventDefault()
  }

  handleKeyDown(evt: any) {
    switch (evt.keyCode) {
      case 16: // Shift
        if (this.props.mode === Modes.SELECT) {
          this.setState({ ...this.state, shiftDown: true })
        }
        break
      case 17: // Ctrl
        if (this.props.mode === Modes.SELECT) {
          this.setState({ ...this.state, cursor: 'copy', ctrlDown: true })
        }
        break
    }
  }

  handleKeyUp(evt: any) {
    switch (evt.keyCode) {
      case 16: // Shift
        if (this.props.mode === Modes.SELECT) {
          this.setState({ ...this.state, shiftDown: false })
        }
        break
      case 17: // Ctrl
        if (this.props.mode === Modes.SELECT) {
          this.setState({ ...this.state, cursor: 'crosshair', ctrlDown: false })
        }
        break
    }
  }

  mergeLayers(
    firstLayer: RenderGrid,
    clearOthers: boolean = false,
    ...layers: RenderGrid[]
  ): RenderGrid {
    for (const layer of layers) {
      for (
        let y: number = 0;
        y < Math.min(firstLayer.length, layer.length);
        y++
      ) {
        for (
          let x: number = 0;
          x < Math.min(firstLayer[y].length, layer[y].length);
          x++
        ) {
          if (layer[y][x] !== null) {
            firstLayer[y][x] = layer[y][x]
            if (clearOthers) {
              layer[y][x] = null
            }
          }
        }
      }
    }
    return firstLayer
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

  drawMasks(grid: Grid, renderGrid: RenderGrid, outline: boolean = false) {
    if (this.ctx !== null) {
      const stepSizeX: number = this.props.width / grid.width
      const stepSizeY: number = this.props.height / grid.height

      if (outline) {
        this.ctx.lineWidth = 6
        this.ctx.lineDashOffset = 0
        this.ctx.setLineDash([6])
        this.ctx.strokeStyle = '#000'

        this.ctx.beginPath()
        for (let x: number = 0; x <= grid.width; x++) {
          for (let y: number = 0; y <= grid.height; y++) {
            if (renderGrid[y][x] !== null) {
              this.ctx.rect(x * stepSizeX, y * stepSizeY, stepSizeX, stepSizeY)
            }
          }
        }
        this.ctx.stroke()

        this.ctx.lineDashOffset = 6
        this.ctx.strokeStyle = '#ddd'
        this.ctx.beginPath()

        for (let x: number = 0; x <= grid.width; x++) {
          for (let y: number = 0; y <= grid.height; y++) {
            if (renderGrid[y][x] !== null) {
              this.ctx.rect(x * stepSizeX, y * stepSizeY, stepSizeX, stepSizeY)
            }
          }
        }
        this.ctx.stroke()
        this.ctx.setLineDash([])
      }

      for (let x: number = 0; x <= grid.width; x++) {
        for (let y: number = 0; y <= grid.height; y++) {
          if (renderGrid[y][x] !== null) {
            const currentColor: string = this.generateColor(renderGrid[y][x])
            if (this.ctx.fillStyle !== currentColor) {
              this.ctx.beginPath()
            }
            this.ctx.rect(x * stepSizeX, y * stepSizeY, stepSizeX, stepSizeY)
            if (this.ctx.fillStyle !== currentColor) {
              this.ctx.fillStyle = currentColor
              this.ctx.fill()
            }
          }
        }
      }
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
        const lineWidth = 3
        this.ctx.lineWidth = lineWidth
        const start: Point = {
          x: Math.min(selectedRect.start.x, selectedRect.end.x),
          y: Math.min(selectedRect.start.y, selectedRect.end.y)
        }
        const end: Point = {
          x: Math.max(selectedRect.start.x, selectedRect.end.x),
          y: Math.max(selectedRect.start.y, selectedRect.end.y)
        }
        const width: number = end.x - start.x
        const height: number = end.y - start.y
        const lineOffset: number = lineWidth / 2

        this.ctx.lineDashOffset = 0
        this.ctx.setLineDash([6])
        this.ctx.strokeStyle = '#000'

        this.ctx.beginPath()
        this.ctx.rect(
          start.x * stepSizeX - lineOffset,
          start.y * stepSizeY - lineOffset,
          (width + 1) * stepSizeX + lineOffset * 2,
          (height + 1) * stepSizeY + lineOffset * 2
        )
        this.ctx.stroke()

        this.ctx.lineDashOffset = 6
        this.ctx.strokeStyle = '#ddd'
        this.ctx.beginPath()
        this.ctx.rect(
          start.x * stepSizeX - lineOffset,
          start.y * stepSizeY - lineOffset,
          (width + 1) * stepSizeX + lineOffset * 2,
          (height + 1) * stepSizeY + lineOffset * 2
        )
        this.ctx.stroke()
        this.ctx.setLineDash([])
      }
    }
  }

  draw() {
    if (this.ctx !== null) {
      this.ctx.fillStyle = 'black'
      this.ctx.fillRect(0, 0, this.props.width, this.props.height)
      this.drawMasks(this.props.grid, this.state.renderGrid)
      this.drawGrid(this.props.grid)
      this.drawMasks(this.props.grid, this.state.selectedGrid, true)
      this.drawControlPoints()
      this.drawMousePointer()
    }
  }

  render() {
    const { width, height } = this.props
    const { cursor } = this.state

    const style: any = { cursor }

    return (
      <div className="Canvas">
        <canvas
          style={style}
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
