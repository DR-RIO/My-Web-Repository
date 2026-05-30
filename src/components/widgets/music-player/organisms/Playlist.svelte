<script lang="ts">
	import Icon from "@iconify/svelte";

	import Key from "../../../../i18n/i18nKey";
	import { i18n } from "../../../../i18n/translation";
	import PlaylistItem from "../atoms/PlaylistItem.svelte";
	import type { Song } from "../types";

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
	}: Props = $props();

	let searchKeyword = $state("");
	const showClear = $derived(searchKeyword.length > 0);

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
	}
</script>

{#if show}
	<div
		class="playlist-panel card-base-transparent fixed bottom-70 right-4 w-80 max-h-96 overflow-hidden z-50"
	>
		<div
			class="playlist-header flex items-center justify-between p-4 border-b border-[var(--line-divider)]"
		>
			<h3 class="text-lg font-semibold text-90">
				{i18n(Key.musicPlayerPlaylist)}
			</h3>
			<button class="btn-plain w-8 h-8 rounded-lg" onclick={onClose}>
				<Icon icon="material-symbols:close" class="text-lg" />
			</button>
		</div>

		{#if onSearch}
			<div class="search-box p-3 border-b border-[var(--line-divider)]">
				<div
					class="search-input-wrapper flex items-center gap-2 rounded-lg px-2.5 py-3"
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
						placeholder="搜索歌曲..."
						onkeydown={handleKeydown}
						class="search-input flex-1 bg-transparent border-none outline-none text-sm p-0"
						style="color: var(--btn-content)"
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
				{#if isSearchMode && onRestorePlaylist}
					<button
						onclick={onRestorePlaylist}
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
			class="playlist-content overflow-y-auto max-h-80 hide-scrollbar"
			role="presentation"
		>
			{#each playlist as song, index}
				<PlaylistItem
					{song}
					{index}
					isCurrent={index === currentIndex}
					{isPlaying}
					onclick={() => onPlaySong(index)}
					lazy={index !== 0}
				/>
			{/each}
		</div>
	</div>
{/if}

<style>
	.playlist-panel {
		right: var(--fab-group-right, 1.5rem);
		bottom: calc(
			var(--fab-group-bottom, 10rem) +
				(var(--fab-button-size, 3rem) * var(--fab-visible-count, 1)) +
				(
					var(--fab-group-gap, 0.5rem) *
						(var(--fab-visible-count, 1) - 1)
				) +
				6.75rem
		);
	}

	@media (max-width: 768px) {
		.playlist-panel {
			width: 280px !important;
			max-width: 280px !important;
			right: var(--fab-group-right, 0.75rem) !important;
		}
	}

	@media (max-width: 480px) {
		.playlist-panel {
			width: 260px !important;
			max-width: 260px !important;
			right: var(--fab-group-right, 0.5rem) !important;
		}
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
	}

	.restore-playlist-btn:hover {
		background-color: var(--btn-regular-bg-hover);
	}

	.restore-playlist-btn:active {
		background-color: var(--btn-regular-bg-active);
	}
</style>
