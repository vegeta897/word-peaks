import { randomFloat, type XY } from '$lib/math'

export type IceShardSection = {
	id: number
	delay: number
	shards: IceShard[]
}

export type IceShard = {
	subTile: SubTile
	origin: XY
	rotation: number
	velocity: XY
	bounces: [duration: number, height: number][]
	// delay: number
	duration: number
	mainPath: string
	shelfPath: string
}
export type SubTile = { pondRow: number; subTileXY: XY; tileGrids: Set<string> }

// Parabolic easing for gravity-like curve
export const easeInParabolic = 'cubic-bezier(0.33, 0, 0.67, 0.33)'
export const easeOutParabolic = 'cubic-bezier(0.33, 0.67, 0.67, 1)'
const gravity = 80
const elasticityMin = 0.1
const elasticityMax = 0.4
const restVelocity = 2

export const calculateBounces = (velocity: number) => {
	let duration = 0
	const bounces: IceShard['bounces'] = []
	while (velocity > restVelocity) {
		const dur = Math.round(Math.sqrt(velocity / gravity) * 1000)
		bounces.push([dur, velocity])
		velocity *= randomFloat(elasticityMin, elasticityMax)
		duration += dur
	}
	return { duration, bounces }
}
