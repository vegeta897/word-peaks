<script lang="ts">
	import { goto } from '$app/navigation'
	import { browser } from '$app/env'
	import { base } from '$app/paths'
	import { encodeWord, getRandomWord } from '$lib/data-model'

	if (browser) {
		const hash = encodeWord(getRandomWord())
		goto(`${base}/#${hash}`)
	}
</script>
