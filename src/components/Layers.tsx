import React, { Component } from 'react'

import { Layer } from '../models/layer'

interface IProps {
  layers: Layer[]
  addLayer(layer: Layer): void
  deleteLayer(index: number): void
  selectLayer(index: number, unselectOthers: boolean): void
  moveLayer(index: number, steps: number): void
}

export default class Layers extends Component<IProps, {}> {
  render() {
    const layers: any = this.props.layers.map((layer: Layer, i: number) => {
      return (
        <div className="layer" key={i}>
          {i == 0 ? <i>Background layer</i> : `Layer ${i}`}
        </div>
      )
    })
    return <div className="layer-list">{layers}</div>
  }
}
