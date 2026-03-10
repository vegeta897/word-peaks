<script lang="ts">
	import { get } from 'svelte/store'
	import Modal from './Modal.svelte'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import * as store from '$src/store'
	import { t } from '$lib/translations'

	export let nlgid: string

	let modalComponent: Modal

	onMount(() => {
		const storedNlgid = get(store.nlgid)
		const nlgEnabled = get(store.nlgEnabled)
		if (nlgEnabled === undefined) {
			modalComponent.openModal()
		} else if (nlgEnabled === true) {
			store.nlgid.set(nlgid)
		}
	})

	function allow() {
		store.nlgEnabled.set(true)
		store.nlgid.set(nlgid)
		modalComponent.closeModal()
	}

	function deny() {
		store.nlgEnabled.set(false)
		modalComponent.closeModal()
	}
</script>

<Modal bind:this={modalComponent}>
	<svg viewBox="0 0 852 848" xmlns="http://www.w3.org/2000/svg" width="80px">
		<title>Nice Light Games</title>
		<g style="stroke-width:65.54px;">
			<path d="M37.119,417.655L136.345,417.23" />
			<path d="M430.63,37.671L430.63,119.628" />
			<path d="M158.915,145.563L210.961,197.609" />
			<path d="M691.96,677.152L636.308,621.5" />
			<path d="M693.345,142.435L641.19,194.373" />
			<path d="M169.362,678.459L225.26,622.778" />
			<path d="M722.276,417.655L814.817,417.655" />
		</g>
		<path
			d="M430.923,207.937C543.061,207.937 634.103,298.979 634.103,411.117C634.103,462.494 614.952,509.407 583.499,545.236C556.472,576.022 526.554,632.296 520.139,677.549C513.753,671.364 477.644,677.723 435.998,681.939C394.048,686.186 351.229,689.887 346.608,695.43C332.556,638.156 313.034,586.297 275.751,542.226C245.806,506.83 227.743,461.066 227.743,411.117C227.743,298.979 318.785,207.937 430.923,207.937Z"
			style="fill:#facc15;"
		/>
		<path
			d="M329.321,487.82C358.465,519.419 395.603,530.543 433.261,530.627C467.18,530.704 509.653,515.138 535.066,487.82"
			style="stroke:var(--tertiary-color);stroke-width:48px;"
		/>
		<circle cx="371.443" cy="372.983" r="33.646" style="fill:var(--tertiary-color);" />
		<circle cx="489.824" cy="372.983" r="33.646" style="fill:var(--tertiary-color);" />
		<path d="M358.49,736.133L509.532,718.519" style="stroke-width:34.53px;" />
		<path d="M384.553,789.85L496.087,778.369" style="stroke-width:34.53px;" />
		<path
			d="M416.396,843.84C407.745,843.84 400.572,837.462 399.325,829.157C433.812,824.883 446.823,823.396 476.232,820.212C477.015,822.182 477.445,824.329 477.445,826.577C477.445,836.104 469.71,843.84 460.182,843.84L416.396,843.84Z"
			style="fill:#fff;stroke:none;"
		/>
	</svg>
	<p>{@html $t('main.other.allow_nlg_tracking')}</p>
	<div class="buttons">
		<button on:click={allow} class="allow">{$t('main.other.allow_tracking')}</button>
		<button on:click={deny} class="deny">{$t('main.other.no_thanks')}</button>
	</div>
	<p class="aside">{$t('main.other.can_change_in_settings')}</p>
</Modal>

<style>
	p {
		font-size: 1.25em;
	}

	.buttons {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.allow {
		height: 3rem;
		padding: 0 1rem;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 6px;
		border: 0;
		font-size: 1.25em;
		font-weight: 700;
		background: var(--cta-color);
	}

	.allow:hover {
		background: #3388de;
	}

	.deny {
		background: none;
		border: none;
		text-decoration: none;
		outline: none;
		height: 2rem;
		font-weight: bold;
	}

	.deny:hover {
		text-decoration: underline;
	}

	.aside {
		font-size: 0.875em;
		opacity: 0.7;
	}

	path {
		stroke: #fff;
		fill: none;
		stroke-linecap: round;
	}
</style>
