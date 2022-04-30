import type { Readable, Updater, Writable } from 'svelte/store'
import { derived, get, writable } from 'svelte/store'
import type { Board, GameMode } from '$lib/data-model'
import {
	createNewBoard,
	getValidLetterBounds,
	getValidLetters,
	ROWS,
	scoreTile,
} from '$lib/data-model'
import { writable as storageWritable } from 'svelte-local-storage-store'

export const answerDaily: Writable<string> = storageWritable('wp-answer', '')
export const answerRandom: Writable<string> = storageWritable('wp-answerRandom', '')

export const guessesDaily: Writable<string[]> = storageWritable('wp-guesses', [])
export const guessesRandom: Writable<string[]> = storageWritable('wp-guessesRandom', [])

export const lastPlayedDailyWasHard: Writable<boolean> = storageWritable(
	'wp-lastPlayedWasHard',
	false
)
export const lastPlayedRandomWasHard: Writable<boolean> = storageWritable(
	'wp-lastPlayedRandomWasHard',
	false
)

const hardModeStored: Writable<boolean> = storageWritable('wp-hardMode', false)
export const hardMode: Readable<boolean> = derived(
	hardModeStored,
	($hardModeStored) => $hardModeStored
)
export const changeHardMode = (changeTo: boolean) => {
	if (!get(gameFinished) && get(guesses).length > 0) throw "Can't change that during a game!"
	hardModeStored.set(changeTo)
}

export const gameMode: Writable<GameMode> = writable('daily')

export const lastPlayedWasHard: Readable<boolean> = derived(
	[gameMode, lastPlayedDailyWasHard, lastPlayedRandomWasHard],
	([$gameMode, $lastPlayedDailyWasHard, $lastPlayedRandomWasHard]) =>
		$gameMode === 'daily' ? $lastPlayedDailyWasHard : $lastPlayedRandomWasHard
)

export const invalidHardModeGuess: Writable<boolean> = writable(false)
export const notEnoughLetters: Writable<boolean> = writable(false)
export const invalidWord: Writable<boolean> = writable(false)
export const invalidWordPreview: Writable<boolean> = writable(false)

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

export function initGameState() {
	guesses.subscribe((guessed) => {
		const newBoardContent = createNewBoard()
		for (let r = 0; r < newBoardContent.length; r++) {
			if (r < guessed.length) {
				const guessedWord = guessed[r]
				newBoardContent[r] = [...guessedWord].map((letter, l) =>
					scoreTile(letter, get(answer), r, l)
				)
			} else if (r > 0 && r === guessed.length) {
				newBoardContent[r].forEach((tile, t) => {
					tile.letterBounds = getValidLetterBounds(getValidLetters(newBoardContent, r, t))
				})
			}
		}
		boardContent.set(newBoardContent)
	})
}

export const guessTimesDaily: Writable<number[]> = storageWritable('wp-guessTimesDaily', [])
export const guessTimesRandom: Writable<number[]> = storageWritable('wp-guessTimesRandom', [])
export const guessTimes: Readable<number[]> = derived(
	[gameMode, guessTimesDaily, guessTimesRandom],
	([$gameMode, $guessTimesDaily, $guessTimesRandom]) =>
		$gameMode === 'daily' ? $guessTimesDaily : $guessTimesRandom
)

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
