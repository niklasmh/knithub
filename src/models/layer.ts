import { Grid } from './grid'
import { RenderGrid } from '../components/Canvas'

export interface Layer {
  grid: Grid
  renderGrid?: RenderGrid
  selected?: boolean
}
