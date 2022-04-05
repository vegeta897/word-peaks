import { writable, derived, get } from 'svelte/store'
import type { Writable, Updater, Readable } from 'svelte/store'
import { writable as storageWritable } from 'svelte-local-storage-store'
import type { Board, GameMode, Stats } from '$lib/data-model'
import {
	createNewBoard,
	getValidLetterBounds,
	getValidLetters,
	newStats,
	ROWS,
	scoreTile,
} from '$lib/data-model'

export const storeVersion: Writable<number> = storageWritable('wp-version', 0)

export const answerDaily: Writable<string> = storageWritable('wp-answer', '')
export const answerRandom: Writable<string> = storageWritable('wp-answerRandom', '')

export const guessesDaily: Writable<string[]> = storageWritable('wp-guesses', [])
export const guessesRandom: Writable<string[]> = storageWritable('wp-guessesRandom', [])

// TODO: Consolidate options to single object?
export const highContrast: Writable<boolean> = storageWritable('wp-highContrast', false)
export const showAllHints: Writable<boolean> = storageWritable('wp-showAllHints', false)
const hardModeStored: Writable<boolean> = storageWritable('wp-hardMode', false)
export const hardMode: Readable<boolean> = derived(
	hardModeStored,
	($hardModeStored) => $hardModeStored
)
export const swapEnterBackspace: Writable<boolean> = storageWritable('wp-swapEnterBackspace', false)
export const keyboardLayout: Writable<string> = storageWritable('wp-keyboardLayout', 'qwerty')

export const lastPlayedDailyWasHard: Writable<boolean> = storageWritable(
	'wp-lastPlayedWasHard',
	false
)
export const lastPlayedRandomWasHard: Writable<boolean> = storageWritable(
	'wp-lastPlayedRandomWasHard',
	false
)

export const changeHardMode = (changeTo: boolean) => {
	if (!get(gameFinished) && get(guesses).length > 0) throw "Can't change that during a game!"
	hardModeStored.set(changeTo)
}

export const lastPlayedDaily: Writable<number> = storageWritable('wp-lastPlayedDaily', -1)

export const stats: Writable<Stats> = storageWritable('wp-stats', newStats())

export const gameMode: Writable<GameMode> = writable('daily')

export const lastPlayedWasHard: Readable<boolean> = derived(
	[gameMode, lastPlayedDailyWasHard, lastPlayedRandomWasHard],
	([$gameMode, $lastPlayedDailyWasHard, $lastPlayedRandomWasHard]) =>
		$gameMode === 'daily' ? $lastPlayedDailyWasHard : $lastPlayedRandomWasHard
)

export const invalidHardModeGuess: Writable<boolean> = writable(false)
export const notEnoughLetters: Writable<boolean> = writable(false)
export const invalidWord: Writable<boolean> = writable(false)

export const boardContent: Writable<Board> = writable(createNewBoard())

export const answer: Readable<string> = derived(
	[gameMode, answerDaily, answerRandom],
	([$gameMode, $answerDaily, $answerRandom]) =>
		$gameMode === 'daily' ? $answerDaily : $answerRandom
)

export const guesses: Readable<string[]> = derived(
	[gameMode, guessesDaily, guessesRandom],
	([$gameMode, $guessesDaily, $guessesRandom]) =>
		$gameMode === 'daily' ? $guessesDaily : $guessesRandom
)

export function updateGuesses(fn: Updater<string[]>): void {
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

export const currentRow: Readable<number> = derived(guesses, ($guesses) => $guesses.length)

export const currentTile: Writable<number> = writable(0)

export const gameWon: Readable<boolean> = derived(
	[answer, guesses],
	([$answer, $guesses]) => $guesses.length > 0 && $guesses[$guesses.length - 1] === $answer
)

export const gameFinished: Readable<boolean> = derived(
	[currentRow, gameWon],
	([$currentRow, $gameWon]) => $gameWon || $currentRow === ROWS
)

export const validLetters: Readable<Set<string>> = derived(
	[boardContent, currentRow, currentTile, gameFinished],
	([$boardContent, $currentRow, $currentTile, $gameFinished]) =>
		$gameFinished
			? (new Set() as Set<string>)
			: getValidLetters($boardContent, $currentRow, $currentTile)
)
