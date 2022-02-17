export const ROWS = 6

type Tile = {
	letter: string
	scored: boolean
	direction: -1 | 0 | 1
}
type Board = Tile[][]

export function createNewBoard(): Board {
	const board = []
	for (let i = 0; i < ROWS; i++) {
		const row = []
		board[i] = row
		for (let j = 0; j < 5; j++) {
			row.push({ letter: '', scored: false, direction: 0 })
		}
	}
	return board
}

export const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
