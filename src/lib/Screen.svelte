<script lang="ts">
	import CloseButton from '$lib/CloseButton.svelte'
	import { fade } from 'svelte/transition'
	export let title: string
</script>

<div class="background" in:fade={{ duration: 200 }} />
<div class="wrapper">
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
		background: var(--secondary-color);
	}

	.wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
	}

	section {
		max-width: 528px;
		margin: 0 auto;
		position: relative;
		padding: 0 1.5rem 1.8rem;
	}

	h2 {
		font-size: 1.8em;
		text-align: center;
		margin: 1.5rem 0;
	}
</style>
