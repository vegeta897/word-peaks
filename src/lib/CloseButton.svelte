<script lang="ts">
	import { screen } from '$lib/store'

	const onClose = () => screen.set('main')
	const handleKeyDown = ({ key }) => {
		if (key === 'Escape') onClose()
	}
</script>

<svelte:window on:keydown={handleKeyDown} />
<button type="button" on:click={onClose}>
	<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
		<title>Close</title>
		<line x1="0" y1="0" x2="10" y2="10" />
		<line x1="10" y1="0" x2="0" y2="10" />
	</svg>
</button>

<style>
	button {
		margin: 0;
		border: 0;
		width: 2.8rem;
		height: 2.8rem;
		border-radius: 8px;
		position: absolute;
		background-color: #ffffff0a;
		transition: background-color 150ms ease-out;
		right: 6px;
		top: -4px;
	}

	svg {
		margin-top: 3px;
		stroke-width: 2;
		stroke: #888;
	}

	button:hover {
		background-color: var(--secondary-color);
	}

	button:hover svg {
		stroke: var(--text-color);
	}
</style>
