import type { Board, Tile as LetterTile } from '$lib/data-model'
import Rand from 'rand-seed'
import { createPond } from './pond'
import { type XY, xyToGrid } from '../math'
import { createHill } from './hill'
import { createTrees } from './tree'

export type Feature = {
	id: number
	x: number
	y: number
	xJitter: number
	yJitter: number
	size: number
	delay: number
} & ({ type: 'hill' } | { type: 'tree' })

type LandscapeTile = {
	x: number
	y: number
	// TODO: "Heat" value that is increased by nearby features, used for weighting
	// Calculate landscape's "center of mass" and try to keep it centered
	centerWeight: number
	noHill?: boolean
	noPond?: boolean
	nearPonds?: number
	nearTrees?: number
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
	pondTiles: XY[]
	newPondTiles: XY[]
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
				landscape.tileMap.set(xyToGrid([x, y]), {
					x,
					y,
					centerWeight: getCenterWeight(landscape, x, y),
				})
			}
		}
		// landscape.openTiles.set(xyToGrid([landscape.centerX, landscape.centerY]), {
		// 	x: landscape.centerX,
		// 	y: landscape.centerY,
		// 	centerWeight: 1,
		// })
	}
	while (landscape.rowsGenerated < currentRow) {
		const rowTiles = board[landscape.rowsGenerated]
		const rowWord = rowToWord(rowTiles)
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

// Old todo: Use perlin noise with center bias, like D-Zone
// No, resolution is too low to make perlin worth it
export function getCenterWeight({ centerX, centerY }: Landscape, x: number, y: number) {
	const verticalCenter = 1 - Math.abs(y - centerY) / (centerY + 1)
	const horizontalCenter = 1 - Math.abs(x - centerX) / (centerX + 1)
	return verticalCenter * horizontalCenter
}

const getFeatureY = (feature: Feature) => feature.y + feature.yJitter

const rowToWord = (row: LetterTile[]) => row.map((t) => t.letter).join('')

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
