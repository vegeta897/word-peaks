import type { Board } from '$lib/data-model'
import Rand from 'rand-seed'
import { fillPond } from './landscape/pond'
import {
	type XY,
	getDistance,
	randomElementWeighted,
	getNeighbors,
	xyToGrid,
	randomInt,
} from './math'

export type Hill = { type: 'hill'; x: number; y: number }
export type Tree = { type: 'tree'; x: number; y: number }
export type Pond = { type: 'pond'; pondID: number; tiles: XY[] }
export type Feature = Hill | Tree | Pond

type Tile = {
	x: number
	y: number
	fromCenter?: number
	noHill?: boolean
	noPond?: boolean
	nearPonds?: number
	nearTrees?: number
}

export type Landscape = {
	width: number
	height: number
	centerX: number
	centerY: number
	rowsGenerated: number
	features: Feature[]
	tileMap: Map<string, Feature>
	openTiles: Map<string, Tile>
	nextPondID: number
	generationTime?: number
}

export function getLandscape(
	existingLandscape: Landscape,
	board: Board,
	currentRow: number,
	seedPrefix = ''
): Landscape {
	const startTime = performance.now()
	console.time('getFeatures')
	const { tileMap, openTiles, width, height, centerX, centerY } = existingLandscape
	let { features, rowsGenerated, nextPondID } = existingLandscape
	const maxDistance = getDistance(centerX + 1, centerY + 1)
	let seed = seedPrefix
	while (rowsGenerated < currentRow) {
		const rowTiles = board[rowsGenerated]
		const rowWord = rowTiles.map((t) => t.letter).join('')
		seed += rowWord
		const rng = new Rand(seed)
		const getRng = () => rng.next()
		for (const tile of rowTiles) {
			// TODO: Seperate these into functions
			if (tile.polarity === 0) {
				// trees
				for (let i = 0; i < 6; i++) {
					const openTilesArray = [...openTiles]
					// const [grid, { x, y }] = randomElement(openTilesArray, getRng)
					const [grid, { x, y }] = randomElementWeighted(
						openTilesArray,
						openTilesArray.map(([, { fromCenter, nearTrees }]) =>
							// TODO: This is bad and crappy
							Math.round(
								(2 ** maxDistance - 2 ** (fromCenter || 0)) * ((nearTrees || 0) + 1)
							)
						),
						getRng
					)
					// const [grid, { x, y }] = randomElement([...openTiles], getRng)
					// console.log(grid)
					openTiles.delete(grid)
					getNeighbors(x, y).forEach(([nx, ny]) => {
						if (nx < 0 || nx >= width || ny < 0 || ny >= height) return
						const nGrid = xyToGrid([nx, ny])
						if (tileMap.has(nGrid)) return
						const openTile = openTiles.get(nGrid)
						if (openTile) {
							openTile.nearTrees = (openTile.nearTrees || 0) + 1
						} else {
							openTiles.set(nGrid, {
								x: nx,
								y: ny,
								fromCenter: getDistance(nx - centerX, ny - centerY),
								nearTrees: 1,
							})
						}
					})
					const feature: Feature = { type: 'tree', x, y }
					features.push(feature)
					tileMap.set(grid, feature)
				}
			} else if (tile.polarity < 0) {
				// hill
				let validXY: null | XY = null
				const hillGrids: string[] = []
				while (validXY === null) {
					const openHillTiles = [...openTiles].filter(([, { noHill }]) => !noHill)
					const openTileWeights = openHillTiles.map(([, { fromCenter }]) =>
						Math.round(2 ** maxDistance - 2 ** (fromCenter || 0))
					)
					// console.log(openTileWeights)
					const [, tile] = randomElementWeighted(openHillTiles, openTileWeights, getRng)
					const subtileStartIndex = randomInt(0, 5, getRng)
					for (let i = 0; i < 6; i++) {
						const subtileIndex = (subtileStartIndex + i) % 6
						const [stX, stY] = hillSubtiles[subtileIndex]
						const originX = tile.x - stX
						if (originX < 0 || originX + 2 >= width) continue
						const originY = tile.y - stY
						if (originY < 0 || originY + 1 >= height) continue
						hillGrids.length = 0
						for (const [hsX, hsY] of hillSubtiles) {
							const hillGrid = xyToGrid([originX + hsX, originY + hsY])
							if (tileMap.has(hillGrid)) break
							hillGrids.push(hillGrid)
						}
						if (hillGrids.length < 6) continue
						// Valid spot found
						validXY = [originX, originY]
						break
					}
					if (!validXY) {
						// Mark this tile as "noHill" so it won't get picked again
						tile.noHill = true
					}
				}
				if (!validXY) throw 'could not find valid spot for hill!'
				const [x, y] = validXY
				const feature: Feature = { type: 'hill', x, y }
				features.push(feature)
				for (const hillGrid of hillGrids) {
					tileMap.set(hillGrid, feature)
					openTiles.delete(hillGrid)
				}
				for (const [nxRel, nyRel] of hillNeighbors) {
					const nx = x + nxRel
					const ny = y + nyRel
					if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
					const nGrid = xyToGrid([nx, ny])
					if (tileMap.has(nGrid)) continue
					const openTile = openTiles.get(nGrid)
					if (openTile) {
						//
					} else {
						openTiles.set(nGrid, {
							x: nx,
							y: ny,
							fromCenter: getDistance(nx - centerX, ny - centerY),
						})
					}
				}
			} else {
				// pond
				let generatedPond: ReturnType<typeof fillPond> = false
				const pondID = nextPondID++
				while (!generatedPond) {
					const openTilesArray = [...openTiles].filter(([, { noPond }]) => !noPond)
					// const [grid, { x, y }] = randomElement(openTilesArray, getRng)
					const [startGrid, openTile] = randomElementWeighted(
						openTilesArray,
						openTilesArray.map(
							([, { fromCenter, nearPonds }]) =>
								(maxDistance - (fromCenter || 0)) / ((nearPonds || 0) + 1)
						),
						getRng
					)
					generatedPond = fillPond(
						startGrid,
						openTile.x,
						openTile.y,
						pondID,
						getRng,
						existingLandscape
					)
					if (!generatedPond) openTile.noPond = true
				}
				const { pondTiles, mergeWithPonds, feature } = generatedPond
				pondTiles.forEach((_, grid) => tileMap.set(grid, feature))
				if (mergeWithPonds.size > 0) {
					// Remove merged ponds
					features = features.filter((f) => !mergeWithPonds.has(f as Pond))
					for (const mergedPond of mergeWithPonds) {
						mergedPond.tiles.forEach((tile) => {
							tileMap.set(xyToGrid(tile), feature)
							feature.tiles.push(tile)
						})
					}
				}
				features.push(feature)
			}
		}
		rowsGenerated++
	}
	// Sort features for proper overlapping
	features.sort((a, b) => (a.type === 'pond' ? -1 : a.y) - (b.type === 'pond' ? -1 : b.y))
	console.timeEnd('getFeatures')
	console.log(features)
	// console.log(openTiles)
	return {
		features,
		tileMap,
		rowsGenerated,
		openTiles,
		width,
		height,
		centerX,
		centerY,
		nextPondID,
		generationTime: performance.now() - startTime,
	}
}
// prettier-ignore
const hillSubtiles = [[0, 0],[1, 0],[2, 0],[0, 1],[1, 1],[2, 1]]
// prettier-ignore
const hillNeighbors = [[0, -1],[1, -1],[2, -1],[-1, 0],[-1, 1],[0, 2],[1, 2],[2, 2],[3, 0],[3, 1]]
