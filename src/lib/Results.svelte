<script lang="ts">
	import { toast } from '@zerodevx/svelte-toast'
	import { trackEvent } from '$lib/plausible'

	// Don't use store, we don't want/need dynamic content for the results
	export let answer
	export let guesses
	export let gameWon
	export let newWord

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

	function share() {
		trackEvent('resultShare')
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
		<h3>You won 🎉</h3>
		<p>Nice job!</p>
	{:else}
		<h3>You lost ☹️</h3>
		<p>The answer was <strong>{answer.toUpperCase()}</strong></p>
	{/if}
	{#if shareText}<div class="share">
			<pre>{shareText}</pre>
			<div class="button-group">
				<button on:click={share} class="cta">Share</button>
				<button on:click={newWord}>New word</button>
			</div>
		</div>{/if}
</section>

<style>
	section {
		padding: 0 1rem 1rem;
	}

	h2 {
		font-size: 1.5em;
		text-align: center;
	}
	h3 {
		font-size: 1.2em;
	}

	.share {
		display: flex;
		justify-content: space-around;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	pre {
		white-space: pre-line;
		font-size: 1.2em;
		margin: 0;
		padding: 1rem;
		color: var(--text-color);
		background: var(--secondary-color);
		border-radius: 8px;
	}

	.button-group {
		display: flex;
		justify-content: space-around;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	button {
		background: var(--primary-color);
		border-radius: 4px;
		border: 0;
		padding: 0 1.2rem;
		height: 3rem;
		font-weight: 700;
		width: 9rem;
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
