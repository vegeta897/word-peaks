<script lang="ts">
	import { screen } from '$lib/store'

	const onClose = () => screen.set('main')
	const handleKeyDown = ({ key }) => {
		console.log(key)
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
		padding: 10px;
		position: absolute;
		right: 0;
		top: -4px;
		background: none;
	}

	svg {
		stroke-width: 2;
		stroke: var(--text-color);
	}

	button:hover svg {
		stroke: #fff;
	}

	button:active svg {
		stroke: #aaa;
	}
</style>
