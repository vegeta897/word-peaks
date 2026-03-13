import Rand from 'rand-seed'
import { randomFloat, randomInt } from './math'
import type { Board } from './board'
import { browser } from '$app/environment'
import { toast } from '@zerodevx/svelte-toast'
import { herdMode } from '$src/store'
import { trackEvent } from './plausible'

function giraffeIsAllowed() {
	// Check if giraffe is rendered with the Windows 10 emoji set
	// The Win10 style only has a head so it's bad (for this)
	const canvas = document.createElement('canvas')
	canvas.width = 1
	canvas.height = 1
	const context = canvas.getContext('2d')
	if (!context) return true
	context.font = '24px Arial'
	context.fillText('🦒', -17, 19)
	const [r, g, b] = context.getImageData(0, 0, 1, 1).data
	const badGiraffe = r === 212 && g === 140 && b === 0 // #d48c00
	return !badGiraffe
}

const giraffeAllowed = browser && giraffeIsAllowed()

export function herdifyBoard(board: Board, seed: string) {
	if (!browser) return
	const rng = new Rand(seed)
	const getRng = () => rng.next()
	// HERD PEAKS!
	const herd = [
		'🐄',
		'🐅',
		'🐆',
		'🐎',
		'🐏',
		'🐐',
		'🐑',
		'🐘',
		'🐫',
		'🦌',
		'🦏',
		'🦘',
		'🦙',
		'🦛',
	]
	if (giraffeAllowed) herd.push('🦒')
	herd.sort(() => randomFloat(-1, 1, getRng))
	const tiles = board.reduce((p, c) => [...p, ...c], [])
	let animalsAdded = 0
	while (herd.length > 0) {
		const animal = herd.pop()
		// Ensure first row has at least 2 animals
		const maxIndex = animalsAdded < 2 ? 4 - animalsAdded : tiles.length - 1
		const tileIndex = randomInt(0, maxIndex, getRng)
		const tile = tiles[tileIndex]
		tile.animal = animal
		tiles.splice(tileIndex, 1)
		animalsAdded++
	}
}

export function getHerdText(board: Board) {
	let text = ''
	for (const row of board) {
		for (const tile of row) {
			if (tile.animal) text += tile.animal
		}
	}
	return text
}

const animalCodes = ['horse', 'rhino', 'tiger', 'llama', 'camel', 'sheep', 'hippo']
const toastTheme = { theme: { '--toastBackground': 'var(--cta-color)' } }

export function checkAnimalCodes(guesses: string[]) {
	if (guesses.length < 6) return
	const guessSet = new Set(guesses)
	if (guessSet.size < 6) return
	if (guesses.some((g) => !animalCodes.includes(g))) return
	trackEvent('herdModeActivate')
	herdMode.set(true)
	toast.pop()
	toast.push('Herd mode activated! 🦙', toastTheme)
}
