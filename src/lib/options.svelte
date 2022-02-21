<script lang="ts">
	import Toggle from 'svelte-toggle'
	import { highContrast } from '$lib/store'
</script>

<section>
	<h2>Options</h2>
	<div class="content">
		<Toggle
			bind:toggled={$highContrast}
			hideLabel
			label="High Contrast Mode"
			style="transform: scale(1.4);"
			toggledColor="var(--accent-color)"><div class="label">High Contrast Mode</div></Toggle
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
	}

	.content {
		margin: 2.5rem 0;
	}

	.label {
		order: -1;
		flex-grow: 1;
		font-size: 1.2em;
	}
</style>
