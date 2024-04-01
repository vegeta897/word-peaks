export type XY = [x: number, y: number]

export function randomChance(chance: number) {
	return Math.random() < chance
}
export function randomFloat(min: number, max: number, rng = Math.random) {
	return min + rng() * (max - min)
}
export function randomInt(min: number, max: number, rng = Math.random) {
	return min + Math.floor(rng() * (max - min + 1))
}
export function randomElement<T>(arr: T[], rng = Math.random): T {
	return arr[Math.floor(rng() * arr.length)]
}
// Based on https://github.com/ChrisCavs/aimless.js/blob/main/src/weighted.ts
export function randomElementWeighted<T>(arr: T[], weights: number[], rng = Math.random) {
	if (arr.length === 1) return arr[0]
	const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
	const random = randomFloat(0, totalWeight, rng)
	let cumulativeWeight = 0
	for (let i = 0; i < arr.length; i++) {
		cumulativeWeight += weights[i]
		if (random < cumulativeWeight) return arr[i]
	}
	return arr[0] // Should never reach here, but just in case
}

export const xyToGrid = ([x, y]: XY) => `${x}:${y}`
export const gridToXY = (grid: string) => grid.split(':').map((v) => +v)

// prettier-ignore
const neighbors = [[-1, 0],[1, 0],[0, -1],[0, 1]]
export function getNeighborGrids(grid: string) {
	const [x, y] = gridToXY(grid)
	return neighbors.map(([nx, ny]) => xyToGrid([x + nx, y + ny]))
}
export const getNeighbors = (x: number, y: number) =>
	neighbors.map(([nx, ny]) => [x + nx, y + ny])

export const getDistance = (x: number, y: number) => Math.sqrt(x ** 2 + y ** 2)
export const getManhattanDistance = (aX: number, aY: number, bX: number, bY: number) =>
	Math.abs(bX - aX) + Math.abs(bY - aY)

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
