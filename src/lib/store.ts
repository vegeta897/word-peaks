import { writable, derived, get } from 'svelte/store'
import type { Writable, Updater } from 'svelte/store'
import { writable as storageWritable } from 'svelte-local-storage-store'
import type { GameMode, Stats } from '$lib/data-model'
import {
	createNewBoard,
	getValidLetterBounds,
	getValidLetters,
	newStats,
	ROWS,
	scoreTile,
	WORD_LENGTH,
} from '$lib/data-model'

export const storeVersion = storageWritable('wp-version', 0)

export const answerDaily = storageWritable('wp-answer', '')
export const answerRandom = storageWritable('wp-answerRandom', '')

export const guessesDaily: Writable<string[]> = storageWritable('wp-guesses', [])
export const guessesRandom: Writable<string[]> = storageWritable('wp-guessesRandom', [])

export const highContrast = storageWritable('wp-highContrast', false)
export const showAllHints = storageWritable('wp-showAllHints', false)
const hardModeStored = storageWritable('wp-hardMode', false)
export const hardMode = derived(hardModeStored, ($hardModeStored) => $hardModeStored)
export const swapEnterBackspace = storageWritable('wp-swapEnterBackspace', false)

export const lastPlayedDailyWasHard = storageWritable('wp-lastPlayedWasHard', false)
export const lastPlayedRandomWasHard = storageWritable('wp-lastPlayedRandomWasHard', false)

export const changeHardMode = (changeTo: boolean) => {
	if (!get(gameFinished) && get(guesses).length > 0) throw "Can't change that during a game!"
	hardModeStored.set(changeTo)
}

export const lastPlayedDaily = storageWritable('wp-lastPlayedDaily', -1)

export const stats: Writable<Stats> = storageWritable('wp-stats', newStats())

export const gameMode: Writable<GameMode> = writable('daily')

export const lastPlayedWasHard = derived(
	[gameMode, lastPlayedDailyWasHard, lastPlayedRandomWasHard],
	([$gameMode, $lastPlayedDailyWasHard, $lastPlayedRandomWasHard]) =>
		$gameMode === 'daily' ? $lastPlayedDailyWasHard : $lastPlayedRandomWasHard
)

export const invalidHardModeGuess = writable(false)

export const boardContent = writable(createNewBoard())

export const answer = derived(
	[gameMode, answerDaily, answerRandom],
	([$gameMode, $answerDaily, $answerRandom]) =>
		$gameMode === 'daily' ? $answerDaily : $answerRandom
)

export const guesses = derived(
	[gameMode, guessesDaily, guessesRandom],
	([$gameMode, $guessesDaily, $guessesRandom]) =>
		$gameMode === 'daily' ? $guessesDaily : $guessesRandom
)

export function updateGuesses(fn: Updater<string[]>) {
	;(get(gameMode) === 'daily' ? guessesDaily : guessesRandom).update(fn)
}

guesses.subscribe((guessed) => {
	boardContent.update((content) => {
		const newBoardContent = createNewBoard()
		content.forEach((row, r) => {
			if (r < guessed.length) {
				const guessedWord = guessed[r]
				newBoardContent[r] = [...guessedWord].map((letter, l) =>
					scoreTile(letter, get(answer), r, l, content)
				)
			} else if (r > 0 && r === guessed.length) {
				newBoardContent[r].forEach((tile, t) => {
					tile.letterBounds = getValidLetterBounds(getValidLetters(newBoardContent, r, t))
				})
			}
		})
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
