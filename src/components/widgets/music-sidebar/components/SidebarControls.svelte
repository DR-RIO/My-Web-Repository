<script lang="ts">
	import Icon from "@iconify/svelte";

	import NextButton from "../../music-player/atoms/NextButton.svelte";
	import PlayButton from "../../music-player/atoms/PlayButton.svelte";
	import PrevButton from "../../music-player/atoms/PrevButton.svelte";
	import type { RepeatMode } from "../../music-player/types";

	interface Props {
		isPlaying: boolean;
		isShuffled: boolean;
		repeatMode: RepeatMode;
		onToggleMode?: () => void;
		onPrev: () => void;
		onNext: () => void;
		onTogglePlay: () => void;
		onTogglePlaylist: () => void;
	}

	const {
		isPlaying,
		isShuffled,
		repeatMode,
		onToggleMode,
		onPrev,
		onNext,
		onTogglePlay,
		onTogglePlaylist,
	}: Props = $props();

	const repeatIcon = $derived(
		isShuffled
			? "material-symbols:shuffle-rounded"
			: repeatMode === 1
				? "material-symbols:repeat-one-rounded"
				: "material-symbols:repeat-rounded",
	);

	const modeActive = $derived(isShuffled || repeatMode > 0);
</script>

<div class="controls-row">
	<button
		class="icon-btn mode-btn"
		class:active-mode={modeActive}
		onclick={() => onToggleMode?.()}
		aria-label="Repeat mode"
	>
		<Icon icon={repeatIcon} class="text-xl" />
	</button>
	<PrevButton onclick={onPrev} disabled={false} />
	<PlayButton {isPlaying} isLoading={false} onclick={onTogglePlay} />
	<NextButton onclick={onNext} disabled={false} />
	<button
		class="icon-btn list-btn"
		onclick={onTogglePlaylist}
		aria-label="Playlist"
	>
		<Icon icon="material-symbols:queue-music-rounded" class="text-xl" />
	</button>
</div>

<style>
	.controls-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-top: 0.75rem;
		padding-inline: 0.125rem;
		flex-wrap: nowrap;
	}

	.icon-btn {
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--content-main);
		transition:
			color 150ms ease,
			transform 150ms ease;
		flex: 0 0 2.5rem;
	}

	.icon-btn:hover {
		color: var(--primary);
	}

	.icon-btn:active {
		transform: scale(0.96);
	}

	.mode-btn,
	.list-btn {
		color: var(--content-meta);
	}

	.active-mode {
		color: var(--primary);
	}

	.controls-row :global(button) {
		flex-shrink: 0;
	}

	@media (max-width: 520px) {
		.controls-row {
			gap: 0.5rem;
			padding-inline: 0;
		}

		.controls-row :global(.btn-plain) {
			width: 3rem;
			height: 3rem;
			padding: 0;
			border-radius: 0.6rem;
			flex: 0 0 3rem;
		}

		.controls-row :global(.btn-regular) {
			width: 3.5rem;
			height: 3.5rem;
			flex: 0 0 3.5rem;
		}

		.icon-btn {
			width: 3rem;
			height: 3rem;
			flex: 0 0 3rem;
		}
	}
</style>
