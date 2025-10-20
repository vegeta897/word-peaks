import {
	type Landscape,
	type Feature,
	LANDSCAPE_FEATURE_DELAY,
	getTileBalance,
	getNewCenterOfMass,
	addFeature,
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
	const { tileMap, width, height } = landscape
	let validXY: false | XY = false
	const hillGrids: string[] = []
	while (!validXY) {
		const openHillTiles = [...tileMap].filter(
			([, tile]) => !tile.feature && tile.connected && !tile.noHill && tile.y > 2 // Hills higher than y=2 would be cut off
		)
		if (openHillTiles.length === 0) break
		const openTileWeights = openHillTiles.map(
			([, { x, y, connected }]) => getTileBalance(x + 1.5, y, 6, landscape) + connected
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
			if (originY < 1 || originY >= height) continue
			const hillRootTile = tileMap.get(xyToGrid([originX, originY]))
			if (hillRootTile?.noHill) continue
			hillGrids.length = 0
			for (const [hsX, hsY] of subtiles) {
				const hillGrid = xyToGrid([originX + hsX, originY + hsY])
				if (tileMap.get(hillGrid)?.feature) break
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
		yJitter: randomFloat(-0.3, 0.2, getRng),
		size: getRng(),
		delay: landscape.totalDelay,
	}
	addFeature(landscape, feature)
	landscape.centerOfMass = getNewCenterOfMass(landscape, x + 1.5, y, 6)
	landscape.totalDelay += LANDSCAPE_FEATURE_DELAY * hillSize
	for (let i = 0; i < hillGrids.length; i++) {
		const tile = tileMap.get(hillGrids[i])!
		tile.feature = feature
		tile.hillSubTile = i
	}
	const neighbors = landscape.mini ? hillNeighborsMini : hillNeighbors
	for (const [nxRel, nyRel] of neighbors) {
		const nx = x + nxRel
		const ny = y + nyRel
		if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
		const nTile = tileMap.get(xyToGrid([nx, ny]))
		if (!nTile) continue
		// No hills directly above or below other hills, unless in mini mode
		const noHill = !landscape.mini && nxRel === 0
		if (noHill) nTile.noHill = true
		nTile.connected = 1
	}
}

// prettier-ignore
const hillSubtiles = [[0,0],[1,0],[2,0],[0,-1],[1,-1],[2,-1]]
// prettier-ignore
const hillSubtilesMini = [[0,0],[1,0],[0,-1],[1,-1]]
// prettier-ignore
const hillNeighbors = [[-1,-2],[0,-2],[1,-2],[2,-2],[3,-2],[-1,-1],[3,-1],[-1,0],[3,0],[-1,1],[0,1],[1,1],[2,1],[3,1]]
// prettier-ignore
const hillNeighborsMini = [[-1,-2],[0,-2],[1,-2],[2,-2],[-1,-1],[2,-1],[-1,0],[2,0],[-1,1],[0,1],[1,1],[2,1]]
