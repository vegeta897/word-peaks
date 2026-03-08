<script lang="ts">
	export let animal: string
	export let xJitter = 0
	export let yJitter = 0
	export let xOffset = 0
	export let yOffset = 0
	export let xOrigin = 0
	export let delay = 0
	export let face = 1
	export let sunken = false

	$: animalCode = `${animal.charCodeAt(0)}${animal.charCodeAt(1)}`

	let element: SVGGElement

	const bumpAnimation = [
		{ easing: 'ease-out' },
		{ easing: 'ease-in', transform: `translateY(-0.5px)` },
		{},
	]

	export function bump(delay: number) {
		element.animate(bumpAnimation, {
			duration: 200,
			delay: Math.round(delay * 100),
		})
	}
</script>

{#if sunken}
	<clipPath id="sunken-{animalCode}-clip">
		<rect x={xOffset - 1.5} y={yOffset - 3.25} width={3} height={3}></rect>
	</clipPath>
{/if}
<g clip-path="url(#sunken-{animalCode}-clip)">
	<g
		class:intro={delay > 0}
		style:user-select="none"
		style:animation-delay="{delay + 200}ms"
		bind:this={element}
	>
		<text
			style:transform="scaleX({(xJitter < 0 ? -1 : 1) * face})"
			style:transform-origin="{xOrigin}px 0"
			text-anchor="middle"
			x={-xJitter * 1.5 + xOffset}
			y={-yJitter + yOffset}
			font-size="{sunken ? 1.25 : 1.5}px"
		>
			{animal}
		</text>
	</g>
</g>

<style>
	.intro {
		animation: popup 150ms both;
	}

	@keyframes popup {
		0% {
			opacity: 0;
			transform: translateY(0.5px);
			animation-timing-function: ease-out;
		}
		80% {
			transform: translateY(-0.1px);
			animation-timing-function: ease-in;
		}
	}
</style>
