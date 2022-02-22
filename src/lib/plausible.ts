import Plausible from 'plausible-tracker'
import { browser } from '$app/env'

type EventName = 'gameWon' | 'firstFinish' | 'submitGuess' | 'resultShare' | 'gameLost'

const plausible = browser
	? Plausible({
			domain: 'vegeta897.github.io/wordle-peaks',
	  })
	: { trackPageview() {}, trackEvent() {} } // TODO: Still necessary?

export const { trackPageview } = plausible

export const trackEvent = (eventName: EventName) => plausible.trackEvent(eventName)
