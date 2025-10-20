import Plausible from 'plausible-tracker'
import { browser, dev } from '$app/env'

// TODO: Consolidate into one game finished event
// with many properties about the game and user's options
// https://www.npmjs.com/package/plausible-tracker#tracking-custom-events-and-goals
// https://plausible.pixelatomy.com/vegeta897.github.io%2Fword-peaks/settings/properties
// Switch to this fork! https://github.com/Barbapapazes/plausible-tracker
// TODO: Track repeated guess in one game

type EventName =
	| 'gameWon'
	| 'firstFinish'
	| 'submitGuess'
	| 'resultShare'
	| 'gameLost'
	| 'idleOnFinish'
	| 'idleBeforeFinish' // TODO: Change to just "idle"
	| 'dailyFinish'
	| 'promoLinkFollow'
	| 'danceClick'
	| 'landscapeShare'
	| 'statsImported'

const plausible = browser
	? Plausible({
			domain: 'vegeta897.github.io/word-peaks',
			apiHost: 'https://plausible.pixelatomy.com',
	  })
	: { trackPageview() {}, trackEvent() {} }

export const trackPageview = () => track('pageview')
export const trackEvent = (eventName: EventName) => track(eventName)

function track(type: 'pageview' | EventName) {
	if (dev) {
		console.log('Tracked', type, 'event')
		return
	}
	try {
		if (type === 'pageview') plausible.trackPageview()
		else plausible.trackEvent(type)
	} catch (e) {
		console.warn(`Failed to track ${type}`, e)
	}
}
