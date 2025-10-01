<script lang="ts">
	import { tick } from 'svelte'
	import { landscapeForceColor } from '$src/store'
	import {
		easeInParabolic,
		easeOutParabolic,
		type IceShardSection,
	} from '$lib/landscape/ice'

	let iceShardSections: IceShardSection[] = []
	let iceShardElements: SVGGElement[] = []

	export async function addShardSection(shardSection: IceShardSection) {
		iceShardSections.push(shardSection)
		iceShardSections = iceShardSections
		await tick()
		const animations: Promise<Animation>[] = []
		for (let i = 0; i < shardSection.shards.length; i++) {
			const shard = shardSection.shards[i]
			if (!shard) continue
			const element = iceShardElements[shardSection.id * 100 + i]
			if (!element) continue
			const keyframes: Keyframe[] = [{ transform: 'none', easing: easeOutParabolic }]
			let runningDuration = 0
			for (let b = 0; b < shard.bounces.length; b++) {
				const [duration, height] = shard.bounces[b]
				keyframes.push(
					{
						transform: `translateY(${-height}px)`,
						opacity: 1,
						easing: easeInParabolic,
						offset: (runningDuration + duration / 2) / shard.duration,
					},
					{
						transform: 'translateY(3.5px)',
						opacity: b === shard.bounces.length - 1 ? 0 : 1,
						easing: easeOutParabolic,
						offset: (runningDuration + duration) / shard.duration,
					}
				)
				runningDuration += duration
			}
			animations.push(
				element.animate(keyframes, {
					duration: shard.duration,
					delay: shardSection.delay,
					fill: 'forwards',
				}).finished
			)
		}
		await Promise.all(animations)
		iceShardSections = [...iceShardSections.filter((s) => s !== shardSection)]
	}
</script>

{#each iceShardSections as { id, delay, shards } (id)}
	<g class="shard-section" style:animation-delay="{delay}ms">
		{#each shards as { origin, rotation, velocity, duration, mainPath, shelfPath }, s}
			<g
				style:transform-origin="{origin[0] * 15}px {origin[1] * 10 - 3.5}px"
				bind:this={iceShardElements[id * 100 + s]}
			>
				<g
					class="ice-shard"
					style:transform-origin="{origin[0] * 15}px {origin[1] * 10 - 3.5}px"
					style:transform="translate({velocity[0]}px, {velocity[1]}px) rotate({rotation}deg)
					scale(0.6)"
					style:animation-delay="{delay}ms"
					style:animation-duration="{duration}ms"
				>
					<path
						transform="translate(0 -3.5)"
						stroke-width="0.5"
						stroke-linejoin="round"
						stroke={$landscapeForceColor ? '#56A9FF' : 'var(--landscape-color)'}
						fill={$landscapeForceColor ? '#56A9FF' : 'var(--landscape-color)'}
						d={shelfPath}
					/>
					<path
						transform="translate(0 -3.5)"
						stroke-width="0.5"
						stroke-linejoin="round"
						stroke={$landscapeForceColor ? '#B2CFFF' : 'var(--landscape-color)'}
						fill={$landscapeForceColor ? '#B2CFFF' : 'var(--landscape-color)'}
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
		animation: transform-from-init linear backwards;
	}

	@keyframes transform-from-init {
		0% {
			transform: none;
		}
	}
</style>
