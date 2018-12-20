export enum Transformations {
  ROTATION,
  FLIP_X,
  FLIP_Y,
  TRANSLATE_X,
  TRANSLATE_Y
}

export interface Transformation {
  type: Transformations
  value?: number
}
