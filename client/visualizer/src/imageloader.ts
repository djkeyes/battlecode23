import { basename } from 'path'
import { Config } from './config'
import * as cst from "./constants"
import { ControlType } from './main/controls'
type Image = HTMLImageElement
type ImageArray = Array<Image>
type ImageMap = Record<string, Image>
type ImageArrayMap = Record<string, ImageArray>

export type AllImages = {
  star: Image,
  tiles: ImageArray,
  robots: ImageArrayMap,
  robots_high_quality: ImageArrayMap,
  resources: ImageMap,
  resource_wells: ImageArrayMap,
  effects: ImageArrayMap,
  controls: ImageMap
}

export function loadAll(config: Config, callback: (arg0: AllImages) => void) {
  const dirname = "./static/img/"

  const NEUTRAL: number = 0
  const RED: number = 1
  const BLU: number = 2

  function loadImage(
    image: Image,
    path: string,
    src?: string
  ): void {
    const f = loadImage
    f.expected++

    function onFinish() {
      if (f.requestedAll && f.expected == f.success + f.failure) {
        console.log(`Total ${f.expected} images loaded: ${f.success} successful, ${f.failure} failed.`)
        callback((Object.freeze(result) as unknown) as AllImages)
      }
    }

    image.onload = () => {
      f.success++
      onFinish()
    }

    image.onerror = () => {
      f.failure++
      console.error(`CANNOT LOAD IMAGE: ${path}, ${image}`)
      if (src) console.error(`Source: ${src}`)
      onFinish()
    }

    // might want to use path library
    // webpack url loader triggers on require("<path>.png"), so .png should be explicit
    image.src = (src ?? require(dirname + path + '.png').default)
  }
  loadImage.expected = 0
  loadImage.success = 0
  loadImage.failure = 0
  loadImage.requestedAll = false

  function loadImageInArray(
    array: ImageArray,
    index: number,
    path: string,
    src?: string
  ): void {
    const image = new Image()
    loadImage(image, path, src)

    while (array.length <= index)
      array.push(new Image())

    array[index] = image
  }

  function loadImageInMap(
    Map: ImageMap,
    key: number,
    path: string,
    src?: string
  ): void {
    const image = new Image()

    // Ensure record entry exists
    if (!(key in Map))
      Map[key] = image

    loadImage(image, path, src)
  }

  function loadImageInArrayMap(
    Map: ImageArrayMap,
    key: number,
    arrayIndex: number,
    path: string,
    src?: string
  ): void {
    // Ensure record entry exists
    if (!(key in Map))
      Map[key] = []

    loadImageInArray(Map[key], arrayIndex, path, src)
  }

  const result = {
    tiles: [],
    robots: {},
    robots_high_quality: {},
    resources: {},
    resource_wells: {},
    effects: {},
    controls: {}
  }

  // helper function to manipulate images
  const htmlToData = (ele: HTMLImageElement): ImageData => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error("Error while converting a tile image")
    canvas.width = ele.width
    canvas.height = ele.height
    context.drawImage(ele, 0, 0)
    return context.getImageData(0, 0, ele.width, ele.height)
  }

  const dataToSrc = (data: ImageData): String => {
    var canvas = document.createElement("canvas")
    canvas.width = data.width
    canvas.height = data.height
    var context = canvas.getContext("2d")
    if (!context) throw new Error("Error while converting a tile images")
    context.putImageData(data, 0, 0)

    return canvas.toDataURL(`edited.png`)
  }

  // loadImage(result, 'star', 'star')

  // terrain tiles
  {
    // const tintData = (data: ImageData, colors: Uint8Array): ImageData => {
    //   const arr = new Uint8ClampedArray(data.data.length)
    //   for (let i = 0; i < arr.length; i += 4) {
    //     const rock = data.data[i] > 128;
    //     const factor = rock ? 1.5 : 1;
    //     arr[i + 0] = colors[0] / factor;
    //     arr[i + 1] = colors[1] / factor;
    //     arr[i + 2] = colors[2] / factor;
    //     arr[i + 3] = 240
    //   }
    //   const result = new ImageData(arr, data.height)
    //   return result
    // }

    const randomTile = (dim: number, colors: Uint8Array, level: number): ImageData => {
      var seed = level + 1 //avoid 0
      function srand() {
        var x = Math.sin(seed++) * 10000
        return x - Math.floor(x)
      }

      const arr = new Uint8ClampedArray(dim ** 2 * 4)
      for (let i = 0; i < arr.length; i += 4) {
        var scale = 8 * (2 + level) / 255
        var shade = srand() * scale + 1 - scale
        arr[i + 0] = colors[level][0] * shade
        arr[i + 1] = colors[level][1] * shade
        arr[i + 2] = colors[level][2] * shade
        arr[i + 3] = 255
      }
      const result = new ImageData(arr, dim)
      return result
    }

    // const baseTile: Image = new Image()
    // baseTile.src = require(dirname + 'tiles/terrain3.png').default

    const nLev = cst.TILE_COLORS.length
    // baseTile.onload = () => {
    //   for (let i = 0; i < nLev; i++) {
    //     const data: ImageData = htmlToData(baseTile)
    //     const tinted: ImageData = randomTile(25, <Uint8Array><unknown>cst.TILE_COLORS, i)
    //     const path: String = dataToSrc(tinted)
    //     loadImage(result.tiles, i, "", path.slice(0, path.length - 4))
    //   }
    // }

    for (let i = 0; i < nLev; i++) {
      const tinted: ImageData = randomTile(25, <Uint8Array><unknown>cst.TILE_COLORS, i)
      const path: String = dataToSrc(tinted)
      loadImageInArray(result.tiles, i, "", path.slice(0, path.length - 4))
    }
  }

  // robot sprites
  for (let team of [RED, BLU]) {
    let team_str = team == RED ? 'red' : 'blue'
    for (let bodytype of cst.bodyTypeList) {
      loadImageInArrayMap(result.robots, bodytype, team, `robots/${team_str}_${cst.bodyTypeToString(bodytype)}_smaller`)
      loadImageInArrayMap(result.robots_high_quality, bodytype, team, `robots/${team_str}_${cst.bodyTypeToString(bodytype)}`)
    }
  }
  // resources

  loadImageInMap(result.resources, cst.ADAMANTIUM, 'resources/adamantium')
  loadImageInMap(result.resources, cst.MANA, 'resources/mana')
  loadImageInMap(result.resources, cst.ELIXIR, 'resources/elixir')
  for(let upgraded of [0,1]){
    loadImageInArrayMap(result.resource_wells, cst.ADAMANTIUM, upgraded, `resources/adamantium_well${upgraded?"_upgraded":""}_smaller`)
    loadImageInArrayMap(result.resource_wells, cst.MANA, upgraded, `resources/mana_well${upgraded?"_upgraded":""}_smaller`)
    loadImageInArrayMap(result.resource_wells, cst.ELIXIR, upgraded, `resources/elixir_well${upgraded?"_upgraded":""}_smaller`)
  }

  

  // effects
  // loadImage(result.effects, 'death', 'effects/death/death_empty');
  // loadImage(result.effects.embezzle, 0, 'effects/embezzle/slanderer_embezzle_empty_1');
  // loadImage(result.effects.embezzle, 1, 'effects/embezzle/slanderer_embezzle_empty_2');

  {
    const makeTransparent = (data: ImageData): ImageData => {
      const arr = new Uint8ClampedArray(data.data.length)
      for (let i = 0; i < arr.length; i += 4) {
        arr[i + 0] = data.data[i + 0]
        arr[i + 1] = data.data[i + 1]
        arr[i + 2] = data.data[i + 2]
        arr[i + 3] = data.data[i + 3] / 1.4
      }
      const result = new ImageData(arr, data.width)
      return result
    }

    const makeRed = (data: ImageData): ImageData => {
      const arr = new Uint8ClampedArray(data.data.length)
      for (let i = 0; i < arr.length; i += 4) {
        arr[i + 0] = 255
        arr[i + 1] = 0
        arr[i + 2] = 0
        arr[i + 3] = data.data[i + 3]
      }
      const result = new ImageData(arr, data.width)
      return result
    }

    const makeBlue = (data: ImageData): ImageData => {
      const arr = new Uint8ClampedArray(data.data.length)
      for (let i = 0; i < arr.length; i += 4) {
        arr[i + 0] = 0
        arr[i + 1] = 0
        arr[i + 2] = 255
        arr[i + 3] = data.data[i + 3]
      }
      const result = new ImageData(arr, data.width)
      return result
    }

    for (let i = 0; i < 2; i++) {
      const base: Image = new Image()
      base.src = require(dirname + `effects/empower/polit_empower_empty_${i + 1}.png`).default

      base.onload = () => {
        const data: ImageData = htmlToData(base)
        const trans: ImageData = makeTransparent(data)
        const red: ImageData = makeRed(trans)
        const blue: ImageData = makeBlue(trans)
        const path_red: String = dataToSrc(red)
        const path_blue: String = dataToSrc(blue)
        // loadImage(result.effects.empower_red, i, "", path_red.slice(0, path_red.length - 4))
        // loadImage(result.effects.empower_blue, i, "", path_blue.slice(0, path_blue.length - 4))
      }
    }
  }

  /*
  loadImage(result.effects.expose, 0, 'effects/expose/expose_empty')
  loadImage(result.effects.camouflage_red, 0, 'effects/camouflage/camo_red')
  loadImage(result.effects.camouflage_blue, 0, 'effects/camouflage/camo_blue')
  */

  // load controls
  // buttons are from https://material.io/resources/icons
  loadImageInMap(result.controls, ControlType.GO_NEXT, 'controls/go-next')
  loadImageInMap(result.controls, ControlType.GO_PREVIOUS, 'controls/go-previous')
  loadImageInMap(result.controls, ControlType.PLAYBACK_PAUSE, 'controls/playback-pause')
  loadImageInMap(result.controls, ControlType.PLAYBACK_START, 'controls/playback-start')
  loadImageInMap(result.controls, ControlType.PLAYBACK_STOP, 'controls/playback-stop')
  loadImageInMap(result.controls, ControlType.REVERSE_UPS, 'controls/reverse')
  loadImageInMap(result.controls, ControlType.DOUBLE_UPS, 'controls/skip-forward')
  loadImageInMap(result.controls, ControlType.HALVE_UPS, 'controls/skip-backward')
  loadImageInMap(result.controls, ControlType.GO_END, 'controls/go-end')
  // loadImageInMap(result.controls, ControlType.MATCH_BACKWARD, 'controls/go-previous')
  // loadImageInMap(result.controls, ControlType.MATCH_FORWARD, 'controls/go-next')

  // mark as finished
  loadImage.requestedAll = true
}
