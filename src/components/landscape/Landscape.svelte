<script lang="ts">
	import * as store from '$src/store'
	import { get } from 'svelte/store'
	import type { Landscape } from '$lib/landscape/landscape'
	import { getLandscape } from '$lib/landscape/landscape'
	import Tree from './Tree.svelte'
	import Hill from './Hill.svelte'
	import Pond from './Pond.svelte'
	import { getDistance, type XY } from '$lib/math'
	import { tick } from 'svelte'
	import { bezierEasing } from '$lib/transitions'

	const { landscapeForceColor, landscapeFunMode } = store

	let initializing = true
	let svgElement: SVGElement
	let containerWidth: number
	let containerHeight: number
	let svgWidth = 0
	let svgHeight = 0
	let hide = false
	let animate = false
	let firstDraw = true
	let redraw = 0

	let landscape: Landscape = {
		width: 0,
		height: 0,
		centerX: 0,
		centerY: 0,
		rowsGenerated: 0,
		features: [],
		tileMap: new Map(),
		openTiles: new Map(),
		pondTiles: [],
		newPondTiles: [],
		nextID: 1,
		totalDelay: 0,
	}

	const IDEAL_TILE_COUNT = 240
	const IDEAL_TILE_COUNT_MINI = 170

	function updateDimensions(width: number, height: number) {
		const ratio = height / (width / 1.5)
		let tileHeight = height / Math.sqrt(IDEAL_TILE_COUNT * ratio) // Yay math
		landscape.mini = false
		if (tileHeight < 12) {
			tileHeight = height / Math.sqrt(IDEAL_TILE_COUNT_MINI * ratio)
			landscape.mini = true
		}
		const tileWidth = tileHeight * 1.5
		const newWidth = Math.floor(width / tileWidth)
		const newHeight = Math.floor(height / tileHeight)
		svgWidth = Math.ceil(newWidth * tileWidth)
		svgHeight = Math.ceil(newHeight * tileHeight)
		if (newWidth === landscape.width && newHeight === landscape.height) return
		landscape.width = newWidth
		landscape.height = newHeight
		landscape.centerX = Math.floor(newWidth / 2)
		landscape.centerY = Math.floor(newHeight / 2)
		animate = false
		redraw++
		clearLandscape()
		updateLandscape()
	}

	function clearLandscape() {
		landscape.rowsGenerated = 0
		landscape.openTiles.clear()
		landscape.tileMap.clear()
		landscape.features.length = 0
		landscape.pondTiles.length = 0
		landscape.newPondTiles.length = 0
		landscape.nextID = 1
		landscape.pondDelay = undefined
	}

	function updateLandscape() {
		// Loop through un-drawn rows as needed (e.g. loading a completed puzzle)
		// Preserve already-drawn feature rows if metrics haven't changed
		if (initializing || !landscape.width) return
		const currentRow = get(store.currentRow)
		if (currentRow === 0) {
			if (landscape.rowsGenerated > 0) clearLandscape()
			return
		}
		if (firstDraw || landscape.rowsGenerated > 0) {
			firstDraw = false
			animate = true
		}
		if (get(store.landscapeRedraw)) {
			animate = true
			store.landscapeRedraw.set(false)
		}
		if (currentRow === landscape.rowsGenerated) return
		landscape = getLandscape(
			landscape,
			get(store.boardContent),
			get(store.answer),
			currentRow
		)
		store.landscape.set(landscape)
		hide = false
	}

	$: if (containerWidth && containerHeight)
		updateDimensions(containerWidth, containerHeight)

	store.landscapeNewGame.subscribe((newGame) => {
		if (!newGame) return
		initializing = false
		store.landscapeNewGame.set(false)
		firstDraw = true
		redraw++
		clearLandscape()
		// Skip update if landscapeWideView is true, because it is about to change
		if (!get(store.landscapeWideView)) updateLandscape()
	})
	store.landscapeNewRow.subscribe((newRow) => {
		if (!newRow) return
		store.landscapeNewRow.set(false)
		updateLandscape()
	})
	store.landscapeRedraw.subscribe((doRedraw) => {
		if (!doRedraw) return
		firstDraw = true
		redraw++
		clearLandscape()
		updateLandscape()
	})
	// Hide landscape until it updates to avoid flashing on FF
	store.landscapeWideView.subscribe(() => (hide = true))

	type FlashColorHandler = (x: number, y: number, duration: number) => void
	const featureComponents: {
		flashColor: FlashColorHandler
	}[] = []
	let pondComponent: {
		flashColor: FlashColorHandler
	}

	function updateMousePosition(offsetX: number, offsetY: number) {
		mouseX = -0.1 + (offsetX / svgWidth) * (landscape.width * 1.5 + 0.2)
		mouseY = -0.1 + (offsetY / svgHeight) * (landscape.height + 0.2)
	}

	let lastFlashAt = 0
	let flashDurationExtra = 0
	let lastFlashXY: null | XY = null
	let flashAnimateElement: SVGAnimateElement
	$: landscapeSpan = getDistance(landscape.width + 3, landscape.height + 3)

	const onPointerDown: svelte.JSX.PointerEventHandler<SVGElement> = (event) => {
		// TODO: Handle multi touch
		if (event.pointerType === 'mouse' && event.button !== 0) return
		mouseDown = true
		event.preventDefault()
		updateMousePosition(event.offsetX, event.offsetY)
		if (get(landscapeFunMode) === null) {
			const now = Date.now()
			// This is brilliant
			flashDurationExtra = Math.max(
				0,
				Math.min(3500, flashDurationExtra + lastFlashAt + 250 - now)
			)
			const duration = landscapeSpan * 70 + flashDurationExtra
			featureComponents.forEach((f) => f?.flashColor(mouseX, mouseY, duration))
			pondComponent.flashColor(mouseX, mouseY, duration)
			lastFlashAt = now
		}
		lastFlashXY = [mouseX, mouseY]
		// TODO: Use different effect in fun modes
		tick().then(() => flashAnimateElement?.beginElement())
	}

	let mouseOver = false
	let mouseDown = false
	let mouseX: number
	let mouseY: number

	const onWindowPointerMove: svelte.JSX.PointerEventHandler<Window> = (event) => {
		// TODO: Perhaps not needed, pointermove continues to fire on elements outside of SVG
		// But if needed, just store pageX/Y of mouse on pointerdown and compare to this event
	}
	const onPointerUp: svelte.JSX.PointerEventHandler<Window> = () => (mouseDown = false)
	const onSVGPointerMove: svelte.JSX.PointerEventHandler<SVGElement> = (event) => {
		mouseOver = true // OK to redundantly assign, doesn't re-trigger reactivity
		updateMousePosition(event.offsetX, event.offsetY)
	}
	const onMouseLeave = () => (mouseOver = false)

	$: if (svgElement) store.landscapeSVG.set(svgElement)
</script>

<svelte:window on:pointerup={onPointerUp} on:pointermove={onWindowPointerMove} />
<div bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
	<svg
		style:display={hide ? 'none' : 'block'}
		xmlns="http://www.w3.org/2000/svg"
		width={svgWidth}
		height={svgHeight}
		style:left="{Math.floor((containerWidth - svgWidth) / 2)}px"
		viewBox="-0.1 -0.1 {landscape.width * 1.5 + 0.2} {landscape.height + 0.2}"
		on:pointerdown={onPointerDown}
		on:pointermove={onSVGPointerMove}
		on:mouseleave={onMouseLeave}
		bind:this={svgElement}
	>
		{#key redraw}
			<Pond
				bind:this={pondComponent}
				tiles={landscape.pondTiles}
				newTiles={landscape.newPondTiles}
				{animate}
				delay={landscape.pondDelay || 0}
				landscapeWidth={landscape.width}
				landscapeHeight={landscape.height}
				mini={landscape.mini}
				forceColor={$landscapeForceColor}
			/>
			{#each landscape.features as feature, f (feature.id)}
				{#if feature.type === 'tree'}
					<Tree
						id={feature.id}
						x={feature.x}
						y={feature.y}
						xJitter={feature.xJitter}
						yJitter={feature.yJitter}
						size={feature.size}
						{animate}
						delay={feature.delay}
						{mouseOver}
						{mouseDown}
						{mouseX}
						{mouseY}
						forceColor={$landscapeForceColor}
						pluckMode={$landscapeFunMode === 'pluck'}
						bind:this={featureComponents[f]}
					/>
				{:else}
					<Hill
						id={feature.id}
						x={feature.x}
						y={feature.y}
						xJitter={feature.xJitter}
						yJitter={feature.yJitter}
						size={feature.size}
						mini={landscape.mini}
						{animate}
						delay={feature.delay}
						{mouseOver}
						{mouseX}
						{mouseY}
						forceColor={$landscapeForceColor}
						bind:this={featureComponents[f]}
					/>
				{/if}
			{/each}
		{/key}
		{#if lastFlashXY}
			{@const [cx, cy] = lastFlashXY}
			<ellipse
				{cx}
				{cy}
				style:transform-origin="{cx}px {cy}px"
				rx="1.5"
				ry="1"
				fill="#fff7"
			>
				<animate
					bind:this={flashAnimateElement}
					id="landscape_flash_animate"
					attributeName="opacity"
					values="1;0"
					calcMode="spline"
					keySplines={bezierEasing.circOut}
					dur="250ms"
					fill="freeze"
					begin="indefinite"
				/>
				<animateTransform
					attributeName="transform"
					type="scale"
					values="0;1"
					calcMode="spline"
					keySplines={bezierEasing.circOut}
					dur="250ms"
					fill="freeze"
					begin="landscape_flash_animate.begin"
				/>
			</ellipse>
		{/if}
	</svg>
</div>

<style>
	div {
		height: 100%;
		position: relative;
		-webkit-user-select: none;
		user-select: none;
	}
	svg {
		position: absolute;
		bottom: 0;
		overflow: visible;
		touch-action: none;
		/* background: #0f21; */
	}
</style>
