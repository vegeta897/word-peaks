<script lang="ts">
	import { funStats } from '$src/store'
	import { onMount } from 'svelte'
	import { cubicOut } from 'svelte/easing'
	import { fade } from 'svelte/transition'
	import { spring } from 'svelte/motion'
	// TODO: Use spring from svelte/motion to animate added values

	export let delay = 0

	let visible = false

	onMount(() => {
		const appear = setTimeout(() => (visible = true), delay)
		return () => clearTimeout(appear)
	})
</script>

<div class="container">
	{#if visible}
		<div class="board" in:fade|local={{ delay: 200, duration: 200, easing: cubicOut }}>
			<ul>
				<li>💎 {$funStats.totalGems}</li>
				<li>💥 {$funStats.counts.pop}</li>
				<li>💦 {$funStats.counts.sop}</li>
				<li>🍃 {$funStats.counts.pluck}</li>
			</ul>
		</div>
	{/if}
</div>

<style>
	.container {
		position: absolute;
		top: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.board {
		padding: 2rem;
		background: var(--secondary-color);
		border-radius: 0.75rem;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		font-size: 1.25em;
	}

	li:first-child {
		font-size: 1.5em;
	}
</style>
