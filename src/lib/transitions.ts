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
