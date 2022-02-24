<script lang="ts">
	import { fly, squish } from '$lib/transitions.ts'
	import { quadIn, quadOut } from 'svelte/easing'

	export let tile
	export let current = false
	export let gameFinished = false
	export let validLetterBounds = []
	export let showHint = false
	export let animate = false

	$: tileFlipDuration = animate ? 250 : 0
	$: tileFlipDelay = animate ? 150 : 0

	const typeAnimation = {
		duration: 100,
		from: 'bottom',
		easing: quadOut,
	}
</script>

<div class="tile-container">
	{#if tile.scored}
		<div
			class="tile scored filled"
			class:correct={tile.distance === 0}
			class:before={tile.distance < 0}
			class:after={tile.distance > 0}
			in:squish={{
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
			out:squish={{ easing: quadIn, delay: tile.id * tileFlipDelay, duration: tileFlipDuration }}
		>
			{#if tile.letter}<div in:fly={typeAnimation}>{tile.letter}</div>{/if}
			{#if showHint && current}
				{#if validLetterBounds[0] !== validLetterBounds[1]}
					<span class="hint"
						>{validLetterBounds[0]} <span class="small">...</span>
						{validLetterBounds[1]}</span
					>
				{:else}
					<span class="hint">{validLetterBounds[0]}</span>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style>
	.tile-container {
		position: relative;
		width: 3.55rem;
		height: 3.55rem;
		margin: 0 0.15rem;
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
		color: #eee;
		transition: border-color 100ms ease-out;
		text-shadow: 1px 1px 1px #0006;
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

	.tile.current:not(.finished) {
		border-color: #bbb;
	}

	.tile.before {
		color: var(--before-text-color);
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		background: var(--before-color);
	}

	.tile.after {
		color: var(--after-text-color);
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

	.hint {
		font-size: 0.45em;
		font-weight: 400;
		color: #999;
		padding-top: 12px;
	}

	.small {
		line-height: 1em;
		font-size: 0.7em;
	}

	@media (max-width: 480px) {
		.tile-container {
			width: 3.3rem;
			height: 3.3rem;
		}
	}
</style>
