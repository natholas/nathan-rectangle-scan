export class RectCheck {
  public ops: any = { maxBrightness: 230, minBrightness: 25, edgeThreshhold: 250, minContrast: 80, scale: 0.5, searchWidth: 30 }
  sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
  sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]
  blur = [1, 1, 1, 1, 1, 1, 1, 1, 1]

  constructor(ops: any = {}) {
    for (let i in ops) this.ops[i] = ops[i]
  }

  public check(image: HTMLImageElement, x: number, y: number, w: number, h: number) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const width = image.clientWidth, height = image.clientHeight
    canvas.width = width * this.ops.scale
    canvas.height = height * this.ops.scale
    const sh = this.ops.searchWidth
    const frame = {
      top: [x + sh / 2, y - sh / 2, w - sh, sh],
      bottom: [x + sh / 2, y + h - sh / 2, w - sh, sh],
      left: [x - sh / 2, y + sh / 2, sh, h - sh],
      right: [x + w - sh / 2, y + sh / 2, sh, h - sh],
    }

    for (let i in frame) frame[i] = frame[i].map((f: number) => Math.round(f * this.ops.scale))
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    return this.checkCoverage(this.getEdges(ctx, frame.top, this.sobelY), frame.top[2], frame.top[2], (i: number, w: number) => i % w) > this.ops.edgeThreshhold &&
      this.checkCoverage(this.getEdges(ctx, frame.bottom, this.sobelY), frame.bottom[2], frame.bottom[2], (i: number, w: number) => i % w) > this.ops.edgeThreshhold &&
      this.checkCoverage(this.getEdges(ctx, frame.left, this.sobelX), frame.left[2], frame.left[3], (i: number, w: number) => Math.floor(i / w)) > this.ops.edgeThreshhold &&
      this.checkCoverage(this.getEdges(ctx, frame.right, this.sobelX), frame.right[2], frame.left[3], (i: number, w: number) => Math.floor(i / w)) > this.ops.edgeThreshhold
  }

  private getEdges = (ctx: CanvasRenderingContext2D, box: number[], kernel: any) => {
    let data = ctx.getImageData(box[0], box[1], box[2], box[3]).data
    let pixels: number[] = [], max = this.ops.maxBrightness, min = this.ops.minB
    for (let i = 0; i < data.length; i += 4) {
      let v = (data[i] + data[i + 1] + data[i + 2]) / 3
      pixels.push(v)
      if (v < max) max = v
      if (v > min) min = v
    }
    return this.blurImage(pixels, box[2]).map((p, i) => {
      let v = Math.abs(Math.floor(this.convolute(pixels, i, box[2], kernel)))
      if (isNaN(v) || v === Infinity || v === -Infinity) return 0
      return v
    })
  }

  private checkCoverage = (data: number[], width: number, length: number, combinationFunc: Function) => {
    let coverage: number[] = []
    for (let i = 0; i < data.length; i++) {
      let x = combinationFunc(i, width)
      let v = data[i] > this.ops.minContrast ? 1 : 0
      coverage[x] = coverage[x] ? coverage[x] + v : v
    }
    return 100 / length * coverage.reduce((t: number, v: number) => t + v)
  }

  private blurImage = (pixels: number[], width: number): number[] => pixels.map((p, i) => Math.floor(this.convolute(pixels, i, width, this.blur) / 9))

  private convolute = (pixels: number[], index: number, width: number, pattern: number[]) => {
    return pixels[(index - 1) - width] * pattern[0] // top left
      + pixels[index - width] * pattern[1] // top
      + pixels[index - width] * pattern[2] // top right
      + pixels[index - 1] * pattern[3] // left
      + pixels[index] * pattern[4] // center
      + pixels[index + 1] * pattern[5] // right
      + pixels[(index - 1) + width] * pattern[6] // bottom left
      + pixels[(index) + width] * pattern[7] // bottom
      + pixels[(index + 1) + width] * pattern[8] // bottom right
  }
}

(<any>window).RectCheck = RectCheck