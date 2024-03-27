import type { Board } from '$lib/data-model'
import Rand from 'rand-seed'
import { fillPond } from './landscape/pond'
import {
	type XY,
	randomElementWeighted,
	getNeighbors,
	xyToGrid,
	randomInt,
	randomFloat,
} from './math'

export type Hill = {
	type: 'hill'
	x: number
	y: number
	xJitter: number
	yJitter: number
	size: number
}
export type Tree = {
	type: 'tree'
	x: number
	y: number
	xJitter: number
	yJitter: number
	size: number
}
export type Pond = { type: 'pond'; tiles: XY[] }
export type Feature = { id: number; delay: number } & (Hill | Tree | Pond)

type OpenTile = {
	x: number
	y: number
	centerWeight: number
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
	openTiles: Map<string, OpenTile>
	nextID: number
	generationTime?: number
	totalDelay: number
}

const FEATURE_DELAY = 20

export function getLandscape(
	existingLandscape: Landscape,
	board: Board,
	answer: string,
	currentRow: number,
	seedPrefix = ''
): Landscape {
	const startTime = performance.now()
	console.time('getFeatures')
	const { tileMap, openTiles, width, height, centerX, centerY } = existingLandscape
	let { features, rowsGenerated, nextID, totalDelay } = existingLandscape
	let seed = seedPrefix + answer
	if (rowsGenerated === 0 && currentRow > rowsGenerated) {
		openTiles.set(xyToGrid([centerX, centerY]), {
			x: centerX,
			y: centerY,
			centerWeight: 1,
		})
	}
	while (rowsGenerated < currentRow) {
		const rowTiles = board[rowsGenerated]
		const rowWord = rowTiles.map((t) => t.letter).join('')
		seed += rowWord
		const rng = new Rand(seed)
		const getRng = () => rng.next()
		let rowFeature = 0
		const winningRow = rowWord === answer
		for (const tile of rowTiles) {
			// TODO: Seperate these into functions
			if (tile.polarity === 0) {
				// trees
				for (let i = 0; i < 6; i++) {
					if (openTiles.size === 0) break
					const openTilesArray = [...openTiles]
					// const [grid, { x, y }] = randomElement(openTilesArray, getRng)
					const [grid, { x, y }] = randomElementWeighted(
						openTilesArray,
						openTilesArray.map(([, { centerWeight, nearTrees }]) =>
							// Prioritize center tree placement on winning row
							winningRow ? centerWeight ** 3 : centerWeight * ((nearTrees || 0) + 1)
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
								centerWeight: getCenterWeight(existingLandscape, nx, ny),
								nearTrees: 1,
							})
						}
					})
					const feature: Feature = {
						type: 'tree',
						id: nextID++,
						x,
						y,
						xJitter: randomFloat(-0.3, 0.3, getRng),
						yJitter: randomFloat(-0.25, 0.25, getRng),
						size: getRng(),
						delay: totalDelay,
					}
					features.push(feature)
					totalDelay += FEATURE_DELAY
					rowFeature++
					tileMap.set(grid, feature)
				}
			} else if (tile.polarity < 0) {
				// hill
				let validXY: null | XY = null
				const hillGrids: string[] = []
				while (validXY === null) {
					const openHillTiles = [...openTiles].filter(([, { noHill }]) => !noHill)
					if (openHillTiles.length === 0) break
					const openTileWeights = openHillTiles.map(
						([, { centerWeight }]) => centerWeight
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
						const openTile = openTiles.get(xyToGrid([originX, originY]))
						if (openTile?.noHill) continue
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
				if (!validXY) continue
				const [x, y] = validXY
				const feature: Feature = {
					type: 'hill',
					id: nextID++,
					x,
					y,
					xJitter: randomFloat(-0.2, 0.2, getRng),
					yJitter: randomFloat(-0.2, 0.2, getRng),
					size: getRng(),
					delay: totalDelay,
				}
				features.push(feature)
				totalDelay += FEATURE_DELAY
				rowFeature++
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
					const noHill = nxRel === 0 // No hills directly above or below other hills
					const openTile = openTiles.get(nGrid)
					if (openTile && noHill) {
						openTile.noHill = noHill
					} else {
						openTiles.set(nGrid, {
							x: nx,
							y: ny,
							centerWeight: getCenterWeight(existingLandscape, nx, ny),
							noHill,
						})
					}
				}
			} else {
				// pond
				let generatedPond: ReturnType<typeof fillPond> = false
				while (!generatedPond) {
					const openTilesArray = [...openTiles].filter(([, { noPond }]) => !noPond)
					if (openTilesArray.length === 0) break
					// const [grid, { x, y }] = randomElement(openTilesArray, getRng)
					const [startGrid, openTile] = randomElementWeighted(
						openTilesArray,
						openTilesArray.map(
							([, { centerWeight, nearPonds }]) => centerWeight / ((nearPonds || 0) + 1)
						),
						getRng
					)
					generatedPond = fillPond(
						startGrid,
						openTile.x,
						openTile.y,
						getRng,
						existingLandscape
					)
					if (!generatedPond) openTile.noPond = true
				}
				if (!generatedPond) continue
				const { pondTiles, mergeWithPonds, feature } = generatedPond
				feature.id = nextID++
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
				totalDelay += FEATURE_DELAY
				rowFeature++
			}
		}
		rowsGenerated++
	}
	// Sort features for proper overlapping
	features.sort((a, b) => getFeatureY(a) - getFeatureY(b))
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
		nextID,
		totalDelay,
		generationTime: performance.now() - startTime,
	}
}
// prettier-ignore
const hillSubtiles = [[0, 0],[1, 0],[2, 0],[0, 1],[1, 1],[2, 1]]
// prettier-ignore
const hillNeighbors = [[0, -1],[1, -1],[2, -1],[-1, 0],[-1, 1],[0, 2],[1, 2],[2, 2],[3, 0],[3, 1]]

export function getCenterWeight({ centerX, centerY }: Landscape, x: number, y: number) {
	const verticalCenter = 1 - Math.abs(y - centerY) / (centerY + 1)
	const horizontalCenter = 1 - Math.abs(x - centerX) / (centerX + 1)
	return verticalCenter * horizontalCenter
}

function getFeatureY(feature: Feature) {
	if (feature.type === 'pond') return -1
	return feature.y + feature.yJitter
}
