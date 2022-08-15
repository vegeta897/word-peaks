import type { Board } from '$lib/data-model'
import { ROWS, WORD_LENGTH } from '$lib/data-model'

type FeatureType = 'hill' | 'tree' | 'pond'
export type Feature = {
	type: FeatureType
	boundingBox: Box
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
}

export function getFeatures(landscape: Landscape, board: Board, currentRow: number): Feature[] {
	if (landscape.rows === currentRow) return landscape.features
	const columnWidth = landscape.metrics.width / WORD_LENGTH
	const rowHeight = landscape.metrics.height / ROWS
	const spawners: Spawner[] = []
	while (landscape.rows < currentRow) {
		console.log('spawning row', landscape.rows)
		const rowTiles = board[landscape.rows]
		for (const tile of rowTiles) {
			if (tile.polarity === 0) {
				spawners.push({ type: 'tree' })
			} else if (tile.polarity < 0) {
				spawners.push({ type: 'hill' })
			} else {
				spawners.push({ type: 'pond' })
			}
		}
		landscape.rows++
	}
	return []
}

// Hills spawn radiating outward, with the largest hill(s) in center

// Trees maybe shouldn't spawn radially
