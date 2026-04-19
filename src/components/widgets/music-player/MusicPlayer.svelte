<script lang="ts">
	import Icon from "@iconify/svelte";
	import { onDestroy, onMount } from "svelte";

	import { musicPlayerConfig } from "@/config";
	import type { MusicPlayerState } from "@/stores/musicPlayerStore";
	import { musicPlayerStore } from "@/stores/musicPlayerStore";

	import CoverImage from "./atoms/CoverImage.svelte";
	import FabMusicPanel from "./FabMusicPanel.svelte";
	import MiniPlayer from "./organisms/MiniPlayer.svelte";
	import PlayerBar from "./organisms/PlayerBar.svelte";
	import Playlist from "./organisms/Playlist.svelte";
	import type { RepeatMode, Song } from "./types";

	let state: MusicPlayerState = musicPlayerStore.getState();
	const showFloatingPlayer = musicPlayerConfig.showFloatingPlayer;
	const floatingEntryMode = musicPlayerConfig.floatingEntryMode ?? "default";
	const useFabEntry = floatingEntryMode === "fab";
	const shouldRenderFloatingUi =
		showFloatingPlayer && musicPlayerConfig.enable;
	let unsubscribe: (() => void) | undefined;

	function togglePlay() {
		musicPlayerStore.toggle();
	}

	function prev() {
		musicPlayerStore.prev();
	}

	function next() {
		musicPlayerStore.next();
	}

	function toggleShuffle() {
		musicPlayerStore.toggleShuffle();
	}

	function toggleRepeat() {
		musicPlayerStore.toggleRepeat();
	}

	function playIndex(index: number) {
		musicPlayerStore.playIndex(index);
	}

	function setProgress(event: MouseEvent) {
		const progressElement = event.currentTarget as HTMLElement | null;
		if (!progressElement) {
			return;
		}
		const rect = progressElement.getBoundingClientRect();
		const percent = (event.clientX - rect.left) / rect.width;
		musicPlayerStore.setProgress(percent);
	}

	function handleProgressKeyDown(event: KeyboardEvent) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			musicPlayerStore.setProgress(0.5);
		}
	}

	function toggleMute() {
		musicPlayerStore.toggleMute();
	}

	function handleVolumeButtonClick() {
		musicPlayerStore.toggleMute();
	}

	function startVolumeDrag(event: PointerEvent) {
		const slider = event.currentTarget as HTMLElement | null;
		if (!slider) {
			return;
		}

		const updateVolume = (clientX: number) => {
			const rect = slider.getBoundingClientRect();
			if (rect.width <= 0) {
				return;
			}
			const percent = Math.max(
				0,
				Math.min(1, (clientX - rect.left) / rect.width),
			);
			musicPlayerStore.setVolume(percent);
		};

		updateVolume(event.clientX);

		const pointerId = event.pointerId;
		slider.setPointerCapture(pointerId);

		const handleMove = (moveEvent: PointerEvent) => {
			if (moveEvent.pointerId !== pointerId) {
				return;
			}
			updateVolume(moveEvent.clientX);
		};

		const cleanup = () => {
			slider.removeEventListener("pointermove", handleMove);
			slider.removeEventListener("pointerup", handleUp);
			slider.removeEventListener("pointercancel", handleCancel);
			if (slider.hasPointerCapture(pointerId)) {
				slider.releasePointerCapture(pointerId);
			}
		};

		const handleUp = (upEvent: PointerEvent) => {
			if (upEvent.pointerId !== pointerId) {
				return;
			}
			updateVolume(upEvent.clientX);
			cleanup();
		};

		const handleCancel = (cancelEvent: PointerEvent) => {
			if (cancelEvent.pointerId !== pointerId) {
				return;
			}
			cleanup();
		};

		slider.addEventListener("pointermove", handleMove);
		slider.addEventListener("pointerup", handleUp);
		slider.addEventListener("pointercancel", handleCancel);
	}

	function handleVolumeKeyDown(event: KeyboardEvent) {
		const target = event.target as HTMLElement;
		if (
			target?.tagName === "INPUT" ||
			target?.tagName === "TEXTAREA" ||
			target?.contentEditable === "true"
		) {
			return;
		}

		if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
			event.preventDefault();
			musicPlayerStore.setVolume(state.volume - 0.05);
			return;
		}

		if (event.key === "ArrowRight" || event.key === "ArrowUp") {
			event.preventDefault();
			musicPlayerStore.setVolume(state.volume + 0.05);
			return;
		}

		if (
			event.key === "Enter" ||
			event.key === " " ||
			event.key === "m" ||
			event.key === "M"
		) {
			event.preventDefault();
			toggleMute();
		}
	}

	function togglePlaylist() {
		musicPlayerStore.togglePlaylist();
	}

	function toggleExpanded() {
		musicPlayerStore.toggleExpanded();
	}

	function toggleHidden() {
		musicPlayerStore.toggleHidden();
	}

	function hideError() {
		musicPlayerStore.hideError();
	}

	function volumeBarRef(node: HTMLElement) {}

	function canSkip(): boolean {
		return musicPlayerStore.canSkip();
	}

	onMount(() => {
		// 无论是否显示 UI，都初始化音乐播放器
		// 立即初始化音乐播放器
		musicPlayerStore
			.initialize()
			.then(() => {
			})
			.catch((error) => {
				console.error("Failed to initialize music player:", error);
			});
		// 订阅状态更新
		unsubscribe = musicPlayerStore.subscribe((nextState) => {
			state = nextState;
		});

		// 监听返回顶部按钮的可见性，动态调整音乐播放器弹窗的偏移量
		const backToTopBtn = document.getElementById('back-to-top-btn');
		if (backToTopBtn) {
			// 创建 MutationObserver 监听返回顶部按钮的 class 变化
			const observer = new MutationObserver(() => {
				// 检查返回顶部按钮是否可见（没有 hide 类）
				const isBackToTopVisible = !backToTopBtn.classList.contains('hide');
				
				// 获取音乐播放器容器
				const fabAnchor = document.querySelector('.music-player-fab-anchor');
				if (fabAnchor) {
					// 上移时（返回顶部按钮出现）加 10px，返回顶部时加 20px
					if (isBackToTopVisible) {
						// 上移时：10px 间距
						(fabAnchor as HTMLElement).style.setProperty('--music-player-offset', '10px');
					} else {
						// 返回顶部时：20px 间距
						(fabAnchor as HTMLElement).style.setProperty('--music-player-offset', '20px');
					}
				}
			});

			observer.observe(backToTopBtn, {
				attributes: true,
				attributeFilter: ['class']
			});

			// 初始更新
			const isBackToTopVisible = !backToTopBtn.classList.contains('hide');
			const fabAnchor = document.querySelector('.music-player-fab-anchor');
			if (fabAnchor) {
				(fabAnchor as HTMLElement).style.setProperty('--music-player-offset', isBackToTopVisible ? '10px' : '20px');
			}

			// 清理函数
			return () => {
				observer.disconnect();
			};
		}
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
		musicPlayerStore.destroy();
	});
</script>

<svelte:window on:keydown={handleVolumeKeyDown} />

<!-- 确保音乐播放器被初始化，无论是否显示 UI -->
{#if shouldRenderFloatingUi}
	{#if state.showError}
		<div class="fixed bottom-20 right-4 z-[60] max-w-sm">
			<div
				class="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up"
			>
				<Icon
					icon="material-symbols:error"
					class="text-xl flex-shrink-0"
				/>
				<span class="text-sm flex-1">{state.errorMessage}</span>
				<button
					onclick={hideError}
					class="text-white/80 hover:text-white transition-colors"
				>
					<Icon icon="material-symbols:close" class="text-lg" />
				</button>
			</div>
		</div>
	{/if}

	{#if useFabEntry}
		<div class="music-player-fab-anchor fixed z-[9999]">
			<div
				class="music-player-fab-shell"
				class:expanded={state.isExpanded}
			>
				<FabMusicPanel />
			</div>
		</div>
	{:else}
		<div
			class="music-player fixed bottom-4 right-4 z-[9999] transition-all duration-300 ease-in-out"
			class:expanded={state.isExpanded}
			class:hidden-mode={state.isHidden}
		>
			<div
				class="orb-player-container {state.isHidden
					? 'orb-enter pointer-events-auto'
					: 'orb-leave pointer-events-none'}"
			>
				<CoverImage
					cover={state.currentSong.cover}
					isPlaying={state.isPlaying}
					isLoading={state.isLoading}
					size="orb"
					onclick={toggleHidden}
				/>
			</div>

			<MiniPlayer
				song={state.currentSong}
				currentTime={state.currentTime}
				duration={state.duration}
				isPlaying={state.isPlaying}
				isLoading={state.isLoading}
				isHidden={state.isExpanded || state.isHidden}
				onCoverClick={togglePlay}
				onInfoClick={toggleExpanded}
				onHideClick={toggleHidden}
				onExpandClick={toggleExpanded}
			/>

			<PlayerBar
				song={state.currentSong}
				currentTime={state.currentTime}
				duration={state.duration}
				isPlaying={state.isPlaying}
				isLoading={state.isLoading}
				isShuffled={state.isShuffled}
				isRepeating={state.isRepeating}
				showPlaylist={state.showPlaylist}
				canSkip={canSkip()}
				volume={state.volume}
				isMuted={state.isMuted}
				isVolumeDragging={false}
				isHidden={!state.isExpanded}
				{volumeBarRef}
				onPlayClick={togglePlay}
				onPrevClick={prev}
				onNextClick={() => next()}
				onShuffleClick={toggleShuffle}
				onRepeatClick={toggleRepeat}
				onProgressClick={setProgress}
				onProgressKeyDown={handleProgressKeyDown}
				onVolumeButtonClick={handleVolumeButtonClick}
				onSliderPointerDown={startVolumeDrag}
				onSliderKeyDown={handleVolumeKeyDown}
				onHideClick={toggleHidden}
				onPlaylistClick={togglePlaylist}
				onCollapseClick={toggleExpanded}
			/>

			<Playlist
				playlist={state.playlist}
				currentIndex={state.currentIndex}
				isPlaying={state.isPlaying}
				show={state.showPlaylist}
				onClose={togglePlaylist}
				onPlaySong={playIndex}
			/>
		</div>
	{/if}

	<style>
		.music-player-fab-anchor {
			right: var(--fab-group-right, 1.5rem);
			bottom: calc(
				var(--fab-group-bottom, 10rem) +
				(
					var(--fab-button-size, 3rem) *
						var(--fab-visible-count, 1)
				) +
				(
					var(--fab-group-gap, 0.5rem) *
						(var(--fab-visible-count, 1) - 1)
				) +
				var(--music-player-offset, 20px)
			);
			width: 0;
			height: 0;
			pointer-events: none;
			transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
		}

		.music-player-fab-shell {
			position: absolute;
			right: 0;
			bottom: 0;
			transform-origin: bottom right;
			pointer-events: auto;
			will-change: transform, opacity;
			opacity: 0;
			transform: scale(0.8) translateY(20px);
			transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
		}

		.music-player-fab-shell.expanded {
			opacity: 1;
			transform: scale(1) translateY(0);
		}

		.orb-player-container {
			position: absolute;
			bottom: 0;
			right: 0;
		}

		.orb-enter {
			animation: orbElasticIn 460ms cubic-bezier(0.22, 1.25, 0.36, 1)
				forwards;
		}

		.orb-leave {
			animation: orbElasticOut 360ms cubic-bezier(0.4, 0, 1, 1) forwards;
		}

		@keyframes orbElasticIn {
			0% {
				opacity: 0;
				transform: translateX(0) scale(0.55);
			}
			70% {
				opacity: 1;
				transform: translateX(0) scale(1.12);
			}
			100% {
				opacity: 1;
				transform: translateX(0) scale(1);
			}
		}

		@keyframes orbElasticOut {
			0% {
				opacity: 1;
				transform: translateX(0) scale(1);
			}
			100% {
				opacity: 0;
				transform: translateX(0) scale(0.6);
			}
		}

		.music-player.hidden-mode {
			width: 3rem;
			height: 3rem;
		}

		.music-player {
			width: 20rem;
			max-width: 20rem;
			min-width: 20rem;
			user-select: none;
			z-index: 9999;
		}

		.music-player-fab-anchor {
			z-index: 9999;
		}

		.music-player-fab-shell {
			z-index: 9999;
		}

		:global(.mini-player) {
			position: absolute;
			bottom: 0;
			right: 0;
			z-index: 9999;
		}

		:global(.expanded-player) {
			position: absolute;
			bottom: 0;
			right: 0;
			z-index: 9999;
		}

		:global(.player-bar) {
			z-index: 9999;
		}

		:global(.playlist-panel) {
			z-index: 9999;
		}

		:global(.orb-player) {
			position: relative;
			backdrop-filter: blur(10px);
			-webkit-backdrop-filter: blur(10px);
		}

		:global(.orb-player::before) {
			content: "";
			position: absolute;
			inset: -0.125rem;
			background: linear-gradient(
				45deg,
				var(--primary),
				transparent,
				var(--primary)
			);
			border-radius: 50%;
			z-index: -1;
			opacity: 0;
			transition: opacity 0.3s ease;
		}

		:global(.orb-player:hover::before) {
			opacity: 0.3;
			animation: rotate 2s linear infinite;
		}

		:global(.orb-player .animate-pulse) {
			animation: musicWave 1.5s ease-in-out infinite;
		}

		@keyframes rotate {
			from {
				transform: rotate(0deg);
			}
			to {
				transform: rotate(360deg);
			}
		}

		@keyframes musicWave {
			0%,
			100% {
				transform: scaleY(0.5);
			}
			50% {
				transform: scaleY(1);
			}
		}

		:global(.animate-pulse) {
			animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
		}

		@keyframes pulse {
			0%,
			100% {
				opacity: 1;
			}
			50% {
				opacity: 0.5;
			}
		}

		:global(.progress-section div:hover),
		:global(.bottom-controls > div:hover) {
			transform: scaleY(1.2);
			transition: transform 0.2s ease;
		}

		@media (max-width: 1279px) {
			.music-player-fab-anchor {
				right: var(--fab-group-right, 1.25rem) !important;
				bottom: calc(
					var(--fab-group-bottom, 3.5rem) +
					(
						var(--fab-button-size, 3rem) *
							var(--fab-visible-count, 1)
					) +
					(
						var(--fab-group-gap, 0.5rem) *
							(var(--fab-visible-count, 1) - 1)
					) +
					var(--music-player-offset, 20px)
				) !important;
				transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
			}

			.music-player-fab-shell {
				right: 0 !important;
				bottom: 0 !important;
			}
		}

		@media (max-width: 1024px) {
			.music-player-fab-anchor {
				right: var(--fab-group-right, 1rem) !important;
				bottom: calc(
					var(--fab-group-bottom, 4rem) +
					(
						var(--fab-button-size, 2.8rem) *
							var(--fab-visible-count, 1)
					) +
					(
						var(--fab-group-gap, 0.5rem) *
							(var(--fab-visible-count, 1) - 1)
					) +
					var(--music-player-offset, 20px)
				) !important;
				transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
			}

			.music-player-fab-shell {
				right: 0 !important;
				bottom: 0 !important;
			}
		}

		@media (max-width: 768px) {
			.music-player-fab-anchor {
				right: var(--fab-group-right, 0.75rem) !important;
				bottom: calc(
					var(--fab-group-bottom, 5rem) +
					(
						var(--fab-button-size, 2.75rem) *
							var(--fab-visible-count, 1)
					) +
					(
						var(--fab-group-gap, 0.5rem) *
							(var(--fab-visible-count, 1) - 1)
					)
				) !important;
			}

			.music-player-fab-shell {
				right: 0 !important;
				bottom: 0.75rem !important;
			}

			.music-player {
				width: 280px !important;
				min-width: 280px !important;
				max-width: 280px !important;
				bottom: 0.5rem !important;
				right: 0.5rem !important;
			}
			:global(.expanded-player) {
				width: 280px !important;
				max-width: 280px !important;
			}
			.music-player.expanded {
				width: 280px !important;
				min-width: 280px !important;
				max-width: 280px !important;
				right: 0.5rem !important;
			}
			:global(.playlist-panel) {
				width: 280px !important;
				right: 0.5rem !important;
				max-width: 280px !important;
			}
			:global(.controls) {
				gap: 8px;
			}
			:global(.controls button) {
				width: 36px;
				height: 36px;
			}
			:global(.controls button:nth-child(3)) {
				width: 44px;
				height: 44px;
			}
		}

		@media (max-width: 480px) {
			.music-player-fab-anchor {
				right: var(--fab-group-right, 0.5rem) !important;
				bottom: calc(
					var(--fab-group-bottom, 4.5rem) +
						(
							var(--fab-button-size, 2.5rem) *
								var(--fab-visible-count, 1)
						) +
						(
							var(--fab-group-gap, 0.5rem) *
								(var(--fab-visible-count, 1) - 1)
						)
				) !important;
			}

			.music-player-fab-shell {
				right: 0 !important;
				bottom: 0.75rem !important;
			}

			.music-player {
				width: 260px !important;
				min-width: 260px !important;
				max-width: 260px !important;
			}
			:global(.expanded-player) {
				width: 260px !important;
				max-width: 260px !important;
			}
			:global(.playlist-panel) {
				width: 260px !important;
				max-width: 260px !important;
				right: 0.5rem !important;
			}
			:global(.song-title) {
				font-size: 14px;
			}
			:global(.song-artist) {
				font-size: 12px;
			}
			:global(.controls) {
				gap: 6px;
				margin-bottom: 12px;
			}
			:global(.controls button) {
				width: 32px;
				height: 32px;
			}
			:global(.controls button:nth-child(3)) {
				width: 40px;
				height: 40px;
			}
			:global(.playlist-item) {
				padding: 8px 12px;
			}
			:global(.playlist-item .w-10) {
				width: 32px;
				height: 32px;
			}
		}

		@keyframes slide-up {
			from {
				transform: translateY(100%);
				opacity: 0;
			}
			to {
				transform: translateY(0);
				opacity: 1;
			}
		}

		.animate-slide-up {
			animation: slide-up 0.3s ease-out;
		}

		@media (hover: none) and (pointer: coarse) {
			:global(.music-player button),
			:global(.playlist-item) {
				min-height: 44px;
			}
			:global(.progress-section > div),
			:global(.bottom-controls > div:nth-child(2)) {
				height: 12px;
			}
		}

		/* 针对小屏幕高度的适配 */
		@media (max-height: 622px) {
			.music-player {
				transform: translateY(calc(100vh - 622px));
				z-index: 9999 !important;
			}
			
			.music-player-fab-anchor {
				transform: translateY(calc(100vh - 622px));
				z-index: 9999 !important;
			}
			
			/* 确保播放器内容完全可见 */
			:global(.player-bar) {
				z-index: 9999 !important;
			}
			
			:global(.mini-player) {
				z-index: 9999 !important;
			}
		}

		@media (max-height: 564px) {
			.music-player {
				transform: translateY(calc(100vh - 564px));
				z-index: 9999 !important;
			}
			
			.music-player-fab-anchor {
				transform: translateY(calc(100vh - 564px));
				z-index: 9999 !important;
			}
		}

		@media (max-height: 500px) {
			.music-player {
				transform: translateY(calc(100vh - 500px));
				z-index: 9999 !important;
			}
			
			.music-player-fab-anchor {
				transform: translateY(calc(100vh - 500px));
				z-index: 9999 !important;
			}
		}

		@keyframes spin-continuous {
			from {
				transform: rotate(0deg);
			}
			to {
				transform: rotate(360deg);
			}
		}

		:global(.cover-container img) {
			animation: spin-continuous 3s linear infinite;
			animation-play-state: paused;
		}

		:global(.cover-container img.spinning) {
			animation-play-state: running;
		}

		:global(button.bg-\\[var\\(--primary\\)\\]) {
			box-shadow: 0 0 0 2px var(--primary);
			border: none;
		}
	</style>
{/if}
