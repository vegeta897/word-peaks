<script lang="ts">
	import { fly, fade } from '$lib/../lib/transitions'
	import { quadOut } from 'svelte/easing'
	import {
		invalidWord,
		invalidWordPreview,
		invalidHardModeGuess,
		notEnoughLetters,
		currentTile,
		gameFinished,
		currentRow,
		lastPlayedDaily,
	} from '$src/store'
	import type { Tile } from '$lib/data-model'
	import { aprilFools } from '$lib/share'

	export let tile: Tile
	export let current = false
	export let showHint = false
	export let inCurrentRow = false

	let animate = !tile.scored
	currentRow.subscribe(() => {
		animate = !tile.scored
	})

	const tileFlipDelay = 150

	const typeAnimation = {
		duration: 100,
		from: 'bottom',
		easing: quadOut,
	}

	$: isAprilFools = $lastPlayedDaily && aprilFools()
</script>

<div
	class="tile-container"
	class:correct={tile.scored && tile.distance === 0}
	class:before={tile.distance < 0}
	class:after={tile.distance > 0}
	class:animate
	class:shimmy={$invalidWord && inCurrentRow}
	class:shake={inCurrentRow &&
		(($notEnoughLetters && !tile.letter) ||
			($invalidHardModeGuess &&
				tile.letter &&
				tile.letterBounds &&
				(tile.letter < tile.letterBounds[0] || tile.letter > tile.letterBounds[1])))}
	class:pea={isAprilFools}
	style={`animation-delay: ${
		tile.id * ($notEnoughLetters || $invalidHardModeGuess ? 20 : 0)
	}ms; --tile-animation-delay: ${tile.id * tileFlipDelay}ms;`}
	on:click={() => inCurrentRow && currentTile.set(tile.id)}
>
	{#if tile.scored}
		<div class="tile-background" />
		<div class="tile scored filled">{tile.letter}</div>
	{:else}
		<div
			class="tile"
			class:filled={tile.letter !== ''}
			class:current
			class:before-pre={!tile.scored && tile.polarity < 0}
			class:after-pre={!tile.scored && tile.polarity > 0}
			class:finished={$gameFinished}
			class:clickable={inCurrentRow}
			class:invalid={$invalidWordPreview && inCurrentRow}
			out:fade|local={{
				delay: tile.id * tileFlipDelay + 300,
				duration: tile.polarity === 0 && isAprilFools ? 100 : 0,
			}}
		>
			{#if tile.letter}<div in:fly={typeAnimation}>{tile.letter}</div>{/if}
			{#if tile.letterBounds && !tile.letter && showHint}
				<span class="hint"
					>{tile.letterBounds[0]}
					{#if tile.letterBounds[0] !== tile.letterBounds[1]}
						<span class="small">...</span>{tile.letterBounds[1]}
					{/if}
				</span>
			{/if}
		</div>
	{/if}
	<slot />
</div>

<style>
	.tile-container {
		position: relative;
		width: var(--tile-size);
		height: var(--tile-size);
		margin: 0 calc(var(--tile-margin) / 2);
		overflow: hidden;
	}

	.tile-container.correct {
		overflow: visible;
	}

	.tile-container.animate.correct::after {
		content: '';
		display: block;
		opacity: 0;
		width: 100%;
		height: 100%;
		border-radius: 14%;
		animation-fill-mode: backwards;
		animation-name: glow;
		animation-duration: 0.8s;
		animation-timing-function: ease-in;
		animation-delay: var(--tile-animation-delay);
		box-shadow: 0 0 10px var(--correct-color);
	}

	.tile-container.animate.correct.pea::after {
		border-radius: 100%;
	}

	.tile-background {
		width: 100%;
		height: 100%;
		border-radius: 14%;
		position: absolute;
		animation-delay: var(--tile-animation-delay);
		top: 0;
		left: 0;
	}

	.correct .tile-background {
		background: var(--correct-color);
	}

	.correct.pea .tile-background {
		border-radius: 100%;
	}

	.correct.animate .tile-background {
		animation-fill-mode: backwards;
		animation-name: illuminate;
		animation-duration: 0.5s;
		animation-timing-function: ease-in;
	}

	.before .tile-background {
		border-top-left-radius: 35%;
		border-top-right-radius: 35%;
		background: var(--before-color);
	}

	.before.animate .tile-background {
		animation-fill-mode: backwards;
		animation-name: rise, bulge-upper;
		animation-duration: 0.5s;
		animation-timing-function: ease-in, ease-out;
	}

	.after .tile-background {
		border-bottom-left-radius: 35%;
		border-bottom-right-radius: 35%;
		background: var(--after-color);
	}

	.after.animate .tile-background {
		animation-fill-mode: backwards;
		animation-name: drop, bulge-lower;
		animation-duration: 0.5s;
		animation-timing-function: ease-in, ease-out;
	}

	@keyframes drop {
		0% {
			transform: translateY(-102%);
		}
		40% {
			transform: translateY(0);
		}
	}

	@keyframes rise {
		0% {
			transform: translateY(102%);
		}
		40% {
			transform: translateY(0);
		}
	}

	@keyframes bulge-lower {
		40% {
			border-bottom-left-radius: 50%;
			border-bottom-right-radius: 50%;
		}
		60% {
			border-bottom-left-radius: 14%;
			border-bottom-right-radius: 14%;
		}
		100% {
			border-bottom-left-radius: 35%;
			border-bottom-right-radius: 35%;
		}
	}

	@keyframes bulge-upper {
		40% {
			border-top-left-radius: 50%;
			border-top-right-radius: 50%;
		}
		60% {
			border-top-left-radius: 14%;
			border-top-right-radius: 14%;
		}
		100% {
			border-top-left-radius: 35%;
			border-top-right-radius: 35%;
		}
	}

	@keyframes illuminate {
		0% {
			background-color: transparent;
		}
		60% {
			background-color: var(--correct-color);
		}
	}

	@keyframes glow {
		10% {
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	.tile {
		line-height: var(--tile-font-size);
		font-size: var(--tile-font-size);
		font-weight: 700;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		text-transform: uppercase;
		box-sizing: border-box;
		border: 2px solid #5b505e;
		position: absolute;
		border-radius: 14%;
		width: 100%;
		height: 100%;
		color: #fff;
		transition: border-color 70ms ease-out;
		text-shadow: 1px 1px 1px #0003;
		user-select: none;
	}
	.tile.finished {
		border-color: #433a46;
	}
	.tile.filled {
		border-color: #988a9d;
	}
	.tile.scored {
		border: 0;
	}
	.tile.clickable {
		cursor: pointer;
	}

	.tile.before-pre:not(.finished) {
		color: var(--before-color);
		border-color: var(--before-color);
	}

	.tile.after-pre:not(.finished) {
		color: var(--after-color);
		border-color: var(--after-color);
	}

	.tile.current:not(.finished) {
		border-color: #ddd;
		border-width: 3px;
	}

	.tile-container .tile.invalid {
		color: #d81946;
	}

	.hint {
		font-size: 0.5em;
		font-weight: 400;
		color: #bbb;
		padding-top: 12px;
		text-shadow: none;
		display: flex;
		align-items: baseline;
		gap: 5px;
	}

	.small {
		line-height: 1em;
		font-size: 0.7em;
	}

	.shimmy {
		animation: shimmy ease-out;
		animation-duration: 300ms;
	}

	.shake {
		animation: shake ease-out;
		animation-duration: 300ms;
	}

	@keyframes shimmy {
		0%,
		100% {
			transform: translate(0, 0);
		}
		25% {
			transform: translate(0.4rem, 0);
		}
		50% {
			transform: translate(-0.3rem, 0);
		}
		75% {
			transform: translate(0.2rem, 0);
		}
	}

	@keyframes shake {
		0%,
		100% {
			transform: translate(0, 0);
		}
		25% {
			transform: translate(0, -0.4rem);
		}
		50% {
			transform: translate(0, 0.3rem);
		}
		75% {
			transform: translate(0, -0.2rem);
		}
	}

	@media (max-width: 480px) {
		.hint {
			font-size: 0.48em;
			gap: 4px;
		}
	}
	@media (max-width: 360px) {
		.tile-container {
			margin: 0 1px;
		}
		.hint {
			font-size: 0.45em;
			gap: 3px;
		}
	}
	@media (max-width: 340px) {
		.tile-container {
			margin: 0 2px;
		}
	}
</style>
