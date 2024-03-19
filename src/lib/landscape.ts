import type { Board } from '$lib/data-model'
import Rand from 'rand-seed'

type XY = [x: number, y: number]

type Hill = { type: 'hill'; x: number; y: number }
type Tree = { type: 'tree'; x: number; y: number }
type Pond = { type: 'pond'; pondID: number; tiles: XY[] }
export type Feature = Hill | Tree | Pond

type Tile = {
	x: number
	y: number
	fromCenter?: number
	noHill?: boolean
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
				const openTilesArray = [...openTiles]
				// const [grid, { x, y }] = randomElement(openTilesArray, getRng)
				const [firstPondGrid, { x, y }] = randomElementWeighted(
					openTilesArray,
					openTilesArray.map(
						([, { fromCenter, nearPonds }]) =>
							(maxDistance - (fromCenter || 0)) / ((nearPonds || 0) + 1)
					),
					getRng
				)
				const pondTiles: XY[] = []
				const openPondTiles = new Map([[firstPondGrid, { weight: 1, x, y }]])
				const feature: Feature = {
					type: 'pond',
					tiles: pondTiles,
					pondID: nextPondID++,
				}
				const mergeWithPonds: Set<Pond> = new Set()
				// console.log(grid)
				// openTiles.delete(grid)
				for (let i = 0; i < 6; i++) {
					if (openPondTiles.size === 0) break // TODO: Find better firstPondGrid instead
					const openGridsArray = [...openPondTiles]
					const openGridWeights = openGridsArray.map(([, { weight }]) => weight)
					const [grid, { x, y }] = randomElementWeighted(
						openGridsArray,
						openGridWeights,
						getRng
					)
					openPondTiles.delete(grid)
					openTiles.delete(grid)
					pondTiles.push([x, y])
					tileMap.set(grid, feature)
					getNeighbors(x, y).forEach(([nx, ny]) => {
						if (nx < 0 || nx >= width || ny < 0 || ny >= height) return
						const nGrid = xyToGrid([nx, ny])
						if (tileMap.has(nGrid)) {
							const neighborFeature = tileMap.get(nGrid)!
							if (
								neighborFeature.type === 'pond' &&
								neighborFeature.pondID !== feature.pondID
							)
								mergeWithPonds.add(neighborFeature)
							return
						}
						const fromCenter = getDistance(nx - centerX, ny - centerY)
						let weight = fromCenter
						let openTile = openTiles.get(nGrid)
						if (openTile) {
							openTile.nearPonds = (openTile.nearPonds || 0) + 1
							weight *= openTile.nearPonds
						} else {
							openTile = { x: nx, y: ny, fromCenter, nearPonds: 1 }
							openTiles.set(nGrid, openTile)
						}
						openPondTiles.set(nGrid, { weight: weight, x: nx, y: ny })
					})
				}
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
	// console.log(features)
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

// TODO: Move this to random.ts
function randomFloat(min: number, max: number, rng = Math.random) {
	return min + rng() * (max - min)
}
function randomInt(min: number, max: number, rng = Math.random) {
	return min + Math.floor(rng() * (max - min + 1))
}
function randomElement<T>(arr: T[], rng = Math.random): T {
	return arr[Math.floor(rng() * arr.length)]
}
// Based on https://github.com/ChrisCavs/aimless.js/blob/main/src/weighted.ts
function randomElementWeighted<T>(arr: T[], weights: number[], rng = Math.random) {
	if (arr.length === 1) return arr[0]
	const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
	const random = randomFloat(0, totalWeight, rng)
	let cumulativeWeight = 0
	for (let i = 0; i < arr.length; i++) {
		cumulativeWeight += weights[i]
		if (random < cumulativeWeight) return arr[i]
	}
	return arr[0] // Should never reach here, but just in case
}

export const xyToGrid = ([x, y]: XY) => `${x}:${y}`
const gridToXY = (grid: string) => grid.split(':').map((v) => +v)

// prettier-ignore
const hillSubtiles = [[0, 0],[1, 0],[2, 0],[0, 1],[1, 1],[2, 1]]
// prettier-ignore
const hillNeighbors = [[0, -1],[1, -1],[2, -1],[-1, 0],[-1, 1],[0, 2],[1, 2],[2, 2],[3, 0],[3, 1]]
// prettier-ignore
const neighbors = [[-1, 0],[1, 0],[0, -1],[0, 1]]
function getNeighborGrids(grid: string) {
	const [x, y] = gridToXY(grid)
	return neighbors.map(([nx, ny]) => xyToGrid([x + nx, y + ny]))
}
const getNeighbors = (x: number, y: number) =>
	neighbors.map(([nx, ny]) => [x + nx, y + ny])

const getDistance = (x: number, y: number) => Math.sqrt(x ** 2 + y ** 2)
