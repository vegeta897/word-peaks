<script lang="ts">
	import { toast } from '@zerodevx/svelte-toast'
	import { trackEvent } from '$lib/plausible'
	import { encodeWord, getDayEnd } from '$lib/data-model'
	import { onMount } from 'svelte'
	import { highContrast } from '$lib/store'
	import { get } from 'svelte/store'

	// Don't use store, we don't want/need dynamic content for the results
	export let answer
	export let guesses
	export let boardContent
	export let gameMode
	export let gameFinished
	export let gameWon
	export let dayNumber
	export let playDaily
	export let playRandom
	export let stats
	export let hash

	let nextMS
	const updateNextMS = () => (nextMS = getDayEnd(dayNumber) - new Date())
	updateNextMS()

	setInterval(() => {
		updateNextMS()
	}, 1000)

	$: nextWordReady = nextMS < 0

	const highestDistribution = stats.distribution.reduce((a, b) => Math.max(a, b), 1)

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
	let day = gameMode === 'random' ? '∞ ' : `#${dayNumber + 1} `
	let copyText = `Wordle Peaks ${day}${score}/6\n\n  ${emojis}`
	if (gameMode === 'random')
		copyText += `\nhttps://vegeta897.github.io/wordle-peaks/#${encodeWord(answer)}`

	function shareText() {
		shareMenu = false
		trackEvent('resultShare')
		toast.pop()
		navigator.clipboard.writeText(copyText).then(
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

	let shareMenu
	let imageShared

	let canvas: HTMLCanvasElement

	async function shareImage() {
		// https://benkaiser.dev/sharing-images-using-the-web-share-api/
		shareMenu = false
		imageShared = true
		trackEvent('resultShare')
		const imageUrl = canvas.toDataURL()
		const imageBlob = await (await fetch(imageUrl)).blob()
		const filesArray = [
			new File([imageBlob], `wordle-peaks-${gameMode === 'random' ? hash : day}.png`, {
				type: imageBlob.type,
				lastModified: new Date().getTime(),
			}),
		]
		const shareData = {
			files: filesArray,
		}
		await navigator.share(shareData)
	}

	onMount(() => {
		if (!canvas) return
		const ctx = canvas.getContext('2d')
		ctx.fillStyle = get(highContrast) ? '#161a25' : '#312236'
		ctx.fillRect(0, 0, 252, 300)
		const roundedRectangle = (x, y, w, h, rTop, rBottom?) => {
			rBottom = rBottom ?? rTop
			ctx.beginPath()
			ctx.moveTo(x + rTop, y)
			ctx.arcTo(x + w, y, x + w, y + h, rTop)
			ctx.arcTo(x + w, y + h, x, y + h, rBottom)
			ctx.arcTo(x, y + h, x, y, rBottom)
			ctx.arcTo(x, y, x + w, y, rTop)
			ctx.closePath()
			ctx.fill()
		}
		boardContent.forEach((row, r) => {
			if (r >= guesses.length) return
			row.forEach((tile, t) => {
				let topRadius = 5
				let bottomRadius = 5
				if (tile.distance === 0) {
					ctx.fillStyle = get(highContrast) ? '#64ba2e' : '#15a850'
				} else if (tile.distance > 0) {
					ctx.fillStyle = '#567de8'
					bottomRadius = 14
				} else {
					ctx.fillStyle = get(highContrast) ? '#da3f8b' : '#e38f2f'
					topRadius = 14
				}
				const x = 4 + t * 50
				const y = 4 + r * 50
				const l = 44
				roundedRectangle(x, y, l, l, topRadius, bottomRadius)
			})
		})
		ctx.font = '20px Arial'
		ctx.textAlign = 'center'
		ctx.fillStyle = '#cccccc'
		ctx.fillText(`Wordle Peaks ${day}${score}/6`, 126, guesses.length * 50 + 22)
	})
</script>

<section>
	<h2>{gameFinished ? (gameWon ? 'You got it! 🎉' : 'Oh no! ☹️') : 'Stats'}</h2>
	{#if gameFinished && !gameWon}
		<p>The answer was <strong>{answer.toUpperCase()}</strong></p>
	{/if}
	<div class="stats">
		<div class="stats-item">
			<strong>{stats.totalGames}</strong>
			Total games
		</div>
		<div class="stats-item">
			<strong>{Math.round((100 * stats.wonGames) / (stats.totalGames || 1))}%</strong>
			Win rate
		</div>
		<div class="stats-item">
			<strong>{stats.currentStreak}</strong>
			Current streak
		</div>
		<div class="stats-item">
			<strong>{stats.bestStreak}</strong>
			Best streak
		</div>
		<div class="distribution">
			<h3>Guess Distribution</h3>
			{#each stats.distribution as guessCount, c}
				<div class="bar-row">
					{c + 1}
					<div
						class="bar"
						style={`width: calc(22px + ${Math.round((100 * guessCount) / highestDistribution)}%)`}
					>
						{guessCount}
					</div>
				</div>
			{/each}
		</div>
		{#if gameMode === 'random'}<em>Stats only count daily games</em>{/if}
	</div>
	<div class="share">
		<div class="column">
			{#if nextWordReady}
				<div class="daily-text">Try today's word!</div>
				<button on:click={playDaily} class="daily-button">Play Daily</button>
			{:else}
				<div class="countdown">
					<h3>Next word</h3>
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
		<div class="column">
			{#if gameFinished}
				{#if shareMenu}
					<div class="share-buttons">
						<button on:click={shareText} class="share-button">Text</button>
						<button on:click={shareImage} class="share-button">Image</button>
					</div>
				{:else}
					<button on:click={() => (shareMenu = true)} class="share-button">Share</button>
				{/if}
			{/if}
			<button on:click={playRandom}>Play Random</button>
		</div>
	</div>
	<div class="image-share" class:hidden={!imageShared}>
		<canvas bind:this={canvas} width="252" height={guesses.length * 50 + 30} />
	</div>
</section>

<style>
	section {
		padding: 0 1rem 1rem;
	}

	h2 {
		font-size: 1.5em;
		margin: 0.6rem 0 1.2rem;
	}

	h3 {
		margin: 0.5rem 0;
	}

	h2,
	h3,
	p {
		text-align: center;
	}

	.stats {
		color: var(--text-color);
		display: flex;
		justify-content: center;
		margin-bottom: 1.4rem;
		flex-wrap: wrap;
	}

	.stats-item {
		width: 25%;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		text-align: center;
	}

	.stats-item strong {
		font-size: 1.8em;
	}

	.distribution {
		margin-top: 1rem;
		max-width: 20rem;
		flex-basis: 100%;
	}

	.bar-row {
		display: flex;
		align-items: baseline;
	}

	.bar {
		height: 20px;
		background-color: var(--accent-color);
		border-radius: 8px;
		margin-bottom: 6px;
		font-weight: 700;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-left: 8px;
	}

	.share {
		display: flex;
		justify-content: space-around;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		color: var(--text-color);
	}

	.column {
		display: flex;
		flex: 1 1 0;
		justify-content: space-around;
		flex-direction: column;
		align-items: stretch;
		gap: 1rem;
	}

	button {
		background: var(--primary-color);
		border-radius: 4px;
		border: 0;
		padding: 0 1.2rem;
		height: 3rem;
		font-size: 1.2em;
		font-weight: 700;
		min-width: 10rem;
	}

	button:hover {
		background: var(--secondary-color);
	}

	button:focus {
		outline: 1px solid #fff;
		outline-offset: 2px;
	}

	button.share-button {
		background: var(--cta-color);
	}

	button.share-button:hover {
		background: #3388de;
	}

	button.daily-button {
		background: #04883b;
	}

	button.daily-button:hover {
		background: var(--correct-color);
	}

	.share-buttons {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.share-buttons button {
		min-width: 3rem;
		width: 50%;
	}

	.daily-text {
		height: 3rem;
		font-size: 1.2em;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.countdown {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: center;
		align-content: space-around;
		text-align: center;
		font-size: 1.2em;
	}

	.countdown strong {
		font-size: 1.6em;
		padding: 0 0.6rem;
	}

	.image-share {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.hidden {
		display: none;
	}

	@media (max-width: 480px) {
		.stats-item {
			font-size: 0.8em;
		}
		.column {
			flex-basis: max-content;
		}
		.countdown strong {
			font-size: 1.2em;
		}
	}
</style>
