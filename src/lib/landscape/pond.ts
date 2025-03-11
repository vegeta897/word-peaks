import {
	getNewCenterOfMass,
	getTileBalance,
	LANDSCAPE_FEATURE_DELAY,
	type Landscape,
} from '$lib/landscape/landscape'
import {
	randomElementWeighted,
	xyToGrid,
	type XY,
	type Dir,
	getNeighbors8,
} from '$lib/math'
import { type PathDataCommand } from '$lib/paths'

export function createPond(getRng: () => number, landscape: Landscape) {
	const { tileMap } = landscape
	let generatedPond = false
	while (!generatedPond) {
		const openTiles = [...tileMap].filter(
			([, tile]) => !tile.feature && tile.connected && !tile.noPond
		)
		if (openTiles.length === 0) break
		const [startGrid, openTile] = randomElementWeighted(
			openTiles,
			openTiles.map(
				([, { x, y, connected }]) => getTileBalance(x, y, 6, landscape) + connected
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
	let minX = x,
		maxX = x,
		minY = y,
		maxY = y
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
		minX = Math.min(minX, x)
		maxX = Math.max(maxX, x)
		minY = Math.min(minY, y)
		maxY = Math.max(maxY, y)
		getNeighbors8(x, y).forEach(([nx, ny], n) => {
			if (nx < 0 || nx >= width || ny < 0 || ny >= height) return
			const nGrid = xyToGrid([nx, ny])
			const nTile = tileMap.get(nGrid)
			if (!nTile || nTile.feature) return
			if (newTiles.has(nGrid)) return
			let weight = getTileBalance(nx, ny, 1, landscape)
			// Bias against expanding the pond's bounding box
			if (nx < minX || nx > maxX) weight /= 2
			if (ny < minY || ny > maxY) weight /= 2
			openPondTiles.set(nGrid, {
				weight: weight + (openPondTiles.get(nGrid)?.weight || 0),
				x: nx,
				y: ny,
			})
		})
	}
	let pondWeight = 0
	const pondCenterOfMass: XY = [0, 0]
	newTiles.forEach((xy) => {
		landscape.pondTiles.push(xy)
		landscape.newPondTiles.push(xy)
		tileMap.get(xyToGrid(xy))!.feature = 'pond'
		pondCenterOfMass[0] = (pondCenterOfMass[0] * pondWeight + xy[0]) / (pondWeight + 1)
		pondCenterOfMass[1] = (pondCenterOfMass[1] * pondWeight + xy[1]) / (pondWeight + 1)
		pondWeight++
		getNeighbors8(...xy).forEach(([nx, ny], n) => {
			if (nx < 0 || nx >= width || ny < 0 || ny >= height) return
			const nGrid = xyToGrid([nx, ny])
			const nTile = tileMap.get(nGrid)
			if (!nTile) return
			nTile.connected += n < 4 ? 1 : Math.max(nTile.connected, 0.5)
		})
		if (!landscape.pondRows.has(xy[1])) {
			landscape.pondRows.add(xy[1])
			landscape.features.push({
				type: 'pond-row',
				id: landscape.nextID++,
				x: 0,
				y: xy[1],
				xJitter: 0,
				yJitter: 0,
				size: 0,
				delay: 0,
			})
		}
	})
	landscape.centerOfMass = getNewCenterOfMass(landscape, ...pondCenterOfMass, pondWeight)
	return true
}

type Edge = [x1: number, y1: number, x2: number, y2: number, dir: Dir]
// prettier-ignore
const EDGES: Edge[] = [[0, 0, 0, 1, 0],[0, 1, 1, 1, 1],[1, 1, 1, 0, 2],[1, 0, 0, 0, 3]]
const nextDirOffets = [3, 1, 0]

const getPondPathSegment = (
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
	directionalSegmentMap: Map<string, string>
) {
	for (const dirOffset of nextDirOffets) {
		const nextDir = (dir + dirOffset) % 4
		const trySegmentKey: string = `${toX}:${toY}:${nextDir}`
		if (directionalSegmentMap.has(trySegmentKey)) return trySegmentKey
	}
}

export function createPondPath(tiles: XY[]): PathDataCommand[] {
	const { directionalSegmentMap } = getSegmentMaps(tiles)
	const pathData: PathDataCommand[] = []
	let newPath = true
	let prevMid: XY
	let first: XY
	let firstMid: XY
	let nextSegmentKey: string | undefined = undefined
	const openDirSegments = new Map(directionalSegmentMap)
	while (openDirSegments.size > 0 && pathData.length < 1000) {
		const [segmentKey, toGrid] = nextSegmentKey
			? [nextSegmentKey, openDirSegments.get(nextSegmentKey)!]
			: [...openDirSegments][0]
		openDirSegments.delete(segmentKey)
		const [fromX, fromY, dir] = segmentKey.split(':').map((v) => +v)
		const [toX, toY] = toGrid.split(':').map((v) => +v)
		const midXY: XY = [(fromX + toX) / 2, (fromY + toY) / 2]
		if (newPath) {
			newPath = false
			first = [fromX, fromY]
			firstMid = midXY
			pathData.push(['M', midXY])
		} else {
			pathData.push(getPondPathSegment([fromX, fromY], midXY, prevMid!))
		}
		prevMid = midXY
		nextSegmentKey = findNextSegmentKey(dir, toX, toY, directionalSegmentMap)
		if (!nextSegmentKey || !openDirSegments.has(nextSegmentKey)) {
			nextSegmentKey = undefined
			pathData.push(getPondPathSegment(first!, firstMid!, prevMid))
			pathData.push(['Z'])
			newPath = true
		}
	}
	return pathData
}

export function createSubTilePath(subTiles: XY[], subPointMap: Map<string, XY>) {
	const { directionalSegmentMap } = getSegmentMaps(subTiles)
	const mainPath: PathDataCommand[] = []
	const shelfPath: PathDataCommand[] = []
	let newPath = true
	let nextSegmentKey: string | undefined = undefined
	const openDirSegments = new Map(directionalSegmentMap)
	while (openDirSegments.size > 0) {
		const [segmentKey, toGrid] = nextSegmentKey
			? [nextSegmentKey, openDirSegments.get(nextSegmentKey)!]
			: [...openDirSegments][0]
		openDirSegments.delete(segmentKey)
		const [fromX, fromY, dir] = segmentKey.split(':').map((v) => +v)
		const drawFromXY = subPointMap.get(xyToGrid([fromX, fromY]))!
		if (newPath) {
			newPath = false
			mainPath.push(['M', drawFromXY])
		}
		const toXY = toGrid.split(':').map((v) => +v) as XY
		const drawToXY = subPointMap.get(xyToGrid(toXY))!
		mainPath.push(['L', drawToXY])
		if (drawToXY[0] > drawFromXY[0]) shelfPath.push(...drawShelf(drawFromXY, drawToXY))
		nextSegmentKey = findNextSegmentKey(dir, toXY[0], toXY[1], directionalSegmentMap)
		if (!nextSegmentKey || !openDirSegments.has(nextSegmentKey)) {
			nextSegmentKey = undefined
			mainPath.push(['Z'])
			newPath = true
		}
	}
	return { mainPath, shelfPath }
}

const drawShelf = (from: XY, to: XY): PathDataCommand[] => [
	['M', from],
	['L', to],
	['L', [to[0], to[1] + 0.35]],
	['L', [from[0], from[1] + 0.35]],
	['Z'],
]
