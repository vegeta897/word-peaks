import { get } from 'svelte/store'
import * as app from '$src/store/app'
import type { GameMode } from '$lib/data-model'
import type { GameDetail } from '$lib/stats'
import { keyboardLayoutNames, ROWS, WORD_LENGTH } from '$lib/data-model'
import { newStats } from '$lib/stats'
import * as game from '$src/store/game-state'

// TODO: Add a validate.html page that displays all localstorage values

const isValidAnswer = (value: any) =>
	!value ||
	(typeof value !== 'string' && !(<any>value instanceof String)) ||
	value.length !== WORD_LENGTH

export function validateLocalStorage() {
	// Options
	if (![true, false].includes(get(app.highContrast))) app.highContrast.set(false)
	if (![true, false].includes(get(app.showAllHints))) app.showAllHints.set(false)
	if (![true, false].includes(get(app.swapEnterBackspace))) app.swapEnterBackspace.set(false)
	if (![true, false].includes(get(app.dyslexicFont))) app.dyslexicFont.set(false)
	if (![true, false].includes(get(app.shareURL))) app.shareURL.set(true)
	if (![true, false].includes(get(app.shareTimes))) app.shareTimes.set(false)
	if (!keyboardLayoutNames.includes(get(app.keyboardLayout))) app.keyboardLayout.set('qwerty')

	// Stats
	const stats = get(app.stats)
	if (!(stats.currentStreak >= 0)) stats.currentStreak = 0
	if (!(stats.bestStreak >= 0)) stats.bestStreak = 0
	if (!(stats.totalGames >= 0)) stats.totalGames = 0
	if (!(stats.wonGames >= 0)) stats.wonGames = 0
	if (!Array.isArray(stats.distribution) || stats.distribution.length !== ROWS)
		stats.distribution = newStats().distribution
	for (let d = 0; d < stats.distribution.length; d++) {
		if (!(stats.distribution[d] >= 0)) stats.distribution[d] = 0
	}
	app.stats.set(stats)

	// Last game details
	const lastDetails: [GameMode, GameDetail | null][] = [
		['daily', get(app.lastDailyDetail)],
		['random', get(app.lastRandomDetail)],
	]
	lastDetails.forEach(([detailName, detailValue]) => {
		if (detailValue === null) return
		try {
			if (detailValue.mode !== detailName) throw 'wrong mode'
			if (!(detailValue.dayNumber >= 0)) throw 'invalid day number'
			if (![true, false].includes(detailValue.hardMode)) throw 'invalid hard mode setting'
			if (isValidAnswer(detailValue.answer)) throw 'invalid answer'
			if (
				!Array.isArray(detailValue.guesses) ||
				detailValue.guesses.length < 1 ||
				detailValue.guesses.length > ROWS
			)
				throw 'invalid guesses array'
			if (detailValue.guesses.some(isValidAnswer)) throw 'invalid guess(es)'
			if (
				!Array.isArray(detailValue.guessTimes) ||
				detailValue.guessTimes.length !== detailValue.guesses.length + 1
			)
				throw 'invalid guessTimes array'
			const now = new Date().getTime()
			for (let t = 0; t < detailValue.guessTimes.length; t++) {
				if (!(detailValue.guessTimes[t] >= now - 1e12)) throw 'invalid guess time'
			}
		} catch (e) {
			if (detailName === 'daily') app.lastDailyDetail.set(null)
			else app.lastRandomDetail.set(null)
		}
	})

	// Game state
	if (isValidAnswer(get(game.answerDaily))) game.answerDaily.set('')
	if (isValidAnswer(get(game.answerRandom))) game.answerRandom.set('')
	if (![true, false].includes(get(game.lastPlayedDailyWasHard)))
		game.lastPlayedDailyWasHard.set(false)
	if (![true, false].includes(get(game.lastPlayedRandomWasHard)))
		game.lastPlayedRandomWasHard.set(false)
	const guessData: [typeof game.guessesDaily, typeof game.guessTimesDaily][] = [
		[game.guessesDaily, game.guessTimesDaily],
		[game.guessesRandom, game.guessTimesRandom],
	]
	guessData.forEach(([guesses, guessTimes]) => {
		try {
			if (
				!Array.isArray(get(guesses)) ||
				get(guesses).length > ROWS ||
				get(guesses).some(isValidAnswer)
			)
				throw 'invalid guess(es)'
			if (!Array.isArray(get(guessTimes)) || get(guessTimes).length !== get(guesses).length + 1)
				throw 'invalid guessTimes array'
			const now = new Date().getTime()
			for (let t = 0; t < get(guessTimes).length; t++) {
				if (!(get(guessTimes)[t] >= now - 1e12)) throw 'invalid guess time'
			}
		} catch (e) {
			guesses.set([])
			guessTimes.set([])
		}
	})
}
