import {
	getTileBalance,
	LANDSCAPE_FEATURE_DELAY,
	getNewCenterOfMass,
	type Landscape,
} from '$lib/landscape/landscape'
import { randomElementWeighted, xyToGrid, randomFloat, getNeighbors8 } from '$lib/math'

export function createTrees(getRng: () => number, landscape: Landscape) {
	const { features, tileMap, width, height } = landscape
	const treeCount = landscape.mini ? 4 : 6
	for (let i = 0; i < treeCount; i++) {
		const openTiles = [...tileMap].filter(
			([, tile]) => !tile.feature && tile.connected && tile.y > 0
		)
		if (openTiles.length === 0) break
		const [, tile] = randomElementWeighted(
			openTiles,
			openTiles.map(
				([, { x, y, connected }]) => getTileBalance(x, y, 1, landscape) + connected
			),
			getRng
		)
		getNeighbors8(tile.x, tile.y).forEach(([nx, ny], n) => {
			if (nx < 0 || nx >= width || ny < 0 || ny >= height) return
			const nGrid = xyToGrid([nx, ny])
			const nTile = tileMap.get(nGrid)
			if (!nTile) return
			nTile.connected += n < 4 ? 1 : Math.max(nTile.connected, 0.5)
		})
		tile.feature = {
			type: 'tree',
			id: landscape.nextID++,
			x: tile.x,
			y: tile.y,
			xJitter: randomFloat(-0.4, 0.4, getRng),
			yJitter: randomFloat(-0.35, 0.25, getRng),
			size: getRng(),
			delay: landscape.totalDelay,
		}
		features.push(tile.feature)
		landscape.centerOfMass = getNewCenterOfMass(landscape, tile.x, tile.y, 1)
		landscape.totalDelay += LANDSCAPE_FEATURE_DELAY
	}
}
