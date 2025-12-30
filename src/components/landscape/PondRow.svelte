<script lang="ts">
	import { landscapeColor } from '$src/store'
	import { type IceShardSection } from '$lib/landscape/ice'
	import BouncyParticles from './BouncyParticles.svelte'

	let iceShardSections: IceShardSection[] = []

	export async function addShardSection(shardSection: IceShardSection) {
		iceShardSections.push(shardSection)
		iceShardSections = iceShardSections // Reactivity
	}
	function onParticlesDone(id: number) {
		iceShardSections = [...iceShardSections.filter((s) => s.id !== id)]
	}
</script>

{#each iceShardSections as { id, shards } (id)}
	<BouncyParticles particles={shards} let:particle on:done={() => onParticlesDone(id)}>
		<g>
			<path
				transform="translate(0 -3.5)"
				stroke-width="0.5"
				stroke-linejoin="round"
				stroke="var(--{$landscapeColor ? 'ice-shelf-color' : 'landscape-color'})"
				fill="var(--{$landscapeColor ? 'ice-shelf-color' : 'landscape-color'})"
				d={particle.shelfPath}
			/>
			<path
				transform="translate(0 -3.5)"
				stroke-width="0.5"
				stroke-linejoin="round"
				stroke="var(--{$landscapeColor ? 'ice-color' : 'landscape-color'})"
				fill="var(--{$landscapeColor ? 'ice-color' : 'landscape-color'})"
				d={particle.mainPath}
			/>
		</g>
	</BouncyParticles>
{/each}
