<script lang="ts">
	import { slide } from 'svelte/transition'
	import { quadOut } from 'svelte/easing'
	import { openScreen } from '$src/store'

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
	const handleKeyDown = ({ key }) => {
		if (key === 'Escape') openScreen.set(null)
	}
</script>

<svelte:window on:keydown={handleKeyDown} />
<div
	class="background"
	bind:this={backgroundElement}
	transition:slide={{ easing: quadOut, duration: 250 }}
	on:mousedown={onBackgroundMousedown}
	on:mouseup={onBackgroundMouseup}
>
	<!-- TODO: Add "Close" to translations -->
	<button title="Close" on:click={() => openScreen.set(null)}>
		<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
			<title>Close</title>
			<line x1="1" y1="1" x2="9" y2="9" />
			<line x1="9" y1="1" x2="1" y2="9" />
		</svg>
	</button>
	<div class="column">
		<section class:no-title={!title}>
			{#if title}<h2>{title}</h2>{/if}
			<slot />
		</section>
	</div>
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
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}

	.column {
		max-width: 520px;
		width: 100%;
		margin-top: 60px;
		display: flex;
		align-items: flex-start;
		justify-content: center;
	}

	button {
		margin: 0;
		border: 0;
		width: 100%;
		height: 60px;
		min-height: 60px;
		background-color: var(--tertiary-color);
		display: flex;
		position: fixed;
		align-items: center;
		justify-content: center;
		z-index: 999999;
	}

	svg {
		margin: 0;
		stroke-width: 1.5;
		stroke: var(--text-color);
		opacity: 0.6;
		fill: none;
	}

	button:hover svg {
		opacity: 1;
	}

	section {
		flex-grow: 1;
		position: relative;
		padding: 1rem 1.5rem;
		box-sizing: border-box;
	}
	section.no-title {
		padding-top: 1.4rem;
	}

	h2 {
		font-size: 1.8em;
		text-align: center;
		margin: 0.4rem 0 1.5rem;
	}
</style>
