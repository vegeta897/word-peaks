<script lang="ts">
	import { fly, squish } from '$lib/../lib/transitions'
	import { quadIn, quadOut } from 'svelte/easing'
	import {
		invalidWord,
		invalidWordPreview,
		invalidHardModeGuess,
		notEnoughLetters,
		currentTile,
	} from '$src/store'
	import type { Tile } from '$lib/data-model'

	export let tile: Tile
	export let current = false
	export let gameFinished = false
	export let showHint = false
	export let animate = false
	export let inCurrentRow = false

	let tileFlipDuration: number
	let tileFlipDelay: number

	$: tileFlipDuration = animate ? 250 : 0
	$: tileFlipDelay = animate ? 150 : 0

	const typeAnimation = {
		duration: 100,
		from: 'bottom',
		easing: quadOut,
	}
</script>

<div class="tile-container" on:click={() => inCurrentRow && currentTile.set(tile.id)}>
	{#if tile.scored}
		<div
			class="tile scored filled"
			class:correct={tile.distance === 0}
			class:before={tile.distance < 0}
			class:after={tile.distance > 0}
			in:squish|local={{
				easing: quadOut,
				delay: (tile.id + 1) * tileFlipDelay,
				duration: tileFlipDuration,
			}}
		>
			{tile.letter}
		</div>
	{:else}
		<div
			class="tile"
			class:filled={tile.letter !== ''}
			class:current
			class:before-pre={!tile.scored && tile.polarity < 0}
			class:after-pre={!tile.scored && tile.polarity > 0}
			class:finished={gameFinished}
			class:clickable={inCurrentRow}
			class:invalid={$invalidWordPreview && inCurrentRow}
			class:shimmy={$invalidWord && inCurrentRow}
			class:shake={inCurrentRow &&
				(($notEnoughLetters && !tile.letter) ||
					($invalidHardModeGuess &&
						tile.letter &&
						tile.letterBounds &&
						(tile.letter < tile.letterBounds[0] || tile.letter > tile.letterBounds[1])))}
			out:squish|local={{
				easing: quadIn,
				delay: tile.id * tileFlipDelay,
				duration: tileFlipDuration,
			}}
			style={`animation-delay: ${
				tile.id * ($notEnoughLetters || $invalidHardModeGuess ? 20 : 0)
			}ms`}
		>
			{#if tile.letter}<div in:fly={typeAnimation}>{tile.letter}</div>{/if}
			{#if tile.letterBounds && !tile.letter && showHint}
				{#if tile.letterBounds[0] !== tile.letterBounds[1]}
					<span class="hint"
						>{tile.letterBounds[0]}<span class="small">...</span>{tile.letterBounds[1]}</span
					>
				{:else}
					<span class="hint">{tile.letterBounds[0]}</span>
				{/if}
			{/if}
		</div>
	{/if}
	<slot />
</div>

<style>
	.tile-container {
		position: relative;
		width: 57px;
		height: 57px;
		margin: 0 3px;
	}

	.tile {
		font-size: 2rem;
		font-weight: 700;
		line-height: 2rem;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		text-transform: uppercase;
		box-sizing: border-box;
		border: 2px solid #5b505e;
		position: absolute;
		border-radius: 4px;
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
		background: var(--primary-color);
		border: 0;
	}
	.tile.correct {
		background: var(--correct-color);
	}
	.tile.clickable {
		cursor: pointer;
	}

	.tile.before {
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		background: var(--before-color);
	}

	.tile.after {
		border-bottom-left-radius: 20px;
		border-bottom-right-radius: 20px;
		background: var(--after-color);
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
		.tile-container {
			width: 53px;
			height: 53px;
		}
		.hint {
			font-size: 0.48em;
			gap: 4px;
		}
	}
	@media (max-width: 360px) {
		.tile-container {
			width: 48px;
			height: 48px;
			margin: 0 2px;
		}
		.hint {
			font-size: 0.45em;
			gap: 3px;
		}
	}
</style>
