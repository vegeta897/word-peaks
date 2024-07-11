import {
	getCenterWeight,
	LANDSCAPE_FEATURE_DELAY,
	type Landscape,
} from '$lib/landscape/landscape'
import {
	randomElementWeighted,
	getNeighbors,
	xyToGrid,
	getDistance,
	type XY,
} from '$lib/math'

export function createPond(getRng: () => number, landscape: Landscape) {
	const { openTiles } = landscape
	let generatedPond = false
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
		generatedPond = fillPond(startGrid, openTile.x, openTile.y, getRng, landscape)
	}
	if (generatedPond && landscape.pondDelay === undefined) {
		landscape.pondDelay = landscape.totalDelay
		landscape.totalDelay += LANDSCAPE_FEATURE_DELAY * (landscape.mini ? 6 : 4)
	}
}

function fillPond(
	startGrid: string,
	x: number,
	y: number,
	getRng: () => number,
	landscape: Landscape
) {
	const { width, height, tileMap, centerX, centerY } = landscape
	const newTiles: Map<string, XY> = new Map()
	const openPondTiles = new Map([[startGrid, { weight: 1, x, y }]])
	const pondSize = landscape.mini ? 4 : 6
	for (let i = 0; i < pondSize; i++) {
		if (openPondTiles.size === 0) {
			// Mark any open tiles attempted as invalid for ponds
			newTiles.forEach((xy) => {
				const openTile = landscape.openTiles.get(xyToGrid(xy))
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
		landscape.openTiles.delete(grid)
		newTiles.set(grid, [x, y])
		getNeighbors(x, y).forEach(([nx, ny]) => {
			if (nx < 0 || nx >= width || ny < 0 || ny >= height) return
			const nGrid = xyToGrid([nx, ny])
			if (newTiles.has(nGrid)) return
			if (tileMap.has(nGrid)) return
			const fromCenter = getDistance(nx - centerX, ny - centerY)
			let weight = fromCenter
			let openTile = landscape.openTiles.get(nGrid)
			if (openTile) {
				openTile.nearPonds = (openTile.nearPonds || 0) + 1
				weight *= 2.5 - Math.abs(2.5 - openTile.nearPonds)
			} else {
				openTile = {
					x: nx,
					y: ny,
					centerWeight: getCenterWeight(landscape, nx, ny),
					nearPonds: 1,
				}
				landscape.openTiles.set(nGrid, openTile)
			}
			openPondTiles.set(nGrid, { weight, x: nx, y: ny })
		})
	}
	newTiles.forEach((t) => tileMap.set(xyToGrid(t), 'pond'))
	landscape.pondTiles.push(...newTiles.values())
	landscape.newPondTiles.push(...newTiles.values())
	return true
}

type Dir = 0 | 1 | 2 | 3 // down | right | up | left
type Edge = [x1: number, y1: number, x2: number, y2: number, dir: Dir]
// prettier-ignore
const EDGES: Edge[] = [[0, 0, 0, 1, 0],[0, 1, 1, 1, 1],[1, 1, 1, 0, 2],[1, 0, 0, 0, 3]]
const nextDirOffets = [1, 3, 0]

export function createPondPath(
	tiles: XY[],
	scaleX = 1.5,
	scaleY = 1,
	offsetX = 0,
	offsetY = 0
) {
	const getPathSegment = ([x, y]: XY, [midX, midY]: XY, [prevMidX, prevMidY]: XY) => {
		const toX = midX * scaleX + offsetX
		const toY = midY * scaleY + offsetY
		if (prevMidX === midX || prevMidY === midY) return `L${toX} ${toY}`
		return `Q${x * scaleX + offsetX} ${y * scaleY + offsetY} ${toX} ${toY}`
	}
	const segmentMap: Map<string, string> = new Map()
	const startsMap: Map<string, string> = new Map()
	for (const [x, y] of tiles) {
		for (const [ex1, ey1, ex2, ey2, dir] of EDGES) {
			const sx1 = x + ex1
			const sy1 = y + ey1
			const sx2 = x + ex2
			const sy2 = y + ey2
			const startKey = `${sx1}:${sy1}:${dir}`
			const segmentKey = dir > 1 ? `${sx2}:${sy2}:${dir % 2}` : `${sx1}:${sy1}:${dir % 2}`
			const existingSegment = segmentMap.get(segmentKey)
			if (existingSegment) {
				segmentMap.delete(segmentKey)
				startsMap.delete(existingSegment)
			} else {
				segmentMap.set(segmentKey, startKey)
				startsMap.set(startKey, `${sx2}:${sy2}`)
			}
		}
	}
	let pathData = ''
	let newPath = true
	let prevMid: XY
	let first: XY
	let firstMid: XY
	let nextStartKey: string | undefined = undefined
	while (startsMap.size > 0) {
		const [startKey, toGrid] = nextStartKey
			? [nextStartKey, startsMap.get(nextStartKey)!]
			: [...startsMap][0]
		startsMap.delete(startKey)
		nextStartKey = undefined
		const [startX, startY, dir] = startKey.split(':').map((v) => +v)
		const [toX, toY] = toGrid.split(':').map((v) => +v)
		const midX = (startX + toX) / 2
		const midY = (startY + toY) / 2
		if (newPath) {
			first = [startX, startY]
			firstMid = [midX, midY]
			pathData += `M${midX * scaleX + offsetX} ${midY * scaleY + offsetY}`
		} else {
			pathData += getPathSegment([startX, startY], [midX, midY], prevMid!)
		}
		newPath = false
		prevMid = [midX, midY]
		for (const dirOffset of nextDirOffets) {
			const tryStartKey: string = `${toGrid}:${(dir + dirOffset) % 4}`
			if (startsMap.has(tryStartKey)) {
				nextStartKey = tryStartKey
				break
			}
		}
		if (!nextStartKey) {
			pathData += getPathSegment(first!, firstMid!, prevMid)
			pathData += 'Z'
			newPath = true
		}
	}
	return pathData
}
