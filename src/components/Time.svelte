<script lang="ts">
	import { onDestroy } from 'svelte'

	export let mode: 'static' | 'countdown' = 'static'
	export let ms: number
	export let alwaysShowHours: boolean = false
	export let dimming: boolean = true
	export let decimals = 0
	export let timeString: string = ''

	let spanElement: HTMLSpanElement
	$: timeString = spanElement?.innerText

	// TODO: Decimals option

	const padZero = (value: number) => value.toString().padStart(2, '0')
	const MINUTE = 60 * 1000
	const HOUR = MINUTE * 60

	let countdown = mode === 'countdown'
	let msTotal = countdown ? ms - Date.now() : ms

	let interval: NodeJS.Timer
	if (countdown && msTotal > 0) {
		interval = setInterval(() => {
			msTotal = ms - Date.now()
		}, 1000)
	}

	$: milliseconds = Math.floor((ms % 1000) / 10 ** (3 - decimals))
		.toString()
		.padStart(decimals, '0')
	$: seconds = Math.floor(msTotal / 1000) % 60
	$: minutes = Math.floor(msTotal / MINUTE) % 60
	$: hours = Math.floor(msTotal / HOUR)
	$: showHours = hours > 0 || alwaysShowHours

	onDestroy(() => {
		clearInterval(interval)
	})
</script>

{#if !countdown || msTotal > 0}
	<slot name="title" />
	<span bind:this={spanElement} class={$$props.class}>
		<span class:fade={dimming && hours === 0}>{showHours ? hours : ''}</span><span
			class:fade={dimming && minutes === 0 && hours === 0}
			>{showHours ? ':' + padZero(minutes) : minutes}</span
		>:{padZero(seconds)}{decimals > 0 ? `.${milliseconds}` : ''}
	</span>
{/if}
{#if countdown && msTotal <= 0}<slot name="after-countdown" />{/if}

<style>
	.fade {
		opacity: 0.6;
	}
</style>
