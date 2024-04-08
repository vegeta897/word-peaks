<script lang="ts">
	export let icon: 'wide' | 'color' | 'redraw' | 'photo'
	export let active = false
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox={icon === 'wide' ? '0 13 100 74' : '0 0 100 100'}
	width={icon === 'wide' ? '48px' : '36px'}
	height="36px"
>
	{#if icon === 'color'}
		<circle cx="72" cy="72" r="28" fill="var(--{active ? 'landscape' : 'after'}-color)" />
		<circle cx="72" cy="72" r="14" fill={active ? 'var(--cta-color)' : 'none'} />
		<circle cx="28" cy="50" r="38.5" fill="var(--{active ? 'cta' : 'primary'}-color)" />
		<circle
			cx="28"
			cy="50"
			r="28"
			fill="var(--{active ? 'landscape' : 'before'}-color)"
		/>
		<circle cx="28" cy="50" r="14" fill={active ? 'var(--cta-color)' : 'none'} />
		<circle cx="72" cy="28" r="38.5" fill="var(--{active ? 'cta' : 'primary'}-color)" />
		<circle
			cx="72"
			cy="28"
			r="28"
			fill="var(--{active ? 'landscape' : 'correct'}-color)"
		/>
		<circle cx="72" cy="28" r="14" fill={active ? 'var(--cta-color)' : 'none'} />
	{:else if icon === 'redraw'}
		<circle cx="50" cy="50" r="18" fill="var(--landscape-color)" />
		<path
			fill="none"
			stroke="var(--after-color)"
			stroke-width="16"
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M{50 + (Math.SQRT2 / 2) * 42} {50 +
				(Math.SQRT2 / 2) * 42} a42 42 0 0 1 {-Math.SQRT2 * 42} 0"
		/>
		<path
			fill="none"
			stroke="var(--primary-color)"
			stroke-width="40"
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M{50 - (Math.SQRT2 / 2) * 42} {50 + (Math.SQRT2 / 2) * 42} A42 42 0 0 1 8 50"
		/>
		<path
			fill="none"
			stroke="var(--before-color)"
			stroke-width="16"
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M{50 - (Math.SQRT2 / 2) * 42} {50 +
				(Math.SQRT2 / 2) * 42} a42 42 0 0 1 0 {-Math.SQRT2 * 42}"
		/>
		<path
			fill="none"
			stroke="var(--primary-color)"
			stroke-width="40"
			stroke-linecap="round"
			d="M{50 - (Math.SQRT2 / 2) * 42} {50 - (Math.SQRT2 / 2) * 42} A42 42 0 0 1 50 8"
		/>
		<path
			fill="none"
			stroke="var(--correct-color)"
			stroke-width="16"
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M{50 - (Math.SQRT2 / 2) * 42} {50 -
				(Math.SQRT2 / 2) * 42} a42 42 0 0 1 {Math.SQRT2 * 42} 0 l12 12 V8"
		/>
	{:else if icon === 'photo'}
		<path
			fill="var(--before-color)"
			stroke="var(--before-color)"
			stroke-width="4"
			stroke-linejoin="round"
			d="M87 66 a24 12 0 0 1 -24 -12 v-12 a24 24 0 0 1 24 -24 Z"
		/>
		<path
			fill="var(--correct-color)"
			stroke="var(--correct-color)"
			stroke-width="4"
			stroke-linecap="round"
			d="M28 44 v-11 a7 7 0 1 1 0.01 0"
		/>
		<circle cx="45" cy="32" r="12" fill="var(--primary-color)" />
		<path
			fill="var(--correct-color)"
			stroke="var(--correct-color)"
			stroke-width="4"
			stroke-linecap="round"
			d="M45 50 v-11 a7 7 0 1 1 0.01 0"
		/>
		<path
			fill="var(--after-color)"
			stroke="var(--after-color)"
			stroke-width="4"
			d="M61 77 q0 -14 -22 -14 q-22 0 -22 -14 q0 -14 -22 -14 v48 Z"
		/>
		<rect
			x="9"
			y="9"
			width="82"
			height="62"
			stroke-width="6.1"
			stroke="var(--primary-color)"
			fill="none"
		/>
		<rect
			x="3"
			y="3"
			width="94"
			height="94"
			stroke-width="6"
			stroke-linejoin="round"
			stroke="var(--landscape-color)"
			fill="none"
		/>
		<rect x="4" y="74" width="92" height="22" fill="var(--landscape-color)" />
	{:else}
		<path
			fill="var(--{active ? 'landscape' : 'before'}-color)"
			stroke="var(--{active ? 'landscape' : 'before'}-color)"
			stroke-width="4"
			stroke-linejoin="round"
			d="M106 72 a24 12 0 0 1 -24 -12 v-12 a24 24 0 0 1 24 -24 Z"
		/>
		<path
			fill="var(--{active ? 'landscape' : 'correct'}-color)"
			stroke="var(--{active ? 'landscape' : 'correct'}-color)"
			stroke-width="4"
			stroke-linecap="round"
			d="M68.5 62 v-11 a7 7 0 1 1 0.01 0"
		/>
		<path
			fill="var(--{active ? 'landscape' : 'after'}-color)"
			stroke="var(--{active ? 'landscape' : 'after'}-color)"
			stroke-width="4"
			d="M80 83 q0 -16 -24 -16 v16 Z"
		/>
		<rect
			x="7.5"
			y="21"
			width="85.5"
			height="58"
			stroke-width="5.1"
			stroke="var(--{active ? 'cta' : 'primary'}-color)"
			fill="none"
		/>
		<path
			d="M50 16 v68"
			stroke-width="15"
			stroke="var(--{active ? 'cta' : 'primary'}-color)"
			fill="none"
		/>
		<rect
			x={active ? 2.5 : 50}
			y="16"
			width={active ? 95 : 47.5}
			height="68"
			stroke-width="5"
			stroke-linejoin="round"
			stroke="var(--landscape-color)"
			fill="none"
		/>
		<path
			d="M50 16{active ? '' : 'H3'} v68{active ? '' : 'H50'}"
			stroke-width="5"
			stroke="var(--landscape-color)"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-dasharray="5 10.71"
			fill="none"
		/>
		{#if active}
			<path
				d="M18 35 v30 L33 50 Z"
				fill="var(--landscape-color)"
				stroke-width="5"
				stroke="var(--landscape-color)"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		{:else}
			<path
				d="M35 35 v30 L20 50 Z"
				fill="var(--landscape-color)"
				stroke-width="5"
				stroke="var(--landscape-color)"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		{/if}
	{/if}
</svg>
