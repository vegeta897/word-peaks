import { encodeWord, ROWS } from '$lib/data-model'
import type { GameMode } from '$lib/data-model'
import * as store from '$src/store'
import { get } from 'svelte/store'

export type Stats = {
	currentStreak: number
	bestStreak: number
	totalGames: number
	wonGames: number
	distribution: number[]
}

export const newStats = (): Stats => ({
	currentStreak: 0,
	bestStreak: 0,
	totalGames: 0,
	wonGames: 0,
	distribution: new Array(ROWS).fill(0),
})

export type GameDetail = {
	mode: GameMode
	dayNumber: number
	hardMode: boolean
	answer: string
	guesses: string[]
	guessTimes: number[]
	hash: string | null
}

export function saveGameDetail() {
	const mode = get(store.gameMode)
	store[mode === 'daily' ? 'lastDailyDetail' : 'lastRandomDetail'].set({
		mode,
		dayNumber: mode === 'daily' ? get(store.lastPlayedDaily) + 1 : 0,
		hardMode: get(store.lastPlayedWasHard),
		answer: get(store.answer),
		guesses: get(store.guesses),
		guessTimes: get(store.guessTimes),
		hash: mode === 'daily' ? null : encodeWord(get(store.answer)),
	})
}

export function recordGuessTime(row: number) {
	store[get(store.gameMode) === 'daily' ? 'guessTimesDaily' : 'guessTimesRandom'].update(
		(guessTimes) => {
			guessTimes[row] = new Date().getTime()
			return guessTimes
		}
	)
}

export const getHighestDistribution = (stats: Stats) =>
	stats.distribution.reduce((a, b) => Math.max(a, b), 1)
