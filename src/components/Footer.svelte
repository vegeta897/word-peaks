<script lang="ts">
	import { t } from '$lib/translations'
	import { DiscordIconPathData, TwitterIconPathData } from '$lib/icons'
</script>

<footer>
	<div class="footer-row">
		<p>{@html $t('main.footer.credits')}</p>
	</div>
	<div class="footer-row">
		<p>{@html $t('main.footer.donate')}</p>
	</div>
	<div class="footer-row">
		<div class="footer-item icon-item">
			<svg class="icon" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
				<title>Discord</title>
				<path d={DiscordIconPathData} fill="#cccccc" />
			</svg>
			<pre>vegeta897#7777</pre>
		</div>
		<div class="footer-item icon-item">
			<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 248 204">
				<title>Twitter</title>
				<path fill="#cccccc" d={TwitterIconPathData} />
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
		margin: 1rem auto 0.2rem;
		opacity: 0.8;
	}

	.footer-row {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		margin: 0 4px;
	}

	.footer-row p {
		margin: 0 0 0.2rem;
	}

	.icon-item {
		display: flex;
		align-items: center;
		margin: 0.2rem 0.7rem 0;
	}

	.icon-item .icon {
		width: 24px;
		height: 24px;
		margin-right: 0.5rem;
	}

	pre {
		font-size: 1.2em;
		background: var(--secondary-color);
		padding: 0.2em 0.4em;
		border-radius: 4px;
		margin: 0;
	}
</style>
