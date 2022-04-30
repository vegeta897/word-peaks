<script lang="ts">
	export let tab1Title: string
	export let tab2Title: string
	export let activeTab: 1 | 2 = 1
</script>

<div class="tabs">
	<button on:click={() => (activeTab = 1)} class="tab-button" class:active={activeTab === 1}
		>{tab1Title}</button
	>
	<button on:click={() => (activeTab = 2)} class="tab-button" class:active={activeTab === 2}
		>{tab2Title}</button
	>
</div>
<div class="tab-content">
	{#if activeTab === 1}
		<slot name="tab-1" />
	{:else}
		<slot name="tab-2" />
	{/if}
</div>

<style>
	.tabs {
		width: 100%;
		display: flex;
		box-sizing: border-box;
		background: var(--secondary-color);
	}
	.tab-button {
		width: calc(50% - 0.4rem);
		padding: 0 1.2rem;
		height: 3.5rem;
		border: 0;
		border-top-left-radius: 1rem;
		border-top-right-radius: 1rem;
		background: none;
		font-size: 1.2em;
		font-weight: 700;
		background: #413245;
	}
	.tab-button:nth-of-type(1) {
		margin-right: 0.4rem;
		border-top-left-radius: 1rem;
	}
	.tab-button:nth-of-type(2) {
		margin-left: 0.4rem;
		border-top-right-radius: 1rem;
	}
	.tab-button.active {
		background: var(--tertiary-color);
		color: #fff;
	}
	.tab-button:hover {
		color: #fff;
	}

	.tab-content {
		width: 100%;
	}
</style>
