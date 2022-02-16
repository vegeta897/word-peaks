<script lang="ts">
	const keyboardLayout = [
		['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
		['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
		['z', 'x', 'c', 'v', 'b', 'n', 'm'],
	]
</script>

<div style="user-select: none; width: 500px;">
	<div class="key-row">
		{#each keyboardLayout[0] as key}
			<button>{key}</button>
		{/each}
	</div>
	<div class="key-row">
		<div class="flex-one-half" />
		{#each keyboardLayout[1] as key}
			<button>{key}</button>
		{/each}
		<div class="flex-one-half" />
	</div>
	<div class="key-row">
		<button class="flex-three-half">enter</button>
		{#each keyboardLayout[2] as key}
			<button>{key}</button>
		{/each}
		<button class="flex-three-half">✖</button>
	</div>
</div>

<style>
	.key-row {
		display: flex;
		margin: 0 auto 8px;
		width: 100%;
	}
	.key-row button {
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		text-transform: uppercase;
		flex: 1;
		margin: 0 6px 0 0;
		height: 58px;
		border-radius: 4px;
		font-weight: bold;
	}
	.flex-one-half {
		flex: 0.5;
	}
	.flex-three-half {
		flex: 1.5;
	}
</style>
