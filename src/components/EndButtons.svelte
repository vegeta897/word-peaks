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
	import Icon from './landscape/Icon.svelte'

	const { landscapeWideView, landscapeForceColor, landscapeRedraw } = store

	export let gameMode: GameMode

	let showScoreShareMenu: boolean
	let showImageShare: boolean
	let canvas: HTMLCanvasElement
	let canvasBlob: Blob
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
		showScoreShareMenu = false
		showImageShare = false
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
		showScoreShareMenu = false
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
		canvas.toBlob((blob) => {
			canvasBlob = blob!
			shareImage(canvasBlob, `${hash || dayNumber}`)
		})
		showImageShare = true
		trackEvent('resultShare')
		canvas.scrollIntoView({ block: 'center' })
	}

	async function onLandscapeShare() {
		const landscapeCanvas = await import('$lib/landscape/canvas')
		const color = get(store.landscapeForceColor)
		landscapeCanvas.drawLandscapeToCanvas(canvas, get(store.landscape), {
			color,
			highContrast: get(store.highContrast),
		})
		canvas.toBlob((blob) => {
			canvasBlob = blob!
			shareImage(canvasBlob, `${hash || dayNumber}-landscape${color ? '-color' : ''}`)
		})
		showImageShare = true
		trackEvent('landscapeShare')
		const { hash, dayNumber } = get(store.lastGameDetail)!
		canvas.scrollIntoView({ block: 'center' })
	}

	function onCopyImage() {
		try {
			copyImage(canvasBlob)
			showImageShare = false
			successToast(get(t)('main.messages.image_copied'))
		} catch (e) {
			errorToast()
		}
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

<svelte:window on:keydown={({ key }) => key === 'Escape' && (showImageShare = false)} />
<div class="container">
	<div class="actions" class:full-width={showScoreShareMenu}>
		{#if showScoreShareMenu}
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
				<button on:click={() => (showScoreShareMenu = true)}
					>{$t('main.results.share')}</button
				>
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
	{#if !showScoreShareMenu}
		<div class="landscape-controls">
			<button
				title={$t('main.other.wide_view')}
				class:cta-bg={$landscapeWideView}
				on:click={() => landscapeWideView.set(!$landscapeWideView)}
			>
				<Icon icon="wide" active={$landscapeWideView} />
			</button>
			<button
				title={$t('main.other.color')}
				class:cta-bg={$landscapeForceColor}
				on:click={() => landscapeForceColor.set(!$landscapeForceColor)}
			>
				<Icon icon="color" active={$landscapeForceColor} />
			</button>
			<button
				title={$t('main.other.redraw')}
				disabled={landscapeRedrawCooldown}
				on:click={() => {
					landscapeRedrawCooldown = true
					setTimeout(() => (landscapeRedrawCooldown = false), 2000)
					landscapeRedraw.set(true)
				}}
			>
				<Icon icon="redraw" />
			</button>
			<button title={$t('main.results.share')} on:click={onLandscapeShare}>
				<Icon icon="photo" />
			</button>
			<div class="promo">
				<a
					on:auxclick={() => trackEvent('promoLinkFollow')}
					on:click={() => trackEvent('promoLinkFollow')}
					href="https://buymeacoffee.com/vegeta897"
				>
					<span class="hide-on-small-screens">{$t('main.footer.donate')}</span>
					<span class="hide-on-big-screens">{$t('main.footer.donate_short')}</span>
				</a>
			</div>
		</div>
	{/if}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="modal-backdrop"
		role="dialog"
		on:click|self={() => (showImageShare = false)}
		style:display={showImageShare ? 'flex' : 'none'}
	>
		<div class="image-share">
			<canvas bind:this={canvas} />
			<button on:click={onCopyImage}>{$t('main.results.copy_image')}</button>
			<button
				title="Close"
				class="close-button"
				on:click={() => (showImageShare = false)}
			>
				<svg viewBox="0 0 4 4" xmlns="http://www.w3.org/2000/svg" width="32px">
					<path
						stroke="currentColor"
						fill="none"
						d="M1.2 1.2 l1.6 1.6 M1.2 2.8 l1.6 -1.6"
						stroke-width="0.5"
						stroke-linecap="round"
					/>
				</svg>
			</button>
		</div>
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
		transition: opacity 300ms ease-out;
		padding: 0.5rem 0;
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
		margin: 0 auto;
		padding: 0 0.25rem 0 0.5rem;
	}

	.label {
		order: -1;
		flex-grow: 1;
		font-size: 1.2em;
		margin: 0.875rem 0;
		padding-right: 0.625rem;
	}

	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 1rem;
		background: #1129;
		justify-content: center;
		align-items: center;
	}

	.image-share {
		padding: 1.5rem;
		border-radius: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		background: var(--tertiary-color);
		pointer-events: auto;
		position: relative;
	}

	.image-share button {
		height: 3rem;
		padding: 0 1rem;
		margin-top: 1rem;
	}

	.image-share button.close-button {
		width: 2.75rem;
		height: 2.75rem;
		padding: 0;
		position: absolute;
		top: -0.5rem;
		right: 0.5rem;
		background: var(--primary-color);
		border-radius: 100%;
	}

	.image-share button.close-button:hover {
		background: var(--secondary-color);
	}

	.hide-on-big-screens {
		display: none;
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
			font-size: 0.75em;
		}
		.landscape-controls {
			gap: 0.375rem;
		}
		.hide-on-small-screens {
			display: none;
		}
		.hide-on-big-screens {
			display: initial;
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
