import { get } from 'svelte/store'
import * as store from '$src/store'
import {
	createNewBoard,
	getBoardRowString,
	getValidLetterBounds,
	hasEnoughLetters,
	isValidWord,
	loadDictionary,
	WORD_LENGTH,
} from '$lib/data-model'
import { t } from '$lib/translations'
import { trackEvent } from '$lib/plausible'
import { toast } from '@zerodevx/svelte-toast'
import type { SvelteToastOptions } from '@zerodevx/svelte-toast'

export function resetBoard() {
	toast.pop()
	store.boardContent.set(createNewBoard())
	store.currentTile.set(0)
}

export function typeLetter(letter: string) {
	if (get(store.gameFinished)) {
		store.openScreen.set('results')
		return
	}
	loadDictionary()
	const _currentTile = get(store.currentTile)
	if (_currentTile === WORD_LENGTH) return
	store.boardContent.update((content) => {
		const tile = content[get(store.currentRow)][_currentTile]
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
	if (letter || _currentTile < WORD_LENGTH - 1) store.currentTile.update((ct) => ct + 1)
}

export function undoLetter(moveCaratBack = true) {
	if (get(store.gameFinished)) {
		store.openScreen.set('results')
		return
	}
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
}

export function moveCarat(dir: number) {
	if (get(store.gameFinished)) {
		store.openScreen.set('results')
		return
	}
	const moveTo = get(store.currentTile) + dir
	if (moveTo < 0 || moveTo >= WORD_LENGTH) return
	store.currentTile.update((ct) => ct + dir)
}

export async function submitRow() {
	if (get(store.gameFinished)) {
		store.openScreen.set('results')
		return
	}
	if (!hasEnoughLetters(get(store.boardContent), get(store.currentRow))) {
		store.notEnoughLetters.set(true)
		showError(get(t)('main.messages.not_enough_letters'), () => store.notEnoughLetters.set(false))
		return
	}
	const submittedRow = get(store.boardContent)[get(store.currentRow)]
	const submittedWord = getBoardRowString(submittedRow)
	if (submittedWord !== get(store.answer) && !(await isValidWord(submittedWord))) {
		store.invalidWord.set(true)
		showError(get(t)('main.messages.invalid_word'), () => store.invalidWord.set(false))
		return
	}
	if (
		get(store.hardMode) &&
		get(store.currentRow) > 0 &&
		submittedRow.some(
			(tile) => tile.letter < tile.letterBounds![0] || tile.letter > tile.letterBounds![1]
		)
	) {
		store.invalidHardModeGuess.set(true)
		showError(get(t)('main.messages.use_valid_letters'), () =>
			store.invalidHardModeGuess.set(false)
		)
		return
	}
	trackEvent('submitGuess')
	store.updateGuesses((words) => [...words, submittedWord])
	if (get(store.gameFinished)) {
		setTimeout(() => store.openScreen.set('results'), 1700)
		const won = get(store.gameWon)
		trackEvent(won ? 'gameWon' : 'gameLost')
		if (get(store.newUser)) trackEvent('firstFinish')
		store.newUser.set(false)
		;(get(store.gameMode) === 'daily'
			? store.lastPlayedDailyWasHard
			: store.lastPlayedRandomWasHard
		).set(get(store.hardMode))
		if (get(store.gameMode) === 'daily')
			store.stats.update((_stats) => {
				const streak = won ? _stats.currentStreak + 1 : 0
				const distribution = [..._stats.distribution]
				distribution[get(store.guesses).length - 1]++
				return {
					currentStreak: streak,
					bestStreak: streak > _stats.bestStreak ? streak : _stats.bestStreak,
					totalGames: _stats.totalGames + 1,
					wonGames: _stats.wonGames + (won ? 1 : 0),
					distribution,
				}
			})
	} else {
		store.currentTile.set(0)
	}
}

const showError = (m: string, onPop?: (id?: number) => any) => {
	toast.pop()
	const toastOptions: SvelteToastOptions = {
		theme: { '--toastBackground': 'var(--error-color)' },
	}
	if (onPop) toastOptions.onpop = onPop
	toast.push(m, toastOptions)
}
