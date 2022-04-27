<script lang="ts">
	import { ROWS, WORD_LENGTH } from '$lib/data-model'
	import { boardContent, currentRow } from '$src/store'
	import { get } from 'svelte/store'
	import { beforeUpdate, onMount } from 'svelte'

	// TODO: Add animations on touch

	export let graphWidth: number
	export let graphHeight: number

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
		river?: boolean
	}
	const features: Feature[] = []
	const featureMap: Feature[] = []

	let _currentRow: number

	const featureColors = {
		lake: 'var(--after-color)',
		hill: 'var(--before-color)',
		grass: 'var(--correct-color)',
	}

	function updateGraph() {
		if (!canDraw) return
		features.length = 0
		featureMap.length = 0
		const graphedRows = get(boardContent).slice(0, _currentRow)
		for (let r = 0; r < graphedRows.length; r++) {
			const row = graphedRows[r]
			let leftNeighbor: Feature | null = null
			for (let t = 0; t < row.length; t++) {
				const tile = row[t]
				const upNeighbor = featureMap[(r - 1) * WORD_LENGTH + t]
				const featureType = tile.polarity > 0 ? 'lake' : tile.polarity < 0 ? 'hill' : 'grass'
				if (featureType !== 'hill' && leftNeighbor?.type === featureType) {
					leftNeighbor!.width += featurePad + featureWidth
					continue
				}
				const featureHeight = featureType === 'hill' ? tileHeight * (2 / 5) : tileHeight / 2
				let yAdjust = tileHeight / 4
				if (featureType === 'hill') yAdjust = tileHeight / 2 - featureHeight
				const feature: Feature = {
					x: featurePad + t * (featureWidth + featurePad),
					y: r * rowHeight + yAdjust,
					width: featureWidth,
					height: featureHeight,
					fill: featureColors[featureType],
					type: featureType,
				}
				if (featureType === 'lake' && upNeighbor?.type === 'lake') {
					feature.river = true
				}
				leftNeighbor = feature
				featureMap[r * WORD_LENGTH + t] = feature
				features.push(feature)
			}
		}
	}

	onMount(() => {
		currentRow.subscribe((cr) => {
			_currentRow = cr
			updateGraph()
		})
	})
</script>

{#if features.length > 0 && canDraw}
	<svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} xmlns="http://www.w3.org/2000/svg">
		<rect
			y={(graphHeight / 6) * $currentRow - platformRadius * 2}
			width={graphWidth}
			height={platformRadius * 2}
			fill="var(--ground-edge-color)"
			rx={platformRadius}
		/>
		<rect
			width={graphWidth}
			height={(graphHeight / 6) * $currentRow - rowMargin}
			fill="var(--ground-color)"
			rx={platformRadius}
		/>
		{#each features as feature, f}
			{#if feature.type === 'hill'}
				<defs>
					<clipPath id={`hill-clip-${f}`}>
						<rect
							x={feature.x}
							y={feature.y}
							width={feature.width}
							height={Math.min(feature.width / 2, feature.height) + 0.5}
						/>
					</clipPath>
					<mask id={`hill-mask-${f}`}>
						<rect
							x={feature.x}
							y={feature.y}
							width={feature.width}
							height={feature.height + featurePad}
							rx={featurePad}
							fill="white"
						/>
						<rect
							x={feature.x - 0.5}
							y={feature.y - 0.5}
							width={feature.width + 1}
							height={Math.min(feature.width / 2, feature.height) + 1}
							fill="black"
						/>
						<g fill="white">
							<circle
								clip-path={`url(#hill-clip-${f})`}
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
					mask={`url(#hill-mask-${f})`}
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
				{#if feature.river}
					<rect
						x={feature.x + featureWidth / 2 - 4}
						y={feature.y - rowHeight + feature.height - 0.5}
						width={8}
						height={rowHeight - feature.height + featurePad + 1}
						fill={feature.fill}
					/>
				{/if}
			{/if}
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
		--ground-edge-color: #b05492;
	}
</style>
