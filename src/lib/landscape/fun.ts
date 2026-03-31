import { get, type Writable, writable } from 'svelte/store'
import type { Landscape } from './landscape'
import { getNeighbors, type XY, xyToGrid } from '$lib/math'
import Rand from 'rand-seed'
import { hillNeighborsFun } from './hill'
import { createFunPlan } from './fun-plan'

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

type TreeFunState = {
	state: 'init' | 'burst' | 'plucked'
	snowy: boolean
	crystalized: boolean
}
type HillFunState = { state: 'init' | 'popped'; snowy: boolean; ivy: number }
type PondFunState = {
	state: 'init' | 'frozen' | 'broken'
	lily: boolean
	crystalized: boolean
}
export type FunTaskType =
	| 'tree-pluck'
	| 'ice-break'
	| 'hill-pop'
	| 'lily-grow'
	| 'ivy-grow'
	| 'tree-snow'
	| 'hill-snow'
	| 'tree-crystalize'
	| 'lily-crystalize'
	| 'tree-crystalize-snow'
type FunTask = { id: number; type: FunTaskType }

export type FunState = {
	features: { tree: TreeFunState[]; hill: HillFunState[] } // Indexed by feature ID
	featureMap: Map<string, ['tree' | 'hill', [id: number, subTile: number]]> // Maps grid to feature type & ID
	pondTiles: Map<string, PondFunState> // Keyed by grid
	tasks: FunTask[]
}

type StoreProps<Type> = {
	[Property in keyof Type]: Writable<Type[Property]> // Cool!
}

// TODO: Don't use reactivity to update fun state in features
// Expose methods on the components for explicit fun updating
// Why? Because the reactivity is messy and re-triggers unnecessarily

export const funState: StoreProps<FunState> = {
	features: writable({ tree: [], hill: [] }),
	featureMap: writable(new Map()),
	pondTiles: writable(new Map()),
	tasks: writable([]),
}

export function initFunState(landscape: Landscape, answer: string) {
	// const rng = new Rand(answer)
	// const getRng = () => rng.next()
	const funPlan = createFunPlan(landscape)
	const features: FunState['features'] = { tree: [], hill: [] }
	const featureMap: FunState['featureMap'] = new Map()
	const pondTiles: FunState['pondTiles'] = new Map()
	for (const row of landscape.featureRows) {
		for (const { id, type } of row.features) {
			if (type === 'hill') {
				features.hill[id] = { state: 'init', snowy: false, ivy: 0 }
			} else {
				features.tree[id] = { state: 'init', snowy: false, crystalized: false }
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
			crystalized: false,
		})
	}
	funState.features.set(features)
	funState.featureMap.set(featureMap)
	funState.pondTiles.set(pondTiles)
	funState.tasks.set(
		[
			'lily-grow',
			'ivy-grow',
			'tree-pluck',
			'hill-pop',
			'tree-crystalize',
			'lily-crystalize',
			'tree-pluck',
			'ice-break',
			'tree-pluck',
			'ice-break',
			'ice-break',
			'tree-pluck',
			'tree-pluck',
			'tree-pluck',
		].map((type, id) => ({ id, type } as FunTask))
	)
}

export function updateTreeFun(id: number, xy: XY, updates: Partial<TreeFunState>) {
	const features = get(funState.features)
	const featureMap = get(funState.featureMap)
	const pondTiles = get(funState.pondTiles)
	features.tree[id] = { ...features.tree[id], ...updates }
	if (updates.state === 'burst' && !features.tree[id].crystalized) {
		let updatePondTiles = false
		getNeighbors(...xy).forEach((nXY) => {
			const neighborGrid = xyToGrid(nXY)
			const featureTile = featureMap.get(neighborGrid)
			if (featureTile) {
				const [featureType, [featureId, subTile]] = featureTile
				if (featureType !== 'hill') return
				if (subTile > 2) return // Can't grow ivy on back side of hill
				const featureStatus = features[featureType][featureId]
				if (featureStatus.state === 'init') {
					const subTileBit = 1 << subTile
					if ((featureStatus.ivy & subTileBit) === 0) {
						featureStatus.ivy |= subTileBit
						tryTask('ivy-grow')
					}
				}
			} else {
				const pondTile = pondTiles.get(neighborGrid)
				if (pondTile?.state === 'init' && pondTile.lily === false) {
					pondTile.lily = true
					updatePondTiles = true
					tryTask('lily-grow')
				}
			}
		})
		if (updatePondTiles) funState.pondTiles.set(pondTiles)
	} else if (updates.state === 'plucked') {
		tryTask('tree-pluck')
	}
	funState.features.set(features)
}

export function updateHillFun(id: number, [x, y]: XY, updates: Partial<HillFunState>) {
	const features = get(funState.features)
	const featureMap = get(funState.featureMap)
	const pondTiles = get(funState.pondTiles)
	features.hill[id] = { ...features.hill[id], ...updates }
	if (updates.state === 'popped') {
		tryTask('hill-pop')
		let updatePondTiles = false
		getNeighbors(x, y, hillNeighborsFun).forEach((nXY) => {
			const neighborGrid = xyToGrid(nXY)
			const featureTile = featureMap.get(neighborGrid)
			if (featureTile) {
				const [featureType, [featureId]] = featureTile
				if (featureType !== 'tree') return
				const featureStatus = features[featureType][featureId]
				if (featureStatus.state !== 'init' || featureStatus.crystalized) return
				tryTask('tree-crystalize')
				if (featureStatus.snowy) tryTask('tree-crystalize-snow')
				featureStatus.crystalized = true
			} else {
				const pondTile = pondTiles.get(neighborGrid)
				if (pondTile?.state === 'init' && pondTile.lily && !pondTile.crystalized) {
					pondTile.crystalized = true
					updatePondTiles = true
					tryTask('lily-crystalize')
				}
			}
		})
		if (updatePondTiles) funState.pondTiles.set(pondTiles)
	}
	funState.features.set(features)
}

export function updatePondFun(
	gridList: string[],
	xyList: XY[],
	updates: Partial<PondFunState>
) {
	const features = get(funState.features)
	const featureMap = get(funState.featureMap)
	const pondTiles = get(funState.pondTiles)
	let updateFeatures = false
	for (let i = 0; i < gridList.length; i++) {
		const grid = gridList[i]
		const xy = xyList[i]
		const tileState = pondTiles.get(grid)!
		pondTiles.set(grid, { ...tileState, ...updates })
		if (updates.state === 'frozen') {
			getNeighbors(...xy).forEach((nXY) => {
				const neighborGrid = xyToGrid(nXY)
				const featureTile = featureMap.get(neighborGrid)
				if (featureTile === undefined) return
				const [featureType, [featureId]] = featureTile
				const featureStatus = features[featureType][featureId]
				if (featureStatus.state === 'init' && !featureStatus.snowy) {
					if (featureType === 'tree' && features.tree[featureId].crystalized) {
						tryTask('tree-crystalize-snow')
					} else {
						tryTask((featureType + '-snow') as FunTaskType)
					}
					featureStatus.snowy = true
					updateFeatures = true
				}
			})
		}
	}
	if (updateFeatures) funState.features.set(features)
	if (updates.state === 'broken') tryTask('ice-break')
	funState.pondTiles.set(pondTiles)
}

export function clearFunState() {
	funState.features.set({ tree: [], hill: [] })
	funState.featureMap.set(new Map())
	funState.pondTiles.set(new Map())
	funState.tasks.set([])
}

function tryTask(task: FunTask['type']) {
	if (get(funState.tasks)[0]?.type === task) {
		funState.tasks.update((tasks) => tasks.slice(1))
	}
}
