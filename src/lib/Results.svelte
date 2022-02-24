<script lang="ts">
	import { toast } from '@zerodevx/svelte-toast'
	import { trackEvent } from '$lib/plausible'
	import { getDayEnd } from '$lib/data-model'

	// Don't use store, we don't want/need dynamic content for the results
	export let answer
	export let guesses
	export let gameWon
	export let newWord
	export let dayNumber

	let nextMS
	const updateNextMS = () => (nextMS = getDayEnd(dayNumber) - new Date())
	updateNextMS()

	setInterval(() => {
		updateNextMS()
	}, 1000)

	$: nextWordReady = nextMS < 0

	const HOUR = 3600000
	const MINUTE = 60000

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
		.join('\n  ')

	const shareText = `Wordle Peaks #${dayNumber} ${score}/6\n\n  ${emojis}`

	function share() {
		trackEvent('resultShare')
		toast.pop()
		navigator.clipboard.writeText(shareText).then(
			() =>
				toast.push('Score copied!', {
					theme: { '--toastBackground': 'var(--cta-color)' },
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
				{#if nextWordReady}
					<button on:click={newWord}>New word</button>
				{:else}
					<div class="countdown">
						<h4>Next word</h4>
						<strong
							>{`${Math.floor(nextMS / HOUR)}`.padStart(2, '0')}:{`${Math.floor(
								(nextMS % HOUR) / MINUTE
							)}`.padStart(2, '0')}:{`${Math.floor((nextMS % MINUTE) / 1000)}`.padStart(
								2,
								'0'
							)}</strong
						>
					</div>
				{/if}
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
		color: var(--text-color);
	}

	pre {
		white-space: pre-wrap;
		font-size: 1.2em;
		margin: 0;
		padding: 1rem;
		min-width: 8rem;
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

	pre,
	.button-group {
		flex: 1 1 0;
	}

	button {
		background: var(--primary-color);
		border-radius: 4px;
		border: 0;
		padding: 0 1.2rem;
		height: 3rem;
		font-size: 1.2em;
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

	.countdown {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		align-content: space-around;
		text-align: center;
	}

	h4 {
		width: 6rem;
		margin: 0.5rem 0;
	}

	.countdown strong {
		font-size: 1.4em;
		padding: 0 0.6rem;
	}
</style>
