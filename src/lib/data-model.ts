import targets from '$lib/data/targets-filtered.json'

export const ROWS = 6
export const WORD_LENGTH = 5

type Tile = {
	id: number
	letter: string
	scored: boolean
	distance: number
	magnitude: number
	polarity: -1 | 0 | 1
}
export type Board = Tile[][]
export type GameMode = 'daily' | 'random'

export function createNewBoard(): Board {
	const board = []
	for (let i = 0; i < ROWS; i++) {
		const row: Tile[] = []
		board[i] = row
		for (let j = 0; j < WORD_LENGTH; j++) {
			row.push({ id: j, letter: '', scored: false, distance: 0, magnitude: 0, polarity: 0 })
		}
	}
	return board
}

export function scoreTile(
	letter: string,
	answer: string,
	row: number,
	tile: number,
	boardContent: Tile[][]
): Tile {
	const distance = alphabet.indexOf(letter) - alphabet.indexOf(answer[tile])
	const polarity = distance === 0 ? 0 : distance > 0 ? 1 : -1
	let magnitude = 0
	if (row === 0) {
		magnitude = ROWS
	} else {
		const prevTile = boardContent[row - 1][tile]
		if (prevTile.polarity !== polarity) {
			magnitude = ROWS
		} else if (Math.abs(distance) > Math.abs(prevTile.distance)) {
			magnitude = prevTile.magnitude + 1
		} else if (Math.abs(distance) < Math.abs(prevTile.distance)) {
			magnitude = prevTile.magnitude - 1
		}
		const alreadyGuessed = boardContent.find((guess, g) => g < row && guess[tile].letter === letter)
		if (alreadyGuessed) {
			magnitude = alreadyGuessed[tile].magnitude
		}
	}
	if (distance === 0) magnitude = 0
	return {
		id: tile,
		scored: true,
		distance,
		magnitude,
		polarity,
		letter,
	}
}

export function getValidLetters(boardContent: Board, row: number, tile: number): Set<string> {
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

const epoch = new Date(2022, 0).getTime() // 2022-01-01
const msPerDay = 86400000

export const getDayNumber = () => Math.floor((Date.now() - epoch) / msPerDay)

export const getWordByDay = (day: number) => targets[day % targets.length]

export const getDayEnd = (day: number) => new Date(epoch + (day + 1) * msPerDay)

export const getRandomWord = () => targets[Math.floor(Math.random() * targets.length)]

export function encodeWord(word: string) {
	let sum = 0
	for (const [l, letter] of [...word].entries()) {
		sum += alphabet.indexOf(letter) << (l * 5)
	}
	return sum.toString(36)
}

export function decodeWord(hash: string) {
	if (!hash) return false
	let word = ''
	for (let i = 0; i < WORD_LENGTH; i++) {
		word += alphabet[(parseInt(hash, 36) & (0b11111 << (i * 5))) >> (i * 5)]
	}
	return targets.includes(word) && word
}

export const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
