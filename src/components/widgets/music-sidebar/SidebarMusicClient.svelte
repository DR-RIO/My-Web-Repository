<script lang="ts">
	import { onDestroy, onMount } from "svelte";

	import type { MusicPlayerState } from "@/stores/musicPlayerStore";
	import { musicPlayerStore } from "@/stores/musicPlayerStore";

	import type { Song } from "../music-player/types";
	import SidebarControls from "./components/SidebarControls.svelte";
	import SidebarCover from "./components/SidebarCover.svelte";
	import SidebarLyrics from "./components/SidebarLyrics.svelte";
	import SidebarPlaylist from "./components/SidebarPlaylist.svelte";
	import SidebarProgress from "./components/SidebarProgress.svelte";
	import SidebarTrackInfo from "./components/SidebarTrackInfo.svelte";

	let state: MusicPlayerState = $state(musicPlayerStore.getState());
	let showPlaylist = $state(false);
	let initialSearchKeyword = $state("");
	let unsubscribe: (() => void) | undefined;

	function handleStateUpdate(event: Event) {
		const custom = event as CustomEvent<MusicPlayerState>;
		if (custom.detail) {
			state = custom.detail;
		}
	}

	onMount(() => {
		musicPlayerStore.initialize().catch((error) => {
			console.error(
				"Failed to initialize music player from SidebarMusicClient:",
				error,
			);
		});
		
		// 使用 store 的 subscribe 方法来获取最新状态（更可靠）
		unsubscribe = musicPlayerStore.subscribe((nextState) => {
			state = nextState;
		});
		
		window.addEventListener("music-sidebar:state", handleStateUpdate);
		
		// 监听音乐搜索事件（和点击艺术家按钮一样）
		window.addEventListener("music-sidebar:search", (event) => {
			const customEvent = event as CustomEvent<{ keyword: string }>;
			if (customEvent.detail?.keyword) {
				console.log('🎵 SidebarMusicClient 收到搜索请求:', customEvent.detail.keyword);
				handleSearch(customEvent.detail.keyword);
			}
		});
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
		if (typeof window !== "undefined") {
			window.removeEventListener(
				"music-sidebar:state",
				handleStateUpdate,
			);
		}
	});

	function togglePlay() {
		musicPlayerStore.toggle();
	}

	function prev() {
		musicPlayerStore.prev();
	}

	function next() {
		musicPlayerStore.next();
	}

	function toggleMode() {
		musicPlayerStore.toggleMode();
	}

	function togglePlaylistView() {
		showPlaylist = !showPlaylist;
	}

	function playIndex(index: number) {
		musicPlayerStore.playIndex(index);
	}

	function seek(time: number) {
		musicPlayerStore.seek(time);
	}

	function toggleMute() {
		musicPlayerStore.toggleMute();
	}

	function setVolume(volume: number) {
		musicPlayerStore.setVolume(volume);
	}

	function handleSearch(keyword: string) {
		console.log('🎵 SidebarMusicClient 开始搜索:', keyword);
		initialSearchKeyword = keyword;
		musicPlayerStore.searchSongs(keyword);
		showPlaylist = true;
		console.log('🎵 SidebarMusicClient 搜索已触发');
	}

	function handleClearSearch() {
		initialSearchKeyword = "";
	}

	function handleArtistClick(artistName: string) {
		handleSearch(artistName);
	}
</script>

<div class="music-sidebar-widget">
	<div class="flex items-center gap-3 mb-2.5">
		<SidebarCover
			currentSong={state.currentSong}
			isPlaying={state.isPlaying}
			isLoading={state.isLoading}
			/>
		<SidebarTrackInfo
			currentSong={state.currentSong}
			currentTime={state.currentTime}
			duration={state.duration}
			volume={state.volume}
			isMuted={state.isMuted}
			onToggleMute={toggleMute}
			onSetVolume={setVolume}
			onArtistClick={handleArtistClick}
			/>
	</div>

	<SidebarLyrics
		currentSong={state.currentSong}
		currentTime={state.currentTime}
		isLoading={state.isLoading}
		/>

	<SidebarProgress
		currentTime={state.currentTime}
		duration={state.duration}
		onSeek={seek}
		/>

	<SidebarControls
		isPlaying={state.isPlaying}
		isShuffled={state.isShuffled}
		repeatMode={state.isRepeating}
		onToggleMode={toggleMode}
		onPrev={prev}
		onNext={next}
		onTogglePlay={togglePlay}
		onTogglePlaylist={togglePlaylistView}
		/>

	<SidebarPlaylist
		playlist={state.playlist}
		currentIndex={state.currentIndex}
		isPlaying={state.isPlaying}
		show={showPlaylist}
		onClose={togglePlaylistView}
		onPlaySong={playIndex}
		onSearch={handleSearch}
		isSearchMode={state.isSearchMode}
		onRestorePlaylist={() => musicPlayerStore.restorePlaylist()}
		onClearSearch={handleClearSearch}
		{initialSearchKeyword}
		/>
</div>

<style>
	@media (max-width: 520px) {
		.music-sidebar-widget {
			min-width: 0;
		}

		.music-sidebar-widget > :global(div:first-child) {
			gap: 0.75rem;
			margin-bottom: 0.5rem;
		}
	}
</style>
