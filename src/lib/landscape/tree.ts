import { LANDSCAPE_FEATURE_DELAY, type Landscape } from '$lib/landscape/landscape'
import { randomElementWeighted, getNeighbors, xyToGrid, randomFloat } from '$lib/math'

export function createTrees(getRng: () => number, landscape: Landscape) {
	const { features, tileMap, width, height } = landscape
	const treeCount = landscape.mini ? 4 : 6
	for (let i = 0; i < treeCount; i++) {
		const openTiles = [...tileMap].filter(([, tile]) => !tile.feature && tile.y > 0)
		if (openTiles.length === 0) break
		const [grid, tile] = randomElementWeighted(
			openTiles,
			openTiles.map(
				([, { y, centerWeight, nearTrees }]) => centerWeight ** 2 * ((nearTrees || 0) + 1)
			),
			getRng
		)
		getNeighbors(tile.x, tile.y).forEach(([nx, ny]) => {
			if (nx < 0 || nx >= width || ny < 0 || ny >= height) return
			const nGrid = xyToGrid([nx, ny])
			const nTile = tileMap.get(nGrid)
			if (!nTile) return
			nTile.nearTrees = (nTile.nearTrees || 0) + 1
			// if (tileMap.has(nGrid)) return
			// const openTile = openTiles.get(nGrid)
			// if (openTile) {
			// 	openTile.nearTrees = (openTile.nearTrees || 0) + 1
			// } else {
			// 	openTiles.set(nGrid, {
			// 		x: nx,
			// 		y: ny,
			// 		centerWeight: getCenterWeight(landscape, nx, ny),
			// 		nearTrees: 1,
			// 	})
			// }
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
		landscape.totalDelay += LANDSCAPE_FEATURE_DELAY
		// tileMap.set(grid, feature)
	}
}
