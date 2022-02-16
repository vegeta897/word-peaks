<script lang="ts">
	export let boardContent
</script>

<div class="board">
	{#each boardContent as boardRow}
		<div class="board-row">
			{#each boardRow as tile}
				<div
					class="tile"
					class:filled={tile.letter !== ''}
					class:scored={tile.scored}
					class:correct={tile.scored && tile.direction === 0}
					class:before={tile.direction < 0}
					class:after={tile.direction > 0}
				>
					{tile.letter}
					<!-- Show valid letter range on tile, like [D...N] -->
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.board {
		padding: 0.5rem;
		box-sizing: border-box;
	}

	.board-row {
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.tile {
		font-size: 2rem;
		font-weight: bold;
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

	.tile.before {
		color: #f7f3b7;
		border-bottom-left-radius: 20px;
		border-bottom-right-radius: 20px;
		background: var(--primary-color) linear-gradient(180deg, var(--primary-color) 70%, #f7f3b7 800%);
	}

	.tile.after {
		color: #deceed;
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		background: var(--primary-color) linear-gradient(0deg, var(--primary-color) 70%, #deceed 800%);
	}
</style>
