import type { Board, Tile as LetterTile } from '$lib/data-model'
import Rand from 'rand-seed'
import { createPond } from './pond'
import { randomElement, type XY, xyToGrid } from '../math'
import { createHill } from './hill'
import { createTrees } from './tree'

export type Feature = {
	type: 'hill' | 'tree' | 'pond-row' | 'gem'
	id: number
	x: number
	y: number
	xJitter?: number
	yJitter?: number
	size?: number
	delay?: number
}

type LandscapeTile = {
	x: number
	y: number
	connected: 0 | 0.5 | 1
	noHill?: boolean
	noPond?: boolean
	feature?: Feature | 'pond'
}

export type Landscape = {
	width: number
	height: number
	centerX: number
	centerY: number
	rowsGenerated: number
	features: Feature[]
	tileMap: Map<string, LandscapeTile>
	centerOfMass: { center: XY; totalMass: number }
	pondTiles: XY[]
	newPondTiles: XY[]
	pondRows: Set<number>
	nextID: number
	pondDelay?: number
	totalDelay: number
	mini?: boolean
	fun: {
		resultDelay?: number
		gem?: { status: 'hidden' | 'found' | 'collected'; xy: XY }
	}
}

export const initLandscape = (): Landscape => ({
	width: 0,
	height: 0,
	centerX: 0,
	centerY: 0,
	rowsGenerated: 0,
	features: [],
	tileMap: new Map(),
	centerOfMass: { center: [0, 0], totalMass: 0 },
	pondTiles: [],
	newPondTiles: [],
	pondRows: new Set(),
	nextID: 1,
	totalDelay: 0,
	fun: {},
})

export function clearLandscape(landscape: Landscape) {
	landscape.rowsGenerated = 0
	landscape.tileMap.clear()
	landscape.features.length = 0
	landscape.centerOfMass = { center: [0, 0], totalMass: 0 }
	landscape.pondTiles.length = 0
	landscape.newPondTiles.length = 0
	landscape.pondRows.clear()
	landscape.nextID = 1
	landscape.pondDelay = undefined
	landscape.fun = {}
}

export const LANDSCAPE_FEATURE_DELAY = 30

export function getLandscape(
	landscape: Landscape,
	board: Board,
	answer: string,
	currentRow: number,
	gameFinished: boolean
): Landscape {
	// No initial delay if loading a partially/fully completed puzzle
	landscape.totalDelay = currentRow > 1 && landscape.rowsGenerated === 0 ? 0 : 500
	landscape.newPondTiles.length = 0
	if (landscape.rowsGenerated === 0 && currentRow > landscape.rowsGenerated) {
		for (let x = 0; x < landscape.width; x++) {
			for (let y = 0; y < landscape.height; y++) {
				const nearCenter =
					Math.abs(x - landscape.centerX) <= 1 && Math.abs(y - landscape.centerY) <= 1
				landscape.tileMap.set(xyToGrid([x, y]), {
					x,
					y,
					connected: nearCenter ? 1 : 0,
				})
			}
		}
	}
	while (landscape.rowsGenerated < currentRow) {
		const rowTiles = board[landscape.rowsGenerated]
		const rowWord = rowToWord(rowTiles)
		const winningRow = rowWord === answer
		const seed = answer + board.slice(0, landscape.rowsGenerated).map(rowToWord).join('')
		const rng = new Rand(seed)
		const getRng = () => rng.next()
		for (const tile of rowTiles) {
			if (tile.polarity === 0) {
				createTrees(getRng, landscape, winningRow)
			} else if (tile.polarity < 0) {
				createHill(getRng, landscape)
			} else {
				createPond(getRng, landscape)
			}
		}
		landscape.rowsGenerated++
	}
	if (gameFinished) {
		// TODO: Spawn hidden gem in random featured tile (use tileMap)
		const seed = answer + board.map(rowToWord).join('')
		const rng = new Rand(seed)
		const gemTile = randomElement(
			[...landscape.tileMap.values()].filter((t) => t.feature),
			() => rng.next()
		)
		console.log('spawned hidden gem at', gemTile.x, gemTile.y)
	}
	sortFeatures(landscape)
	return { ...landscape }
}

export function getCenterWeight({ centerX, centerY }: Landscape, x: number, y: number) {
	const verticalCenter = 1 - Math.abs(y - centerY) / (centerY + 1)
	const horizontalCenter = 1 - Math.abs(x - centerX) / (centerX + 1)
	return (verticalCenter * horizontalCenter) ** 3
}

export function getTileBalance(
	x: number,
	y: number,
	weight: number,
	landscape: Landscape
) {
	const {
		center: [newCenterX, newCenterY],
	} = getNewCenterOfMass(landscape, x, y, weight)
	return getCenterWeight(landscape, newCenterX, newCenterY)
}

export function getNewCenterOfMass(
	landscape: Landscape,
	x: number,
	y: number,
	weight: number
): Landscape['centerOfMass'] {
	const newTotalMass = landscape.centerOfMass.totalMass + weight
	const newCenterX =
		(landscape.centerOfMass.totalMass * landscape.centerOfMass.center[0] + x * weight) /
		newTotalMass
	const newCenterY =
		(landscape.centerOfMass.totalMass * landscape.centerOfMass.center[1] + y * weight) /
		newTotalMass
	return { center: [newCenterX, newCenterY], totalMass: newTotalMass }
}

// Sort features by Y for proper overlapping
export const sortFeatures = (landscape: Landscape) => {
	landscape.features.sort((a, b) => getFeatureY(a) - getFeatureY(b))
}

const getFeatureY = (feature: Feature) =>
	feature.y + (feature.yJitter || 0) + (feature.type === 'hill' ? 0.5 : 0)

const rowToWord = (row: LetterTile[]) => row.map((t) => t.letter).join('')
