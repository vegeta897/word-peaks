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

export function createSetArray(length = WORD_LENGTH) {
	const arr = []
	for (let i = 0; i < length; i++) {
		arr.push(new Set())
	}
	return arr
}

export const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
