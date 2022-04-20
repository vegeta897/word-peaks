<script lang="ts">
	import { screen, highContrast } from '$lib/store'

	const onClose = () => screen.set('main')
	const handleKeyDown = ({ key }) => {
		if (key === 'Escape') onClose()
	}
</script>

<svelte:window on:keydown={handleKeyDown} />
<button type="button" on:click={onClose} class:high-contrast={$highContrast}>
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
		display: flex;
		align-items: center;
		justify-content: center;
	}

	svg {
		margin: 0;
		stroke-width: 2;
		stroke: #888;
	}

	.high-contrast {
		background-color: #fff;
	}
	.high-contrast svg {
		stroke: #000;
	}

	button:hover {
		background-color: #ffffff20;
	}

	button.high-contrast:hover {
		background-color: var(--accent-color);
	}

	button.high-contrast:hover svg {
		stroke: #fff;
	}

	button:hover svg {
		stroke: var(--text-color);
	}
</style>
