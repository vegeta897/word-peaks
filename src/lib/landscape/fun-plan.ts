import { getNeighbors, type XY, xyToGrid } from '$lib/math'
import type { FunTaskType } from './fun'
import { hillNeighborsFun } from './hill'
import type { FeatureType, Landscape } from './landscape'

export function createFunPlan(landscape: Landscape) {
	function getNeighborTypes(nXYList: XY[]) {
		const neighborTypes: Map<FeatureType, Set<string>> = new Map()
		nXYList.forEach((nXY) => {
			let neighborGrid = xyToGrid(nXY)
			const neighborTile = landscape.tileMap.get(neighborGrid)
			if (!neighborTile || !neighborTile.feature) return
			// TODO: Check if neighbor has init state
			const neighborType = neighborTile.feature.type
			if (neighborType === 'hill') {
				// Use hill origin grid
				neighborGrid = `${neighborTile.feature.x}:${neighborTile.feature.y}`
			}
			const typeGrids = neighborTypes.get(neighborType) || new Set([neighborGrid])
			typeGrids.add(neighborGrid)
			neighborTypes.set(neighborType, typeGrids)
		})
		return neighborTypes
	}

	function addPotential(grid: string, ...potential: FunTaskType[]) {
		const newPotential = funPlan.potentialMap.get(grid) || new Set()
		potential.forEach((p) => {
			newPotential.add(p)
			const newGrids = funPlan.potentialByType.get(p) || new Set()
			newGrids.add(grid)
			funPlan.potentialByType.set(p, newGrids)
		})
		funPlan.potentialMap.set(grid, newPotential)
	}

	const funPlan = {
		features: [],
		potentialMap: new Map() as Map<string, Set<FunTaskType>>,
		potentialByType: new Map() as Map<FunTaskType, Set<string>>,
	}
	for (let y = 0; y < landscape.height; y++) {
		for (let x = 0; x < landscape.width; x++) {
			const grid = xyToGrid([x, y])
			const tile = landscape.tileMap.get(grid)!
			if (!tile.feature) continue
			const feature: {
				// potential: Set<string>
				neighbors: { grid: string; type: 'hill' | 'tree' | 'pond' }[]
			} = {
				// potential: new Set(),
				neighbors: [],
			}
			if (tile.feature.type === 'tree') {
				addPotential(grid, 'tree-pluck')
				const neighborTypes = getNeighborTypes(getNeighbors(x, y))
				if (neighborTypes.has('pond')) {
					addPotential(grid, 'lily-grow')
					if (neighborTypes.has('hill')) {
						const pondAndHillNeighbors = [
							...neighborTypes.get('pond')!,
							...neighborTypes.get('hill')!,
						]
						pondAndHillNeighbors.forEach((nGrid) =>
							addPotential(nGrid, 'tree-crystalize-snow')
						)
					}
				}
				if (neighborTypes.has('hill')) addPotential(grid, 'ivy-grow')
			} else if (tile.feature.type === 'hill') {
				if (tile.hillSubTile !== 0) continue // Hill neighbors are relative to origin
				addPotential(grid, 'hill-pop')
				const neighborTypes = getNeighborTypes(getNeighbors(x, y, hillNeighborsFun))
				if (neighborTypes.has('tree')) addPotential(grid, 'tree-crystalize')
			} else {
				// Pond tile
				addPotential(grid, 'ice-break')
				const neighborTypes = getNeighborTypes(getNeighbors(x, y))
				if (neighborTypes.has('hill')) {
					addPotential(grid, 'hill-snow')
					if (neighborTypes.has('tree')) {
						neighborTypes
							.get('hill')!
							.forEach((nGrid) => addPotential(nGrid, 'lily-crystalize'))
					}
				}
				if (neighborTypes.has('tree')) addPotential(grid, 'tree-snow')
			}
		}
	}
	// TODO: Assign values to fun task types, then create a weighted pool to pick from
	// After each task performed, re-check dirty grids and repeat the process

	// TODO: Create entire task flows while crawling (not just potentials),
	// that have dependecies which can be checked as tasks are completed.
	// Then prioritize the longer flows and randomly pick them
	// Then randomize order of tasks that don't interfere with eachother

	console.log(funPlan.potentialByType)
	return funPlan
}
