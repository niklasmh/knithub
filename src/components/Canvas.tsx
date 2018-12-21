import React, { Component } from 'react'
import './Canvas.css'

import { Grid } from '../models/grid'
import { Layer } from '../models/layer'
import { Modes } from '../models/modes'
import { Color } from '../models/color'
import { Point } from '../models/point'
import { Transformation, Transformations } from '../models/transformations'

interface IProps {
  mode: Modes
  grid: Grid
  width: number
  height: number
  scale: Point
  color: Color
  layers: Layer[]
  updateLayers(layers: Layer[]): void
}

export type RenderGridElement = Color | null
export type RenderGrid = RenderGridElement[][]

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
  movingSelection: boolean
  movingSelectionPosition: Point
  mousePosition: Point
  mouseDownPosition: Point
  mouseUpPosition: Point
  mouseDown: boolean
  mouseHover: boolean
  layers: Layer[]
}

export default class Canvas extends Component<IProps, IState> {
  public canvas: any = null
  public ctx: CanvasRenderingContext2D | null = null
  private showControlPoints: boolean = false
  private lineWidth: number

  constructor(props: IProps) {
    super(props)

    this.lineWidth = Math.max(2, props.scale.x / 10)

    const renderGrid: RenderGrid = []
    for (let y = 0; y < props.grid.height; y++) {
      const row: RenderGridElement[] = []
      for (let x = 0; x < props.grid.width; x++) {
        row.push(null)
      }
      renderGrid.push(row)
    }

    const selectedGrid: RenderGrid = []
    for (let y = 0; y < props.grid.height; y++) {
      const row: RenderGridElement[] = []
      for (let x = 0; x < props.grid.width; x++) {
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
      movingSelection: false,
      movingSelectionPosition: { x: -1, y: -1 },
      mouseHover: false,
      mouseDown: false,
      mouseDownPosition: { x: -1, y: -1 },
      mouseUpPosition: { x: -1, y: -1 },
      layers: props.layers
    }
  }

  componentWillReceiveProps(nextProps: IProps) {
    let cursor: string = this.state.cursor
    if (nextProps.mode !== this.props.mode) {
      switch (nextProps.mode) {
        case Modes.SELECT:
          cursor = 'crosshair'
          break
        default:
          cursor = 'default'
      }
    }
    let layers: Layer[] = this.props.layers
    this.setState({ ...this.state, cursor, layers })
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
      const selectedRect: Rect = { ...this.state.selectedRect }
      const renderGrid: RenderGrid = this.state.renderGrid.slice()
      let selectedGrid: RenderGrid = this.state.selectedGrid.slice()
      let movingSelectionPosition: Point = this.state.movingSelectionPosition
      let cursor: string = this.state.cursor
      if (this.props.mode === Modes.DRAW && this.state.mouseDown) {
        renderGrid[y][x] = this.state.drawColor
      } else if (this.props.mode === Modes.SELECT) {
        if (this.state.mouseDown && !this.state.movingSelection) {
          selectedRect.end = { x, y }
        }
        if (this.state.movingSelection) {
          selectedRect.start.x = -1
        }
        if (!this.state.ctrlDown) {
          if (this.state.movingSelection) {
            selectedGrid = this.transformGrid(this.state.selectedGrid, {
              type: Transformations.TRANSLATE_X,
              value: x - movingSelectionPosition.x
            })
            selectedGrid = this.transformGrid(selectedGrid, {
              type: Transformations.TRANSLATE_Y,
              value: y - movingSelectionPosition.y
            })
            movingSelectionPosition = { x, y }
          } else {
            if (this.state.selectedGrid[y][x] !== null) {
              cursor = 'grab'
            } else {
              cursor = 'crosshair'
            }
          }
        } else {
          cursor = 'copy'
        }
      }

      this.setState({
        ...this.state,
        cursor,
        renderGrid,
        selectedGrid,
        selectedRect,
        movingSelectionPosition,
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
      let cursor: string = this.state.cursor
      let movingSelection: boolean = this.state.movingSelection
      let movingSelectionPosition: Point = this.state.movingSelectionPosition
      if (this.props.mode === Modes.DRAW) {
        if (renderGrid[y][x] === this.props.color) {
          drawColor = null
        } else {
          drawColor = this.props.color
        }

        renderGrid[y][x] = drawColor
      } else if (this.props.mode === Modes.SELECT) {
        if (this.state.ctrlDown) {
          cursor = 'copy'
        } else {
          if (this.state.selectedGrid[y][x] !== null) {
            cursor = 'grabbing'
            movingSelectionPosition = { x, y }
            movingSelection = true
            selectedRect.start.x = -1
          } else {
            this.mergeLayers(renderGrid, true, selectedGrid)
            cursor = 'crosshair'
          }
        }
      }

      this.setState({
        ...this.state,
        cursor,
        renderGrid,
        drawColor,
        selectedRect,
        movingSelection,
        movingSelectionPosition,
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
      let cursor: string = this.state.cursor

      if (this.props.mode === Modes.SELECT) {
        if (!this.state.movingSelection) {
          const start: Point = {
            x: Math.min(selectedRect.start.x, selectedRect.end.x),
            y: Math.min(selectedRect.start.y, selectedRect.end.y)
          }
          const end: Point = {
            x: Math.max(selectedRect.start.x, selectedRect.end.x),
            y: Math.max(selectedRect.start.y, selectedRect.end.y)
          }

          if (
            selectedGrid[selectedRect.start.y][selectedRect.start.x] !== null
          ) {
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
        }

        selectedRect.start.x = -1

        if (!this.state.ctrlDown) {
          if (this.state.selectedGrid[y][x] !== null) {
            cursor = 'grab'
          } else {
            cursor = 'crosshair'
          }
        } else {
          cursor = 'copy'
        }
      }

      this.setState({
        ...this.state,
        cursor,
        selectedRect,
        selectedGrid,
        movingSelection: false,
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
      case 37: // Left
        if (this.props.mode === Modes.SELECT) {
          evt.preventDefault()
          this.moveSelection({ x: -1, y: 0 })
        }
        break
      case 38: // Up
        if (this.props.mode === Modes.SELECT) {
          evt.preventDefault()
          this.moveSelection({ x: 0, y: -1 })
        }
        break
      case 39: // Right
        if (this.props.mode === Modes.SELECT) {
          evt.preventDefault()
          this.moveSelection({ x: 1, y: 0 })
        }
        break
      case 40: // Down
        if (this.props.mode === Modes.SELECT) {
          evt.preventDefault()
          this.moveSelection({ x: 0, y: 1 })
        }
        break
      case 46: // Delete
        if (this.props.mode === Modes.SELECT) {
          evt.preventDefault()
          this.deleteSelection()
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
          let cursor: string = this.state.cursor
          if (
            this.state.selectedGrid[this.state.mousePosition.y][
              this.state.mousePosition.x
            ] !== null ||
            this.state.movingSelection
          ) {
            cursor = 'grab'
          } else {
            cursor = 'crosshair'
          }
          this.setState({ ...this.state, cursor, ctrlDown: false })
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

  moveSelection(position: Point, grid: RenderGrid = this.state.selectedGrid) {
    let selectedGrid: RenderGrid = grid
    if (position.x !== 0)
      selectedGrid = this.transformGrid(selectedGrid, {
        type: Transformations.TRANSLATE_X,
        value: position.x
      })
    if (position.y !== 0)
      selectedGrid = this.transformGrid(selectedGrid, {
        type: Transformations.TRANSLATE_Y,
        value: position.y
      })
    this.setState({ ...this.state, selectedGrid })
  }

  deleteSelection(grid: RenderGrid = this.state.selectedGrid) {
    const selectedGrid: RenderGrid = grid.map((e: RenderGridElement[]) =>
      e.map(() => null)
    )
    this.setState({ ...this.state, selectedGrid })
  }

  public transformation(operation: Transformation) {
    const selectedGrid: RenderGrid = this.transformGrid(
      this.state.selectedGrid,
      operation
    )
    this.setState({ ...this.state, selectedGrid })
  }

  transformGrid(grid: RenderGrid, ...operations: Transformation[]): RenderGrid {
    const bounds: Rect = {
      start: {
        x: grid[0].length - 1,
        y: grid.length - 1
      },
      end: {
        x: 0,
        y: 0
      }
    }

    for (let y: number = 0; y < grid.length; y++) {
      for (let x: number = 0; x < grid[0].length; x++) {
        if (grid[y][x] !== null) {
          bounds.start.x = Math.min(bounds.start.x, x)
          bounds.end.x = Math.max(bounds.end.x, x)
          bounds.start.y = Math.min(bounds.start.y, y)
          bounds.end.y = Math.max(bounds.end.y, y)
        }
      }
    }

    const center: Point = {
      x: Math.round((bounds.start.x + bounds.end.x) / 2),
      y: Math.round((bounds.start.y + bounds.end.y) / 2)
    }

    const evenX: boolean = (bounds.start.x - bounds.end.x) % 2 !== 0
    const evenY: boolean = (bounds.start.y - bounds.end.y) % 2 !== 0

    const transformedGrid: RenderGrid = grid.map((row: RenderGridElement[]) => {
      const emptyRow: RenderGridElement[] = []
      for (let x: number = 0; x < row.length; x++) {
        emptyRow.push(null)
      }
      return emptyRow
    })

    for (const { type, value = 0 } of operations) {
      switch (type) {
        case Transformations.ROTATION:
          const matrix: [[number, number], [number, number]] = [
            [Math.cos(value), -Math.sin(value)],
            [Math.sin(value), Math.cos(value)]
          ]
          for (let y: number = 0; y < grid.length; y++) {
            for (let x: number = 0; x < grid[0].length; x++) {
              const position: Point = {
                x:
                  center.x +
                  Math.round(
                    matrix[0][0] * (x - center.x) +
                      matrix[0][1] * (y - center.y)
                  ) +
                  (evenX ? -1 : 0),
                y:
                  center.y +
                  Math.round(
                    matrix[1][0] * (x - center.x) +
                      matrix[1][1] * (y - center.y)
                  ) +
                  (evenY ? 0 : 0)
              }
              if (
                position.x >= 0 &&
                position.x < grid[0].length &&
                position.y >= 0 &&
                position.y < grid.length
              ) {
                transformedGrid[position.y][position.x] = grid[y][x]
              }
            }
          }
          break
        case Transformations.TRANSLATE_X:
          for (let y: number = bounds.start.y; y <= bounds.end.y; y++) {
            for (let x: number = 0; x < grid[0].length; x++) {
              const position: Point = {
                x: x + value,
                y
              }
              if (position.x >= 0 && position.x < grid[0].length) {
                transformedGrid[position.y][position.x] = grid[y][x]
              }
            }
          }
          break
        case Transformations.TRANSLATE_Y:
          for (let y: number = 0; y < grid.length; y++) {
            for (let x: number = bounds.start.x; x <= bounds.end.x; x++) {
              const position: Point = {
                x,
                y: y + value
              }
              if (position.y >= 0 && position.y < grid.length) {
                transformedGrid[position.y][position.x] = grid[y][x]
              }
            }
          }
          break
        case Transformations.FLIP_X:
          for (let y: number = bounds.start.y; y <= bounds.end.y; y++) {
            for (let x: number = bounds.start.x; x <= bounds.end.x; x++) {
              const position: Point = {
                x: center.x - (x - center.x) + (evenX ? -1 : 0),
                y
              }
              transformedGrid[position.y][position.x] = grid[y][x]
            }
          }
          break
        case Transformations.FLIP_Y:
          for (let y: number = bounds.start.y; y <= bounds.end.y; y++) {
            for (let x: number = bounds.start.x; x <= bounds.end.x; x++) {
              const position: Point = {
                x,
                y: center.y - (y - center.y) + (evenY ? -1 : 0)
              }
              transformedGrid[position.y][position.x] = grid[y][x]
            }
          }
          break
      }
    }

    return transformedGrid
  }

  drawGrid(
    grid: Grid,
    color: string = '#884400',
    width: number = this.lineWidth / 2
  ) {
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
        this.ctx.lineWidth = this.lineWidth
        this.ctx.lineDashOffset = 0
        this.ctx.setLineDash([this.lineWidth])
        this.ctx.strokeStyle = '#000'

        this.ctx.beginPath()
        for (let x: number = 0; x < grid.width; x++) {
          for (let y: number = 0; y < grid.height; y++) {
            if (renderGrid[y][x] !== null) {
              this.ctx.rect(x * stepSizeX, y * stepSizeY, stepSizeX, stepSizeY)
            }
          }
        }
        this.ctx.stroke()

        this.ctx.lineDashOffset = this.lineWidth
        this.ctx.strokeStyle = '#ddd'
        this.ctx.beginPath()

        for (let x: number = 0; x < grid.width; x++) {
          for (let y: number = 0; y < grid.height; y++) {
            if (renderGrid[y][x] !== null) {
              this.ctx.rect(x * stepSizeX, y * stepSizeY, stepSizeX, stepSizeY)
            }
          }
        }
        this.ctx.stroke()
        this.ctx.setLineDash([])
      }

      this.ctx.beginPath()
      for (let x: number = 0; x < grid.width; x++) {
        for (let y: number = 0; y < grid.height; y++) {
          if (renderGrid[y][x] !== null) {
            const currentColor: string = this.generateColor(renderGrid[y][x])
            if (this.ctx.fillStyle !== currentColor) {
              this.ctx.fill()
              this.ctx.beginPath()
            }
            this.ctx.rect(x * stepSizeX, y * stepSizeY, stepSizeX, stepSizeY)
            if (this.ctx.fillStyle !== currentColor) {
              this.ctx.fillStyle = currentColor
            }
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
        const lineWidth = this.lineWidth / 2
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
        this.ctx.setLineDash([this.lineWidth])
        this.ctx.strokeStyle = '#000'

        this.ctx.beginPath()
        this.ctx.rect(
          start.x * stepSizeX - lineOffset,
          start.y * stepSizeY - lineOffset,
          (width + 1) * stepSizeX + lineOffset * 2,
          (height + 1) * stepSizeY + lineOffset * 2
        )
        this.ctx.stroke()

        this.ctx.lineDashOffset = this.lineWidth
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
