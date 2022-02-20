<script lang="ts">
	import Toggle from 'svelte-toggle'
	import { highContrast } from '$lib/store'
</script>

<section>
	<h2>Options</h2>
	<Toggle
		toggled={$highContrast}
		on:toggle={({ detail }) => highContrast.set(detail)}
		hideLabel
		label="High Contrast Mode"
		toggledColor="var(--accent-color)"><div class="label">High Contrast Mode</div></Toggle
	>
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

	.label {
		order: -1;
		flex-grow: 1;
		font-size: 1.1em;
	}
</style>
