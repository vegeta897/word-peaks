<script lang="ts">
	import { quadOut } from 'svelte/easing'
	import { ROWS, WORD_LENGTH } from '$lib/data-model'
	import { boardContent, currentRow } from '$src/store'
	import { get } from 'svelte/store'
	import { beforeUpdate, onMount } from 'svelte'

	// TODO: Add animations on touch

	export let graphWidth: number
	export let graphHeight: number

	let rows: Feature[][]

	let featurePad: number
	let featureRadius: number
	let platformRadius: number
	let rowMargin: number
	let rowHeight: number
	let tileHeight: number
	let paddedRowWidth: number
	let featureWidth: number

	$: canDraw = graphWidth > 0 && graphHeight > 0 && _currentRow >= 0 && rowMargin >= 0

	beforeUpdate(() => {
		rowMargin = parseInt(
			getComputedStyle(document.documentElement)
				.getPropertyValue('--tile-row-margin-bottom')
				.split('px')[0]
		)
		rowHeight = graphHeight / ROWS
		tileHeight = rowHeight - rowMargin
		platformRadius = tileHeight / 3
		featurePad = graphWidth / 50
		paddedRowWidth = graphWidth - featurePad * 2
		featureWidth = (paddedRowWidth - featurePad * (WORD_LENGTH - 1)) / WORD_LENGTH
		featureRadius = featureWidth / 4
		updateGraph()
	})

	type Feature = {
		x: number
		y: number
		width: number
		height: number
		fill: string
		type: 'grass' | 'lake' | 'hill'
	}

	let _currentRow: number

	const featureColors = {
		lake: 'var(--after-color)',
		hill: 'var(--before-color)',
		grass: 'var(--correct-color)',
	}

	function updateGraph() {
		if (!canDraw) return
		rows = get(boardContent)
			.slice(0, _currentRow)
			.map((row, r) =>
				row.map((tile, i) => {
					const featureType = tile.polarity > 0 ? 'lake' : tile.polarity < 0 ? 'hill' : 'grass'
					const heightFactor = quadOut(tile.magnitude / (ROWS * 2 - 1))
					const featureHeight =
						featureType === 'grass' ? tileHeight / 3 : (tileHeight / 2) * heightFactor
					let yAdjust = tileHeight / 3
					if (featureType === 'lake') yAdjust = tileHeight / 2
					if (featureType === 'hill') yAdjust = tileHeight / 2 - featureHeight
					return {
						x: featurePad + i * (featureWidth + featurePad),
						y: r * rowHeight + yAdjust,
						width: featureWidth,
						height: featureHeight,
						fill: featureColors[featureType],
						type: featureType,
					}
				})
			)
	}

	onMount(() => {
		currentRow.subscribe((cr) => {
			_currentRow = cr
			updateGraph()
		})
	})
</script>

{#if rows && canDraw}
	<svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} xmlns="http://www.w3.org/2000/svg">
		<rect
			width={graphWidth}
			height={(graphHeight / 6) * rows.length}
			fill="var(--ground-edge-color)"
			rx={platformRadius}
		/>
		<rect
			width={graphWidth}
			height={(graphHeight / 6) * rows.length - rowMargin}
			fill="var(--ground-color)"
			rx={platformRadius}
		/>
		{#each rows as row, r}
			{#each row as feature, f}
				{#if feature.type === 'hill'}
					<defs>
						<clipPath id={`hill-clip-${r}-${f}`}>
							<rect
								x={feature.x}
								y={feature.y}
								width={feature.width}
								height={Math.min(feature.width / 2, feature.height)}
							/>
						</clipPath>
						<mask id={`hill-mask-${r}-${f}`}>
							<rect
								x={feature.x}
								y={feature.y}
								width={feature.width}
								height={feature.height + featurePad}
								rx={featurePad}
								fill="white"
							/>
							<rect
								x={feature.x}
								y={feature.y}
								width={feature.width}
								height={Math.min(feature.width / 2, feature.height)}
								fill="black"
							/>
							<g fill="white">
								<circle
									clip-path={`url(#hill-clip-${r}-${f})`}
									cx={feature.x + feature.width / 2}
									cy={feature.y + Math.min(feature.width / 2, feature.height)}
									r={Math.min(feature.width / 2, feature.height)}
								/>
								<rect
									x={feature.x}
									y={feature.y + Math.min(feature.width / 2, feature.height)}
									width={feature.width}
									height={feature.height - Math.min(feature.width / 2, feature.height)}
								/>
							</g>
						</mask>
					</defs>
					<rect
						mask={`url(#hill-mask-${r}-${f})`}
						x={feature.x}
						y={feature.y}
						width={feature.width}
						height={feature.height + featureRadius}
						fill={feature.fill}
					/>
				{:else}
					<rect
						x={feature.x}
						y={feature.y}
						width={feature.width}
						height={feature.height}
						rx={featureRadius}
						fill={feature.type === 'lake' ? 'var(--ground-edge-color)' : feature.fill}
					/>
					{#if feature.type === 'lake'}
						<rect
							x={feature.x}
							y={feature.y + featurePad}
							width={feature.width}
							height={feature.height - featurePad}
							rx={featureRadius}
							fill={feature.fill}
						/>
					{/if}
				{/if}
			{/each}
		{/each}
	</svg>
{/if}

<style>
	svg {
		width: 100%;
		height: 100%;
	}
	:root {
		--ground-color: #c76dab;
		--ground-edge-color: #a84f8c;
	}
</style>
