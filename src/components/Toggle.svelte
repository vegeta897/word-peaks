<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements'
	import type { Writable } from 'svelte/store'

	export let label: string
	export let store: Writable<boolean | undefined>
	export let validate = () => true
	export let small = false

	let checked: boolean

	store.subscribe((value) => (checked = !!value))

	const onClick: MouseEventHandler<HTMLButtonElement> = () => {
		if (validate()) {
			store.set(!checked)
		}
	}
</script>

<label class="toggle">
	<div class="label">{label}</div>
	<input type="checkbox" {checked} class:small />
	<button class:checked class:small on:click={onClick}></button>
</label>

<style>
	.label {
		font-size: 1.25em;
	}

	input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.toggle button {
		width: 64px;
		height: 32px;
		position: relative;
		margin: 0 0 0 0.5rem;
		background: #695d6e;
		border: none;
		border-radius: 16px;
		flex-shrink: 0;
	}

	.toggle button.small {
		width: 48px;
		height: 24px;
	}

	.toggle button::before {
		content: '';
		position: absolute;
		width: 28px;
		height: 28px;
		background: #fff;
		top: 2px;
		left: 2px;
		transition: transform 0.1s ease-out;
		border-radius: 100%;
	}

	.toggle button.small::before {
		width: 20px;
		height: 20px;
	}

	.toggle button.checked {
		background-color: var(--accent-color);
	}

	.toggle button.checked::before {
		transform: translateX(32px);
	}

	.toggle button.small.checked::before {
		transform: translateX(24px);
	}

	@media (max-width: 480px) {
		.label {
			font-size: 1.125em;
		}
	}

	@media (max-width: 360px) {
		.label {
			font-size: 1em;
		}
	}
</style>
