<script lang="ts">
	import { alphabet } from '$lib/data-model'
	import Peaks from '$lib/peaks.svelte'

	export let currentRow
	export let currentTile
	export let boardContent
	export let correctLetter
	export let invalidLetters
	export let gameFinished

	$: upperValid = alphabet.find((letter) => !invalidLetters.has(letter))
	$: lowerValid = [...alphabet].reverse().find((letter) => !invalidLetters.has(letter))
</script>

<div class="container">
	<div class="board" class:finished={gameFinished}>
		{#each boardContent as boardRow, r}
			<div class="tile-row">
				{#each boardRow as tile}
					<div
						class="tile"
						class:filled={tile.letter !== ''}
						class:scored={tile.scored}
						class:correct={tile.scored && tile.distance === 0}
						class:before={tile.distance < 0}
						class:after={tile.distance > 0}
						class:current={r === currentRow && tile.id === currentTile}
					>
						{tile.letter}
						{#if !gameFinished && currentRow > 0 && r === currentRow && tile.id === currentTile}
							{#if !correctLetter}
								<span class="hint">{upperValid} <span class="small">...</span> {lowerValid}</span>
							{/if}
							{#if correctLetter}
								<span class="hint">{correctLetter}</span>
							{/if}
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>

	<div class="graph" class:minimized={currentRow === 0}>
		<Peaks {boardContent} {currentRow} />
	</div>
</div>

<style>
	.container {
		margin: 0 auto 20px;
		padding: 0 4px;
		display: flex;
		justify-content: center;
	}

	.board {
		display: flex;
		flex-direction: column;
	}

	.tile-row {
		margin-bottom: 0.4rem;
		display: flex;
	}

	.tile-row:last-child {
		margin-bottom: 0;
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
		border: 2px solid #666;
		position: relative;
		border-radius: 4px;
		width: 3.55rem;
		height: 3.55rem;
		margin: 0 0.15rem;
		color: #eee;
		transition: border-radius 300ms ease-out;
	}
	.finished .tile {
		border-color: #444;
	}
	.tile.filled {
		border-color: #888;
	}
	.tile.scored {
		background: var(--primary-color);
		border: 0;
	}
	.tile.correct {
		background: var(--correct-color);
	}

	.board:not(.finished) .tile.current {
		border-color: #bbb;
	}

	.tile.before {
		color: #f6ecd9;
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		background: #e99637 linear-gradient(0deg, #e99637 0%, #de793a 100%);
	}

	.tile.after {
		color: #e4e3f3;
		border-bottom-left-radius: 20px;
		border-bottom-right-radius: 20px;
		background: #3859b3 linear-gradient(180deg, #3859b3 0%, #3e3b65 100%);
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

	.graph {
		margin-left: 0.3rem;
		width: 204px;
		transition: width 300ms ease-out;
		height: 23.25rem;
	}

	.graph.minimized {
		width: 0;
	}

	@media (max-width: 480px) {
		.tile {
			width: 3.3rem;
			height: 3.3rem;
		}
		.graph {
			width: 118px;
			height: 21.8rem;
		}
	}
</style>
