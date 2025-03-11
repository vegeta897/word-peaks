import type { Board, Tile as LetterTile } from '$lib/data-model'
import Rand from 'rand-seed'
import { createPond } from './pond'
import { type XY, xyToGrid } from '../math'
import { createHill } from './hill'
import { createTrees } from './tree'

export type Feature = {
	type: 'hill' | 'tree' | 'pond-row'
	id: number
	x: number
	y: number
	xJitter: number
	yJitter: number
	size: number
	delay: number
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
}

export const LANDSCAPE_FEATURE_DELAY = 30

export function getLandscape(
	landscape: Landscape,
	board: Board,
	answer: string,
	currentRow: number
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
		// const rowWord = rowToWord(rowTiles)
		const seed = answer + board.slice(0, landscape.rowsGenerated).map(rowToWord).join('')
		const rng = new Rand(seed)
		const getRng = () => rng.next()
		for (const tile of rowTiles) {
			if (tile.polarity === 0) {
				createTrees(getRng, landscape)
			} else if (tile.polarity < 0) {
				createHill(getRng, landscape)
			} else {
				createPond(getRng, landscape)
			}
		}
		landscape.rowsGenerated++
	}
	// Sort features by Y for proper overlapping
	landscape.features.sort((a, b) => getFeatureY(a) - getFeatureY(b))
	return { ...landscape }
}

function getCenterWeight({ centerX, centerY }: Landscape, x: number, y: number) {
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

const getFeatureY = (feature: Feature) =>
	feature.y + feature.yJitter + (feature.type === 'hill' ? 0.5 : 0)

const rowToWord = (row: LetterTile[]) => row.map((t) => t.letter).join('')

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
}

// TODO: Change sop to chill, or ice
// Change pop to burst? All 5 letter words?
export const landscapeFunModes = ['pop', 'sop', 'pluck'] as const
export type LandscapeFunMode = typeof landscapeFunModes[number]

export type FunStats = {
	totalGems: 0
	activeDayNumber: 0
	activeDayGems: 0
	counts: Record<LandscapeFunMode, number>
}

export function newFunStats(): FunStats {
	return {
		totalGems: 0,
		activeDayNumber: 0,
		activeDayGems: 0,
		counts: { pluck: 0, pop: 0, sop: 0 },
	}
}
