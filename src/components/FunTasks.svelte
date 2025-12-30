<script lang="ts">
	import { funState } from '$lib/landscape/fun'
	import { flip } from 'svelte/animate'
	import { cubicIn, cubicOut } from 'svelte/easing'
	import { fade } from 'svelte/transition'

	const { tasks } = funState

	// TODO: Show radial progress bar on tasks with delayed completion (e.g. waiting for snow)
</script>

<div class="container">
	{#each $tasks as task, t (task.id)}
		{@const current = t === 0}
		<div
			class="task"
			animate:flip={{ duration: 200, easing: cubicOut }}
			out:fade|local={{ duration: 100, easing: cubicIn }}
			class:current
		>
			{#if task.type === 'tree-pluck'}
				🌳
			{:else if task.type === 'hill-pop'}
				💥
			{:else if task.type === 'ice-break'}
				🧊
			{:else if task.type === 'lily-grow'}
				🍀
			{:else if task.type === 'ivy-grow'}
				🌿
			{:else if task.type === 'tree-crystalize'}
				🔮
			{:else}
				<span style="font-size: 0.25em">{task.type}</span>
			{/if}
		</div>
	{/each}
</div>

<style>
	.container {
		padding-left: 0.5rem;
		grid-column: 1 / span 2;
		height: 3.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		overflow: clip;
	}

	.task {
		background: var(--secondary-color);
		font-size: 1.25em;
		border-radius: 25%;
		flex-shrink: 0;
		text-align: center;
		width: 32px;
		height: 32px;
		border: 6px solid var(--primary-color);
	}

	.task.current {
		font-size: 1.75em;
		width: 48px;
		height: 48px;
		border-color: var(--cta-color);
	}

	@media (max-width: 430px) {
		.task {
			font-size: 1em;
			width: 24px;
			height: 24px;
		}

		.task.current {
			font-size: 1.25em;
			width: 32px;
			height: 32px;
		}
	}
</style>
