<script lang="ts">
	import Toggle from 'svelte-toggle'
	import { highContrast, showAllHints } from '$lib/store'
</script>

<section>
	<h2>Options</h2>
	<div class="content">
		<Toggle
			bind:toggled={$highContrast}
			hideLabel
			label="High contrast mode"
			style="transform: scale(1.4); touch-action: manipulation;"
			toggledColor="var(--accent-color)"><div class="label">High contrast mode</div></Toggle
		>
		<Toggle
			bind:toggled={$showAllHints}
			hideLabel
			label="Show all hints in row"
			style="transform: scale(1.4); touch-action: manipulation;"
			toggledColor="var(--accent-color)"><div class="label">Show all hints in row</div></Toggle
		>
	</div>
</section>

<style>
	section {
		max-width: 20rem;
		margin: 0 auto 1.2rem;
		padding: 0 1rem;
		color: var(--text-color);
	}

	h2 {
		font-size: 1.5em;
		text-align: center;
		margin: 0.6rem 0 1rem;
	}

	.content {
		margin: 2.5rem 0;
	}

	.label {
		order: -1;
		flex-grow: 1;
		font-size: 1.2em;
		margin: 0.8rem 0;
		padding-right: 0.8rem;
	}

	@media (max-width: 360px) {
		.label {
			font-size: 1em;
		}
	}
</style>
