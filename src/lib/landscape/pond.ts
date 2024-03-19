import type { Feature, Landscape, Pond } from '$lib/landscape'
import {
	randomElementWeighted,
	getNeighbors,
	xyToGrid,
	getDistance,
	type XY,
} from '$lib/math'

export function fillPond(
	startGrid: string,
	x: number,
	y: number,
	pondID: number,
	getRng: () => number,
	landscape: Landscape
) {
	const { openTiles, width, height, tileMap, centerX, centerY } = landscape
	const pondTiles: Map<string, XY> = new Map()
	const openPondTiles = new Map([[startGrid, { weight: 1, x, y }]])
	const mergeWithPonds: Set<Pond> = new Set()
	// console.log(grid)
	// openTiles.delete(grid)
	for (let i = 0; i < 6; i++) {
		if (openPondTiles.size === 0) return false
		const openGridsArray = [...openPondTiles]
		const openGridWeights = openGridsArray.map(([, { weight }]) => weight)
		const [grid, { x, y }] = randomElementWeighted(
			openGridsArray,
			openGridWeights,
			getRng
		)
		openPondTiles.delete(grid)
		openTiles.delete(grid)
		pondTiles.set(grid, [x, y])
		getNeighbors(x, y).forEach(([nx, ny]) => {
			if (nx < 0 || nx >= width || ny < 0 || ny >= height) return
			const nGrid = xyToGrid([nx, ny])
			if (pondTiles.has(nGrid)) return
			if (tileMap.has(nGrid)) {
				const neighborFeature = tileMap.get(nGrid)!
				if (neighborFeature.type === 'pond') mergeWithPonds.add(neighborFeature)
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
			openPondTiles.set(nGrid, { weight, x: nx, y: ny })
		})
	}
	const feature: Feature = { type: 'pond', tiles: [...pondTiles.values()], pondID }
	return { feature, pondTiles, mergeWithPonds }
}
