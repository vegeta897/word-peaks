import { derived, writable } from 'svelte/store'
import type { Writable, Readable } from 'svelte/store'
import { writable as storageWritable } from 'svelte-local-storage-store'
import type { Stats, GameDetail } from '$lib/stats'
import { newStats } from '$lib/stats'
import { gameMode } from '$src/store/game-state'
import type { KeyboardLayout } from '$lib/data-model'

export const storeVersion: Writable<number> = storageWritable('wp-version', 0)
export const storedLocale: Writable<string> = storageWritable('wp-locale', '')

export const openScreen: Writable<null | 'options' | 'tutorial' | 'results'> = writable(null)

export const highContrast: Writable<boolean> = storageWritable('wp-highContrast', false)
export const showAllHints: Writable<boolean> = storageWritable('wp-showAllHints', false)
export const swapEnterBackspace: Writable<boolean> = storageWritable('wp-swapEnterBackspace', false)
export const keyboardLayout: Writable<KeyboardLayout> = storageWritable(
	'wp-keyboardLayout',
	'alphabetic'
)
export const dyslexicFont: Writable<boolean> = storageWritable('wp-dyslexicFont', false)
export const shareURL: Writable<boolean> = storageWritable('wp-shareURL', true)
export const shareTimes: Writable<boolean> = storageWritable('wp-shareTimes', false)

export const lastPlayedDaily: Writable<number> = storageWritable('wp-lastPlayedDaily', -1)

export const stats: Writable<Stats> = storageWritable('wp-stats', newStats())
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

export const newUser: Writable<boolean> = writable(false)
