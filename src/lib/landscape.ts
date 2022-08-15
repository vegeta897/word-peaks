import type { Board } from '$lib/data-model'
import { ROWS, WORD_LENGTH } from '$lib/data-model'
import Hill from '$com/landscape/Hill.svelte'
import Pond from '$com/landscape/Pond.svelte'
import Tree from '$com/landscape/Tree.svelte'

type FeatureType = 'hill' | 'tree' | 'pond'
export type Feature = {
	type: FeatureType
	boundingBox: Box
	component: typeof Hill | typeof Pond | typeof Tree
	props: Record<string, number>
}

const featureComponents = {
	hill: Hill,
	tree: Tree,
	pond: Pond,
}

export type Landscape = {
	rows: number
	metrics: {
		width: number
		height: number
		tileHeight: number
		rowMargin: number
	}
	features: Feature[]
}

/*
TODO: Circle/rectangle collision detection
// clamp(value, min, max) - limits value to the range min...max

// Find the closest point to the circle within the rectangle
float closestX = clamp(circle.X, rectangle.Left, rectangle.Right);
float closestY = clamp(circle.Y, rectangle.Top, rectangle.Bottom);

// Calculate the distance between the circle's center and this closest point
float distanceX = circle.X - closestX;
float distanceY = circle.Y - closestY;

// If the distance is less than the circle's radius, an intersection occurs
float distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
return distanceSquared < (circle.Radius * circle.Radius);
*/

type Box = {
	x: number
	y: number
	width: number
	height: number
}

type Spawner = {
	type: FeatureType
	x: number
	y: number
	row: number
	column: number
	finished?: true
}

export function getFeatures(landscape: Landscape, board: Board, currentRow: number) {
	if (landscape.rows === currentRow) return
	const columnWidth = landscape.metrics.width / WORD_LENGTH
	const rowHeight = landscape.metrics.height / ROWS
	while (landscape.rows < currentRow) {
		const spawners: Spawner[] = []
		const row = landscape.rows
		console.log('spawning row', row)
		const y = (row + 0.5) * rowHeight
		const rowTiles = board[landscape.rows]
		for (const tile of rowTiles) {
			const column = tile.id
			const x = (column + 0.5) * columnWidth
			if (tile.polarity === 0) {
				spawners.push({ type: 'tree', x, y, row, column })
			} else if (tile.polarity < 0) {
				spawners.push({ type: 'hill', x, y, row, column })
			} else {
				spawners.push({ type: 'pond', x, y, row, column })
			}
		}
		while (spawners.some((s) => !s.finished)) {
			for (const spawner of spawners) {
				console.log('spawning', spawner.type)
				landscape.features.push({
					type: spawner.type,
					boundingBox: { x: 0, y: 0, width: 0, height: 0 },
					component: featureComponents[spawner.type],
					props: { x: spawner.x, y: spawner.y, delay: spawner.row * 500 + spawner.column * 100 },
				})
				spawner.finished = true
			}
		}
		landscape.rows++
	}
}

// Hills spawn radiating outward, with the largest hill(s) in center

// Trees maybe shouldn't spawn radially
