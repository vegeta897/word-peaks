import {
	LANDSCAPE_FEATURE_DELAY,
	getCenterWeight,
	type Landscape,
	type Feature,
} from '$lib/landscape'
import { randomElementWeighted, getNeighbors, xyToGrid, randomFloat } from '$lib/math'

export function createTrees(
	getRng: () => number,
	landscape: Landscape,
	winningRow: boolean
) {
	const { features, tileMap, openTiles, width, height } = landscape
	const treeCount = landscape.mini ? 4 : 6
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
					centerWeight: getCenterWeight(landscape, nx, ny),
					nearTrees: 1,
				})
			}
		})
		const feature: Feature = {
			type: 'tree',
			id: landscape.nextID++,
			x,
			y,
			xJitter: randomFloat(-0.35, 0.35, getRng),
			yJitter: randomFloat(-0.22, 0.22, getRng),
			size: getRng(),
			delay: landscape.totalDelay,
		}
		features.push(feature)
		landscape.totalDelay += LANDSCAPE_FEATURE_DELAY
		tileMap.set(grid, feature)
	}
}
