import type { Board, GameMode } from '$lib/data-model'
import { toast } from '@zerodevx/svelte-toast'
import { dev } from '$app/environment'
import { getWormHoleColor, wormHolePositions } from '$src/components/Worm.svelte'
import { WORD_LENGTH } from './constants'

export function getShareTitle({
	gameWon,
	guesses,
	gameMode,
	hardMode,
	day,
}: {
	gameWon: boolean
	guesses: string[]
	gameMode: GameMode
	hardMode: boolean
	day?: number
}): string {
	const score = gameWon ? guesses.length : 'X'
	const dayText = gameMode === 'random' ? '∞ ' : `#${day!} `
	const scoreText = `${score}/6${hardMode ? '*' : ''}`
	const gameName = aprilFools() ? 'Worm Peaks' : 'Word Peaks'
	return `${gameName} ${dayText}${scoreText}`
}

export function getEmojiGrid({
	guesses,
	answer,
	guessTimes,
	hideArrows,
}: {
	guesses: string[]
	answer: string
	guessTimes?: string[]
	hideArrows: boolean
}): string {
	let timeStringPad: number
	if (guessTimes) timeStringPad = longestStringLength(guessTimes)
	return (
		'  ' +
		guesses
			.map(
				(word, w) =>
					[...word]
						.map((letter, l) => {
							if (letter === answer[l]) return '🟩'
							return hideArrows ? '🟪' : letter > answer[l] ? '🔽' : '🔼'
						})
						.join('') + (guessTimes ? ' ' + guessTimes[w].padStart(timeStringPad) : '')
			)
			.join('\n  ')
	)
}

export function copyText(text: string): Promise<void> {
	toast.pop()
	return navigator.clipboard.writeText(text)
}

export async function copyImage(blob: Blob): Promise<void> {
	await navigator.clipboard.write([new ClipboardItem({ [blob!.type]: blob! })])
}

// https://benkaiser.dev/sharing-images-using-the-web-share-api/
export async function shareImage(blob: Blob, name: string): Promise<void> {
	const filesArray = [
		new File([blob], `word-peaks-${name}.png`, {
			type: blob.type,
			lastModified: new Date().getTime(),
		}),
	]
	const shareData = { files: filesArray }
	if (navigator.share) await navigator.share(shareData)
}

const MARGIN = 48
const TILE_SIZE = 88
const TILE_SPACE = 12

export function drawResults(
	canvas: HTMLCanvasElement,
	{
		highContrast,
		boardContent,
		guesses,
		caption,
		guessTimes,
		totalTime,
		showURL,
		hash,
		hideArrows,
		tileSharpness,
	}: {
		highContrast: boolean
		boardContent: Board
		guesses: string[]
		caption: string
		guessTimes?: string[]
		totalTime?: string
		showURL: boolean
		hash?: string
		hideArrows: boolean
		tileSharpness: number
	}
): void {
	if (!canvas) return
	canvas.width =
		MARGIN * 2 +
		(TILE_SIZE + TILE_SPACE) * WORD_LENGTH +
		(guessTimes ? longestStringLength(guessTimes) * 28 + 6 : 0)
	canvas.style.maxWidth = `min(100%, ${Math.round(canvas.width / 2)}px)`
	canvas.height =
		MARGIN * 2 + guesses.length * (TILE_SIZE + TILE_SPACE) + 54 + (showURL ? 46 : 0)
	canvas.style.maxHeight = `${Math.round(canvas.height / 2)}px`
	const ctx = canvas.getContext('2d')!
	ctx.fillStyle = highContrast ? '#161a25' : '#312236'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	const roundedRectangle = (
		x: number,
		y: number,
		w: number,
		h: number,
		rTop: number,
		rBottom?: number
	) => {
		rBottom = rBottom ?? rTop
		ctx.beginPath()
		const maxRadius = Math.max(rTop, rBottom)
		if (maxRadius > h * 0.5) {
			if (rBottom > rTop) {
				ctx.ellipse(x + w / 2, y + (h - rBottom), w / 2, rBottom, 0, Math.PI, 0, true)
				ctx.arcTo(x + w, y, x, y, rTop)
				ctx.arcTo(x, y, x, y + h, rTop)
			} else {
				ctx.ellipse(x + w / 2, y + rTop, w / 2, rTop, 0, Math.PI, 0)
				ctx.arcTo(x + w, y + h, x, y + h, rBottom)
				ctx.arcTo(x, y + h, x, y, rBottom)
			}
		} else {
			ctx.moveTo(x + rTop, y)
			ctx.arcTo(x + w, y, x + w, y + h, rTop)
			ctx.arcTo(x + w, y + h, x, y + h, rBottom)
			ctx.arcTo(x, y + h, x, y, rBottom)
			ctx.arcTo(x, y, x + w, y, rTop)
		}
		ctx.closePath()
		ctx.fill()
	}
	ctx.font = '50px Arial'
	ctx.textAlign = 'right'
	ctx.textBaseline = 'middle'
	const arrowRadius =
		TILE_SIZE *
		(tileSharpness <= 1 ? 0.14 + tileSharpness * 0.36 : 0.5 + (tileSharpness - 1) * 0.36)
	boardContent.forEach((rowTiles, r) => {
		if (r >= guesses.length) return
		rowTiles.forEach((tile, t) => {
			let topRadius = TILE_SIZE * 0.14
			let bottomRadius = TILE_SIZE * 0.14
			const correctTile = tile.distance === 0
			if (correctTile || hideArrows) {
				ctx.fillStyle = correctTile ? (highContrast ? '#64ba2e' : '#15a850') : '#a640c7'
			} else if (tile.distance > 0) {
				ctx.fillStyle = '#567de8'
				bottomRadius = arrowRadius
			} else {
				ctx.fillStyle = highContrast ? '#da3f8b' : '#e38f2f'
				topRadius = arrowRadius
			}
			const x = MARGIN + t * (TILE_SIZE + TILE_SPACE)
			const y = MARGIN + r * (TILE_SIZE + TILE_SPACE)
			roundedRectangle(x, y, TILE_SIZE, TILE_SIZE, topRadius, bottomRadius)
		})
		if (guessTimes) {
			ctx.fillStyle = '#a7a1a9'
			ctx.fillText(
				guessTimes[r],
				canvas.width - MARGIN + 2,
				MARGIN + r * (TILE_SIZE + TILE_SPACE) + 48
			)
		}
	})
	ctx.textBaseline = 'alphabetic'
	ctx.fillStyle = '#cccccc'
	if (totalTime)
		ctx.fillText(
			totalTime,
			canvas.width - MARGIN + 2,
			MARGIN + guesses.length * (TILE_SIZE + TILE_SPACE) + 48
		)
	ctx.font = '40px Arial'
	ctx.textAlign = totalTime ? 'left' : 'center'
	ctx.fillText(
		caption,
		totalTime ? MARGIN : canvas.width / 2,
		MARGIN + guesses.length * (TILE_SIZE + TILE_SPACE) + 48
	)
	if (showURL) {
		ctx.font = '40px Arial'
		let url = 'wordpeaks.com'
		if (hash) url += '/#' + hash
		ctx.fillStyle = '#a7a1a9'
		ctx.fillText(
			url,
			totalTime ? MARGIN : canvas.width / 2,
			MARGIN + guesses.length * (TILE_SIZE + TILE_SPACE) + 96
		)
	}
	if (aprilFools()) {
		const holeRadius = Math.round((TILE_SIZE * 0.33) / 2)
		boardContent.forEach((row, r) => {
			if (r >= guesses.length) return
			row.forEach((tile, t) => {
				if (t !== wormHolePositions[r][0]) return
				const holeX =
					MARGIN +
					t * (TILE_SIZE + TILE_SPACE) +
					(wormHolePositions[r][1] / 100) * TILE_SIZE +
					holeRadius
				const holeY =
					MARGIN +
					r * (TILE_SIZE + TILE_SPACE) +
					(wormHolePositions[r][2] / 100) * TILE_SIZE +
					holeRadius
				ctx.fillStyle = getWormHoleColor(tile.polarity, highContrast)
				ctx.beginPath()
				ctx.moveTo(holeX, holeY - holeRadius)
				ctx.arc(holeX, holeY, holeRadius, 0, Math.PI * 2)
				ctx.fill()
				if (r === guesses.length - 1) {
					ctx.strokeStyle = '#de49a2'
					ctx.lineWidth = holeRadius * 1.6
					ctx.lineCap = 'round'
					ctx.beginPath()
					ctx.stroke(new Path2D(`M${holeX},${holeY} c36,30 -10,30 30,55`))
				}
			})
		})
	}
}

const longestStringLength = (strArr: string[]) =>
	strArr.reduce((prev, curr) =>
		prev === null || prev.length < curr.length ? curr : prev
	).length

export const aprilFools = () => {
	// if (dev) return true
	const today = new Date()
	return today.getMonth() === 3 && today.getDate() === 1
}
