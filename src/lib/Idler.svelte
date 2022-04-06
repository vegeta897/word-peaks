<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import type { AnimationPart, MultipartAnimation } from '$lib/idle-animations'
	import { AnimationParts } from '$lib/idle-animations'
	import type { IdleSchedule } from '$lib/idle-scheduler'
	import { getSchedule } from '$lib/idle-scheduler'

	let mounted = false
	let letter: string
	export let id: string

	// Nested divs to animate transform functions separately
	let letterTranslateX: HTMLDivElement
	let letterTranslateY: HTMLDivElement
	let letterRotate: HTMLDivElement
	let letterScale: HTMLDivElement

	const animationParts: Map<AnimationPart, () => HTMLDivElement> = new Map([
		['translateX', () => letterTranslateX],
		['translateY', () => letterTranslateY],
		['rotate', () => letterRotate],
		['scale', () => letterScale],
	])

	const performAnimation = (
		animation: MultipartAnimation,
		endDelay = 0,
		iterations = 1,
		fill: FillMode = 'forwards'
	): Promise<Awaited<Animation | void>[]> => {
		return Promise.all(
			AnimationParts.map((part) => {
				const element = animationParts.get(part)!()
				if (element && animation[part]) {
					return element.animate(animation[part]!, {
						duration: animation.duration,
						iterations,
						endDelay,
						fill,
					}).finished
				} else {
					return Promise.resolve()
				}
			})
		)
	}

	const animate = async ({ animations }: IdleSchedule) => {
		for (const animation of animations) {
			if (!mounted) break
			await performAnimation(animation.animation, animation.endDelay || 0, animation.iterations)
		}
	}

	onMount(async () => {
		mounted = true
		while (mounted && !document.hidden) {
			const schedule = await getSchedule(id)
			letter = schedule.letter
			await animate(schedule)
		}
	})
	onDestroy(() => (mounted = false))
</script>

<div class="frame">
	<div class="letter-anchor">
		<div class="letter-animation" bind:this={letterTranslateX}>
			<div class="letter-animation" bind:this={letterTranslateY}>
				<div class="letter-animation" bind:this={letterRotate}>
					<div class="letter-animation" bind:this={letterScale}>
						<div class="letter">
							{letter || ''}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.frame {
		overflow: hidden;
		position: relative;
		left: 2px;
		top: 2px;
		width: calc(100% - 4px);
		height: calc(100% - 4px);
		border-radius: 2px;
	}
	.letter-anchor {
		position: relative;
		left: -40px;
		top: 18px;
		width: 100%;
		height: 100%;
	}
	.letter-animation {
		position: relative;
		width: 100%;
		height: 100%;
	}
	.letter {
		position: relative;
		top: -3px;
		text-transform: uppercase;
		font-weight: 700;
		color: #5b505e;
		font-size: 2rem;
		text-align: center;
		user-select: none;
	}
	@media (max-width: 480px) {
		.letter-anchor {
			top: 16px;
			left: -37px;
			transform: scale(0.93);
		}
		.letter {
			top: -6px;
		}
	}
	@media (max-width: 360px) {
		.letter-anchor {
			top: 14px;
			left: -34px;
			transform: scale(0.845);
		}
		.letter {
			top: -7px;
		}
	}
</style>
