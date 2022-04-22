import { get } from 'svelte/store'
import { lastPlayedDaily, storeVersion } from './app'
import { answerDaily, guessesDaily } from './game-state'

const VERSION = 1

if (!get(storeVersion) || get(storeVersion) < VERSION) {
	storeVersion.set(VERSION)
	lastPlayedDaily.set(-1)
	answerDaily.set('')
	guessesDaily.set([])
}

export * from './app'
export * from './game-state'
