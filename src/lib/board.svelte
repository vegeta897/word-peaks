<script lang="ts">
	export let boardContent
</script>

<div class="board">
	{#each boardContent as boardRow}
		<div class="board-row">
			{#each boardRow as tileLetter}
				<div class="tile">{tileLetter}</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.board {
		width: 350px;
		height: 420px;
		display: grid;
		grid-template-rows: repeat(6, 1fr);
		grid-gap: 5px;
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
		border: 2px solid #777;
	}
</style>
