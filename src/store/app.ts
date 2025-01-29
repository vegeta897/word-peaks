import { derived, writable } from 'svelte/store'
import type { Writable, Readable } from 'svelte/store'
import { persisted } from 'svelte-persisted-store'
import type { Stats, GameDetail, TimeStats } from '$lib/stats'
import { newStats, newTimeStats } from '$lib/stats'
import { gameMode } from '$src/store/game-state'
import type { KeyboardLayout } from '$lib/constants'
import type { Landscape } from '$lib/landscape/landscape'

export const storeVersion: Writable<number> = persisted('wp-version', 0)
export const storedLocale: Writable<string> = persisted('wp-locale', '')

export const openScreen: Writable<null | 'options' | 'tutorial' | 'stats'> =
	writable(null)

export const highContrast: Writable<boolean> = persisted('wp-highContrast', false)
export const showAllHints: Writable<boolean> = persisted('wp-showAllHints', false)
export const previewInvalidWords: Writable<boolean> = persisted(
	'wp-previewInvalidWords',
	true
)
export const swapEnterBackspace: Writable<boolean> = persisted(
	'wp-swapEnterBackspace',
	false
)
export const keyboardLayout: Writable<KeyboardLayout> = persisted(
	'wp-keyboardLayout',
	'alphabetic'
)
export const dyslexicFont: Writable<boolean> = persisted('wp-dyslexicFont', false)
export const allowDancing: Writable<boolean> = persisted('wp-allowDancing', true)
export const hideLandscape: Writable<boolean> = persisted('wp-hideLandscape', false)
export const shareURL: Writable<boolean> = persisted('wp-shareURL', true)
export const shareTimes: Writable<boolean> = persisted('wp-shareTimes', false)
export const hideArrows: Writable<boolean> = persisted('wp-hideArrows', false)
export const preciseTimes: Writable<boolean> = persisted('wp-preciseTimes', false)
export const tileSharpness: Writable<number> = persisted('wp-tileSharpness', 0.72)
export const tileArrowRadius: Readable<string> = derived(
	[tileSharpness],
	([$tileSharpness]) => {
		if ($tileSharpness <= 1) {
			return `${14 + $tileSharpness * 36}%`
		} else {
			return `50% ${50 + ($tileSharpness - 1) * 36}%`
		}
	}
)

export const lastPlayedDaily: Writable<number> = persisted('wp-lastPlayedDaily', -1)

export const stats: Writable<Stats> = persisted('wp-stats', newStats())
export const timeStats: Writable<TimeStats> = persisted('wp-timeStats', newTimeStats())
export const lastDailyDetail: Writable<GameDetail | null> = persisted(
	'wp-lastDailyDetail',
	null
)
export const lastRandomDetail: Writable<GameDetail | null> = persisted(
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

export const dismissPromo: Writable<number> = persisted('wp-dismissPromo', 0)
