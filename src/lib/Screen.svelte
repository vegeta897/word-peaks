<script lang="ts">
	import CloseButton from '$lib/CloseButton.svelte'
	import { slide } from 'svelte/transition'
	import { quadOut } from 'svelte/easing'
	import { openScreen } from '$lib/store'

	export let title: string

	let backgroundElement: HTMLDivElement
	let backgroundClickTarget: HTMLElement
	const onBackgroundMousedown = (event) => {
		if (event.target === backgroundElement) backgroundClickTarget = event.target
	}
	const onBackgroundMouseup = (event) => {
		if (event.target === backgroundClickTarget) {
			event.preventDefault()
			openScreen.set(null)
		}
	}
</script>

<div
	class="background"
	bind:this={backgroundElement}
	transition:slide={{ easing: quadOut, duration: 250 }}
	on:mousedown={onBackgroundMousedown}
	on:mouseup={onBackgroundMouseup}
>
	<section>
		<CloseButton />
		<h2>{title}</h2>
		<slot />
	</section>
</div>

<style>
	.background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: auto;
		background: var(--secondary-color);
		display: flex;
		align-items: flex-start;
		justify-content: center;
	}

	section {
		max-width: 520px;
		flex-grow: 100;
		position: relative;
		padding: 1rem 1.5rem;
		box-sizing: border-box;
	}

	h2 {
		font-size: 1.8em;
		text-align: center;
		margin: 1.5rem 0;
	}
</style>
