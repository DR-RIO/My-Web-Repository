<script lang="ts">
	import type { Song } from "../../music-player/types";

	interface Props {
		currentSong: Song;
		currentTime: number;
		isLoading: boolean;
	}

	const { currentSong, currentTime, isLoading }: Props = $props();

	interface ParsedLyric {
		time: number;
		original: string;
		translation: string;
	}

	function splitLyric(text: string) {
		const match = text.match(/^(.*?)[（(](.*?)[）)]$/);
		if (match) {
			return {
				original: match[1].trim(),
				translation: match[2].trim()
			};
		}
		return { original: text, translation: "" };
	}

	function isLyricUrl(str: string | undefined): boolean {
		if (!str) return false;
		return str.startsWith('http://') || str.startsWith('https://');
	}

	function parseLyric(str: string): ParsedLyric[] {
		if (!str || isLyricUrl(str)) {return [];}

		const reg = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/;

		return str.split("\n")
			.map(line => {
				const m = line.match(reg);
				if (!m) {return null;}

				const t =
					+ m[1] * 60 +
					+ m[2] +
					(m[3] ? +m[3].padEnd(3, "0") / 1000 : 0);

				const text = line.replace(reg, "").trim();
				if (!text) {return null;}

				const { original, translation } = splitLyric(text);

				return { time: t, original, translation };
			})
			.filter(Boolean)
			.sort((a, b) => a!.time - b!.time) as ParsedLyric[];
	}
	
	// 检测歌词是否为URL（正在加载中）
	const isLyricLoading = $derived(isLyricUrl(currentSong?.lyric));

	function getIndex(list: ParsedLyric[], t: number) {
		let i = -1;
		for (let j = 0; j < list.length; j++) {
			if (list[j].time <= t) {i = j;}
			else {break;}
		}
		return i;
	}

	const lyrics = $derived(parseLyric(currentSong.lyric ?? ""));
	const index = $derived(getIndex(lyrics, currentTime));

	const prev = $derived(index > 0 ? lyrics[index - 1] : null);
	const current = $derived(index >= 0 ? lyrics[index] : null);
	const next = $derived(index + 1 < lyrics.length ? lyrics[index + 1] : null);

	const progress = $derived(() => {
		if (index < 0) {return 0;}

		const currentTimeVal = lyrics[index].time;
		const nextTime =
			index + 1 < lyrics.length
				? lyrics[index + 1].time
				: currentTimeVal + 5;

		const p = (currentTime - currentTimeVal) / (nextTime - currentTimeVal);

		return Math.min(Math.max(p, 0), 1);
	});
</script>

{#if isLoading || isLyricLoading}
<div class="lyrics">
	<div class="loading loading-dots">{isLyricLoading ? '歌词加载中' : '正在加载'}</div>
</div>
{:else if lyrics.length}
<div class="lyrics">
	{#key current?.time}
		<div class="group">
			<div class="line prev">{prev?.original}</div>

			<div class="current">
				<!-- 原文 -->
				{#if current?.original}
					{@const chars = [...current.original]}
					{@const p = progress()}
					<div class="origin">
						{#each chars as char, i}
							{@const charStart = i / chars.length}
							{@const charEnd = (i + 1) / chars.length}
							
							{#if p >= charEnd}
								<span class="hig">{char}</span>
							{:else if p > charStart}
								{@const percent = ((p - charStart) / (charEnd - charStart)) * 100}
								<span style="--partial:{percent}%">{char}</span>
							{:else}
								<span>{char}</span>
							{/if}
						{/each}
					</div>
				{/if}

				<!-- 翻译 -->
				{#if current?.translation}
					{@const chars = [...current.translation]}
					{@const p = progress()}
					<div class="trans">
						{#each chars as char, i}
							{@const charStart = i / chars.length}
							{@const charEnd = (i + 1) / chars.length}
							
							{#if p >= charEnd}
								<span class="hig">{char}</span>
							{:else if p > charStart}
								{@const percent = ((p - charStart) / (charEnd - charStart)) * 100}
								<span style="--partial:{percent}%">{char}</span>
							{:else}
								<span>{char}</span>
							{/if}
						{/each}
					</div>
				{/if}
			</div>

			<div class="line next">{next?.original}</div>
		</div>
	{/key}
</div>
{:else}
<div class="lyrics">
	<div class="no-lyrics">暂无歌词</div>
</div>
{/if}

<style>
.lyrics {
	min-height: 80px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.loading {
	font-size: 12px;
	color: #999;
}

.no-lyrics {
	font-size: 12px;
	color: #999;
}

.loading-dots::after {
	content: '';
	animation: loading-dots 2s steps(7, end) infinite;
}

@keyframes loading-dots {
	0% {
		content: '';
	}
	14.28% {
		content: '.';
	}
	28.57% {
		content: '..';
	}
	42.85% {
		content: '...';
	}
	57.14% {
		content: '....';
	}
	71.42% {
		content: '.....';
	}
	85.71% {
		content: '......';
	}
	100% {
		content: '';
	}
}

.group {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	animation: slideUp 0.4s ease;
}

.line {
	font-size: 9px;
	color: #999;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.current {
	text-align: center;
}

.origin {
	font-size: 12px;
	font-weight: 600;
}

.origin span {
	color: #999;
}

.origin span.hig {
	color: var(--primary);
}

.origin span[style*="--partial"] {
	background: linear-gradient(
		to right,
		var(--primary) var(--partial),
		#999 var(--partial)
	);
	-webkit-background-clip: text;
	background-clip: text;
	-webkit-text-fill-color: transparent;
}

.trans {
	font-size: 10px;
	font-weight: 600;
	margin-top: 4px;
}

.trans span {
	color: #999;
}

.trans span.hig {
	color: var(--primary);
}

.trans span[style*="--partial"] {
	background: linear-gradient(
		to right,
		var(--primary) var(--partial),
		#999 var(--partial)
	);
	-webkit-background-clip: text;
	background-clip: text;
	-webkit-text-fill-color: transparent;
}

@keyframes slideUp {
	from {
		transform: translateY(20px);
		opacity: 0;
	}
	to {
		transform: translateY(0);
		opacity: 1;
	}
}
</style>