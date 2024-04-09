import {
	getCenterWeight,
	type Landscape,
	type Feature,
	LANDSCAPE_FEATURE_DELAY,
} from '$lib/landscape/landscape'
import {
	type XY,
	randomElementWeighted,
	randomInt,
	xyToGrid,
	randomFloat,
} from '$lib/math'

export function createHill(getRng: () => number, landscape: Landscape) {
	const hillSize = landscape.mini ? 4 : 6
	const { features, tileMap, openTiles, width, height } = landscape
	let validXY: false | XY = false
	const hillGrids: string[] = []
	while (!validXY) {
		const openHillTiles = [...openTiles].filter(([, { noHill }]) => !noHill)
		if (openHillTiles.length === 0) break
		const openTileWeights = openHillTiles.map(
			([, { y, centerWeight }]) => (y > 1 ? centerWeight : 0) // Hills higher than y=1 would be cut off
		)
		const [, tile] = randomElementWeighted(openHillTiles, openTileWeights, getRng)
		const subtileStartIndex = randomInt(0, 5, getRng)
		const subtiles = landscape.mini ? hillSubtilesMini : hillSubtiles
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
	if (!validXY) return false
	const [x, y] = validXY
	const feature: Feature = {
		type: 'hill',
		id: landscape.nextID++,
		x,
		y,
		xJitter: randomFloat(-0.2, 0.2, getRng),
		yJitter: randomFloat(-0.2, 0.19, getRng),
		size: getRng(),
		delay: landscape.totalDelay,
	}
	features.push(feature)
	landscape.totalDelay += LANDSCAPE_FEATURE_DELAY * hillSize
	for (const hillGrid of hillGrids) {
		tileMap.set(hillGrid, feature)
		openTiles.delete(hillGrid)
	}
	const neighbors = landscape.mini ? hillNeighborsMini : hillNeighbors
	for (const [nxRel, nyRel] of neighbors) {
		const nx = x + nxRel
		const ny = y + nyRel
		if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
		const nGrid = xyToGrid([nx, ny])
		if (tileMap.has(nGrid)) continue
		// No hills directly above or below other hills, unless in mini mode
		const noHill = !landscape.mini && nxRel === 0
		const openTile = openTiles.get(nGrid)
		if (openTile && noHill) {
			openTile.noHill = noHill
		} else {
			openTiles.set(nGrid, {
				x: nx,
				y: ny,
				centerWeight: getCenterWeight(landscape, nx, ny),
				noHill,
			})
		}
	}
}

// prettier-ignore
const hillSubtiles = [[0, 0],[1, 0],[0, 1],[1, 1],[2, 0],[2, 1]]
const hillSubtilesMini = hillSubtiles.slice(0, 4)
// prettier-ignore
const hillNeighbors = [[0, -1],[1, -1],[2, -1],[-1, 0],[-1, 1],[0, 2],[1, 2],[2, 2],[3, 0],[3, 1]]
// prettier-ignore
const hillNeighborsMini = [[0, -1],[1, -1],[-1, 0],[-1, 1],[2, 0],[2, 1],[0, 2],[1, 2]]
