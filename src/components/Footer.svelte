<script lang="ts">
	import { t } from '$lib/translations'
	import { DiscordIconPathData, TwitterIconPathData } from '$lib/icons'
</script>

<footer>
	<div class="footer-row">
		<p>{@html $t('main.footer.credits')}</p>
	</div>
	<div class="footer-row">
		<div class="footer-item icon-item">
			<svg
				class="icon"
				viewBox="0 0 71 55"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>Discord</title>
				<path d={DiscordIconPathData} fill="#bbbbbb" />
			</svg>
			<pre>vegeta897</pre>
		</div>
		<div class="footer-item icon-item">
			<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 248 204">
				<title>Twitter</title>
				<path fill="#bbbbbb" d={TwitterIconPathData} />
			</svg>
			<a href="https://twitter.com/vegeta897">@vegeta897</a>
		</div>
	</div>
</footer>

<style>
	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin: 1rem auto 0.25rem;
	}

	.footer-row {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		margin: 0 0.25rem;
	}

	.footer-row p {
		margin: 0 0 0.25rem;
		color: #bbbbbb;
	}

	.icon-item {
		display: flex;
		align-items: center;
		margin: 0.25rem 0.75rem;
	}

	.icon-item .icon {
		width: 1.5rem;
		height: 1.5rem;
		margin-right: 0.5rem;
	}

	pre {
		font-size: 1.25em;
		background: var(--secondary-color);
		padding: 0.25rem 0.375rem;
		border-radius: 0.25rem;
		margin: 0;
	}
</style>
