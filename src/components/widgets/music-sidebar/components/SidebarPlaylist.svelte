<script lang="ts">
	import Icon from "@iconify/svelte";
	import { tick } from "svelte";

	import AccordionDrawer from "../../common/AccordionDrawer.svelte";
	import type { Song } from "../../music-player/types";
	import TrackListItem from "./TrackListItem.svelte";

	interface Props {
		playlist: Song[];
		currentIndex: number;
		isPlaying: boolean;
		show: boolean;
		onClose: () => void;
		onPlaySong: (index: number) => void;
		onSearch?: (keyword: string) => void;
		isSearchMode?: boolean;
		onRestorePlaylist?: () => void;
		onClearSearch?: () => void;
		initialSearchKeyword?: string;
	}

	const {
		playlist,
		currentIndex,
		isPlaying,
		show,
		onClose,
		onPlaySong,
		onSearch,
		isSearchMode = false,
		onRestorePlaylist,
		onClearSearch,
		initialSearchKeyword = "",
	}: Props = $props();

	let searchKeyword = $state(initialSearchKeyword);
	const showClear = $derived(searchKeyword.length > 0);

	$effect(() => {
		if (initialSearchKeyword !== undefined) {
			searchKeyword = initialSearchKeyword;
		}
	});

	function handleSearch() {
		if (onSearch) {
			onSearch(searchKeyword);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter") {
			handleSearch();
		}
	}

	function clearSearch() {
		searchKeyword = "";
		if (onClearSearch) {
			onClearSearch();
		}
	}

	function handleRestorePlaylist() {
		clearSearch();
		if (onRestorePlaylist) {
			onRestorePlaylist();
		}
	}
</script>

<AccordionDrawer {show} class="playlist-drawer">
	<div class="playlist-shell">
		{#if onSearch}
			<div class="search-box mb-2 w-full min-w-[200px]">
				<div
					class="search-input-wrapper flex items-center gap-2 rounded-lg px-2.5 py-1.5"
				>
					<Icon
						icon="simple-icons:neteasecloudmusic"
						width="20"
						height="20"
						class="inline-flex items-center justify-center"
						style="color: #C20C0C;"
					/>
					<input
						type="text"
						bind:value={searchKeyword}
						placeholder="在网易云搜索... ( •̀ ω •́ )✧"
						onkeydown={handleKeydown}
						class="search-input flex-1 min-w-[80px] bg-transparent border-none outline-none text-xs text-black/75 dark:text-white p-0"
					/>
					<button
						onclick={clearSearch}
						class="clear-btn w-6 h-6 rounded flex items-center justify-center"
						class:visible={showClear}
					>
						<Icon icon="material-symbols:close" class="text-sm" />
					</button>
					<button
						onclick={handleSearch}
						class="btn-plain w-6 h-6 rounded"
					>
						<Icon
							icon="material-symbols:arrow-forward"
							class="text-sm"
							style="color: var(--btn-content)"
						/>
					</button>
				</div>
				<!-- 网易云提示移到下方 -->
				<div
					class="text-[10px] opacity-60 mt-1 px-1"
					style="color: var(--content-meta)"
				>
					已接入 网易云音乐® 中国大陆版权曲库
				</div>
				{#if isSearchMode && onRestorePlaylist}
					<button
						onclick={handleRestorePlaylist}
						class="restore-playlist-btn w-full mt-2 py-1.5 px-3 text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
					>
						<Icon
							icon="material-symbols:arrow-back"
							class="text-xs"
						/>
						<span>返回站长歌单</span>
					</button>
				{/if}
			</div>
		{/if}
		<div
			class="playlist-content"
			role="listbox"
			aria-label="Playlist"
			aria-multiselectable="false"
		>
			{#each playlist as song, index}
				<TrackListItem
					{song}
					isCurrent={index === currentIndex}
					{isPlaying}
					onclick={() => onPlaySong(index)}
				/>
			{/each}
		</div>
	</div>
</AccordionDrawer>

<style>
	:global(.playlist-drawer) {
		margin-top: 0;
	}

	.playlist-shell {
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid
			color-mix(in srgb, var(--content-meta) 12%, transparent 88%);
	}

	.playlist-content {
		overflow-y: auto;
		max-height: 12rem;
		padding-right: 0.25rem;
		padding-bottom: 0.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.playlist-content::-webkit-scrollbar {
		display: none;
	}

	.search-input-wrapper {
		background-color: var(--btn-regular-bg);
	}

	.search-input-wrapper:hover {
		background-color: var(--btn-regular-bg-hover);
	}

	.search-input::placeholder {
		font-size: 10px;
		opacity: 0.6;
		color: var(--content-meta);
	}

	.clear-btn {
		color: var(--btn-content);
		background-color: transparent;
		transition: opacity 0.2s;
		opacity: 0;
		cursor: default;
		pointer-events: none;
	}

	.clear-btn.visible {
		opacity: 1;
		cursor: pointer;
		pointer-events: auto;
	}

	.clear-btn:hover {
		background-color: var(--btn-regular-bg-hover);
	}

	.restore-playlist-btn {
		transition:
			background-color 0.2s,
			color 0.2s;
		background-color: var(--btn-regular-bg);
		color: var(--btn-content);
		cursor: pointer;
	}

	.restore-playlist-btn:hover {
		background-color: var(--btn-regular-bg-hover);
	}

	.restore-playlist-btn:active {
		background-color: var(--btn-regular-bg-active);
	}

	/* 移动端优化 */
	@media (max-width: 768px) {
		.search-input-wrapper {
			padding: 4px 8px;
			height: 38px;
		}

		.search-input {
			font-size: 12px;
		}

		.clear-btn,
		.btn-plain {
			min-width: 24px;
			min-height: 24px;
			touch-action: manipulation;
		}

		.restore-playlist-btn {
			padding: 0.75rem 1rem;
			font-size: 13px;
			min-height: 44px;
		}
	}
</style>
