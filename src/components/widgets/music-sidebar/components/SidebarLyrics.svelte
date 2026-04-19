<script lang="ts">
	import type { Song } from "../../music-player/types";

	interface Props {
		currentSong: Song;
		currentTime: number;
	}

	const { currentSong, currentTime }: Props = $props();

	interface ParsedLyric {
		time: number;
		text: string;
	}

	function parseLyric(lyricString: string): ParsedLyric[] {
		if (!lyricString) {
			return [];
		}

		const lines = lyricString.split("\n");
		const parsed: ParsedLyric[] = [];

		const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/;

		for (const line of lines) {
			const match = line.match(timeRegex);
			if (match) {
				const minutes = parseInt(match[1], 10);
				const seconds = parseInt(match[2], 10);
				const milliseconds = match[3]
					? parseInt(match[3].padEnd(3, "0").slice(0, 3), 10)
					: 0;
				const time = minutes * 60 + seconds + milliseconds / 1000;
				// 提取时间戳后的歌词文本，移除时间戳并修剪空白
				const text = line.replace(timeRegex, "").trim();

				// 跳过空行和只有标签的行
				if (text && !text.includes("作词") && !text.includes("作曲") && !text.includes("编曲")) {
					parsed.push({ time, text });
				}
			}
		}

		parsed.sort((a, b) => a.time - b.time);
		return parsed;
	}

	function getCurrentLyricIndex(
		lyrics: ParsedLyric[],
		currentTime: number,
	): number {
		if (!lyrics || lyrics.length === 0) {
			return -1;
		}

		let index = -1;
		for (let i = 0; i < lyrics.length; i++) {
			if (lyrics[i].time <= currentTime) {
				index = i;
			} else {
				break;
			}
		}
		return index;
	}

	const lyrics = $derived(parseLyric(currentSong.lyric ?? ""));
	const currentLyricIndex = $derived(getCurrentLyricIndex(lyrics, currentTime));
	const currentLyricText = $derived(
		currentLyricIndex >= 0 ? lyrics[currentLyricIndex]?.text ?? "" : "",
	);
	const nextLyricText = $derived(
		currentLyricIndex + 1 < lyrics.length
			? lyrics[currentLyricIndex + 1]?.text ?? ""
			: "",
	);

	const transitionDuration = $derived(() => {
		if (currentLyricIndex < 0 || lyrics.length === 0) {
			return "0ms";
		}
		const nextTime =
			currentLyricIndex + 1 < lyrics.length
				? lyrics[currentLyricIndex + 1].time
				: lyrics[currentLyricIndex].time + 5;
		const currentTimeVal =
			currentLyricIndex >= 0 ? lyrics[currentLyricIndex].time : 0;
		const diff = nextTime - currentTimeVal;
		return `${Math.min(Math.max(diff * 1000, 300), 800)}ms`;
	});
</script>

{#if lyrics.length > 0}
	<div class="sidebar-lyrics-wrapper">
		<div class="sidebar-lyrics-container">
			{#if currentLyricText}
				<div
					class="lyric-current"
					style={`transition: all ${transitionDuration()} ease-out;`}
				>
					{currentLyricText}
				</div>
			{/if}
			{#if nextLyricText}
				<div class="lyric-next">
					{nextLyricText}
				</div>
			{/if}
			{#if !currentLyricText && !nextLyricText}
				<div class="lyric-empty">
					等待歌词...
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.sidebar-lyrics-wrapper {
		margin-bottom: 0.1rem;
		padding: 0.25rem 0;
		overflow: hidden;
	}

	.sidebar-lyrics-container {
		display: flex;
		flex-direction: column;
		min-height: 2.5rem;
		justify-content: center;
	}

	.lyric-current {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--primary);
		text-align: left;
		line-height: 1.3;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		transition: opacity 0.3s ease;
	}

	.lyric-next {
		font-size: 0.72rem;
		color: var(--content-meta);
		text-align: left;
		line-height: 1.2;
		opacity: 0.7;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-top: 0.15rem;
	}

	.lyric-empty {
		font-size: 0.7rem;
		color: var(--content-meta);
		text-align: left;
		opacity: 0.5;
		font-style: italic;
	}

	@media (max-width: 520px) {
		.lyric-current {
			font-size: 1rem;
		}

		.lyric-next {
			font-size: 0.75rem;
		}
	}
</style>
