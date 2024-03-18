import type { Board } from '$lib/data-model'
import Hill from '$com/landscape/Hill.svelte'
import Pond from '$com/landscape/Pond.svelte'
import Tree from '$com/landscape/Tree.svelte'
import Rand from 'rand-seed'

type XY = [x: number, y: number]

type FeatureType = 'hill' | 'tree' | 'pond'
export type Feature = {
	x: number
	y: number
} & (
	| {
			type: 'hill'
			component: typeof Hill
			props?: {}
			// props: {
			// 	tiles: XY[]
			// }
	  }
	| {
			type: 'tree'
			component: typeof Tree
			props?: {}
	  }
	| {
			type: 'pond'
			component: typeof Pond
			props: {
				tiles: XY[]
			}
	  }
)

type Tile = {
	x: number
	y: number
	noHill?: boolean
}

export type Landscape = {
	rows: number
	features: Feature[]
	tileMap: Map<string, Feature>
	openTiles: Map<string, Tile>
}

const featureComponents = {
	hill: Hill,
	tree: Tree,
	pond: Pond,
}

const DEG_TO_RAD = Math.PI / 180

// function featureInBounds({ boundingBox }: Feature, metrics: Metrics): boolean {
// 	return (
// 		boundingBox.x >= 0 &&
// 		boundingBox.y >= 0 &&
// 		boundingBox.x + boundingBox.width < metrics.width &&
// 		boundingBox.y + boundingBox.height < metrics.height
// 	)
// }

// function featuresIntersect(
// 	{ boundingBox: aBox }: Feature,
// 	{ boundingBox: bBox }: Feature
// ): boolean {
// 	return (
// 		aBox.x < bBox.x + bBox.width &&
// 		aBox.x + aBox.width > bBox.x &&
// 		aBox.y < bBox.y + bBox.height &&
// 		aBox.y + aBox.height > bBox.y
// 	)
// }

export function getLandscape(
	xTiles: number,
	yTiles: number,
	existingLandscape: Landscape,
	board: Board,
	currentRow: number
): Landscape {
	console.time('getFeatures')
	// TODO: Maybe don't need to create new arrays/maps
	const features = [...existingLandscape.features]
	const tileMap = new Map(existingLandscape.tileMap)
	const openTiles = new Map(existingLandscape.openTiles)
	// Store each tile's squared distance to use as probability
	// Ponds and trees gain probability near other ponds and trees
	let rows = existingLandscape.rows
	while (rows < currentRow) {
		const rowTiles = board[rows]
		const rowWord = rowTiles.map((t) => t.letter).join('')
		const rng = new Rand(rowWord)
		const getRng = () => rng.next()
		for (const tile of rowTiles) {
			if (tile.polarity === 0) {
				// trees
				for (let i = 0; i < 6; i++) {
					const [grid, { x, y }] = randomElement([...openTiles], getRng)
					// console.log(grid)
					openTiles.delete(grid)
					getNeighbors(x, y).forEach(([nx, ny]) => {
						if (nx < 0 || nx >= xTiles || ny < 0 || ny >= yTiles) return
						const nGrid = xyToGrid([nx, ny])
						if (tileMap.has(nGrid)) return
						const openTile = openTiles.get(nGrid)
						if (openTile) {
							//
						} else {
							openTiles.set(nGrid, { x: nx, y: ny })
						}
					})
					const feature: Feature = { type: 'tree', x, y, component: Tree }
					features.push(feature)
					tileMap.set(grid, feature)
				}
			} else if (tile.polarity < 0) {
				// hill
				const openHillTiles = [...openTiles].filter(([, { noHill }]) => !noHill)
				let validXY: null | XY = null
				const hillGrids: string[] = []
				while (validXY === null) {
					const [, { x, y }] = randomElement(openHillTiles, getRng)
					const subtileStartIndex = randomInt(0, 5, getRng)
					for (let i = 0; i < 6; i++) {
						const subtileIndex = (subtileStartIndex + i) % 6
						const [stX, stY] = hillSubtiles[subtileIndex]
						const originX = x - stX
						if (originX < 0 || originX + 2 >= xTiles) continue
						const originY = y - stY
						if (originY < 0 || originY + 1 >= yTiles) continue
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
					// mark this tile as noHill
				}
				if (!validXY) throw 'could not find valid spot for hill!'
				const [x, y] = validXY
				const feature: Feature = { type: 'hill', x, y, component: Hill }
				features.push(feature)
				for (const hillGrid of hillGrids) {
					tileMap.set(hillGrid, feature)
					openTiles.delete(hillGrid)
				}
				for (const [nxRel, nyRel] of hillNeighbors) {
					const nx = x + nxRel
					const ny = y + nyRel
					if (nx < 0 || nx >= xTiles || ny < 0 || ny >= yTiles) continue
					const nGrid = xyToGrid([nx, ny])
					if (tileMap.has(nGrid)) continue
					const openTile = openTiles.get(nGrid)
					if (openTile) {
						//
					} else {
						openTiles.set(nGrid, { x: nx, y: ny })
					}
				}
			} else {
				// pond
				for (let i = 0; i < 6; i++) {
					const [grid, { x, y }] = randomElement([...openTiles], getRng)
					// console.log(grid)
					openTiles.delete(grid)
					getNeighbors(x, y).forEach(([nx, ny]) => {
						if (nx < 0 || nx >= xTiles || ny < 0 || ny >= yTiles) return
						const nGrid = xyToGrid([nx, ny])
						if (tileMap.has(nGrid)) return
						const openTile = openTiles.get(nGrid)
						if (openTile) {
							//
						} else {
							openTiles.set(nGrid, { x: nx, y: ny })
						}
					})
					const feature: Feature = {
						type: 'pond',
						x,
						y,
						component: Pond,
						props: { tiles: [] },
					}
					features.push(feature)
					tileMap.set(grid, feature)
				}
			}
		}
		rows++
	}
	console.timeEnd('getFeatures')
	return { features, tileMap, rows, openTiles }
}

// TODO: Move this to random.ts
function randomInt(min: number, max: number, rng = Math.random) {
	return min + Math.floor(rng() * (max - min + 1))
}
function randomElement<T>(arr: T[], rng = Math.random): T {
	return arr[Math.floor(rng() * arr.length)]
}

export const xyToGrid = ([x, y]: XY) => `${x}:${y}`
const gridToXY = (grid: string) => grid.split(':').map((v) => +v)

const hillSubtiles = [
	[0, 0],
	[1, 0],
	[2, 0],
	[0, 1],
	[1, 1],
	[2, 1],
]
const hillNeighbors = [
	[0, -1],
	[1, -1],
	[2, -1],
	[-1, 0],
	[-1, 1],
	[0, 2],
	[1, 2],
	[2, 2],
	[3, 0],
	[3, 1],
]

const neighbors = [
	[-1, 0],
	[1, 0],
	[0, -1],
	[0, 1],
]
function getNeighborGrids(grid: string) {
	const [x, y] = gridToXY(grid)
	return neighbors.map(([nx, ny]) => xyToGrid([x + nx, y + ny]))
}
function getNeighbors(x: number, y: number) {
	return neighbors.map(([nx, ny]) => [x + nx, y + ny])
}
