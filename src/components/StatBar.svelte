<script lang="ts">
	import { onMount } from 'svelte'

	export let percent: number
	export let minWidth = '20px'

	$: widthPercent = Math.round(100 * percent * mounted)
	$: minWidthValue = parseFloat(minWidth)
	$: minWidthUnit = minWidth.replace(/[^a-z]/gi, '')

	let mounted = 0
	onMount(() => setTimeout(() => (mounted = 1)))
</script>

<div
	style={`width: ${widthPercent}%; min-width: max(20px, ${
		minWidthValue * mounted
	}${minWidthUnit});`}
>
	<slot />
</div>

<style>
	div {
		height: 20px;
		background-color: var(--accent-color);
		border-radius: 8px;
		font-weight: 700;
		display: flex;
		justify-content: center;
		align-items: center;
		transition: width cubic-bezier(0.25, 0.46, 0.45, 0.94) 400ms,
			min-width cubic-bezier(0.25, 0.46, 0.45, 0.94) 400ms;
		overflow: clip;
	}
</style>
