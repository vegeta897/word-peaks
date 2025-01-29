<script lang="ts">
	import { base } from '$app/paths'
	import { hideLandscape } from '$src/store'
	import Index from '../+page.svelte'

	hideLandscape.set(true)
</script>

<p>
	<strong>Hey! 👋</strong> This page will be removed soon. There is now an option to hide
	the landscape, and if you're reading this, it's already enabled. You can use the
	<a href="{base}/" rel="external">default page</a>
	from now on.
</p>
<Index />

<style>
	p {
		padding: 1rem 1.5rem;
		border-radius: 1rem;
		background: var(--secondary-color);
	}
</style>
