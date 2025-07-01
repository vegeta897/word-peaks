<script lang="ts">
	import { sleep } from '$lib/math'
	import type { IceShardSection } from './Pond.svelte'

	export let forceColor: boolean

	let iceShardSections: IceShardSection[] = []

	// TODO: Maybe simplify all this by getting rid of "break sections"
	// Make break area smaller, and just use one section for all of it
	// Simpler code, better perf
	// Try to fake shard animations radiating from epicenter
	// Can't delay drawing shelf because it may not be covered by unbroken ice

	export function addShardSections(shardSections: IceShardSection[]) {
		for (const shardSection of shardSections) {
			if (!shardSection) continue
			iceShardSections.push(shardSection)
			sleep(shardSection.expires).then(() => {
				iceShardSections = [...iceShardSections.filter((s) => s !== shardSection)]
			})
		}
		iceShardSections = iceShardSections
	}
</script>

{#each iceShardSections as { id, delay, shards } (id)}
	<g class="shard-section" style:animation-delay="{delay}ms">
		{#each shards as { origin, rotation, velocity, duration, mainPath, shelfPath }}
			<g
				class="ice-shard"
				style:transform-origin="{origin[0] * 15}px {origin[1] * 10 - 3.5}px"
				style:transform="translateY({velocity[2]}px) scale(0.6)"
				style:animation-delay="{delay}ms"
				style:animation-duration="{duration}ms"
			>
				<g
					class="ice-shard-sub"
					style:transform-origin="{origin[0] * 15}px {origin[1] * 10 - 3.5}px"
					style:transform="translate({velocity[0]}px, {velocity[1]}px) rotate({rotation}deg)"
					style:animation-delay="{delay}ms"
					style:animation-duration="{duration}ms"
				>
					<path
						transform="translate(0 -3.5)"
						stroke-width="0.5"
						stroke-linejoin="round"
						stroke={forceColor ? '#56A9FF' : 'var(--landscape-color)'}
						fill={forceColor ? '#56A9FF' : 'var(--landscape-color)'}
						d={shelfPath}
					/>
					<path
						transform="translate(0 -3.5)"
						stroke-width="0.5"
						stroke-linejoin="round"
						stroke={forceColor ? '#B2CFFF' : 'var(--landscape-color)'}
						fill={forceColor ? '#B2CFFF' : 'var(--landscape-color)'}
						d={mainPath}
					/>
				</g>
			</g>
		{/each}
	</g>
{/each}

<style>
	.shard-section {
		animation: appear 0ms backwards;
	}

	@keyframes appear {
		0% {
			visibility: hidden;
		}
	}

	.ice-shard {
		animation: transform-from-init cubic-bezier(0, 0.55, 0.45, 1) backwards,
			fade cubic-bezier(0.64, 0, 0.78, 0) forwards;
	}

	.ice-shard-sub {
		animation: transform-from-init linear backwards;
	}

	@keyframes transform-from-init {
		0% {
			transform: none;
		}
	}

	@keyframes fade {
		100% {
			opacity: 0;
		}
	}
</style>
