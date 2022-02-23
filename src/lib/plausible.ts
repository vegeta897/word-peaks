import Plausible from 'plausible-tracker'
import { browser, dev } from '$app/env'

type EventName = 'gameWon' | 'firstFinish' | 'submitGuess' | 'resultShare' | 'gameLost'

const plausible = browser
	? Plausible({
			domain: 'vegeta897.github.io/wordle-peaks',
	  })
	: { trackPageview() {}, trackEvent() {} }

export const trackPageview = () => !dev && plausible.trackPageview()
export const trackEvent = (eventName: EventName) => !dev && plausible.trackEvent(eventName)
