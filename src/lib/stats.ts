import { ROWS } from '$lib/data-model'
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
}

export function saveGameDetail() {
	const mode = get(store.gameMode)
	store.lastGameDetail.set({
		mode,
		dayNumber: mode === 'daily' ? get(store.lastPlayedDaily) + 1 : 0,
		hardMode: get(store.lastPlayedWasHard),
		answer: get(store.answer),
		guesses: get(store.guesses),
		guessTimes: get(store.guessTimes),
	})
}

export function recordGuessTime(row: number) {
	store.guessTimes.update((guessTimes) => {
		guessTimes[row] = new Date().getTime()
		return guessTimes
	})
}

export const getHighestDistribution = (stats: Stats) =>
	stats.distribution.reduce((a, b) => Math.max(a, b), 1)
