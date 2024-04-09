import { get } from 'svelte/store'
import { lastPlayedDaily, storeVersion } from './app'
import { answerDaily, guessesDaily } from './game-state'
import { validateLocalStorage } from './validation'

export const STORE_VERSION = 1

// Store version migration
const loadedStoreVersion = get(storeVersion)
if (!loadedStoreVersion || loadedStoreVersion < 1) {
	// New player
	lastPlayedDaily.set(-1)
	answerDaily.set('')
	guessesDaily.set([])
}
// else if (loadedStoreVersion < 2) ...
storeVersion.set(STORE_VERSION)

validateLocalStorage()

export * from './app'
export * from './game-state'
