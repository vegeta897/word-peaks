export const ROWS = 6

type Tile = {
	id: number
	letter: string
	scored: boolean
	distance: number
	magnitude: number
	polarity: -1 | 0 | 1
}
type Board = Tile[][]

export function createNewBoard(): Board {
	const board = []
	for (let i = 0; i < ROWS; i++) {
		const row: Tile[] = []
		board[i] = row
		for (let j = 0; j < 5; j++) {
			row.push({ id: j, letter: '', scored: false, distance: 0, magnitude: 0, polarity: 0 })
		}
	}
	return board
}

export const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
