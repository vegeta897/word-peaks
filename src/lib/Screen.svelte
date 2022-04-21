<script lang="ts">
	import CloseButton from '$lib/CloseButton.svelte'
	import { slide } from 'svelte/transition'
	export let title: string
</script>

<div class="background" transition:slide>
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
		overflow: scroll;
		background: var(--secondary-color);
		display: flex;
		align-items: flex-start;
		justify-content: center;
	}

	section {
		max-width: 520px;
		flex-grow: 100;
		position: relative;
		padding: 1.5rem;
		box-sizing: border-box;
	}

	h2 {
		font-size: 1.8em;
		text-align: center;
		margin: 1.5rem 0;
	}
</style>
