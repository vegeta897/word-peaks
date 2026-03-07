import Rand from 'rand-seed'
import { randomFloat, randomInt } from './math'
import type { Board } from './board'
import { browser } from '$app/environment'

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
