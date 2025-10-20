import { get, type Writable, writable } from 'svelte/store'
import type { Landscape } from './landscape'
import { getNeighbors, type XY, xyToGrid } from '$lib/math'
import Rand from 'rand-seed'

// TODO: Change sop to chill, or ice
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

type TreeFunState = { state: 'init' | 'burst' | 'plucked'; snowy: boolean }
type HillFunState = { state: 'init' | 'popped'; snowy: boolean; ivy: number[] }
type PondFunState = {
	state: 'init' | 'frozen' | 'broken'
	lily: boolean
	gemmed: boolean
}

export type FunState = {
	features: { tree: TreeFunState[]; hill: HillFunState[] } // Indexed by feature ID
	featureMap: Map<string, ['tree' | 'hill', [id: number, subTile: number]]> // Maps grid to feature type & ID
	pondTiles: Map<string, PondFunState> // Keyed by grid
}

type StoreProps<Type> = {
	[Property in keyof Type]: Writable<Type[Property]> // Cool!
}

export const funState: StoreProps<FunState> = {
	features: writable({ tree: [], hill: [] }),
	featureMap: writable(new Map()),
	pondTiles: writable(new Map()),
}

// TODO: Crawl for neighbors during init to calculate max possible frost, gem, etc
export function initFunState(landscape: Landscape, answer: string) {
	// const rng = new Rand(answer)
	// const getRng = () => rng.next()
	const features: FunState['features'] = { tree: [], hill: [] }
	const featureMap: FunState['featureMap'] = new Map()
	const pondTiles: FunState['pondTiles'] = new Map()
	for (const row of landscape.featureRows) {
		for (const { id, type } of row.features) {
			if (type === 'hill') {
				features.hill[id] = { state: 'init', snowy: false, ivy: [0, 0, 0, 0, 0, 0] }
			} else {
				features.tree[id] = { state: 'init', snowy: false }
			}
		}
	}
	for (const [grid, tile] of landscape.tileMap) {
		if (tile.feature && tile.feature.type !== 'pond') {
			featureMap.set(grid, [tile.feature.type, [tile.feature.id, tile.hillSubTile || 0]])
		}
	}
	for (const pondTile of landscape.pondTiles) {
		pondTiles.set(xyToGrid(pondTile), {
			state: 'init',
			lily: false,
			gemmed: false,
		})
	}
	funState.features.set(features)
	funState.featureMap.set(featureMap)
	funState.pondTiles.set(pondTiles)
}

export function updateTreeFun(id: number, xy: XY, updates: Partial<TreeFunState>) {
	const features = get(funState.features)
	const featureMap = get(funState.featureMap)
	const pondTiles = get(funState.pondTiles)
	features.tree[id] = { ...features.tree[id], ...updates }
	if (updates.state === 'burst') {
		let updatePondTiles = false
		getNeighbors(...xy).forEach((nXY) => {
			const neighborGrid = xyToGrid(nXY)
			const featureTile = featureMap.get(neighborGrid)
			if (featureTile) {
				if (featureTile[0] !== 'hill') return
				const featureStatus = features[featureTile[0]][featureTile[1][0]]
				if (featureStatus.state === 'init') {
					featureStatus.ivy[featureTile[1][1]] = 1
				}
			} else {
				const pondTile = pondTiles.get(neighborGrid)
				if (pondTile?.state === 'init') {
					pondTile.lily = true
					updatePondTiles = true
				}
			}
		})
		if (updatePondTiles) funState.pondTiles.set(pondTiles)
	}
	funState.features.set(features)
}

export function updateHillFun(id: number, xy: XY, updates: Partial<HillFunState>) {
	const features = get(funState.features)
	features.hill[id] = { ...features.hill[id], ...updates }
	if (updates.state === 'popped') {
		// TODO: Gem ponds
	}
	funState.features.set(features)
}

export function updatePondFun(grid: string, xy: XY, updates: Partial<PondFunState>) {
	const features = get(funState.features)
	const featureMap = get(funState.featureMap)
	const pondTiles = get(funState.pondTiles)
	const tileState = pondTiles.get(grid)!
	pondTiles.set(grid, { ...tileState, ...updates })
	if (updates.state === 'frozen') {
		let updateFeatures = false
		getNeighbors(...xy).forEach((nXY) => {
			const neighborGrid = xyToGrid(nXY)
			const feature = featureMap.get(neighborGrid)
			if (feature === undefined) return
			const featureStatus = features[feature[0]][feature[1][0]]
			if (featureStatus.state === 'init') {
				featureStatus.snowy = true
				updateFeatures = true
			}
		})
		if (updateFeatures) funState.features.set(features)
	}
	funState.pondTiles.set(pondTiles)
}

export function clearFunState() {
	funState.features.set({ tree: [], hill: [] })
	funState.featureMap.set(new Map())
	funState.pondTiles.set(new Map())
}
