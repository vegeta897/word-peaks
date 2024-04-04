<script lang="ts">
	import Toggle from 'svelte-toggle'
	import { trackEvent } from '$lib/plausible'
	import { get, type Writable } from 'svelte/store'
	import { t } from '$lib/translations'
	import * as store from '$src/store'
	import { toast } from '@zerodevx/svelte-toast'
	import {
		copyImage,
		copyText,
		drawResults,
		getShareTitle,
		shareImage,
		getEmojiGrid,
	} from '$lib/share'
	import { onMount } from 'svelte'
	import Time from './Time.svelte'
	import {
		getDayEnd,
		getRandomWord,
		playDaily,
		playRandom,
		type GameMode,
	} from '$lib/data-model'

	const { landscapeFullView, landscapeForceColor, landscapeRedraw } = store

	export let gameMode: GameMode

	let shareMenu: boolean
	let imageShared: boolean
	let canvas: HTMLCanvasElement
	let shareTitleText: string
	let landscapeRedrawCooldown = false

	const toastOptions = { theme: { '--toastBackground': 'var(--cta-color)' } }
	const successToast = (message: string) => toast.push(message, toastOptions)
	const errorToast = () => toast.push(get(t)('main.messages.could_not_do'), toastOptions)

	const toggle = (prop: Writable<boolean>) => () => prop.set(!get(prop))

	const toggleOptions = [
		{
			bind: store.shareURL,
			label: 'main.options.include_link',
			click: toggle(store.shareURL),
		},
		{
			bind: store.shareTimes,
			label: 'main.options.include_times',
			click: toggle(store.shareTimes),
		},
	]

	function shareText() {
		shareMenu = false
		imageShared = false
		trackEvent('resultShare')
		const emojiGridParams: Parameters<typeof getEmojiGrid>[0] = {
			guesses: get(store.guesses),
			answer: get(store.answer),
		}
		let totalTime = ''
		if (get(store.shareTimes)) {
			totalTime = `\n  ${get(t)('main.summary.total_time')}: ${get(
				store.totalGuessTimeString
			)}`
			emojiGridParams.guessTimes = get(store.guessTimeStrings)
		}
		let url = ''
		const lastGameDetail = get(store.lastGameDetail)!
		if (get(store.shareURL)) {
			url = '\nhttps://wordpeaks.com'
			if (lastGameDetail.hash) url += `/#${lastGameDetail.hash}`
		}
		copyText(
			shareTitleText + '\n\n' + getEmojiGrid(emojiGridParams) + totalTime + url
		).then(
			() => successToast(get(t)('main.messages.score_copied')),
			() => errorToast()
		)
	}

	async function onBoardImageShare() {
		shareMenu = false
		imageShared = true
		const { hash, dayNumber } = get(store.lastGameDetail)!
		drawResults(canvas, {
			highContrast: get(store.highContrast),
			boardContent: get(store.boardContent),
			guesses: get(store.guesses),
			caption: shareTitleText,
			guessTimes: get(store.shareTimes) ? get(store.guessTimeStrings) : undefined,
			totalTime: get(store.shareTimes) ? get(store.totalGuessTimeString) : undefined,
			showURL: get(store.shareURL),
			hash: hash || undefined,
		})
		trackEvent('resultShare')
		await shareImage(canvas, `${hash || dayNumber}`)
		canvas.scrollIntoView({ block: 'center' })
	}

	function onCopyImage() {
		try {
			copyImage(canvas)
			successToast(get(t)('main.messages.image_copied'))
		} catch (e) {
			errorToast()
		}
	}

	async function onLandscapeShare() {
		const landscapeShare = await import('$lib/landscape/share')
		const color = get(store.landscapeForceColor)
		landscapeShare.drawLandscapeToCanvas(canvas, get(store.landscape), {
			color,
			highContrast: get(store.highContrast),
		})
		imageShared = true
		trackEvent('landscapeShare')
		const { hash, dayNumber } = get(store.lastGameDetail)!
		await shareImage(canvas, `${hash || dayNumber}-landscape${color ? '-color' : ''}`)
		canvas.scrollIntoView({ block: 'center' })
	}

	const nextDailyTime = getDayEnd(get(store.lastPlayedDaily)).getTime()
	let nextWordReady = nextDailyTime < Date.now()
	const nextWordInterval = setInterval(
		() => (nextWordReady = nextDailyTime < Date.now()),
		1000
	)

	onMount(() => {
		shareTitleText = getShareTitle({
			gameWon: get(store.gameWon),
			guesses: get(store.guesses),
			gameMode: get(store.lastGameDetail)!.mode,
			hardMode: get(store.lastPlayedWasHard),
			day: get(store.lastGameDetail)!.dayNumber,
		})
		return () => clearInterval(nextWordInterval)
	})
</script>

<div class="container">
	<div class="actions" class:full-width={shareMenu}>
		{#if shareMenu}
			<div class="share-buttons">
				<button on:click={shareText}>{$t('main.results.text')}</button>
				<button on:click={onBoardImageShare}>{$t('main.results.image')}</button>
			</div>
			<div class="share-options">
				{#each toggleOptions as toggleOption}
					<Toggle
						toggled={get(toggleOption.bind)}
						on:click={toggleOption.click}
						hideLabel
						label={$t(toggleOption.label)}
						style="transform: scale(1.2); touch-action: manipulation; flex-basis: 2.5rem;"
						toggledColor="var(--accent-color)"
						untoggledColor="#695d6e"
					>
						<div class="label">{$t(toggleOption.label)}</div>
					</Toggle>
				{/each}
			</div>
		{:else}
			<div class="action-items">
				<button on:click={() => (shareMenu = true)}>{$t('main.results.share')}</button>
				{#if gameMode === 'daily'}
					{#if nextWordReady}
						<button class="play-button" on:click={playDaily}
							>{$t('main.results.play_daily')}</button
						>
					{:else}
						<div class="countdown">
							<Time mode="countdown" alwaysShowHours ms={nextDailyTime} class="time">
								<h3 slot="title">{$t('main.results.next_word')}</h3>
							</Time>
						</div>
					{/if}
				{:else}
					<button class="play-button" on:click={() => playRandom(getRandomWord())}
						>{$t('main.results.play_random')}</button
					>
				{/if}
			</div>
		{/if}
	</div>
	{#if !shareMenu}
		<div class="landscape-controls">
			<button
				title="Full view"
				class:cta-bg={$landscapeFullView}
				on:click={() => landscapeFullView.set(!$landscapeFullView)}>🏞️</button
			>
			<button
				title="Color"
				class:cta-bg={$landscapeForceColor}
				on:click={() => landscapeForceColor.set(!$landscapeForceColor)}>🎨</button
			>
			<button
				title="Redraw"
				disabled={landscapeRedrawCooldown}
				on:click={() => {
					landscapeRedrawCooldown = true
					setTimeout(() => (landscapeRedrawCooldown = false), 2000)
					landscapeRedraw.set(true)
				}}
			>
				🖌️
			</button>
			<button title={$t('main.results.share')} on:click={onLandscapeShare}>📸</button>
			<div class="promo">
				<a
					on:auxclick={() => trackEvent('promoLinkFollow')}
					on:click={() => trackEvent('promoLinkFollow')}
					href="https://buymeacoffee.com/vegeta897"
					>Buy me a <span class="hide-on-small-screens">coffee </span>☕</a
				>
			</div>
		</div>
	{/if}
	<div class="image-share" style:display={imageShared && !shareMenu ? 'flex' : 'none'}>
		<canvas bind:this={canvas} />
		<button on:click={onCopyImage}>{$t('main.results.copy_image')}</button>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		width: 100%;
		height: 100%;
		padding: 0.5rem;
		box-sizing: border-box;
	}

	.actions {
		width: calc(var(--board-width) - 0.5rem);
		height: 100%;
		padding: 1rem;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-radius: 0.75rem;
		background: var(--secondary-color);
	}

	.full-width {
		width: 100%;
	}

	.action-items {
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-rows: 1fr 1fr;
		gap: 0.5rem;
	}

	.play-button {
		background: #04883b;
	}
	.play-button:hover {
		background: var(--correct-color);
	}

	.countdown {
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-align: center;
	}

	.countdown h3 {
		font-size: 1.25em;
		margin: 0 0 0.3rem;
	}

	.countdown :global(.time) {
		font-weight: 700;
		font-size: 1.5em;
		padding: 0 0.6rem;
	}

	.landscape-controls {
		flex: 1 0 92px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		box-sizing: border-box;
	}

	.landscape-controls button {
		background: var(--primary-color);
		font-size: 2em;
		transition: opacity 300ms ease-out;
	}

	.landscape-controls button:hover {
		background: var(--secondary-color);
		text-decoration: none;
	}

	.landscape-controls button:disabled {
		opacity: 0.5;
	}

	.landscape-controls button.cta-bg {
		background: var(--cta-color);
	}

	.landscape-controls .promo {
		grid-column: 1 / span 2;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	button {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 6px;
		border: 0;
		padding: 0;
		font-size: 1.5em;
		font-weight: 700;
		background: var(--cta-color);
	}

	button:hover {
		background: #3388de;
	}

	button:focus {
		outline: 1px solid #fff;
		outline-offset: 2px;
	}

	.share-buttons {
		width: calc(var(--board-width) - 2.5rem);
		height: 100%;
		display: grid;
		grid-template-rows: 1fr 1fr;
		gap: 0.5rem;
	}

	.share-options {
		max-width: 220px;
		flex-grow: 1;
		margin: 0 1rem;
	}

	.label {
		order: -1;
		flex-grow: 1.5;
		font-size: 1.2em;
		margin: 0.5rem 0;
		padding: 0.4rem 0.8rem 0.4rem 0;
	}

	.image-share {
		width: 100%;
		margin-top: 4.5rem;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.image-share canvas {
		padding: 0.25rem;
		border: 1px solid var(--primary-color);
		border-radius: 0.5rem;
		box-shadow: 0 0 0.5rem var(--primary-color);
	}

	.image-share button {
		height: 3rem;
		padding: 0 1rem;
		margin-top: 1rem;
	}

	@media (max-width: 430px) {
		button {
			font-size: 1.25em;
		}
		.actions {
			padding: 0.5rem;
		}
		.share-buttons {
			width: 50%;
		}
		.share-options {
			margin: 0 0.75rem;
			font-size: 0.75em;
		}
		.landscape-controls button {
			font-size: 1.5em;
		}
		.hide-on-small-screens {
			display: none;
		}
	}

	@media (max-width: 340px) {
		.actions {
			width: 100%;
		}
		.landscape-controls {
			display: none;
		}
	}
</style>
