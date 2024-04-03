import type { Board, Tile } from '$lib/data-model'
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
export type Feature = { id: number; delay: number } & (Hill | Tree)

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
	tileMap: Map<string, Feature | 'pond'>
	openTiles: Map<string, OpenTile>
	pondTiles: XY[]
	newPondTiles: XY[]
	nextID: number
	pondDelay?: number
	totalDelay?: number
	mini?: boolean
}

const FEATURE_DELAY = 30

export function getLandscape(
	existingLandscape: Landscape,
	board: Board,
	answer: string,
	currentRow: number,
	seedPrefix = ''
): Landscape {
	const { tileMap, openTiles, pondTiles, newPondTiles, width, height, centerX, centerY } =
		existingLandscape
	existingLandscape.mini = width < 8
	const hillSize = existingLandscape.mini ? 4 : 6
	let { features, rowsGenerated, nextID } = existingLandscape
	// No initial delay if loading a partially/fully completed puzzle
	let totalDelay = currentRow > 1 && rowsGenerated === 0 ? 0 : 500
	let pondDelay = -1
	newPondTiles.length = 0
	if (rowsGenerated === 0 && currentRow > rowsGenerated) {
		openTiles.set(xyToGrid([centerX, centerY]), {
			x: centerX,
			y: centerY,
			centerWeight: 1,
		})
	}
	while (rowsGenerated < currentRow) {
		const rowTiles = board[rowsGenerated]
		const rowWord = rowToWord(rowTiles)
		const seed =
			seedPrefix + answer + board.slice(0, rowsGenerated).map(rowToWord).join('')
		const rng = new Rand(seed)
		const getRng = () => rng.next()
		const winningRow = rowWord === answer
		for (const tile of rowTiles) {
			// TODO: Seperate these into functions
			if (tile.polarity === 0) {
				// trees
				const treeCount = existingLandscape.mini ? 4 : 6
				for (let i = 0; i < treeCount; i++) {
					if (openTiles.size === 0) break
					const openTilesArray = [...openTiles]
					const [grid, { x, y }] = randomElementWeighted(
						openTilesArray,
						openTilesArray.map(([, { y, centerWeight, nearTrees }]) =>
							// Prioritize center tree placement on winning row
							y === 0 // Trees at the top would be cut off
								? 0
								: winningRow
								? centerWeight ** 3
								: centerWeight * ((nearTrees || 0) + 1)
						),
						getRng
					)
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
						xJitter: randomFloat(-0.35, 0.35, getRng),
						yJitter: randomFloat(-0.22, 0.22, getRng),
						size: getRng(),
						delay: totalDelay,
					}
					features.push(feature)
					totalDelay += FEATURE_DELAY
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
						([, { y, centerWeight }]) => (y > 1 ? centerWeight : 0) // Hills higher than y=1 would be cut off
					)
					const [, tile] = randomElementWeighted(openHillTiles, openTileWeights, getRng)
					const subtileStartIndex = randomInt(0, 5, getRng)
					const subtiles = existingLandscape.mini ? hillSubtilesMini : hillSubtiles
					for (let i = 0; i < hillSize; i++) {
						const subtileIndex = (subtileStartIndex + i) % hillSize
						const [stX, stY] = subtiles[subtileIndex]
						const originX = tile.x - stX
						if (originX < 0 || originX + 2 >= width) continue
						const originY = tile.y - stY
						if (originY < 0 || originY + 1 >= height) continue
						const openTile = openTiles.get(xyToGrid([originX, originY]))
						if (openTile?.noHill) continue
						hillGrids.length = 0
						for (const [hsX, hsY] of subtiles) {
							const hillGrid = xyToGrid([originX + hsX, originY + hsY])
							if (tileMap.has(hillGrid)) break
							hillGrids.push(hillGrid)
						}
						if (hillGrids.length < hillSize) continue
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
				totalDelay += FEATURE_DELAY * hillSize
				for (const hillGrid of hillGrids) {
					tileMap.set(hillGrid, feature)
					openTiles.delete(hillGrid)
				}
				const neighbors = existingLandscape.mini ? hillNeighborsMini : hillNeighbors
				for (const [nxRel, nyRel] of neighbors) {
					const nx = x + nxRel
					const ny = y + nyRel
					if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
					const nGrid = xyToGrid([nx, ny])
					if (tileMap.has(nGrid)) continue
					// No hills directly above or below other hills, unless in mini mode
					const noHill = !existingLandscape.mini && nxRel === 0
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
				}
				if (generatedPond && pondDelay < 0) {
					pondDelay = totalDelay
					totalDelay += FEATURE_DELAY * (existingLandscape.mini ? 6 : 4)
				}
			}
		}
		rowsGenerated++
	}
	// Sort features for proper overlapping
	features.sort((a, b) => getFeatureY(a) - getFeatureY(b))
	return {
		features,
		tileMap,
		rowsGenerated,
		openTiles,
		pondTiles,
		newPondTiles,
		width,
		height,
		centerX,
		centerY,
		nextID,
		pondDelay,
		totalDelay,
		mini: existingLandscape.mini,
	}
}
// prettier-ignore
const hillSubtiles = [[0, 0],[1, 0],[0, 1],[1, 1],[2, 0],[2, 1]]
const hillSubtilesMini = hillSubtiles.slice(0, 4)
// prettier-ignore
const hillNeighbors = [[0, -1],[1, -1],[2, -1],[-1, 0],[-1, 1],[0, 2],[1, 2],[2, 2],[3, 0],[3, 1]]
// prettier-ignore
const hillNeighborsMini = [[0, -1],[1, -1],[-1, 0],[-1, 1],[2, 0],[2, 1],[0, 2],[1, 2]]

export function getCenterWeight({ centerX, centerY }: Landscape, x: number, y: number) {
	const verticalCenter = 1 - Math.abs(y - centerY) / (centerY + 1)
	const horizontalCenter = 1 - Math.abs(x - centerX) / (centerX + 1)
	return verticalCenter * horizontalCenter
}

const getFeatureY = (feature: Feature) => feature.y + feature.yJitter

const rowToWord = (row: Tile[]) => row.map((t) => t.letter).join('')
