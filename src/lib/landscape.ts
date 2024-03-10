import type { Board } from '$lib/data-model'
import { ROWS, WORD_LENGTH } from '$lib/data-model'
import Hill from '$com/landscape/Hill.svelte'
import Pond from '$com/landscape/Pond.svelte'
import Tree from '$com/landscape/Tree.svelte'
import Rand from 'rand-seed'

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
const featureSizes = {
	hill: { width: 32, height: 27 },
	tree: { width: 14, height: 22 },
	pond: { width: 37, height: 22 },
}

export type Metrics = {
	width: number
	height: number
	tileHeight: number
	rowMargin: number
}

const DEG_TO_RAD = Math.PI / 180

function featureInBounds({ boundingBox }: Feature, metrics: Metrics): boolean {
	return (
		boundingBox.x >= 0 &&
		boundingBox.y >= 0 &&
		boundingBox.x + boundingBox.width < metrics.width &&
		boundingBox.y + boundingBox.height < metrics.height
	)
}

function featuresIntersect(
	{ boundingBox: aBox }: Feature,
	{ boundingBox: bBox }: Feature
): boolean {
	return (
		aBox.x < bBox.x + bBox.width &&
		aBox.x + aBox.width > bBox.x &&
		aBox.y < bBox.y + bBox.height &&
		aBox.y + aBox.height > bBox.y
	)
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
	spawned?: number
	finished?: true
}

export function getFeatures(
	rows: number,
	metrics: Metrics,
	existingFeatures: Feature[],
	board: Board,
	currentRow: number
) {
	if (rows === currentRow) return
	const features = [...existingFeatures]
	console.time('getFeatures')
	const columnWidth = metrics.width / WORD_LENGTH
	const rowHeight = metrics.height / ROWS
	while (rows < currentRow) {
		const spawners: Spawner[] = []
		const row = rows
		const y = (row + 0.5) * rowHeight
		const rowTiles = board[rows]
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
		// TODO: Spawners create a "heat map" that dictates chances of a feature being a particular type
		// Don't use individual spawning nodes
		// This should make for better ponds
		const spawnerCount = spawners.length
		let spawnersFinished = 0
		const rowWord = board[row].map((t) => t.letter).join('')
		const rng = new Rand(rowWord)
		while (spawnersFinished < spawnerCount) {
			for (const spawner of spawners) {
				if (spawner.finished) continue
				const featureSize = featureSizes[spawner.type]
				const newFeature = {
					type: spawner.type,
					boundingBox: Object.assign(
						{ x: spawner.x - featureSize.width / 2, y: spawner.y - featureSize.height / 2 },
						featureSize
					),
					component: featureComponents[spawner.type],
					props: {
						x: spawner.x - featureSize.width / 2,
						y: spawner.y - featureSize.height / 2,
						delay: spawner.row * 500 + spawner.column * 100,
					},
				}
				if (!spawner.spawned) {
					features.push(newFeature)
					spawner.spawned = 1
				} else {
					const startDegree = rng.next() * 360
					let degree = startDegree
					let radius = Math.min(newFeature.boundingBox.width, newFeature.boundingBox.height)
					do {
						const rad = degree * DEG_TO_RAD
						newFeature.boundingBox.x = spawner.x + radius * Math.cos(rad) - featureSize.width / 2
						newFeature.boundingBox.y = spawner.y + radius * Math.sin(rad) - featureSize.height / 2
						const inBounds = featureInBounds(newFeature, metrics)
						const intersects = features.some((otherFeature) =>
							featuresIntersect(newFeature, otherFeature)
						)
						if (inBounds && !intersects) {
							newFeature.props.x = newFeature.boundingBox.x
							newFeature.props.y = newFeature.boundingBox.y
							features.push(newFeature)
							spawner.spawned++
							break
						}
						degree += 5
						if (degree > startDegree + 360) {
							degree = startDegree
							radius += 5
							if (radius > metrics.height / ROWS) {
								spawner.finished = true
								spawnersFinished++
							}
						}
					} while (!spawner.finished)
				}
			}
		}
		rows++
	}
	console.timeEnd('getFeatures')
	return { rows, features }
}

// Hills spawn radiating outward, with the largest hill(s) in center

// Trees maybe shouldn't spawn radially
