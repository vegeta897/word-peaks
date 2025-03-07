export const bezierEasing = {
	cubicIn: '0.32, 0, 0.67, 0',
	cubicOut: '0.33, 1, 0.68, 1',
	cubicInOut: '0.65, 0, 0.35, 1',
	sineIn: '0.12, 0, 0.39, 0',
	sineOut: '0.61, 1, 0.88, 1',
	sineInOut: '0.37, 0, 0.63, 1',
	circIn: '0.55, 0, 1, 0.45',
	circOut: '0, 0.55, 0.45, 1',
	circInOut: '0.85, 0, 0.15, 1',
	expoIn: '0.7, 0, 0.84, 0',
	expoOut: '0.16, 1, 0.3, 1',
	easeOut: '0, 0, 0.58, 1',
} as const

// Based on https://codepen.io/danwilson/pen/xGBKVq
export const animationSupported = (): boolean => {
	// Unfortunately we can't risk having Chrome iOS's flickering animation bugs
	if (navigator.userAgent.match('iPhone.*CriOS')) return false
	const element = document.createElement('a')
	document.body.appendChild(element)
	if (!element.animate) return false
	const player = element.animate(
		{ opacity: [1, 0.5, 0.75] },
		{ iterations: 1, duration: 100, fill: 'forwards' }
	)
	if (!player || !player.finished || !player.finished.then) return false
	player.pause()
	player.currentTime = 50
	const midOpacity = parseFloat(window.getComputedStyle(element).opacity)
	player.finish()
	const endOpacity = parseFloat(window.getComputedStyle(element).opacity)
	element.remove()
	return midOpacity === 0.5 && endOpacity === 0.75
}
