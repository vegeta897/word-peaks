import { get } from 'svelte/store'
import { lastPlayedDaily, storeVersion } from './app'
import { answerDaily, guessesDaily } from './game-state'

const VERSION = 1

// Store version migration
const loadedStoreVersion = get(storeVersion)
if (!loadedStoreVersion || loadedStoreVersion < 1) {
	// New player
	lastPlayedDaily.set(-1)
	answerDaily.set('')
	guessesDaily.set([])
}
// else if (loadedStoreVersion < 2) ...
storeVersion.set(VERSION)

export * from './app'
export * from './game-state'
