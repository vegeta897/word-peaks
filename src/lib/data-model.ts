type Tile = {
	letter: string
	scored: boolean
	direction: -1 | 0 | 1
}
type Board = Tile[][]

export function createNewBoard(rows: number): Board {
	const board = []
	for (let i = 0; i < rows; i++) {
		const row = []
		board[i] = row
		for (let j = 0; j < 5; j++) {
			row.push({ letter: '', scored: false, direction: 0 })
		}
	}
	return board
}

export const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')