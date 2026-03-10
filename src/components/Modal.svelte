<script lang="ts">
	let showModal = false

	export const openModal = () => (showModal = true)
	export const closeModal = () => (showModal = false)
</script>

<svelte:window on:keydown={({ key }) => key === 'Escape' && (showModal = false)} />
<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
<div
	class="backdrop"
	role="dialog"
	on:click|self={() => (showModal = false)}
	style:display={showModal ? 'flex' : 'none'}
>
	<div class="dialog">
		<slot />
		<button title="Close" class="close-button" on:click={closeModal}>
			<svg viewBox="0 0 4 4" xmlns="http://www.w3.org/2000/svg" width="32px">
				<path
					stroke="currentColor"
					fill="none"
					d="M1.2 1.2 l1.6 1.6 M1.2 2.8 l1.6 -1.6"
					stroke-width="0.5"
					stroke-linecap="round"
				/>
			</svg>
		</button>
	</div>
</div>

<style>
	.dialog {
		padding: 1rem 1.5rem;
		border-radius: 1rem;
		background: var(--tertiary-color);
		border: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	button.close-button {
		width: 2.75rem;
		height: 2.75rem;
		padding: 0;
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: var(--primary-color);
		border-radius: 100%;
		border: none;
	}

	button.close-button:hover {
		background: var(--secondary-color);
	}

	.backdrop {
		background: #1129;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 1.5rem;
		justify-content: center;
		align-items: center;
	}
</style>
