<script lang="ts">
	export let x: number
	export let y: number
	export let radius: number
	export let height: number

	let stroke = '#D6D3D7'
</script>

<path
	{stroke}
	fill="var(--tertiary-color)"
	stroke-width="1"
	stroke-linejoin="miter"
	stroke-miterlimit="8"
	d={`M${x - radius} ${y}
				l${radius} ${-radius * 1.4}
				l${radius} ${radius * 1.4}
				a${radius} ${radius / 2} 0 0 1 ${-radius * 2} 0
			Z`}
/>
