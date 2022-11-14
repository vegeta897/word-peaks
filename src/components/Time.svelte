<script lang="ts">
	import { onDestroy } from 'svelte'

	export let ms: number | false = false
	export let countdown: number | false = false
	export let alwaysShowHours: boolean = false
	export let bindContainer: { span: HTMLSpanElement | undefined } = { span: undefined }
	export let dimming: boolean = true
	export let decimals = 0

	// TODO: Decimals option

	const padZero = (value: number) => value.toString().padStart(2, '0')
	const MINUTE = 60 * 1000
	const HOUR = MINUTE * 60

	let msLeft = countdown ? countdown - new Date() : ms

	let interval: NodeJS.Timer
	if (countdown && msLeft > 0) {
		interval = setInterval(() => {
			msLeft = countdown - new Date()
		}, 1000)
	}

	$: milliseconds = Math.floor((ms % 1000) / 10 ** (3 - decimals))
		.toString()
		.padStart(decimals, '0')
	$: seconds = Math.floor(msLeft / 1000) % 60
	$: minutes = Math.floor(msLeft / MINUTE) % 60
	$: hours = Math.floor(msLeft / HOUR)
	$: showHours = hours > 0 || alwaysShowHours

	onDestroy(() => {
		clearInterval(interval)
	})
</script>

{#if !countdown || msLeft > 0}
	<slot name="title" />
	<span bind:this={bindContainer.span} class={$$props.class}>
		<span class:fade={dimming && hours === 0}>{showHours ? hours : ''}</span><span
			class:fade={dimming && minutes === 0 && hours === 0}
			>{showHours ? ':' + padZero(minutes) : minutes}</span
		>:{padZero(seconds)}{decimals > 0 ? `.${milliseconds}` : ''}
	</span>
{/if}
{#if countdown && msLeft <= 0}<slot name="after-countdown" />{/if}

<style>
	.fade {
		opacity: 0.6;
	}
</style>
