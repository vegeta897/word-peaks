import { type XY } from '$lib/math'
import { type Particle } from '$com/landscape/BouncyParticles.svelte'

export type IceShardSection = { id: number; shards: IceShard[] }

export interface IceShard extends Particle {
	subTile: SubTile
	mainPath: string
	shelfPath: string
}
export type SubTile = { pondRow: number; subTileXY: XY; tileGrids: Set<string> }
