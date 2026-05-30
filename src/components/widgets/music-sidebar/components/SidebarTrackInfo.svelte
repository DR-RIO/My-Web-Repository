<script lang="ts">
	import Icon from "@iconify/svelte";
	import { onMount } from "svelte";

	import type { Song } from "../../music-player/types";

	interface Props {
		currentSong: Song;
		currentTime: number;
		duration: number;
		volume: number;
		isMuted: boolean;
		onToggleMute: () => void;
		onSetVolume: (volume: number) => void;
		onSearchArtist?: (artist: string) => void;
	}

	const {
		currentSong,
		currentTime,
		duration,
		volume,
		isMuted,
		onToggleMute,
		onSetVolume,
		onSearchArtist,
	}: Props = $props();

	const currentTimeLabel = $derived(
		`${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, "0")}`,
	);

	const durationLabel = $derived(
		`${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, "0")}`,
	);

	const volumePercent = $derived(
		isMuted ? 0 : Math.max(0, Math.min(100, volume * 100)),
	);

	const thumbPosition = $derived(Math.min(95, Math.max(5, volumePercent)));

	let isVolumeDragging = false;

	// 滚动相关
	let titleContainer: HTMLElement;
	let artistContainer: HTMLElement;
	let titleOverflow = false;
	let artistOverflow = false;
	let titleScrollDistance = "-100%";
	let artistScrollDistance = "-100%";

	function calculateScrollDistance(
		container: HTMLElement | undefined,
	): string {
		if (!container) return "-100%";
		const scrollWidth = container.scrollWidth;
		const clientWidth = container.clientWidth;
		const distance = scrollWidth - clientWidth;
		return `-${distance}px`;
	}

	function checkOverflow() {
		setTimeout(() => {
			if (titleContainer) {
				titleOverflow =
					titleContainer.scrollWidth > titleContainer.clientWidth;
				titleScrollDistance = calculateScrollDistance(titleContainer);
				titleContainer.style.setProperty(
					"--scroll-distance",
					titleScrollDistance,
				);
			}
			if (artistContainer) {
				artistOverflow =
					artistContainer.scrollWidth > artistContainer.clientWidth;
				artistScrollDistance = calculateScrollDistance(artistContainer);
				artistContainer.style.setProperty(
					"--scroll-distance",
					artistScrollDistance,
				);
			}
		}, 50);
	}

	$effect(() => {
		if (currentSong?.title || currentSong?.artist) {
			checkOverflow();
		}
	});

	onMount(() => {
		checkOverflow();
		window.addEventListener("resize", checkOverflow);
		return () => window.removeEventListener("resize", checkOverflow);
	});

	// 分割歌手名为可点击的部分
	const artistParts = $derived(() => {
		if (!currentSong?.artist || !onSearchArtist) return [];

		// 按 "/" 分割
		return currentSong.artist
			.split("/")
			.map((part) => part.trim())
			.filter(Boolean);
	});

	function handleArtistClick(artist: string) {
		if (onSearchArtist) {
			onSearchArtist(artist);
		}
	}

	function handleVolumePointer(event: PointerEvent) {
		const el = event.currentTarget as HTMLElement | null;
		if (!el) return;

		event.preventDefault();

		isVolumeDragging = true;

		const rect = el.getBoundingClientRect();
		let percent = (event.clientX - rect.left) / rect.width;
		percent = Math.max(0, Math.min(1, percent));

		onSetVolume(percent);
		el.setPointerCapture(event.pointerId);
	}

	function handleVolumeMove(event: PointerEvent) {
		if (!isVolumeDragging) return;

		event.preventDefault();

		const el = event.currentTarget as HTMLElement | null;
		if (!el) return;

		const rect = el.getBoundingClientRect();
		let percent = (event.clientX - rect.left) / rect.width;
		percent = Math.max(0, Math.min(1, percent));

		onSetVolume(percent);
	}

	function handleVolumeEnd() {
		isVolumeDragging = false;
	}

	function handleVolumeKeyDown(event: KeyboardEvent) {
		if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
			event.preventDefault();
			onSetVolume(Math.max(0, volume - 0.05));
		} else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
			event.preventDefault();
			onSetVolume(Math.min(1, volume + 0.05));
		} else if (event.key === "Enter") {
			event.preventDefault();
			onToggleMute();
		}
	}
</script>

<div class="flex flex-col min-w-0 flex-1 overflow-hidden">
	<div class="title-row">
		<div
			bind:this={titleContainer}
			class="scroll-container"
			class:has-overflow={titleOverflow}
			style="--scroll-distance: {titleScrollDistance}"
		>
			<div class="scroll-content">
				<span class="title-text">{currentSong.title}</span>
			</div>
		</div>
	</div>

	<div class="artist-row">
		<div
			bind:this={artistContainer}
			class="scroll-container"
			class:has-overflow={artistOverflow}
			style="--scroll-distance: {artistScrollDistance}"
		>
			<div class="scroll-content">
				{#if onSearchArtist}{#each artistParts() as artist, index}{#if index > 0}<span
								class="artist-separator">/</span
							>{/if}<button
							type="button"
							class="artist-btn"
							onclick={() => handleArtistClick(artist)}
							>{artist}</button
						>{/each}{:else}<span class="artist-text"
						>{currentSong.artist}</span
					>{/if}
			</div>
		</div>
	</div>

	<div class="meta-row">
		<div class="time-label" aria-live="polite">
			<span>{currentTimeLabel}</span>
			<span class="divider">/</span>
			<span>{durationLabel}</span>
		</div>

		<div class="volume-wrap">
			<button
				type="button"
				class="volume-btn"
				onclick={onToggleMute}
				aria-label="Toggle volume"
			>
				<Icon
					icon={isMuted || volume === 0
						? "material-symbols:volume-off-rounded"
						: "material-symbols:volume-up-rounded"}
					class="text-base"
				/>
			</button>

			<div
				class="volume-slider"
				onpointerdown={handleVolumePointer}
				onpointermove={handleVolumeMove}
				onpointerup={handleVolumeEnd}
				onpointercancel={handleVolumeEnd}
				onkeydown={handleVolumeKeyDown}
				role="slider"
				tabindex="0"
				aria-label="Volume"
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuenow={volumePercent}
			>
				<div class="volume-track"></div>
				<div
					class="volume-fill"
					style={`width: ${volumePercent}%`}
				></div>
				<div
					class="volume-thumb"
					style={`left: ${thumbPosition}%`}
				></div>
			</div>
		</div>
	</div>
</div>

<style>
	.title-row {
		margin-bottom: 0.06rem;
	}

	.title-text {
		font-weight: 600;
		color: var(--content-main);
		line-height: 1.1;
		white-space: nowrap;
	}

	:global(.dark) .title-text {
		color: rgb(245 245 245);
	}

	.artist-text {
		font-size: 0.75rem;
		color: var(--content-meta);
		white-space: nowrap;
	}

	.artist-btn {
		font-size: 0.75rem;
		color: var(--content-meta);
		white-space: nowrap;
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: color 0.15s;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.artist-btn:hover {
		color: var(--primary);
	}

	.artist-btn:active {
		opacity: 0.7;
	}

	.artist-separator {
		color: var(--content-meta);
		white-space: nowrap;
		margin: 0;
	}

	.artist-row {
		margin-bottom: 0.36rem;
	}

	/* 滚动容器样式 */
	.scroll-container {
		position: relative;
		overflow: hidden;
		width: 100%;
		max-width: 100%;
	}

	.scroll-content {
		display: inline-block;
		white-space: nowrap;
	}

	/* 当有溢出时启用滚动动画 */
	.scroll-container.has-overflow .scroll-content {
		animation: scroll-back-forth 10s ease-in-out infinite;
		animation-delay: 1s;
	}

	@keyframes scroll-back-forth {
		0% {
			transform: translateX(0);
		}
		42.5% {
			transform: translateX(var(--scroll-distance));
		}
		57.5% {
			transform: translateX(var(--scroll-distance));
		}
		100% {
			transform: translateX(0);
		}
	}

	/* 移动端优化 - 触摸时暂停动画 */
	@media (hover: none) and (pointer: coarse) {
		.scroll-container.has-overflow .scroll-content:active {
			animation-play-state: paused;
		}
	}

	.meta-row {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		min-width: 0;
		justify-content: flex-start;
	}

	.time-label {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		font-size: 10px;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		color: var(--content-meta);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.divider {
		opacity: 0.6;
	}

	.volume-wrap {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		min-width: 0;
		justify-content: flex-end;
		margin-left: auto;
		transform: translateX(-2px);
	}

	/* 音量按钮样式 */
	.volume-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.375rem;
		color: var(--content-meta);
		transition: color 150ms ease;
		flex-shrink: 0;
		background: transparent;
		border: none;
		cursor: pointer;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.volume-btn::before {
		content: "";
		position: absolute;
		top: -8px;
		left: -8px;
		right: -8px;
		bottom: -8px;
	}

	.volume-btn:hover {
		color: var(--primary);
	}

	/* 音量条样式 */
	.volume-slider {
		position: relative;
		width: 4rem;
		height: 0.25rem;
		border-radius: 9999px;
		cursor: pointer;
		flex-shrink: 0;
		transition: height 150ms ease;
		touch-action: none;
	}

	.volume-slider::before {
		content: "";
		position: absolute;
		top: -12px;
		left: 0;
		right: 0;
		height: calc(100% + 24px);
		background: transparent;
		pointer-events: auto;
	}

	@media (hover: hover) {
		.volume-slider:hover,
		.volume-slider:focus-visible {
			height: 0.375rem;
		}
	}

	.volume-track {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 9999px;
		background: color-mix(
			in srgb,
			var(--btn-regular-bg) 80%,
			var(--content-meta) 20%
		);
	}

	.volume-fill {
		position: relative;
		height: 100%;
		background: var(--primary);
		border-radius: inherit;
		transition: width 100ms linear;
		z-index: 1;
	}

	.volume-thumb {
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);

		width: 7px;
		height: 7px;
		border-radius: 50%;

		background: #fff;
		border: 2px solid var(--primary);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

		opacity: 0;
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;

		pointer-events: none;
		z-index: 2;
	}

	@media (hover: hover) {
		.volume-slider:hover .volume-thumb,
		.volume-slider:focus-visible .volume-thumb {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.15);
		}
	}

	@media (hover: none) and (pointer: coarse) {
		.volume-thumb {
			width: 12px;
			height: 12px;
			opacity: 1;
		}
	}

	.volume-slider:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	/* 移动端优化 */
	@media (max-width: 768px) {
		.volume-slider {
			height: 0.375rem;
		}

		.volume-thumb {
			width: 10px;
			height: 10px;
		}

		.scroll-content {
			padding-right: 1rem;
		}

		.artist-btn {
			padding: 4px 0;
			min-height: 44px;
		}
	}

	/* 响应式 */
	@media (max-width: 520px) {
		.artist-row {
			margin-bottom: 0.28rem;
		}

		.meta-row {
			gap: 0.4rem;
		}

		.time-label {
			font-size: 9px;
		}

		.volume-wrap {
			gap: 0.25rem;
			margin-right: 2px;
		}

		.volume-btn {
			width: 1.25rem;
			height: 1.25rem;
		}

		.volume-slider {
			width: 3.2rem;
			height: 0.375rem;
		}

		.volume-thumb {
			width: 10px;
			height: 10px;
		}
	}
</style>
