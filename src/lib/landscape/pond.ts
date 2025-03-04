import { LANDSCAPE_FEATURE_DELAY, type Landscape } from '$lib/landscape/landscape'
import {
	randomElementWeighted,
	getNeighbors,
	xyToGrid,
	getDistance,
	type XY,
	neighbors,
	type Dir,
	randomFloat,
} from '$lib/math'
import { type PathDataCommand } from '$lib/paths'
import Rand from 'rand-seed'

export function createPond(getRng: () => number, landscape: Landscape) {
	const { tileMap } = landscape
	let generatedPond = false
	while (!generatedPond) {
		const openTiles = [...tileMap].filter(
			([, { feature, noPond }]) => !feature && !noPond
		)
		if (openTiles.length === 0) break
		const [startGrid, openTile] = randomElementWeighted(
			openTiles,
			openTiles.map(
				([, { centerWeight, nearPonds }]) => centerWeight ** 2 / ((nearPonds || 0) + 1)
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
				const openTile = tileMap.get(xyToGrid(xy))
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
		newTiles.set(grid, [x, y])
		getNeighbors(x, y).forEach(([nx, ny]) => {
			if (nx < 0 || nx >= width || ny < 0 || ny >= height) return
			const nGrid = xyToGrid([nx, ny])
			const nTile = tileMap.get(nGrid)
			if (!nTile) return
			if (nTile.feature) return
			if (newTiles.has(nGrid)) return
			const fromCenter = getDistance(nx - centerX, ny - centerY)
			let weight = fromCenter
			nTile.nearPonds = (nTile.nearPonds || 0) + 1
			weight *= 2.5 - Math.abs(2.5 - nTile.nearPonds)
			openPondTiles.set(nGrid, { weight, x: nx, y: ny })
		})
	}
	newTiles.forEach((t) => (tileMap.get(xyToGrid(t))!.feature = 'pond'))
	landscape.pondTiles.push(...newTiles.values())
	landscape.newPondTiles.push(...newTiles.values())
	return true
}

type Edge = [x1: number, y1: number, x2: number, y2: number, dir: Dir]
// prettier-ignore
const EDGES: Edge[] = [[0, 0, 0, 1, 0],[0, 1, 1, 1, 1],[1, 1, 1, 0, 2],[1, 0, 0, 0, 3]]
const nextDirOffets = [1, 3, 0]

const getPathSegment = (
	corner: XY,
	mid: XY,
	[prevMidX, prevMidY]: XY
): PathDataCommand => {
	if (prevMidX === mid[0] || prevMidY === mid[1]) return ['L', mid]
	return ['Q', corner, mid]
}

function getSegmentMaps(tiles: XY[]) {
	const segmentMap: Map<string, string> = new Map()
	const directionalSegmentMap: Map<string, string> = new Map()
	for (const [x, y] of tiles) {
		for (const [ex1, ey1, ex2, ey2, dir] of EDGES) {
			const sx1 = x + ex1
			const sy1 = y + ey1
			const sx2 = x + ex2
			const sy2 = y + ey2
			const directionalKey = `${sx1}:${sy1}:${dir}`
			const segmentKey = `${(sx1 + sx2) / 2}:${(sy1 + sy2) / 2}`
			const existingSegment = segmentMap.get(segmentKey)
			if (existingSegment) {
				segmentMap.delete(segmentKey)
				directionalSegmentMap.delete(existingSegment)
			} else {
				segmentMap.set(segmentKey, directionalKey)
				directionalSegmentMap.set(directionalKey, `${sx2}:${sy2}`)
			}
		}
	}
	return { segmentMap, directionalSegmentMap }
}

function findNextSegmentKey(
	dir: number,
	toX: number,
	toY: number,
	{ segmentMap, directionalSegmentMap }: ReturnType<typeof getSegmentMaps>
) {
	for (const dirOffset of nextDirOffets) {
		const nextDir = (dir + dirOffset) % 4
		const trySegmentKey: string = `${toX}:${toY}:${nextDir}`
		// Avoid connecting isolated diagonals
		const isolatingDirXY = neighbors[(nextDir + 2) % 4]
		const isolatingSegmentKey = `${toX + isolatingDirXY[0] / 2}:${
			toY + isolatingDirXY[1] / 2
		}`
		if (
			directionalSegmentMap.has(trySegmentKey) &&
			(dirOffset !== 3 || !segmentMap.has(isolatingSegmentKey))
		) {
			return trySegmentKey
		}
	}
}

export function createPondPath(tiles: XY[]): PathDataCommand[] {
	const { segmentMap, directionalSegmentMap } = getSegmentMaps(tiles)
	const pathData: PathDataCommand[] = []
	let newPath = true
	let prevMid: XY
	let first: XY
	let firstMid: XY
	let nextSegmentKey: string | undefined = undefined
	while (directionalSegmentMap.size > 0) {
		const [segmentKey, toGrid] = nextSegmentKey
			? [nextSegmentKey, directionalSegmentMap.get(nextSegmentKey)!]
			: [...directionalSegmentMap][0]
		directionalSegmentMap.delete(segmentKey)
		const [fromX, fromY, dir] = segmentKey.split(':').map((v) => +v)
		const [toX, toY] = toGrid.split(':').map((v) => +v)
		const midXY: XY = [(fromX + toX) / 2, (fromY + toY) / 2]
		if (newPath) {
			newPath = false
			first = [fromX, fromY]
			firstMid = midXY
			pathData.push(['M', midXY])
		} else {
			pathData.push(getPathSegment([fromX, fromY], midXY, prevMid!))
		}
		prevMid = midXY
		nextSegmentKey = findNextSegmentKey(dir, toX, toY, {
			segmentMap,
			directionalSegmentMap,
		})
		if (!nextSegmentKey) {
			pathData.push(getPathSegment(first!, firstMid!, prevMid))
			pathData.push(['Z'])
			newPath = true
		}
	}
	return pathData
}

const drawShelf = (from: XY, to: XY): PathDataCommand[] => [
	['M', from],
	['L', to],
	['L', [to[0], to[1] + 0.35]],
	['L', [from[0], from[1] + 0.35]],
	['Z'],
]

export function createFrozenPondPaths(iceTiles: XY[], emptyTiles: XY[], answer: string) {
	const { segmentMap, directionalSegmentMap } = getSegmentMaps(iceTiles)
	const { segmentMap: emptySegmentMap } = getSegmentMaps(emptyTiles)
	const isJagged = (...xy: XY[]) => xy.some(([x, y]) => emptySegmentMap.has(x + ':' + y))
	const mainPath: PathDataCommand[] = []
	const shelfPaths: PathDataCommand[][] = []
	const drawNextSegment = (corner: XY, mid: XY, prev: XY) => {
		if (isJagged(mid, prev)) {
			const halfX = ((prev[0] + mid[0]) / 2 + corner[0]) / 2
			const halfY = ((prev[1] + mid[1]) / 2 + corner[1]) / 2
			const rng = new Rand(answer + halfX + ':' + halfY)
			const getRng = () => rng.next()
			const xVariance = prev[0] === mid[0] ? 0.2 : 0.1
			const yVariance = prev[1] === mid[1] ? 0.2 : 0.1
			const jagged: XY = [
				halfX + randomFloat(-xVariance, xVariance, getRng),
				halfY + randomFloat(-yVariance, yVariance, getRng),
			]
			mainPath.push(['L', jagged])
			mainPath.push(['L', mid])
			if (jagged[0] > prev[0]) shelfPaths.push(drawShelf(prev, jagged))
			if (mid[0] > jagged[0]) shelfPaths.push(drawShelf(jagged, mid))
		} else {
			mainPath.push(getPathSegment(corner, mid, prev))
		}
	}
	let newPath = true
	let prevMid: XY
	let first: XY
	let firstMid: XY
	let nextSegmentKey: string | undefined = undefined
	while (directionalSegmentMap.size > 0) {
		const [segmentKey, toGrid] = nextSegmentKey
			? [nextSegmentKey, directionalSegmentMap.get(nextSegmentKey)!]
			: [...directionalSegmentMap][0]
		directionalSegmentMap.delete(segmentKey)
		const [fromX, fromY, dir] = segmentKey.split(':').map((v) => +v)
		const [toX, toY] = toGrid.split(':').map((v) => +v)
		const midXY: XY = [(fromX + toX) / 2, (fromY + toY) / 2]
		if (newPath) {
			newPath = false
			first = [fromX, fromY]
			firstMid = midXY
			mainPath.push(['M', midXY])
		} else {
			drawNextSegment([fromX, fromY], midXY, prevMid!)
		}
		prevMid = midXY
		nextSegmentKey = findNextSegmentKey(dir, toX, toY, {
			segmentMap,
			directionalSegmentMap,
		})
		if (!nextSegmentKey) {
			drawNextSegment(first!, firstMid!, prevMid)
			mainPath.push(['Z'])
			newPath = true
		}
	}
	return { mainPath, shelfPaths }
}
