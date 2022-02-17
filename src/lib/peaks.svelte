<script lang="ts">
	export let points = []
	export let id

	$: linePoints = points.map((p) => p.join(',')).join(' ')
</script>

<svg
	viewBox="-8 0 516 100"
	class="chart"
	preserveAspectRatio="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<defs>
		<linearGradient id="score" x1="0" x2="0" y1="0" y2="1">
			<stop stop-color="#e99637" offset="20%" />
			<stop stop-color="#94493a" offset="50%" />
			<stop stop-color="#3e3b65" offset="50%" />
			<stop stop-color="#3859b3" offset="80%" />
		</linearGradient>
	</defs>
	{#if points.length > 0}
		<mask id={`mask${id}`}>
			<polygon fill="#fff" points={linePoints} />
		</mask>

		<rect x="0" y="0" width="500" height="100" fill="url(#score)" mask={`url(#mask${id})`} />
		<!--		<rect x="0" y="50" width="500" height="50" fill="#469" mask={`url(#mask${id})`} />-->
	{/if}

	<!--	<line-->
	<!--		stroke="#fff"-->
	<!--		stroke-width="2"-->
	<!--		vector-effect="non-scaling-stroke"-->
	<!--		stroke-opacity="0.2"-->
	<!--		x1="0"-->
	<!--		x2="500"-->
	<!--		y1="50"-->
	<!--		y2="50"-->
	<!--	/>-->
</svg>

<style>
	svg {
		width: 100%;
		height: 100%;
	}
</style>
