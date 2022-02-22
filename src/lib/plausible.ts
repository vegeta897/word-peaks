import Plausible from 'plausible-tracker'
import { browser } from '$app/env'

export const { trackPageview, trackEvent } = browser
	? Plausible({
			domain: 'vegeta897.github.io/wordle-peaks',
	  })
	: { trackPageview() {}, trackEvent() {} }
