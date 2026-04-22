<script lang="ts">
	import type { Song } from "../../music-player/types";

	interface Props {
		currentSong: Song;
		currentTime: number;
	}

	const { currentSong, currentTime }: Props = $props();

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

	function parseLyric(str: string): ParsedLyric[] {
		if (!str) return [];

		const reg = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/;

		return str.split("\n")
			.map(line => {
				const m = line.match(reg);
				if (!m) return null;

				const t =
					+ m[1] * 60 +
					+ m[2] +
					(m[3] ? +m[3].padEnd(3, "0") / 1000 : 0);

				const text = line.replace(reg, "").trim();
				if (!text) return null;

				const { original, translation } = splitLyric(text);

				return { time: t, original, translation };
			})
			.filter(Boolean)
			.sort((a, b) => a!.time - b!.time) as ParsedLyric[];
	}

	function getIndex(list: ParsedLyric[], t: number) {
		let i = -1;
		for (let j = 0; j < list.length; j++) {
			if (list[j].time <= t) i = j;
			else break;
		}
		return i;
	}

	const lyrics = $derived(parseLyric(currentSong.lyric ?? ""));
	const index = $derived(getIndex(lyrics, currentTime));

	const prev = $derived(index > 0 ? lyrics[index - 1] : null);
	const current = $derived(index >= 0 ? lyrics[index] : null);
	const next = $derived(index + 1 < lyrics.length ? lyrics[index + 1] : null);

	// ⭐ 统一进度（原文+翻译共用）
	const progress = $derived(() => {
		if (index < 0) return 0;

		const currentTimeVal = lyrics[index].time;
		const nextTime =
			index + 1 < lyrics.length
				? lyrics[index + 1].time
				: currentTimeVal + 5;

		const p = (currentTime - currentTimeVal) / (nextTime - currentTimeVal);

		return Math.min(Math.max(p, 0), 1);
	});
</script>

{#if lyrics.length}
<div class="lyrics">
	{#key current?.time}
		<div class="group">
			<div class="line prev">{prev?.original}</div>

			<div class="current">
				<!-- ⭐ 原文 -->
				<div
					class="origin"
					style={`--p:${progress() * 100}%`}
				>
					{current?.original}
				</div>

				<!-- ⭐ 翻译（同步高亮） -->
				{#if current?.translation}
					<div
						class="trans"
						style={`--p:${progress() * 100}%`}
					>
						{current.translation}
					</div>
				{/if}
			</div>

			<div class="line next">{next?.original}</div>
		</div>
	{/key}
</div>
{/if}

<style>
.lyrics {
	min-height: 80px;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 动画组 */
.group {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;

	animation: slideUp 0.4s ease;
}

.line {
	font-size: 10px;
	opacity: 0.25;

	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

/* 当前 */
.current {
	text-align: center;
}

/* ⭐ 原文渐变 */
.origin {
	font-size: 13px;
	font-weight: 600;

	background: linear-gradient(
		to right,
		var(--primary) var(--p),
		#999 var(--p)
	);

	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

/* ⭐ 翻译渐变（颜色更淡一点） */
.trans {
	font-size: 11px;
	font-weight: 600;

	background: linear-gradient(
		to right,
		var(--primary) var(--p),
		#aaa var(--p)
	);

	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

/* 动画 */
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