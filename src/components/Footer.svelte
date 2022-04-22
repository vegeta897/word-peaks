<script lang="ts">
	import { t } from '$lib/translations'
	import { DiscordIconPathData, TwitterIconPathData } from '$lib/icons'
</script>

<footer>
	<div class="footer-item important">
		<p>📢 <strong>{$t('main.footer.translate_looking')}</strong></p>
		<p>{@html $t('main.footer.translate_contribute')}</p>
	</div>
	<hr />
	<div class="footer-item">
		{@html $t('main.footer.credits')}
	</div>
	<div class="footer-item icon-row">
		<svg class="icon" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path clip-path="url(#clip0)" d={DiscordIconPathData} fill="#cccccc" />
			<defs>
				<clipPath id="clip0">
					<rect width="71" height="55" fill="#ffffff" />
				</clipPath>
			</defs>
		</svg>
		<pre>vegeta897#7777</pre>
	</div>
	<div class="footer-item icon-row">
		<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 248 204">
			<path fill="#cccccc" d={TwitterIconPathData} />
		</svg>
		<a href="https://twitter.com/vegeta897">@vegeta897</a>
	</div>
</footer>

<style>
	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		margin: 1rem auto 0.2rem;
		max-width: 254px;
	}

	footer p {
		margin: 0 0 0.2rem;
	}

	footer .icon {
		width: 24px;
		height: 24px;
	}

	.footer-item {
		margin: 0.4rem 0 0;
		opacity: 0.8;
	}

	.footer-item.important {
		opacity: 1;
	}

	hr {
		width: 100%;
		opacity: 0.5;
		border-top: 0 solid var(--text-color);
		margin-top: 0.6rem;
	}

	.icon-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	pre {
		font-size: 1.2em;
		background: var(--secondary-color);
		padding: 0.2em 0.4em;
		border-radius: 4px;
		margin: 0;
	}
</style>
