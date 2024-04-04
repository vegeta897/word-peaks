import type { Landscape } from '$lib/landscape'
import { createPondPath } from './pond'

const TILE_WIDTH = 48
const TILE_HEIGHT = 32
const TAU = Math.PI * 2
const WHITE = '#dddddd'

export function drawLandscapeToCanvas(
	canvas: HTMLCanvasElement,
	landscape: Landscape,
	{ color, highContrast }: { color: boolean; highContrast: boolean }
) {
	if (!canvas) return
	const bgColor = highContrast ? '#161a25' : '#312236'
	canvas.width = (landscape.width + 1) * TILE_WIDTH
	canvas.height = (landscape.height + 2) * TILE_HEIGHT
	canvas.style.maxWidth = `min(100%, ${Math.round(canvas.width / 2)}px)`
	canvas.style.maxHeight = `${Math.round(canvas.height / 2)}px`
	const ctx = canvas.getContext('2d')!
	ctx.fillStyle = bgColor
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	const pondPath = new Path2D(
		createPondPath(
			landscape.pondTiles,
			TILE_WIDTH,
			TILE_HEIGHT,
			TILE_WIDTH / 2,
			TILE_HEIGHT * 1.5
		)
	)
	const pondColor = color ? '#567de8' : WHITE
	ctx.fillStyle = pondColor
	ctx.fill(pondPath)
	ctx.lineWidth = TILE_HEIGHT * 0.2
	if (!color) {
		ctx.save()
		ctx.clip(pondPath)
		const shiftedPondPath = new Path2D(
			createPondPath(
				landscape.pondTiles,
				TILE_WIDTH,
				TILE_HEIGHT,
				TILE_WIDTH / 2,
				TILE_HEIGHT * 1.7
			)
		)
		ctx.fillStyle = bgColor
		ctx.fill(shiftedPondPath)
		ctx.strokeStyle = WHITE
		ctx.stroke(shiftedPondPath)
		ctx.restore()
	}
	ctx.strokeStyle = pondColor
	ctx.stroke(pondPath)
	ctx.lineCap = 'round'
	ctx.lineJoin = 'round'
	const lineWidth = TILE_HEIGHT * 0.2
	const thickLineWidth = TILE_HEIGHT * 0.5
	const treeColor = highContrast ? '#64ba2e' : '#15a850'
	const treeStrokeColor = color ? treeColor : WHITE
	const hillColor = highContrast ? '#da3f8b' : '#e38f2f'
	const hillStrokeColor = color ? hillColor : WHITE
	const hillFillColor = color ? hillColor : bgColor
	for (const feature of landscape.features) {
		if (feature.type === 'tree') {
			const centerX = (0.5 + feature.x + feature.xJitter + 0.5) * TILE_WIDTH
			const centerY = (1.5 + feature.y + feature.yJitter + 0.5) * TILE_HEIGHT
			const radius = ((0.9 + feature.size * 0.2) * TILE_HEIGHT) / 2
			ctx.lineWidth = thickLineWidth
			ctx.strokeStyle = bgColor
			ctx.beginPath()
			ctx.moveTo(centerX, centerY)
			ctx.lineTo(centerX, centerY - radius)
			ctx.stroke()
			ctx.arc(centerX, centerY - radius * 2, radius + TILE_HEIGHT * 0.125, 0, TAU)
			ctx.fillStyle = bgColor
			ctx.fill()
			ctx.strokeStyle = treeStrokeColor
			ctx.lineWidth = lineWidth
			ctx.beginPath()
			ctx.moveTo(centerX, centerY)
			ctx.lineTo(centerX, centerY - radius)
			ctx.stroke()
			ctx.beginPath()
			ctx.arc(centerX, centerY - radius * 2, radius - TILE_HEIGHT * 0.1, 0, TAU)
			ctx.stroke()
			if (color) {
				ctx.fillStyle = treeColor
				ctx.fill()
			}
		} else {
			const centerX =
				(0.5 + feature.x + feature.xJitter + (landscape.mini ? 1 : 1.5)) * TILE_WIDTH
			const centerY = (1.5 + feature.y + feature.yJitter + 1) * TILE_HEIGHT
			const radius = ((landscape.mini ? 0.8 : 1.35) + 0.2 * feature.size) * TILE_HEIGHT
			ctx.lineWidth = thickLineWidth
			ctx.strokeStyle = bgColor
			ctx.beginPath()
			ctx.moveTo(centerX - radius, centerY)
			ctx.lineTo(
				centerX - radius,
				centerY - TILE_HEIGHT / 2 - (landscape.mini ? 0.2 : 0.5) * TILE_HEIGHT
			)
			ctx.arc(
				centerX,
				centerY - TILE_HEIGHT / 2 - (landscape.mini ? 0.2 : 0.5) * TILE_HEIGHT,
				radius,
				Math.PI,
				0
			)
			ctx.lineTo(centerX + radius, centerY)
			ctx.ellipse(centerX, centerY, radius, radius / 3, 0, 0, Math.PI)
			ctx.stroke()
			ctx.lineWidth = lineWidth
			ctx.strokeStyle = hillStrokeColor
			ctx.fillStyle = hillFillColor
			ctx.fill()
			ctx.stroke()
		}
	}
}
