// Because the in: directive seems to be broken
// Reference: https://svelte.dev/repl/e177537996964518a97c27dd0bee2d43?version=3.42.4

import type { AnimationConfig } from 'svelte/animate'

const dirs = {
	top: 'translateY(-',
	bottom: 'translateY(',
	left: 'translateX(-',
	right: 'translateX(',
}

export const fly = (node: HTMLElement, { from = 'top', ...opts }): AnimationConfig => ({
	...opts,
	tick: (t: number, u: number) => {
		node.style.setProperty('transform', `${dirs[from as keyof typeof dirs]}${u * 100.0}%)`)
		node.style.setProperty('opacity', `${t}`)
	},
})

export const fade = (node: HTMLElement, opts: any): AnimationConfig => ({
	...opts,
	tick: (t: number) => {
		node.style.setProperty('opacity', `${t}`)
	},
})

export const squish = (node: HTMLElement, opts: any): AnimationConfig => ({
	...opts,
	tick: (t: number) => {
		node.style.setProperty('transform', `scaleX(${t})`)
	},
})

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
