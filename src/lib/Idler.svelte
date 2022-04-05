<script lang="ts">
	import { alphabet, pickRandom } from '$lib/data-model'

	let letter = pickRandom(alphabet)
</script>

<div class="frame">
	<div class="letter-anchor">
		<div class="letter">
			{letter}
		</div>
	</div>
</div>

<style>
	.frame {
		overflow: hidden;
		position: relative;
		left: 2px;
		top: 2px;
		width: calc(100% - 4px);
		height: calc(100% - 4px);
		border-radius: 2px;
	}
	.letter-anchor {
		position: relative;
		left: -20px;
		top: 18px;
		width: 100%;
		height: 100%;
		transform: translate(0px, 0) rotate(0deg) scaleY(1);
	}
	.letter {
		position: relative;
		top: -3px;
		text-transform: uppercase;
		font-weight: 700;
		color: #5b505e;
		font-size: 2rem;
		text-align: center;
	}

	@media (max-width: 480px) {
		.letter-anchor {
			top: 17px;
		}
		.letter {
			top: -2px;
			font-size: 1.8rem;
		}
	}
	@media (max-width: 360px) {
		.letter-anchor {
			top: 16px;
		}
		.letter {
			top: -1.5px;
			font-size: 1.6rem;
		}
	}
</style>
