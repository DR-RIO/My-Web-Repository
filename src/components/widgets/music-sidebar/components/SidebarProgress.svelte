<script lang="ts">
	interface Props {
		currentTime: number;
		duration: number;
		onSeek: (time: number) => void;
	}

	const { currentTime, duration, onSeek }: Props = $props();

	function formatTime(t: number) {
		const m = Math.floor(t / 60);
		const s = Math.floor(t % 60);
		return `${m}:${s.toString().padStart(2, "0")}`;
	}

	const progressPercent = $derived(
		duration > 0
			? Math.max(0, Math.min(100, (currentTime / duration) * 100))
			: 0
	);

	function seekByEvent(clientX: number, el: HTMLElement) {
		const rect = el.getBoundingClientRect();
		const percent = (clientX - rect.left) / rect.width;
		const clamped = Math.max(0, Math.min(1, percent));
		onSeek(clamped * duration);
	}

	function handleClick(event: MouseEvent) {
		const el = event.currentTarget as HTMLElement;
		seekByEvent(event.clientX, el);
	}

	// ✅ 键盘支持（Enter / Space）
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			const el = event.currentTarget as HTMLElement;

			// 用中点模拟点击（也可以改成根据箭头键微调）
			const rect = el.getBoundingClientRect();
			const middleX = rect.left + rect.width / 2;

			seekByEvent(middleX, el);
		}
	}

	const bubbleStyle = $derived(
		`left: clamp(20px, ${progressPercent}%, calc(100% - 20px));
		 transform: translateX(-50%);`
	);
</script>

<div class="wrapper">
	<!-- 气泡 -->
	<div class="time-bubble" style={bubbleStyle}>
		{formatTime(currentTime)} / {formatTime(duration)}
	</div>

	<!-- ✅ 修复后的进度条 -->
	<div
		class="bar"
		onclick={handleClick}
		onkeydown={handleKeydown}
		role="slider"
		tabindex="0"
		aria-valuemin="0"
		aria-valuemax={duration}
		aria-valuenow={currentTime}
	>
		<div class="fill" style={`width: ${progressPercent}%`}></div>
		<div class="thumb" style={`left: ${progressPercent}%`}></div>
	</div>
</div>

<style>
.wrapper {
	position: relative;
	margin-top: 6px;
}

/* 气泡 */
.time-bubble {
	position: absolute;
	top: -28px;

	background: #000;
	color: #fff;

	font-size: 11px;
	padding: 3px 8px;
	border-radius: 999px;

	white-space: nowrap;
	pointer-events: none;

	opacity: 0;
	transition: opacity 0.2s ease;
}

.wrapper:hover .time-bubble {
	opacity: 1;
}

/* 进度条 */
.bar {
	position: relative;
	width: 100%;
	height: 6px;
	border-radius: 9999px;

	background: color-mix(
		in srgb,
		var(--btn-regular-bg) 80%,
		var(--content-meta) 20%
	);

	cursor: pointer;
}

/* 已播放 */
.fill {
	height: 100%;
	border-radius: inherit;
	background: var(--primary);
}

/* 圆点 */
.thumb {
	position: absolute;
	top: 50%;
	transform: translate(-50%, -50%);

	width: 12px;
	height: 12px;
	border-radius: 50%;

	background: #fff;
	border: 2px solid var(--primary);

	opacity: 0;
	transition: opacity 0.2s ease, transform 0.2s ease;
}

.wrapper:hover .thumb {
	opacity: 1;
	transform: translate(-50%, -50%) scale(1.1);
}
</style>