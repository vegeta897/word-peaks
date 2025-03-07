export type XY = [x: number, y: number]

export function randomChance(chance: number = 0.5) {
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

export type Dir = 0 | 1 | 2 | 3 // down | right | up | left
// prettier-ignore
export const neighbors = [[0, 1], [1, 0], [0, -1], [-1, 0]]
const neighbors8 = [...neighbors, [1, 1], [-1, 1], [-1, -1], [1, -1]]
export function getNeighborGrids(grid: string) {
	const [x, y] = grid.split(':').map((v) => +v)
	return neighbors.map(([nx, ny]) => xyToGrid([x + nx, y + ny]))
}
export const getNeighbors = (x: number, y: number) =>
	neighbors.map(([nx, ny]) => [x + nx, y + ny]) as XY[]
export const getNeighbors8 = (x: number, y: number) =>
	neighbors8.map(([nx, ny]) => [x + nx, y + ny]) as XY[]

export const getDistance = (x: number, y: number) => Math.sqrt(x ** 2 + y ** 2)
export const getDistanceBetween = (a: XY, b: XY) =>
	Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2)
export const getManhattanDistanceBetween = (a: XY, b: XY) =>
	Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
