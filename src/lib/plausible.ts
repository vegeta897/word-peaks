import Plausible from 'plausible-tracker'
import { browser, dev } from '$app/env'

type EventName =
	| 'gameWon'
	| 'firstFinish'
	| 'submitGuess'
	| 'resultShare'
	| 'gameLost'
	| 'idleOnFinish'
	| 'idleBeforeFinish'

const plausible = browser
	? Plausible({
			domain: 'vegeta897.github.io/wordle-peaks',
			apiHost: 'https://plausible.pixelatomy.com',
	  })
	: { trackPageview() {}, trackEvent() {} }

export const trackPageview = () => !dev && plausible.trackPageview()
export const trackEvent = (eventName: EventName) => !dev && plausible.trackEvent(eventName)
