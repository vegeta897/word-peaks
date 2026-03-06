import { derived, writable } from 'svelte/store'
import type { Writable, Readable } from 'svelte/store'
import { persisted } from 'svelte-persisted-store'
import type { Stats, GameDetail, TimeStats } from '$lib/stats'
import { newStats, newTimeStats } from '$lib/stats'
import { gameMode } from '$src/store/game-state'
import type { KeyboardLayout } from '$lib/constants'
import type { Landscape } from '$lib/landscape/landscape'

const PREFIX = 'wp24-'

const prefixPersisted = <T extends Parameters<typeof persisted>[1]>(
	key: string,
	initialValue: T
) => persisted(PREFIX + key, initialValue)

export const storeVersion: Writable<number> = prefixPersisted('version', 0)
export const storedLocale: Writable<string> = prefixPersisted('locale', '')

export const openScreen: Writable<null | 'options' | 'tutorial' | 'stats'> =
	writable(null)

export const highContrast: Writable<boolean> = prefixPersisted('highContrast', false)
export const showAllHints: Writable<boolean> = prefixPersisted('showAllHints', false)
export const previewInvalidWords: Writable<boolean> = prefixPersisted(
	'previewInvalidWords',
	true
)
export const swapEnterBackspace: Writable<boolean> = prefixPersisted(
	'swapEnterBackspace',
	false
)
export const keyboardLayout: Writable<KeyboardLayout> = prefixPersisted(
	'keyboardLayout',
	'alphabetic'
)
export const dyslexicFont: Writable<boolean> = prefixPersisted('dyslexicFont', false)
export const allowDancing: Writable<boolean> = prefixPersisted('allowDancing', true)
export const hideLandscape: Writable<boolean> = prefixPersisted('hideLandscape', false)
export const shareURL: Writable<boolean> = prefixPersisted('shareURL', true)
export const shareTimes: Writable<boolean> = prefixPersisted('shareTimes', false)
export const hideArrows: Writable<boolean> = prefixPersisted('hideArrows', false)
export const preciseTimes: Writable<boolean> = prefixPersisted('preciseTimes', false)
export const tileSharpness: Writable<number> = prefixPersisted('tileSharpness', 0.72)
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

export const lastPlayedDaily: Writable<number> = prefixPersisted('lastPlayedDaily', -1)

export const stats: Writable<Stats> = prefixPersisted('stats', newStats())
export const timeStats: Writable<TimeStats> = prefixPersisted('timeStats', newTimeStats())
export const lastDailyDetail: Writable<GameDetail | null> = prefixPersisted(
	'lastDailyDetail',
	null
)
export const lastRandomDetail: Writable<GameDetail | null> = prefixPersisted(
	'lastRandomDetail',
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

export const dismissPromo: Writable<number> = prefixPersisted('dismissPromo', 0)
