<script lang="ts">
	import { page } from '$app/stores'
	import Game from '$lib/Game.svelte'
	import { decodeWord } from '$lib/data-model'
</script>

<Game word={decodeWord($page.params.hash)} />
