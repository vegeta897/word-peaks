<script>
	import { trackEvent } from '$lib/plausible'
	import { showEndView, dismissPromo } from '$src/store'
	import { fly } from 'svelte/transition'

	const CURRENT_PROMO = 1
</script>

{#if $showEndView && $dismissPromo < CURRENT_PROMO}
	<section in:fly|global={{ duration: 400, y: 100 }}>
		<div>
			<p class="promo-link">
				<a
					href="https://www.playorbits.com"
					on:auxclick={() => trackEvent('promoLinkFollow')}
					on:click={() => trackEvent('promoLinkFollow')}
				>
					Check out Orbits, the circular word game!
				</a>
			</p>
			<p>Start with any word and make a loop of connected words</p>
			<button title="Dismiss" on:click={() => dismissPromo.set(CURRENT_PROMO)}>
				<svg
					viewBox="0 0 10 10"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
				>
					<line x1="2" y1="2" x2="8" y2="8" />
					<line x1="8" y1="2" x2="2" y2="8" />
				</svg>
			</button>
		</div>
	</section>
{/if}

<style>
	section {
		display: flex;
		justify-content: center;
		padding: 0 0.5rem;
	}

	div {
		padding: 0.5rem 2.5rem;
		text-align: center;
		background: var(--secondary-color);
		border-radius: 0.75rem;
		position: relative;
	}

	p {
		margin: 0.25rem 0;
	}

	.promo-link {
		font-size: 1.125em;
	}

	button {
		position: absolute;
		right: 4px;
		top: 4px;
		margin: 0;
		border: 0;
		width: 36px;
		height: 36px;
		padding: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		opacity: 0.4;
		border-radius: 100%;
	}

	svg {
		stroke-width: 1.75;
		stroke: var(--text-color);
		stroke-linecap: round;
		fill: none;
	}

	button:hover {
		background-color: var(--primary-color);
		opacity: 1;
	}

	@media (max-width: 480px) {
		div {
			max-width: 16rem;
		}
		.promo-link {
			font-size: 1em;
		}
	}
</style>
