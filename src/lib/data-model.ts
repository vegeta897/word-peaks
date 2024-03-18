export const ROWS = 6
export const WORD_LENGTH = 5
import targetWords from '$lib/words/targets-filtered.json'

let dictionary: string[] | undefined
export async function loadDictionary() {
	if (dictionary) return
	dictionary = (await import('$lib/words/dictionary-filtered.json')).default
}
export async function isValidWord(word: string): Promise<boolean> {
	if (!dictionary) await loadDictionary()
	return dictionary!.includes(word)
}

export type Tile = {
	id: number
	letter: string
	scored: boolean
	distance: number
	polarity: -1 | 0 | 1
	letterBounds?: [string, string]
}
export type Board = Tile[][]
export type GameMode = 'daily' | 'random'

export function createNewBoard(): Board {
	const board = []
	for (let i = 0; i < ROWS; i++) {
		const row: Tile[] = []
		board[i] = row
		for (let j = 0; j < WORD_LENGTH; j++) {
			row.push({ id: j, letter: '', scored: false, distance: 0, polarity: 0 })
		}
	}
	return board
}

export function scoreTile(letter: string, answer: string, tile: number): Tile {
	const distance = alphabet.indexOf(letter) - alphabet.indexOf(answer[tile])
	const polarity = distance === 0 ? 0 : distance > 0 ? 1 : -1
	return { id: tile, scored: true, distance, polarity, letter }
}

export function getValidLetters(
	boardContent: Board,
	row: number,
	tile: number
): Set<string> {
	if (tile === WORD_LENGTH) return new Set()
	const valid: Set<string> = new Set(alphabet)
	alphabet.forEach((letter) => {
		if (!valid.has(letter)) return // Already removed
		for (let i = 0; i < row; i++) {
			const prevTile = boardContent[i][tile]
			if (prevTile.distance === 0 && letter !== prevTile.letter) valid.delete(letter)
			if (prevTile.distance < 0 && letter <= prevTile.letter) valid.delete(letter)
			if (prevTile.distance > 0 && letter >= prevTile.letter) valid.delete(letter)
		}
	})
	return valid
}

export function getBoardRowString(row: Tile[]): string {
	return row.map((t) => t.letter).join('')
}

export function getValidLetterBounds(list: Set<string>): [string, string] {
	return [
		alphabet.find((letter) => list.has(letter))!,
		[...alphabet].reverse().find((letter) => list.has(letter))!,
	]
}

export function hasEnoughLetters(boardContent: Board, row: number): boolean {
	const letters = getBoardRowString(boardContent[row])
	return !(letters.length < WORD_LENGTH || letters.includes(' '))
}

const firstDay = new Date(2022, 1, 25) // 2022-02-25

export const getDayNumber = (): number => {
	let dayCount = 0
	const start = new Date(firstDay)
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	while (start < today) {
		dayCount++
		start.setDate(start.getDate() + 1)
	}
	return dayCount
}

export function getWordByDay(day: number): string {
	return targetWords[day % targetWords!.length]
}

export const getDayEnd = (day: number): Date => {
	const start = new Date(firstDay)
	let dayEnd = new Date(start)
	dayEnd.setDate(start.getDate() + day + 1)
	return dayEnd
}

export function pickRandom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)]
}

export function getRandomWord(): string {
	return pickRandom(targetWords)
}

export function encodeWord(word: string): string {
	let sum = 0
	for (const [l, letter] of [...word].entries()) {
		sum += alphabet.indexOf(letter) << (l * 5)
	}
	return sum.toString(36)
}

export function decodeWord(hash: string): false | string {
	if (!hash) return false
	let word = ''
	for (let i = 0; i < WORD_LENGTH; i++) {
		word += alphabet[(parseInt(hash, 36) & (0b11111 << (i * 5))) >> (i * 5)]
	}
	return word.length === 5 && word
}

export const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')

export const keyboardLayoutNames = [
	'alphabetic',
	'qwerty',
	'azerty',
	'qwertz',
	'dvorak',
	'colemak',
] as const
export type KeyboardLayout = typeof keyboardLayoutNames[number]
export const keyboardLayoutOptions: {
	value: KeyboardLayout
	label: string
	layout: [string[], string[], string[]]
	wideKeysRow: 0 | 1 | 2
}[] = [
	{
		value: 'alphabetic',
		label: 'Alphabetic',
		layout: [
			['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
			['k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't'],
			['u', 'v', 'w', 'x', 'y', 'z'],
		],
		wideKeysRow: 2,
	},
	{
		value: 'qwerty',
		label: 'QWERTY',
		layout: [
			['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
			['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
			['z', 'x', 'c', 'v', 'b', 'n', 'm'],
		],
		wideKeysRow: 2,
	},
	{
		value: 'azerty',
		label: 'AZERTY',
		layout: [
			['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
			['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
			['z', 'x', 'c', 'v', 'b', 'n'],
		],
		wideKeysRow: 2,
	},
	{
		value: 'qwertz',
		label: 'QWERTZ',
		layout: [
			['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p'],
			['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
			['y', 'x', 'c', 'v', 'b', 'n', 'm'],
		],
		wideKeysRow: 2,
	},
	{
		value: 'dvorak',
		label: 'Dvorak',
		layout: [
			['p', 'y', 'f', 'g', 'c', 'r', 'l'],
			['a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's'],
			['q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z'],
		],
		wideKeysRow: 0,
	},
	{
		value: 'colemak',
		label: 'Colemak',
		layout: [
			['q', 'w', 'f', 'p', 'g', 'j', 'l', 'u', 'y'],
			['a', 'r', 's', 't', 'd', 'h', 'n', 'e', 'i', 'o'],
			['z', 'x', 'c', 'v', 'b', 'k', 'm'],
		],
		wideKeysRow: 2,
	},
]
