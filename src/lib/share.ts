import type { Board, GameMode } from '$lib/data-model'
import { toast } from '@zerodevx/svelte-toast'
import { dev } from '$app/env'

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
	const gameName = aprilFools() ? 'Word Peas' : 'Word Peaks'
	return `${gameName} ${dayText}${scoreText}`
}

export function getEmojiGrid({
	guesses,
	answer,
	guessTimes,
}: {
	guesses: string[]
	answer: string
	guessTimes?: string[]
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
							if (letter === answer[l]) return aprilFools() ? '🟢' : '🟩'
							return letter > answer[l] ? '🔽' : '🔼'
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

export function copyImage(canvas: HTMLCanvasElement): void {
	canvas.toBlob(async (blob) => {
		let data = [new ClipboardItem({ [blob!.type]: blob! })]
		await navigator.clipboard.write(data)
	})
}

// https://benkaiser.dev/sharing-images-using-the-web-share-api/
export async function shareImage(
	canvas: HTMLCanvasElement,
	{ hash, day }: { hash?: string; day?: number }
): Promise<void> {
	const imageUrl = canvas.toDataURL()
	const imageBlob = await (await fetch(imageUrl)).blob()
	const filesArray = [
		new File([imageBlob], `word-peaks-${hash || day}.png`, {
			type: imageBlob.type,
			lastModified: new Date().getTime(),
		}),
	]
	const shareData = {
		files: filesArray,
	}
	// Fail silently, image will appear in modal to copy
	await navigator.share(shareData)
}

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
	}: {
		highContrast: boolean
		boardContent: Board
		guesses: string[]
		caption: string
		guessTimes?: string[]
		totalTime?: string
		showURL: boolean
		hash?: string
	}
): void {
	if (!canvas) return
	canvas.width = 504 + (guessTimes ? longestStringLength(guessTimes) * 28 + 6 : 0)
	canvas.style.maxWidth = `min(100%, ${Math.round(canvas.width / 2)}px)`
	canvas.height = guesses.length * 100 + 60 + (showURL ? 44 : 0)
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
		ctx.moveTo(x + rTop, y)
		ctx.arcTo(x + w, y, x + w, y + h, rTop)
		ctx.arcTo(x + w, y + h, x, y + h, rBottom)
		ctx.arcTo(x, y + h, x, y, rBottom)
		ctx.arcTo(x, y, x + w, y, rTop)
		ctx.closePath()
		ctx.fill()
	}
	ctx.font = '50px Arial'
	ctx.textAlign = 'right'
	ctx.textBaseline = 'middle'
	const isAprilFools = aprilFools()
	boardContent.forEach((row, r) => {
		if (r >= guesses.length) return
		row.forEach((tile, t) => {
			let topRadius = 12
			let bottomRadius = 12
			if (tile.distance === 0) {
				ctx.fillStyle = highContrast ? '#64ba2e' : '#15a850'
			} else if (tile.distance > 0) {
				ctx.fillStyle = '#567de8'
				bottomRadius = 28
			} else {
				ctx.fillStyle = highContrast ? '#da3f8b' : '#e38f2f'
				topRadius = 28
			}
			const x = 8 + t * 100
			const y = 8 + r * 100
			const l = 88
			if (isAprilFools && tile.distance === 0) {
				ctx.beginPath()
				ctx.arc(x + l / 2, y + l / 2, l / 2, 0, 2 * Math.PI)
				ctx.fill()
			} else {
				roundedRectangle(x, y, l, l, topRadius, bottomRadius)
			}
		})
		if (guessTimes) {
			ctx.fillStyle = '#a7a1a9'
			ctx.fillText(guessTimes[r], canvas.width - 6, r * 100 + 55)
		}
	})
	ctx.textBaseline = 'alphabetic'
	ctx.fillStyle = '#cccccc'
	if (totalTime) ctx.fillText(totalTime, canvas.width - 6, guesses.length * 100 + 44)
	ctx.font = '40px Arial'
	ctx.textAlign = totalTime ? 'left' : 'center'
	ctx.fillText(caption, totalTime ? 8 : canvas.width / 2, guesses.length * 100 + 44)
	if (showURL) {
		ctx.font = '40px Arial'
		let url = 'wordpeaks.com'
		if (hash) url += '/#' + hash
		ctx.fillStyle = '#a7a1a9'
		ctx.fillText(url, totalTime ? 8 : canvas.width / 2, guesses.length * 100 + 92)
	}
}

const longestStringLength = (strArr: string[]) =>
	strArr.reduce((prev, curr) => (prev === null || prev.length < curr.length ? curr : prev)).length

export const aprilFools = () => {
	if (dev) return true
	const today = new Date()
	return today.getMonth() === 3 && today.getDate() === 1
}
