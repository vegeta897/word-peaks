<script lang="ts">
	import { toast } from '@zerodevx/svelte-toast'

	export let gameFinished
	export let gameWon
	export let boardContent
	export let newWord
	export let answer

	function share() {
		const boardContentFiltered = boardContent.filter((row) => row.every((t) => t.letter !== ''))
		const score = gameWon ? boardContentFiltered.length : 'X'
		const emojis = boardContentFiltered
			.map((row) =>
				row
					.map((tile) => {
						if (tile.polarity === 0) return '🟩'
						return tile.polarity > 0 ? '🔽' : '🔼'
					})
					.join('')
			)
			.join('\n')
		navigator.clipboard.writeText(`Wordle Peaks ${score}/6\n\n${emojis}`)
		toast.pop()
		toast.push('Score copied!')
	}
</script>

<section>
	<h2>Results</h2>
	{#if gameWon}
		<h3>You won</h3>
		<p>Nice job!</p>
	{:else}
		<h3>You lost ☹️</h3>
		<p>The answer was <strong>{answer.toUpperCase()}</strong></p>
	{/if}
	<div class="button-group">
		<button on:click={newWord}>New word</button>
		<button on:click={share} class="cta">Share</button>
	</div>
</section>

<style>
	section {
		padding: 0 1rem;
	}

	h2 {
		font-size: 1.5em;
		text-align: center;
	}
	h3 {
		font-size: 1.2em;
	}

	.button-group {
		display: flex;
		gap: 4rem;
	}

	button {
		background: var(--primary-color);
		border-radius: 4px;
		border: 0;
		padding: 0;
		flex: 1;
		height: 3rem;
		font-weight: 700;
	}

	button:hover {
		background: var(--secondary-color);
	}

	button:focus {
		outline: 1px solid #fff;
		outline-offset: 2px;
	}

	button.cta {
		background: var(--cta-color);
	}

	button.cta:hover {
		background: #3388de;
	}
</style>
