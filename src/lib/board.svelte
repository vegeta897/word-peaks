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
					<!--					<div class="arrow" />-->
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.board {
		width: 350px;
		height: 460px;
		display: grid;
		grid-template-rows: repeat(6, 1fr);
		grid-gap: 13px;
		padding: 10px;
		box-sizing: border-box;
	}

	.board-row {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-gap: 5px;
	}

	.tile {
		width: 100%;
		font-size: 2rem;
		font-weight: bold;
		line-height: 2rem;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		vertical-align: middle;
		text-transform: uppercase;
		box-sizing: border-box;
		border: 2px solid #666;
		position: relative;
		border-radius: 4px;
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
		/*color: rgb(222, 152, 131);*/
		color: #f7f3b7;
		border-bottom-left-radius: 20px;
		border-bottom-right-radius: 20px;
		background: var(--primary-color) linear-gradient(180deg, var(--primary-color) 70%, #f7f3b7 800%);
	}

	.tile.after {
		/*color: rgb(135, 156, 224);*/
		color: #deceed;
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		background: var(--primary-color) linear-gradient(0deg, var(--primary-color) 70%, #deceed 800%);
	}

	.tile .arrow {
		display: none;
	}

	.tile.before .arrow,
	.tile.after .arrow {
		display: block;
		position: absolute;
		width: 0;
		height: 0;
		font-size: 1.1rem;
		/*border-left: 10px solid transparent;*/
		/*border-right: 10px solid transparent;*/
		left: 23px;
	}

	.tile.before .arrow {
		/*border-top: 10px solid rgba(75, 110, 224, 0.5);*/
		top: 36px;
	}
	.tile.after .arrow {
		/*border-bottom: 10px solid rgba(222, 108, 74, 0.5);*/
		top: -6px;
	}

	.tile.before .arrow:before {
		content: '▽';
	}
	.tile.after .arrow:before {
		content: '△';
	}
</style>
