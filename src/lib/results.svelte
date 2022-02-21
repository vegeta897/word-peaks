<script lang="ts">
	import { toast } from '@zerodevx/svelte-toast'

	// Don't use store, we don't want/need dynamic content for the results
	export let answer
	export let guesses
	export let gameWon
	export let newWord

	function share() {
		const score = gameWon ? guesses.length : 'X'
		const emojis = guesses
			.map((word) =>
				[...word]
					.map((letter, l) => {
						if (letter === answer[l]) return '🟩'
						return letter > answer[l] ? '🔽' : '🔼'
					})
					.join('')
			)
			.join('\n')
		const shareText = `Wordle Peaks ${score}/6\n\n${emojis}`
		toast.pop()
		navigator.clipboard.writeText(shareText).then(
			() =>
				toast.push('Score copied!', {
					theme: { '--toastBackground': 'var(--correct-color)' },
				}),
			() =>
				toast.push("Sorry, couldn't do that!", {
					theme: { '--toastBackground': 'var(--error-color)' },
				})
		)
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
		margin-top: 1.5rem;
		margin-bottom: 1rem;
		display: flex;
		justify-content: space-around;
		gap: 1rem;
	}

	button {
		background: var(--primary-color);
		border-radius: 4px;
		border: 0;
		padding: 0;
		flex: 1;
		height: 3rem;
		font-weight: 700;
		max-width: 10rem;
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
