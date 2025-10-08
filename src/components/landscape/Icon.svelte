<script lang="ts">
	export let icon: 'wide' | 'color' | 'redraw' | 'photo'
	export let active = false
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox={icon === 'wide' ? '0 13 100 74' : '0 0 100 100'}
	width={icon === 'wide' ? '3rem' : '2.25rem'}
	class={icon}
	class:active
	height="2.25rem"
>
	{#if icon === 'color'}
		<g id="landscape_icon_color_1">
			<circle
				cx="72"
				cy="72"
				r="28"
				fill="var(--{active ? 'landscape' : 'after'}-color)"
			/>
			<circle cx="72" cy="72" r="14" fill={active ? 'var(--cta-color)' : 'none'} />
		</g>
		<g id="landscape_icon_color_2">
			<circle cx="28" cy="50" r="38.5" fill="var(--{active ? 'cta' : 'icon-bg'}-color)" />
			<circle
				cx="28"
				cy="50"
				r="28"
				fill="var(--{active ? 'landscape' : 'before'}-color)"
			/>
			<circle cx="28" cy="50" r="14" fill={active ? 'var(--cta-color)' : 'none'} />
		</g>
		<g id="landscape_icon_color_3">
			<circle cx="72" cy="28" r="38.5" fill="var(--{active ? 'cta' : 'icon-bg'}-color)" />
			<circle
				cx="72"
				cy="28"
				r="28"
				fill="var(--{active ? 'landscape' : 'correct'}-color)"
			/>
			<circle cx="72" cy="28" r="14" fill={active ? 'var(--cta-color)' : 'none'} />
		</g>
	{:else if icon === 'redraw'}
		<circle cx="50" cy="50" r="18" fill="var(--landscape-color)" />
		<g id="landscape_icon_redraw_1">
			<path
				fill="none"
				stroke="var(--after-color)"
				stroke-width="16"
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M79.698 79.698 a42 42 0 0 1 -59.397 0"
			/>
		</g>
		<g id="landscape_icon_redraw_2">
			<path
				fill="none"
				stroke="var(--icon-bg-color)"
				stroke-width="40"
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M20.302 79.698 a42 42 0 0 1 59.397 -59.397"
			/>
			<path
				fill="none"
				stroke="var(--before-color)"
				stroke-width="16"
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M20.302 79.698 a42 42 0 0 1 59.397 -59.397"
			/>
		</g>
		<g id="landscape_icon_redraw_3">
			<path
				fill="none"
				stroke="var(--icon-bg-color)"
				stroke-width="40"
				stroke-linecap="round"
				d="M20.302 20.302 a42 42 0 0 1 59.397 0 l12 12"
			/>
			<path
				fill="none"
				stroke="var(--correct-color)"
				stroke-width="16"
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M20.302 20.302 a42 42 0 0 1 59.397 0 l12 12 V8"
			/>
		</g>
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
		<circle cx="45" cy="32" r="12" fill="var(--icon-bg-color)" />
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
			stroke="var(--icon-bg-color)"
			fill="none"
		/>
		<rect
			id="landscape_icon_photo_flash"
			x="9"
			y="9"
			width="82"
			height="62"
			fill="var(--icon-bg-color)"
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
			id="landscape_icon_wide_hill"
			fill="var(--{active ? 'landscape' : 'before'}-color)"
			stroke="var(--{active ? 'landscape' : 'before'}-color)"
			stroke-width="4"
			stroke-linejoin="round"
			d="M106 72 a24 12 0 0 1 -24 -12 v-12 a24 24 0 0 1 24 -24 Z"
		/>
		<path
			id="landscape_icon_wide_tree"
			fill="var(--{active ? 'landscape' : 'correct'}-color)"
			stroke="var(--{active ? 'landscape' : 'correct'}-color)"
			stroke-width="4"
			stroke-linecap="round"
			d="M68.5 62 v-11 a7 7 0 1 1 0.01 0"
		/>
		<path
			id="landscape_icon_wide_pond"
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
			stroke="var(--{active ? 'cta' : 'icon-bg'}-color)"
			fill="none"
		/>
		<path
			d="M44 16 H97.5 V84 H44"
			stroke-width="5"
			stroke-linejoin="round"
			stroke-linecap="round"
			stroke="var(--landscape-color)"
			fill="none"
		/>
		<g id="landscape_icon_wide_divider">
			<path
				d="M50 18.5 v63"
				stroke-width="15"
				stroke="var(--{active ? 'cta' : 'icon-bg'}-color)"
				fill="none"
			/>
			<path
				d="M55 16 h-5 v68 h5"
				stroke-width={active ? 4.5 : 5}
				stroke="var(--landscape-color)"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-dasharray={active ? '5 9.7' : 'none'}
				fill="none"
			/>
			<path
				id="landscape_icon_wide_arrow"
				d={active ? 'M18 35 v30 L33 50 Z' : 'M35 35 v30 L20 50 Z'}
				fill="var(--landscape-color)"
				stroke-width="5"
				stroke="var(--landscape-color)"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</g>
		<path
			d="M50 16 H3 v68 H50"
			stroke-width={active ? 5 : 4.5}
			stroke="var(--landscape-color)"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-dasharray={active ? 'none' : '5 10.71'}
			fill="none"
		/>
	{/if}
</svg>

<style>
	svg {
		--icon-bg-color: var(--primary-color);
	}
	svg.color g {
		transition: transform 150ms ease-out;
	}
	#landscape_icon_color_1 {
		transform-origin: 69px 72px;
		transition-delay: 120ms;
	}
	#landscape_icon_color_2 {
		transform-origin: 31px 50px;
		transition-delay: 60ms;
	}
	#landscape_icon_color_3 {
		transform-origin: 69px 28px;
	}
	svg.redraw {
		overflow: visible;
	}
	svg.redraw g {
		transition: transform 600ms ease-in;
		transform-origin: 50px 50px;
	}
	#landscape_icon_redraw_1 {
		transition-delay: 80ms;
	}
	#landscape_icon_redraw_2 {
		transition-delay: 40ms;
	}
	svg.photo {
		transition: transform 100ms ease-in;
	}
	#landscape_icon_photo_flash {
		opacity: 0;
	}
	#landscape_icon_wide_arrow,
	#landscape_icon_wide_divider,
	#landscape_icon_wide_pond,
	#landscape_icon_wide_hill,
	#landscape_icon_wide_tree {
		transform-origin: 45px 50px;
		transition: transform 200ms ease-in;
	}

	@media (hover: hover) {
		:global(button:hover) svg {
			--icon-bg-color: var(--secondary-color);
		}
		:global(button:hover) svg.color g {
			transform: scale(0.6);
		}
		:global(button:hover:not(:disabled)) svg.redraw g {
			transform: rotate(360deg);
			transition: transform 1s ease-out;
		}
		:global(button:disabled) svg.redraw g {
			transition: transform 1.5s linear;
		}
		:global(button:hover:not(:disabled)) #landscape_icon_redraw_1 {
			transition-delay: 180ms;
		}
		:global(button:hover:not(:disabled)) #landscape_icon_redraw_2 {
			transition-delay: 90ms;
		}
		:global(button:hover:not(:disabled)) svg.photo {
			transform: rotate(10deg);
			transition: transform 200ms ease-out;
		}
		:global(button:hover) #landscape_icon_photo_flash {
			animation: fade_out 1.5s forwards ease-in;
			opacity: 1;
		}
		@keyframes fade_out {
			to {
				opacity: 0;
			}
		}
		:global(button:hover) #landscape_icon_wide_arrow {
			transition: transform 150ms ease-out;
			transform: scaleX(0.8);
		}
		:global(button:hover) #landscape_icon_wide_divider,
		:global(button:hover) #landscape_icon_wide_pond {
			transform: translateX(-13px);
			transition: transform 150ms ease-out;
		}
		:global(button:hover) #landscape_icon_wide_hill {
			transform: translateX(-2px);
			transition: transform 150ms ease-out;
		}
		:global(button:hover) #landscape_icon_wide_tree {
			transform: translateX(-4px);
			transition: transform 150ms ease-out;
		}
		:global(button:hover) .active #landscape_icon_wide_arrow {
			transform: scaleX(1.2);
		}
		:global(button:hover) .active #landscape_icon_wide_divider {
			transform: translateX(13px);
			transition: transform 150ms ease-out;
		}
		:global(button:hover) .active #landscape_icon_wide_pond {
			transform: translateX(2px);
			transition: transform 150ms ease-out;
		}
		:global(button:hover) .active #landscape_icon_wide_hill {
			transform: translateX(6px);
			transition: transform 150ms ease-out;
		}
		:global(button:hover) .active #landscape_icon_wide_tree {
			transform: translateX(6px);
			transition: transform 150ms ease-out;
		}
	}

	@media (prefers-reduced-motion) {
		* {
			transition: none !important;
			animation: none !important;
		}
	}
</style>
