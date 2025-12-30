<script lang="ts" context="module">
	// Parabolic easing for gravity-like curve
	const easeInParabolic = 'cubic-bezier(0.33, 0, 0.67, 0.33)'
	const easeOutParabolic = 'cubic-bezier(0.33, 0.67, 0.67, 1)'

	export interface Particle {
		origin: XY
		rotation: number
		velocity: XY
		duration: number
		bounces: [time: number, toHeight: number, easing: string][]
	}

	const gravity = 600
	const elasticityMin = 0.1
	const elasticityMax = 0.4
	const restVelocity = 30

	export const calculateBounces = (startVelocity: number, startHeight = 0) => {
		let time = 0
		let height = startHeight
		let velocity = startVelocity
		const bounces: Particle['bounces'] = [[time, height, 'linear']]
		while (height < 0 || Math.abs(velocity) > restVelocity) {
			if (velocity < 0) {
				// Moving up
				const duration = -velocity / gravity
				height += (gravity / 2) * duration ** 2 + velocity * duration
				velocity = 0
				const durationMs = Math.round(duration * 1000)
				time += durationMs
				bounces[bounces.length - 1][2] = easeOutParabolic
				bounces.push([durationMs, height, 'linear'])
			} else if (velocity === 0) {
				// Free fall
				const duration = Math.sqrt(-height / (gravity / 2))
				velocity = duration * -gravity * randomFloat(elasticityMin, elasticityMax)
				height = 0
				const durationMs = Math.round(duration * 1000)
				time += durationMs
				bounces[bounces.length - 1][2] = easeInParabolic
				bounces.push([durationMs, height, 'linear'])
			} else {
				// Downward force
				const impactVelocity = Math.sqrt(velocity ** 2 + 2 * gravity * -height)
				const duration = (impactVelocity - velocity) / gravity
				velocity = -impactVelocity * randomFloat(elasticityMin, elasticityMax)
				height = 0
				const durationMs = Math.round(duration * 1000)
				time += durationMs
				bounces.push([durationMs, height, 'linear'])
			}
		}
		return { duration: time, bounces }
	}
</script>

<script lang="ts" generics="P extends Particle">
	import { randomFloat, type XY } from '$lib/math'
	import { onMount } from 'svelte'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let particles: P[]

	let elements: SVGGElement[] = []

	onMount(async () => {
		const animations: Promise<Animation>[] = []
		for (let i = 0; i < particles.length; i++) {
			const particle = particles[i]
			const element = elements[i]
			const keyframes: Keyframe[] = [
				/*{ transform: 'none', easing: easeOutParabolic }*/
			]
			let runningTime = 0
			for (let b = 0; b < particle.bounces.length; b++) {
				const [time, toHeight, easing] = particle.bounces[b]
				keyframes.push({
					transform: `translateY(${toHeight}px)`,
					opacity: b === particle.bounces.length - 1 ? 0 : 1,
					easing,
					offset: (runningTime + time) / particle.duration,
				})
				runningTime += time
			}
			animations.push(
				element.animate(keyframes, {
					duration: particle.duration,
					fill: 'both',
				}).finished
			)
		}
		await Promise.all(animations)
		dispatch('done')
	})
</script>

{#each particles as particle, p}
	<g
		style:transform-origin="{particle.origin[0]}px {particle.origin[1]}px"
		bind:this={elements[p]}
	>
		<g
			class="particle"
			style:transform-origin="{particle.origin[0]}px {particle.origin[1]}px"
			style:transform="translate({particle.velocity[0]}px, {particle.velocity[1]}px)
			rotate({particle.rotation}deg) scale(0.8)"
			style:animation-duration="{particle.duration}ms"
		>
			<slot {particle} />
		</g>
	</g>
{/each}

<style>
	.particle {
		animation: transform-from-init linear backwards;
	}

	@keyframes transform-from-init {
		0% {
			transform: none;
		}
	}
</style>
