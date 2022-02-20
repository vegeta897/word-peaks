import { writable, derived, get } from 'svelte/store'
import { writable as storageWritable } from 'svelte-local-storage-store'
import { createNewBoard, getValidLetters, ROWS, scoreTile, WORD_LENGTH } from '$lib/data-model'

export const answer = storageWritable('wp-answer', '')

export const guesses = storageWritable('wp-guesses', [])

export const boardContent = writable(createNewBoard())

guesses.subscribe((words) => {
	boardContent.update((content) => {
		const newBoardContent = createNewBoard()
		words.forEach(
			(word, r) =>
				(newBoardContent[r] = [...word].map((letter, l) =>
					scoreTile(letter, get(answer), r, l, content)
				))
		)
		return newBoardContent
	})
})

export const currentRow = derived(guesses, ($guesses) => $guesses.length)

export const currentTile = derived([boardContent, currentRow], ([$boardContent, $currentRow]) => {
	if ($currentRow === ROWS) return WORD_LENGTH
	const tileIndex = $boardContent[$currentRow].findIndex((tile) => tile.letter === '')
	return tileIndex < 0 ? WORD_LENGTH : tileIndex
})

export const gameWon = derived(
	[answer, guesses],
	([$answer, $guesses]) => $guesses.length > 0 && $guesses[$guesses.length - 1] === $answer
)

export const gameFinished = derived(
	[currentRow, gameWon],
	([$currentRow, $gameWon]) => $gameWon || $currentRow === ROWS
)

export const validLetters = derived(
	[boardContent, currentRow, currentTile, gameFinished],
	([$boardContent, $currentRow, $currentTile, $gameFinished]) =>
		$gameFinished ? new Set() : getValidLetters($boardContent, $currentRow, $currentTile)
)
