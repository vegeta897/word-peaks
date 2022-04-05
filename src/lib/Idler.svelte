<script lang="ts">
	import { alphabet, pickRandom } from '$lib/data-model'
	import { onMount } from 'svelte'
	import { dance, danceEnd, danceStart, hopOut, letterPeek, spinJump } from '$lib/idle-animations'

	let letter = pickRandom(alphabet)

	// Nested divs to animate components of transform separately
	let letterTranslateX: HTMLDivElement
	let letterTranslateY: HTMLDivElement
	let letterRotate: HTMLDivElement
	let letterScale: HTMLDivElement

	const animationParts: Map<string, () => HTMLDivElement> = new Map([
		['translateX', () => letterTranslateX],
		['translateY', () => letterTranslateY],
		['rotate', () => letterRotate],
		['scale', () => letterScale],
	])

	const animate = async () => {
		// await letterAnchor.animate(letterPeek, {
		// 	duration: 1000,
		// 	endDelay: 1000,
		// 	fill: 'forwards',
		// }).finished
		// await letterAnchor.animate(hopOut, {
		// 	duration: 800,
		// 	endDelay: 400,
		// 	fill: 'forwards',
		// }).finished
		await Promise.all(
			[...animationParts.entries()].map(
				([partName, element]) =>
					spinJump[partName] &&
					element().animate(spinJump[partName], {
						duration: spinJump.duration,
						endDelay: spinJump.endDelay,
						fill: 'forwards',
					}).finished
			)
		)
		// await letterAnchor.animate(danceStart, {
		// 	duration: 400,
		// 	fill: 'forwards',
		// }).finished
		// await letterAnchor.animate(dance, {
		// 	duration: 1100,
		// 	fill: 'forwards',
		// 	iterations: 3,
		// }).finished
		// await letterAnchor.animate(danceEnd, {
		// 	duration: 700,
		// 	fill: 'forwards',
		// }).finished
		try {
			await animate()
		} catch (e) {}
	}

	onMount(() => {
		animate()
	})
</script>

<div class="frame">
	<div class="letter-anchor">
		<div class="letter-animation" bind:this={letterTranslateX}>
			<div class="letter-animation" bind:this={letterTranslateY}>
				<div class="letter-animation" bind:this={letterRotate}>
					<div class="letter-animation" bind:this={letterScale}>
						<div class="letter">
							{letter}
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
	}
	@media (max-width: 480px) {
		.letter-anchor {
			top: 13px;
			left: -37px;
			transform: scale(0.93);
		}
	}
	@media (max-width: 360px) {
		.letter-anchor {
			top: 10px;
			left: -34px;
			transform: scale(0.845);
		}
	}
</style>
