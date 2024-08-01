import { derived, writable } from 'svelte/store'
import type { Writable, Readable } from 'svelte/store'
import { writable as storageWritable } from 'svelte-local-storage-store'
import type { Stats, GameDetail, TimeStats } from '$lib/stats'
import { newStats, newTimeStats } from '$lib/stats'
import { gameMode } from '$src/store/game-state'
import type { KeyboardLayout } from '$lib/constants'
import type { Landscape } from '$lib/landscape/landscape'

export const storeVersion: Writable<number> = storageWritable('wp-version', 0)
export const storedLocale: Writable<string> = storageWritable('wp-locale', '')

export const openScreen: Writable<null | 'options' | 'tutorial' | 'stats'> =
	writable(null)

export const highContrast: Writable<boolean> = storageWritable('wp-highContrast', false)
export const showAllHints: Writable<boolean> = storageWritable('wp-showAllHints', false)
export const swapEnterBackspace: Writable<boolean> = storageWritable(
	'wp-swapEnterBackspace',
	false
)
export const keyboardLayout: Writable<KeyboardLayout> = storageWritable(
	'wp-keyboardLayout',
	'alphabetic'
)
export const dyslexicFont: Writable<boolean> = storageWritable('wp-dyslexicFont', false)
export const allowDancing: Writable<boolean> = storageWritable('wp-allowDancing', true)
export const hideLandscape: Writable<boolean> = storageWritable('wp-hideLandscape', false)
export const shareURL: Writable<boolean> = storageWritable('wp-shareURL', true)
export const shareTimes: Writable<boolean> = storageWritable('wp-shareTimes', false)
export const preciseTimes: Writable<boolean> = storageWritable('wp-preciseTimes', false)

export const lastPlayedDaily: Writable<number> = storageWritable('wp-lastPlayedDaily', -1)

export const stats: Writable<Stats> = storageWritable('wp-stats', newStats())
export const timeStats: Writable<TimeStats> = storageWritable(
	'wp-timeStats',
	newTimeStats()
)
export const lastDailyDetail: Writable<GameDetail | null> = storageWritable(
	'wp-lastDailyDetail',
	null
)
export const lastRandomDetail: Writable<GameDetail | null> = storageWritable(
	'wp-lastRandomDetail',
	null
)
export const lastGameDetail: Readable<GameDetail | null> = derived(
	[gameMode, lastDailyDetail, lastRandomDetail],
	([$gameMode, $lastDailyDetail, $lastRandomDetail]) =>
		$gameMode === 'daily' ? $lastDailyDetail : $lastRandomDetail
)

export const showEndView: Writable<boolean> = writable(false)
export const guessTimeStrings: Writable<string[]> = writable([])
export const totalGuessTimeString: Writable<string> = writable()

export const landscape: Writable<Landscape> = writable()
export const landscapeNewGame: Writable<boolean> = writable(false)
export const landscapeNewRow: Writable<boolean> = writable(false)
export const landscapeWideView: Writable<boolean> = writable(false)
export const landscapeForceColor: Writable<boolean> = writable(false)
export const landscapeRedraw: Writable<boolean> = writable(false)
export const landscapeSVG: Writable<SVGElement | null> = writable(null)

export const newUser: Writable<boolean> = writable(false)

export const dismissPromo: Writable<number> = storageWritable('wp-dismissPromo', 0)
