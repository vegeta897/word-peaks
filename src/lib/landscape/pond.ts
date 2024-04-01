import { getCenterWeight, type Landscape } from '$lib/landscape'
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
	getRng: () => number,
	landscape: Landscape
) {
	const { openTiles, pondTiles, newPondTiles, width, height, tileMap, centerX, centerY } =
		landscape
	const newTiles: Map<string, XY> = new Map()
	const openPondTiles = new Map([[startGrid, { weight: 1, x, y }]])
	for (let i = 0; i < 6; i++) {
		if (openPondTiles.size === 0) {
			// Mark any open tiles attempted as invalid for ponds
			newTiles.forEach((xy) => {
				const openTile = openTiles.get(xyToGrid(xy))
				if (openTile) openTile.noPond = true
			})
			return false
		}
		const openGridsArray = [...openPondTiles]
		const openGridWeights = openGridsArray.map(([, { weight }]) => weight)
		const [grid, { x, y }] = randomElementWeighted(
			openGridsArray,
			openGridWeights,
			getRng
		)
		openPondTiles.delete(grid)
		openTiles.delete(grid)
		newTiles.set(grid, [x, y])
		getNeighbors(x, y).forEach(([nx, ny]) => {
			if (nx < 0 || nx >= width || ny < 0 || ny >= height) return
			const nGrid = xyToGrid([nx, ny])
			if (newTiles.has(nGrid)) return
			if (tileMap.has(nGrid)) return
			const fromCenter = getDistance(nx - centerX, ny - centerY)
			let weight = fromCenter
			let openTile = openTiles.get(nGrid)
			if (openTile) {
				openTile.nearPonds = (openTile.nearPonds || 0) + 1
				weight *= openTile.nearPonds
			} else {
				openTile = {
					x: nx,
					y: ny,
					centerWeight: getCenterWeight(landscape, nx, ny),
					nearPonds: 1,
				}
				openTiles.set(nGrid, openTile)
			}
			openPondTiles.set(nGrid, { weight, x: nx, y: ny })
		})
	}
	newTiles.forEach((t) => tileMap.set(xyToGrid(t), 'pond'))
	pondTiles.push(...newTiles.values())
	newPondTiles.push(...newTiles.values())
	return true
}
