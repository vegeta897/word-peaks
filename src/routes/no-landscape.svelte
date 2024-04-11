<script lang="ts">
	import { landscapeHide } from '$src/store'
	import Index from './index.svelte'

	landscapeHide.set(true)
</script>

<Index />
