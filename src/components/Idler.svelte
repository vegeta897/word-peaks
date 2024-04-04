<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import type { AnimationPart, MultipartAnimation } from '$lib/idle-animations'
	import { AnimationParts } from '$lib/idle-animations'
	import type { IdleSchedule } from '$lib/idle-scheduler'
	import { getSchedule, startAnimation, stopAnimation } from '$lib/idle-scheduler'
	import { randomInt, sleep } from '$lib/math'

	let mounted = false
	let letter: string
	export let id: string

	// Nested divs to animate transform functions separately
	let letterTranslateX: HTMLDivElement
	let letterTranslateY: HTMLDivElement
	let letterRotate: HTMLDivElement
	let letterScale: HTMLDivElement

	const animationParts: Record<AnimationPart, () => HTMLDivElement> = {
		translateX: () => letterTranslateX,
		translateY: () => letterTranslateY,
		rotate: () => letterRotate,
		scale: () => letterScale,
	}

	const performAnimation = async (
		animation: MultipartAnimation,
		endDelay = 0,
		iterations = 1,
		fill: FillMode = 'forwards'
	): Promise<void> => {
		await Promise.all(
			AnimationParts.map(async (part) => {
				const element = animationParts[part]()
				if (element && animation[part]) {
					await element.animate(animation[part]!, {
						duration: animation.duration,
						iterations,
						endDelay,
						fill,
					}).finished
				}
			})
		)
	}

	const animate = async ({ animations }: IdleSchedule) => {
		for (const animation of animations) {
			if (!mounted) break
			await performAnimation(
				animation.animation,
				animation.endDelay || 0,
				animation.iterations
			)
		}
	}

	onMount(async () => {
		mounted = true
		await sleep(randomInt(1, 100)) // Ensures random first idler
		while (mounted) {
			const schedule = getSchedule(id)
			if ('wait' in schedule) {
				await sleep(schedule.wait)
				continue
			}
			letter = schedule.letter
			if (document.hidden || !mounted) continue
			startAnimation(id)
			await animate(schedule)
			stopAnimation(id)
			await sleep(10 * 1000) // Minimum 10 seconds before animating again
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
							{'W' || letter || ''}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.frame {
		position: relative;
		left: 2px;
		top: 2px;
		width: calc(100% - 4px);
		height: calc(100% - 4px);
		border-radius: 11%;
	}
	.letter-anchor {
		transform: scale(1.25) translate(-40px, 20px);
		width: 100%;
		height: 100%;
	}
	.letter-animation {
		width: 100%;
		height: 100%;
	}
	.letter {
		position: relative;
		top: 3px;
		text-transform: uppercase;
		font-weight: 700;
		color: #5b505e;
		font-size: 2rem;
		text-align: center;
		user-select: none;
	}

	@media (max-width: 720px) {
		.letter-anchor {
			transform: scale(1.25) translate(-40px, 18px);
		}
		.letter {
			top: 0;
		}
	}
	@media (max-width: 640px) {
		.letter-anchor {
			transform: translate(-40px, 20px);
		}
		.letter {
			top: -3px;
		}
	}
	@media (max-width: 560px) {
		.letter-anchor {
			transform: translate(-40px, 16px);
		}
	}
	@media (max-width: 480px) {
		.letter {
			top: -6px;
		}
	}
	@media (max-width: 430px) {
		.letter-anchor {
			transform: translate(-40px, 14px);
		}
		.letter {
			top: -7px;
		}
	}
	@media (max-width: 390px) {
		.letter-anchor {
			transform: scale(0.95) translate(-40px, 13px);
		}
		.letter {
			top: -9px;
		}
	}
	@media (max-width: 375px) {
		.letter-anchor {
			transform: scale(0.9) translate(-40px, 14px);
		}
		.letter {
			top: -10px;
		}
	}
</style>
