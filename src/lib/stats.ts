import { encodeWord } from '$lib/data-model'
import type { GameMode } from '$lib/data-model'
import * as store from '$src/store'
import { get } from 'svelte/store'
import { ROWS } from './constants'

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

export type TimeStats = {
	gameCount: number
	guessTotals: number[]
	guessCounts: number[]
	fastestGame: number
}

export const newTimeStats = (): TimeStats => ({
	gameCount: 0,
	guessTotals: new Array(ROWS).fill(0),
	guessCounts: new Array(ROWS).fill(0),
	fastestGame: 0,
})

const getGameTime = (guessTimes: number[]) =>
	guessTimes[guessTimes.length - 1]! - guessTimes[0]

export function finishGame(won: boolean) {
	const mode = get(store.gameMode)
	let fastest = false
	if (mode === 'daily') {
		fastest = won && getGameTime(get(store.guessTimes)) < get(store.timeStats).fastestGame
		updateStats(won)
	}
	saveGameDetail(fastest)
}

function updateStats(won: boolean) {
	const guessCount = get(store.guesses).length
	store.stats.update((stats) => {
		const streak = won ? stats.currentStreak + 1 : 0
		const distribution = [...stats.distribution]
		distribution[guessCount - 1]++
		return {
			currentStreak: streak,
			bestStreak: streak > stats.bestStreak ? streak : stats.bestStreak,
			totalGames: stats.totalGames + 1,
			wonGames: stats.wonGames + (won ? 1 : 0),
			distribution,
		}
	})
	const guessTimes = get(store.guessTimes)
	const gameTime = getGameTime(guessTimes)
	store.timeStats.update((timeStats) => {
		const guessTotals = timeStats.guessTotals.map((t, g) =>
			g < guessCount ? t + (guessTimes[g + 1] - guessTimes[g]) : t
		)
		return {
			gameCount: timeStats.gameCount + 1,
			guessTotals,
			guessCounts: timeStats.guessCounts.map((c, g) => (g < guessCount ? c + 1 : c)),
			fastestGame:
				won && (timeStats.fastestGame === 0 || gameTime < timeStats.fastestGame)
					? gameTime
					: timeStats.fastestGame,
		}
	})
}

export type GameDetail = {
	mode: GameMode
	dayNumber: number
	hardMode: boolean
	answer: string
	guesses: string[]
	guessTimes: number[]
	hash: string | null
	fastest: boolean
}

function saveGameDetail(fastest: boolean) {
	const mode = get(store.gameMode)
	store[mode === 'daily' ? 'lastDailyDetail' : 'lastRandomDetail'].set({
		mode,
		dayNumber: mode === 'daily' ? get(store.lastPlayedDaily) + 1 : 0,
		hardMode: get(store.lastPlayedWasHard),
		answer: get(store.answer),
		guesses: get(store.guesses),
		guessTimes: get(store.guessTimes),
		hash: mode === 'daily' ? null : encodeWord(get(store.answer)),
		fastest,
	})
}

export function recordGuessTime(row: number) {
	const gameMode = get(store.gameMode)
	store[gameMode === 'daily' ? 'guessTimesDaily' : 'guessTimesRandom'].update(
		(guessTimes) => {
			if (row === 0) {
				resetPauseState()
			}
			const pauseTotal = get(store.pauseInfo)[gameMode].pauseTotal
			const guessTime = new Date().getTime() - pauseTotal
			return [...guessTimes.slice(0, row), guessTime]
		}
	)
}

export type PauseState = { paused: boolean; pausedAt: number; pauseTotal: number }
export const newPauseState = (): PauseState => ({
	paused: false,
	pausedAt: 0,
	pauseTotal: 0,
})

export function resetPauseState() {
	store.pauseInfo.update((info) => {
		info[get(store.gameMode)] = newPauseState()
		return info
	})
}

export function pauseTimer() {
	store.pauseInfo.update((info) => {
		const state = info[get(store.gameMode)]
		if (!state.paused) {
			state.paused = true
			state.pausedAt = new Date().getTime()
		}
		return info
	})
}

export function resumeTimer() {
	store.pauseInfo.update((info) => {
		const state = info[get(store.gameMode)]
		if (state.paused) {
			state.paused = false
			const now = new Date().getTime()
			state.pauseTotal += now - state.pausedAt
		}
		return info
	})
}
