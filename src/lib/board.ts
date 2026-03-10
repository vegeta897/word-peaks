import { get } from 'svelte/store'
import * as store from '$src/store'
import {
	getBoardRowString,
	getDayEndTime,
	getValidLetterBounds,
	hasEnoughLetters,
	isValidWord,
	loadDictionary,
} from '$src/lib/game'
import { t } from '$lib/translations'
import { trackEvent } from '$lib/plausible'
import { toast } from '@zerodevx/svelte-toast'
import type { SvelteToastOptions } from '@zerodevx/svelte-toast'
import { recordGuessTime, finishGame } from '$lib/stats'
import { ROWS, WORD_LENGTH } from './constants'
import { herdifyBoard } from './herd'
import { aprilFools } from './share'

export type Tile = {
	id: number
	letter: string
	scored: boolean
	distance: number
	polarity: -1 | 0 | 1
	letterBounds?: [string, string]
	animal?: string
}
export type Board = Tile[][]

export function createNewBoard(): Board {
	const board = []
	for (let i = 0; i < ROWS; i++) {
		const row: Tile[] = []
		board[i] = row
		for (let j = 0; j < WORD_LENGTH; j++) {
			row.push({ id: j, letter: '', scored: false, distance: 0, polarity: 0 })
		}
	}
	if (aprilFools()) herdifyBoard(board, get(store.answer) + get(store.uid))
	return board
}

export function resetBoard() {
	store.boardContent.set(createNewBoard())
	store[get(store.gameMode) === 'daily' ? 'guessTimesDaily' : 'guessTimesRandom'].set([])
}

export function resetGuess() {
	toast.pop()
	store.currentTile.set(0)
	store.invalidWord.set(false)
	store.invalidWordPreview.set(false)
	store.invalidHardModeGuess.set(false)
	store.notEnoughLetters.set(false)
}

export async function typeLetter(letter: string) {
	if (get(store.gameFinished)) return
	loadDictionary().catch((_) => {
		showError(get(t)('main.messages.need_reload'), () => {}, 8000)
	})
	const _currentTile = get(store.currentTile)
	if (_currentTile === WORD_LENGTH) return
	const _currentRow = get(store.currentRow)
	if (_currentRow === 0 && _currentTile === 0) recordGuessTime(_currentRow)
	store.boardContent.update((content) => {
		const tile = content[_currentRow][_currentTile]
		const [lower, upper] = getValidLetterBounds(get(store.validLetters))
		tile.polarity = 0
		if (letter && letter < lower) {
			tile.polarity = -1
		} else if (letter && letter > upper) {
			tile.polarity = 1
		}
		tile.letter = letter
		return content
	})
	store.notEnoughLetters.set(false)
	store.invalidWordPreview.set(false)
	if (letter || _currentTile < WORD_LENGTH - 1) {
		store.currentTile.update((ct) => ct + 1)
		const typedWord = getBoardRowString(get(store.boardContent)[_currentRow])
		if (typedWord.length === WORD_LENGTH && get(store.previewInvalidWords)) {
			if (typedWord !== get(store.answer) && !(await isValidWord(typedWord))) {
				store.invalidWordPreview.set(true)
			}
		}
	}
}

export function undoLetter(moveCaratBack = true) {
	if (get(store.gameFinished)) return
	store.boardContent.update((content) => {
		let tile = content[get(store.currentRow)][get(store.currentTile)]
		if (moveCaratBack && get(store.currentTile) > 0 && !tile?.letter) {
			store.currentTile.update((ct) => ct - 1)
			tile = content[get(store.currentRow)][get(store.currentTile)]
		}
		tile.letter = ''
		tile.polarity = 0
		return content
	})
	store.invalidHardModeGuess.set(false)
	store.notEnoughLetters.set(false)
	store.invalidWord.set(false)
	store.invalidWordPreview.set(false)
}

export function moveCarat(dir: number) {
	if (get(store.gameFinished)) return
	const moveTo = get(store.currentTile) + dir
	if (moveTo < 0 || moveTo >= WORD_LENGTH) return
	store.currentTile.update((ct) => ct + dir)
}

let submitting = false
export async function submitRow() {
	if (submitting) return
	if (get(store.gameFinished)) return
	submitting = true
	const rowNumber = get(store.currentRow)
	if (!hasEnoughLetters(get(store.boardContent), rowNumber)) {
		store.notEnoughLetters.set(true)
		showError(get(t)('main.messages.not_enough_letters'), () =>
			store.notEnoughLetters.set(false)
		)
		submitting = false
		return
	}
	const submittedRow = get(store.boardContent)[rowNumber]
	const submittedWord = getBoardRowString(submittedRow)
	let validWord: boolean
	try {
		validWord = await isValidWord(submittedWord)
	} catch (e) {
		showError(get(t)('main.messages.need_reload'), () => {}, 8000)
		submitting = false
		return
	}
	if (submittedWord !== get(store.answer) && !validWord) {
		store.invalidWord.set(true)
		store.invalidWordPreview.set(true)
		showError(get(t)('main.messages.invalid_word'), () => store.invalidWord.set(false))
		submitting = false
		return
	}
	if (
		get(store.hardMode) &&
		rowNumber > 0 &&
		submittedRow.some(
			(tile) => tile.letter < tile.letterBounds![0] || tile.letter > tile.letterBounds![1]
		)
	) {
		store.invalidHardModeGuess.set(true)
		showError(get(t)('main.messages.use_valid_letters'), () =>
			store.invalidHardModeGuess.set(false)
		)
		submitting = false
		return
	}
	trackEvent('submitGuess')
	recordGuessTime(rowNumber + 1)
	store.updateGuesses((words) => [...words, submittedWord])
	const gameMode = get(store.gameMode)
	store.landscapeNewRow.set(true)
	if (get(store.gameFinished)) {
		const won = get(store.gameWon)
		trackEvent(won ? 'gameWon' : 'gameLost')
		if (gameMode === 'daily') {
			trackEvent('dailyFinish')
			const nlgid = get(store.nlgid)
			if (nlgid && get(store.nlgEnabled)) {
				const score = won ? rowNumber + 1 : 'X'
				const date = new Date(getDayEndTime(get(store.lastPlayedDaily)))
				date.setDate(date.getDate() - 1)
				console.log(date)
				const yy = date.getFullYear() - 2000
				const mm = (date.getMonth() + 1).toString().padStart(2, '0')
				const dd = date.getDate().toString().padStart(2, '0')
				const yymmdd = `${yy}${mm}${dd}`
				console.log('yymmdd:', yymmdd)
				console.log('score:', score)
				// fetch('https://api.nicelight.games/plays/done', {
				// 	method: 'POST',
				// 	headers: { 'Content-Type': 'application/json' },
				// 	body: JSON.stringify({ nlgid, score, date: yymmdd }),
				// }).catch(() => {})
				// TODO: Show result in toast
			}
		}
		if (get(store.newUser)) trackEvent('firstFinish')
		store.newUser.set(false)
		store[
			gameMode === 'daily' ? 'lastPlayedDailyWasHard' : 'lastPlayedRandomWasHard'
		].set(get(store.hardMode))
		// Show end screen after waiting for tiles to flip
		setTimeout(
			() => {
				store.showEndView.set(true)
				if (won) store.landscapeForceColor.set(true)
			},
			6 * 150 + 250
		)
		finishGame(won)
	} else {
		store.currentTile.set(0)
	}
	submitting = false
}

const showError = (m: string, onPop?: (id?: number) => any, duration?: number) => {
	toast.pop()
	const toastOptions: SvelteToastOptions = {
		theme: { '--toastBackground': 'var(--error-color)' },
	}
	if (onPop) toastOptions.onpop = onPop
	if (duration !== undefined) toastOptions.duration = duration
	toast.push(m, toastOptions)
}
