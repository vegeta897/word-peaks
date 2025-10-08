// TODO: Change sop to chill, or ice
// Change pop to burst? All 5 letter words? No, won't translate to other languages
export const landscapeFunModes = ['pop', 'sop', 'pluck'] as const
export type LandscapeFunMode = typeof landscapeFunModes[number]

export type FunStats = {
	totalGems: number
	activeDayNumber: number
	lastDayCollected: number
	counts: Record<LandscapeFunMode, number>
	cleaned: number
}

export function newFunStats(): FunStats {
	return {
		totalGems: 0,
		activeDayNumber: 0,
		lastDayCollected: 0,
		counts: { pluck: 0, pop: 0, sop: 0 },
		cleaned: 0,
	}
}

export type Interaction = {
	gestureId: number
	touch: boolean
	dragging: boolean
	pointerUp: boolean
}
