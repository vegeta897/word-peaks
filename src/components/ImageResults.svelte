<script lang="ts">
	import * as store from '$src/store'
	import { t } from '$lib/translations'
	import { trackEvent } from '$lib/plausible'
	import { drawResults, copyImage, shareImage } from '$lib/share'
	import { get } from 'svelte/store'
	import Modal from './Modal.svelte'
	import { toast } from '@zerodevx/svelte-toast'

	export let shareTitleText: string

	const canvas = document.createElement('canvas')
	let modalComponent: Modal
	let canvasBlob: Blob
	let imageFileName: string
	let canvasImageURL: string
	let canvasImageAltText: string
	let canvasWidth = 0
	let canvasHeight = 0

	const toastOptions = { theme: { '--toastBackground': 'var(--cta-color)' } }
	const successToast = (message: string) => toast.push(message, toastOptions)
	const errorToast = () => toast.push(get(t)('main.messages.could_not_do'), toastOptions)

	export async function shareBoardImage() {
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
			hideArrows: get(store.hideArrows),
			tileSharpness: get(store.tileSharpness),
		})
		canvas.toBlob((blob) => (canvasBlob = blob!))
		imageFileName = `${hash || dayNumber}`
		canvasImageURL = canvas.toDataURL()
		canvasImageAltText = `Word Peaks #${hash || dayNumber} results`
		canvasWidth = canvas.width
		canvasHeight = canvas.height
		modalComponent.openModal()
		trackEvent('resultShare')
		canvas.scrollIntoView({ block: 'center' })
	}

	export async function shareLandscapeImage() {
		const landscapeCanvas = await import('$lib/landscape/canvas')
		const color = get(store.landscapeForceColor)
		landscapeCanvas.drawLandscapeToCanvas(canvas, get(store.landscape), {
			color,
			highContrast: get(store.highContrast),
		})
		const { hash, dayNumber } = get(store.lastGameDetail)!
		canvas.toBlob((blob) => (canvasBlob = blob!))
		imageFileName = `${hash || dayNumber}-landscape${color ? '-color' : ''}`
		canvasImageURL = canvas.toDataURL()
		canvasImageAltText = `Word Peaks #${hash || dayNumber} landscape`
		canvasWidth = canvas.width
		canvasHeight = canvas.height
		modalComponent.openModal()
		trackEvent('landscapeShare')
		canvas.scrollIntoView({ block: 'center' })
	}

	function onCopyImage() {
		try {
			copyImage(canvasBlob)
			successToast(get(t)('main.messages.image_copied'))
		} catch (e) {
			errorToast()
		}
		modalComponent.closeModal()
	}

	function onShareImage() {
		try {
			shareImage(canvasBlob, imageFileName)
		} catch (e) {
			errorToast()
		}
		modalComponent.closeModal()
	}
</script>

<Modal bind:this={modalComponent}>
	<img
		alt={canvasImageAltText}
		src={canvasImageURL}
		style:max-width="min(100%, {Math.round(canvasWidth / 2)}px"
		style:max-height="{Math.round(canvasHeight / 2)}px"
	/>
	<div class="buttons">
		<button on:click={onCopyImage}>{$t('main.results.copy_image')}</button>
		<button on:click={onShareImage}>{$t('main.results.share')}</button>
	</div>
</Modal>

<style>
	.buttons {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		margin: 1rem 0;
	}

	button {
		height: 3rem;
		padding: 0 1rem;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 6px;
		border: 0;
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
</style>
