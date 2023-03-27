<script lang="ts">
	import { goto } from '$app/navigation'
	import { browser } from '$app/env'
	import { encodeWord, getRandomWord } from '$lib/data-model'

	if (browser) {
		const hash = encodeWord(getRandomWord())
		goto(`/#${hash}`)
	}
</script>
