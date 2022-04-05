<script lang="ts">
	import { alphabet, pickRandom } from '$lib/data-model'
	import { onMount } from 'svelte'

	let letter = pickRandom(alphabet)
	const letterPeek: Keyframe[] = [
		{ transform: 'rotate(0)', easing: 'ease-in-out' },
		{ transform: 'translateX(10px) rotate(20deg)' },
	]
	const hopOut: Keyframe[] = [
		{ transform: 'translateX(10px) rotate(20deg)', easing: 'ease-out' },
		{ transform: 'translateX(10px) rotate(20deg) scaleY(0.8)', offset: 0.4, easing: 'ease-in' },
		{ transform: 'translateX(10px) rotate(20deg) scaleY(1.2)', offset: 0.5 },
		{ transform: 'translate(20px,-7px) rotate(20deg) scaleY(1)' },
		{ transform: 'translate(24px,-10px) rotate(10deg) scaleY(1)' },
		{ transform: 'translate(28px,-7px) rotate(5deg) scaleY(1)' },
		{ transform: 'translate(32px,0) rotate(0) scaleY(0.8)' },
		{ transform: 'translate(32px,0) rotate(0) scaleY(1)' },
	]
	const danceStart: Keyframe[] = [
		{ transform: 'translate(32px,0) rotate(0) scaleY(1)', easing: 'ease-in-out' },
		{ transform: 'translate(32px,0) rotate(-3deg) scaleY(0.8)' },
	]
	const dance: Keyframe[] = [
		{ transform: 'translate(32px,0) rotate(-3deg) scaleY(0.8)', easing: 'ease-out' },
		{ transform: 'translate(32px,0) rotate(-6deg) scaleY(1.1)', easing: 'ease-in' },
		{ transform: 'translate(32px,0) rotate(3deg) scaleY(0.8)', easing: 'ease-out' },
		{ transform: 'translate(32px,0) rotate(6deg) scaleY(1.1)', easing: 'ease-in' },
		{ transform: 'translate(32px,0) rotate(-3deg) scaleY(0.8)' },
	]
	const danceEnd: Keyframe[] = [
		{ transform: 'translate(32px,0) rotate(-3deg) scaleY(0.8)', easing: 'ease-out' },
		{ transform: 'translate(32px,0) rotate(-6deg) scaleY(1.1)', easing: 'ease-in-out' },
		{ transform: 'translate(32px,0) rotate(0) scaleY(1)' },
	]

	let letterAnchor: HTMLDivElement

	const animate = async () => {
		await letterAnchor.animate(letterPeek, {
			duration: 1000,
			endDelay: 1000,
			fill: 'forwards',
		}).finished
		await letterAnchor.animate(hopOut, {
			duration: 800,
			endDelay: 400,
			fill: 'forwards',
		}).finished
		await letterAnchor.animate(danceStart, {
			duration: 400,
			fill: 'forwards',
		}).finished
		await letterAnchor.animate(dance, {
			duration: 1100,
			fill: 'forwards',
			iterations: 4,
		}).finished
		await letterAnchor.animate(danceEnd, {
			duration: 700,
			fill: 'forwards',
		}).finished
		await animate()
	}

	onMount(() => {
		animate()
	})
</script>

<div class="frame">
	<div class="letter-anchor" bind:this={letterAnchor}>
		<div class="letter">
			{letter}
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
		transform: translate(0px, 0) rotate(0deg) scaleY(1);
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
			top: 17px;
			left: -38px;
		}
		.letter {
			top: -2px;
			font-size: 1.8rem;
		}
	}
	@media (max-width: 360px) {
		.letter-anchor {
			top: 16px;
			left: -34px;
		}
		.letter {
			top: -1.5px;
			font-size: 1.6rem;
		}
	}
</style>
