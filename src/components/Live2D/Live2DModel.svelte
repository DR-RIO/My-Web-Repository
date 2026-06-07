<script>
	import * as PIXI from "pixi.js";
	import { Live2DModel } from "pixi-live2d-display-lipsyncpatch/cubism4";
	import { onDestroy, onMount } from "svelte";

	let isLoading = false;
	let loadError = false;

	export let modelPath = "/pio/models/UGOfficial/ugofficial.model3.json";
	export let canvasWidth = 300;
	export let canvasHeight = 360;
	export let positionX = 12;
	export let positionY = -50;

	let canvasElement;
	let model;
	let app;
	let isMinimized = false;
	let isMobile = false;
	let userMinimized = false;
	let clickTimeout = null;

	let isAutoHidden = false;
	let autoHideTimer = null;
	let isRestoring = false;
	let handleMouseMove = null;
	let currentExpressionIndex = -1; // 初始为-1，表示默认表情状态

	// 表情配置（按照你想要的顺序，使用索引）
	const expressions = [
		{ index: 0, name: "桌面" }, // 1desk
		{ index: 1, name: "麦克风" }, // 2mic
		{ index: 3, name: "惊讶" }, // 4OAO
		{ index: 4, name: "委屈" }, // 5QAQ
		{ index: 5, name: "异议" }, // 6i gi a ri
	];

	// 节流函数，限制函数执行频率
	function throttle(func, limit) {
		let inThrottle;
		return function () {
			const args = arguments;
			const context = this;
			if (!inThrottle) {
				func.apply(context, args);
				inThrottle = true;
				setTimeout(() => (inThrottle = false), limit);
			}
		};
	}

	const buttonNormalBottom = positionY + canvasHeight + 20;
	const buttonMinimizedBottom = 20;

	const avatarNormal = "/pio/models/UGOfficial/ZBU.png";
	const avatarMinimized = "/pio/models/UGOfficial/ZBU.png";

	function loadSavedState() {
		const saved = localStorage.getItem("live2d_minimized");
		if (saved !== null) {
			userMinimized = saved === "true";
			return userMinimized;
		}
		return false;
	}

	function saveState(state) {
		localStorage.setItem("live2d_minimized", state);
	}

	function startAutoHideTimer() {
		if (autoHideTimer) {
			clearTimeout(autoHideTimer);
			autoHideTimer = null;
		}

		if (isMinimized && !isMobile && !isAutoHidden && !isRestoring) {
			autoHideTimer = setTimeout(() => {
				if (isMinimized && !isMobile && !isRestoring) {
					isAutoHidden = true;
				}
			}, 800);
		}
	}

	function cancelAutoHide() {
		if (autoHideTimer) {
			clearTimeout(autoHideTimer);
			autoHideTimer = null;
		}
		isAutoHidden = false;
		isRestoring = false;
	}

	function restoreToMinimized() {
		if (!isAutoHidden) {
			return;
		}

		isRestoring = true;
		isAutoHidden = false;

		setTimeout(() => {
			isRestoring = false;
			if (isMinimized && !isMobile) {
				startAutoHideTimer();
			}
		}, 400);
	}

	function checkScreenSize() {
		const wasMobile = isMobile;
		isMobile = window.innerWidth < 768;

		if (isMobile) {
			isMinimized = true;
			cancelAutoHide();
			return;
		}

		if (wasMobile && !isMobile) {
			isAutoHidden = false;
			isRestoring = false;
			if (autoHideTimer) {
				clearTimeout(autoHideTimer);
			}

			isMinimized = userMinimized;
			if (!userMinimized) {
				isMinimized = false;
			} else {
				startAutoHideTimer();
			}

			// 从移动端切换回桌面端时，强制重新渲染模型
			if (app) {
				setTimeout(() => {
					app.render();
					console.log("🔄 移动端切换回桌面端，模型已重新渲染");
				}, 100);
			}

			return;
		}

		if (!userMinimized) {
			isMinimized = false;
			cancelAutoHide();
		}
	}

	function toggleMinimize() {
		if (isMobile) {
			return;
		}

		// 半隐藏状态：直接展开
		if (isAutoHidden) {
			cancelAutoHide();
			userMinimized = false;
			isMinimized = false;
			saveState(userMinimized);
			return;
		}

		// 正常切换最小化/展开
		userMinimized = !isMinimized;
		isMinimized = !isMinimized;
		saveState(userMinimized);

		cancelAutoHide();

		if (isMinimized) {
			startAutoHideTimer();
		}
	}

	function setExpression(index) {
		if (!model) {
			return;
		}

		try {
			if (index < 0) {
				// 复位表情 - 使用 queueManager 播放 defaultExpression
				currentExpressionIndex = -1;
				if (model.internalModel?.motionManager?.expressionManager) {
					const exprManager =
						model.internalModel.motionManager.expressionManager;
					if (
						exprManager.defaultExpression &&
						exprManager.queueManager
					) {
						exprManager.queueManager.startMotion(
							exprManager.defaultExpression,
							false,
						);
						console.log(
							"🎭 表情已复位到默认 (使用 queueManager 播放 defaultExpression)",
						);
					} else {
						// 备用方案
						if (model.expression) {
							model.expression();
						}
						console.log("🎭 表情已复位到默认 (备用方案)");
					}
				} else {
					// 最后的备用方案
					if (model.expression) {
						model.expression();
					}
					console.log("🎭 表情已复位到默认 (最终备用方案)");
				}
			} else {
				// 设置指定表情 - 尝试多种方法！
				currentExpressionIndex = index;
				if (model.internalModel?.motionManager?.expressionManager) {
					const exprManager =
						model.internalModel.motionManager.expressionManager;
					const expressionIndex = expressions[index]?.index;
					if (
						expressionIndex !== undefined &&
						exprManager.definitions &&
						exprManager.definitions[expressionIndex]
					) {
						console.log(
							"🎭 表情定义:",
							exprManager.definitions[expressionIndex],
						);
						console.log(
							"🎭 表情管理器对象:",
							Object.keys(exprManager),
						);

						// 方法1：先尝试用 model.expression()
						if (model.expression) {
							model.expression(expressionIndex);
							console.log("🎭 方法1：表情已设置");
						}

						// 方法2：尝试直接设置 currentExpression
						setTimeout(() => {
							if (
								exprManager.expressions &&
								exprManager.expressions[expressionIndex]
							) {
								exprManager.currentExpression =
									exprManager.expressions[expressionIndex];
								console.log(
									"🎭 方法2：currentExpression 已设置",
								);

								// 方法3：尝试用 queueManager 播放
								if (exprManager.queueManager) {
									exprManager.queueManager.startMotion(
										exprManager.expressions[
											expressionIndex
										],
										false,
									);
									console.log("🎭 方法3：表情已播放");
								}
							} else {
								console.log(
									"🎭 expressions 数组里没有这个表情，只有:",
									exprManager.expressions?.length,
								);
							}
						}, 100);
					}
				} else {
					// 最后的备用方案
					if (model.expression) {
						const expressionIndex = expressions[index]?.index;
						if (expressionIndex !== undefined) {
							model.expression(expressionIndex);
						}
					}
					console.log("🎭 表情已设置 (最终备用方案)");
				}
				const expressionInfo = expressions[index];
				console.log(
					`🎭 当前表情: [${index + 1}] ${expressionInfo?.name || "未知"} (索引: ${expressionInfo?.index})`,
				);
			}
		} catch (error) {
			console.error("表情切换失败:", error);
		}
	}

	function handleModelClick() {
		if (isMobile) {
			return;
		}

		if (isAutoHidden) {
			restoreToMinimized();
			return;
		}
		if (isMinimized) {
			return;
		}
		if (clickTimeout) {
			return;
		}

		// 循环切换表情: 默认 -> 第9个 -> 麦克风 -> 惊讶 -> 委屈 -> 异议 -> 拳头 -> 默认
		if (currentExpressionIndex === -1) {
			// 当前是默认表情，切换到第1个表情
			setExpression(0);
		} else if (currentExpressionIndex === expressions.length - 1) {
			// 当前是最后一个表情（拳头），复位到默认
			setExpression(-1);
		} else {
			// 切换到下一个表情
			setExpression(currentExpressionIndex + 1);
		}

		clickTimeout = setTimeout(() => {
			clickTimeout = null;
		}, 500);
	}

	function handleButtonClick(e) {
		if (isMobile) {
			return;
		}
		e.stopPropagation();
		toggleMinimize();
	}

	function handleButtonMouseEnter() {
		if (isMobile) {
			return;
		}
		cancelAutoHide();
	}

	function handleButtonMouseLeave() {
		if (isMobile) {
			return;
		}
		if (isMinimized) {
			startAutoHideTimer();
		}
	}

	function handleKeydown(event) {
		// 移除空格键处理逻辑，避免影响输入框
	}

	onMount(() => {
		window.PIXI = PIXI;

		// 强制不最小化，以便测试
		userMinimized = false;
		isMinimized = false;
		isAutoHidden = false;

		checkScreenSize();

		// 页面加载完成后延迟加载 Live2D 模型
		const loadLive2D = async () => {
			if (isLoading) {
				return;
			}

			isLoading = true;
			try {
				app = new PIXI.Application({
					view: canvasElement,
					width: canvasWidth,
					height: canvasHeight,
					backgroundAlpha: 0,
					autoStart: true,
					antialias: true,
					resolution: window.devicePixelRatio,
					autoDensity: true,
				});

				// 定义鼠标移动处理函数
				const mouseMoveHandler = function (event) {
					if (!model || isMinimized || isMobile) {
						return;
					}

					try {
						const rect = canvasElement.getBoundingClientRect();
						const mouseX = event.clientX - rect.left;
						const mouseY = event.clientY - rect.top;

						// 将鼠标坐标转换为模型坐标（-1 到 1 的范围）
						const normalizedX = (mouseX / canvasWidth) * 2 - 1;
						const normalizedY = (mouseY / canvasHeight) * 2 - 1;

						// 设置模型参数，控制眼珠跟随
						model.setParamValue("ParamEyeBallX", normalizedX * 1.5); // 1.5 是灵敏度系数
						model.setParamValue(
							"ParamEyeBallY",
							-normalizedY * 1.5,
						);
						model.setParamValue("ParamEyeBallForm", 1); // 激活眼珠跟随
					} catch (error) {}
				};

				// 使用节流函数限制鼠标移动事件的执行频率
				handleMouseMove = throttle(mouseMoveHandler, 50); // 每50毫秒执行一次

				model = await Live2DModel.from(modelPath);

				model.anchor.set(0.5, 0.5);
				model.x = canvasWidth / 2;
				model.y = canvasHeight / 2;
				model.scale.set(0.25, 0.25);
				app.stage.addChild(model);

				console.log("🎨 模型加载完成!");
				console.log("Available model methods:", Object.keys(model));
				console.log("Internal model:", model.internalModel);
				if (model.internalModel?.motionManager?.expressionManager) {
					console.log(
						"Expression manager:",
						model.internalModel.motionManager.expressionManager,
					);
					console.log(
						"📋 模型所有表情:",
						model.internalModel.motionManager.expressionManager
							.definitions,
					);

					const definitions =
						model.internalModel.motionManager.expressionManager
							.definitions;
					if (definitions && definitions.length > 0) {
						console.log("📄 表情文件列表:");
						definitions.forEach((exp, index) => {
							console.log(
								`  [${index}] ${exp.Name} → ${exp.File}`,
							);
						});
						console.log(
							"� 第一个表情（通常是默认）:",
							definitions[0],
						);
					}
				}
				console.log("🎭 当前状态: 未应用任何表情（原始默认表情）");
				console.log(
					"🔄 表情循环顺序: 默认 → 桌面 → 麦克风 → 惊讶 → 委屈 → 异议 → 默认",
				);

				// 播放循环待机动作
				if (model.motion) {
					model.motion("", 0, { loop: true });
					console.log("🎬 待机动作已开始播放");
				}

				model.on("click", () => {
					handleModelClick();
				});

				// 添加鼠标移动事件监听
				window.addEventListener("mousemove", handleMouseMove);

				window.addEventListener("resize", () => {
					checkScreenSize();
				});

				console.log("模型设置完成");
			} catch (error) {
				console.error("Live2D 模型加载失败:", error);
				loadError = true;
			} finally {
				isLoading = false;
			}
		};

		// 延迟 0.5 秒加载，让页面先渲染完成
		const loadTimer = setTimeout(() => {
			loadLive2D();
		}, 500);

		return () => {
			clearTimeout(loadTimer);
			if (app) {
				app.destroy(true, { children: true });
			}
			if (clickTimeout) {
				clearTimeout(clickTimeout);
			}
			if (autoHideTimer) {
				clearTimeout(autoHideTimer);
			}
			// 移除事件监听
			if (handleMouseMove) {
				window.removeEventListener("mousemove", handleMouseMove);
			}
		};
	});
</script>

<!-- 看板娘 -->
<div
	role="button"
	tabindex="0"
	class="live2d-model"
	class:minimized={isMinimized}
	class:auto-hidden={isAutoHidden}
	class:restoring={isRestoring}
	class:hide-on-mobile={isMobile}
	style="position: fixed; bottom: {positionY}px; left: {positionX}px; z-index: 1000; cursor: pointer;"
	on:click={handleModelClick}
	on:keydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleModelClick();
		}
	}}
>
	<div>
		<canvas
			bind:this={canvasElement}
			width={canvasWidth}
			height={canvasHeight}
		></canvas>
	</div>
</div>

<!-- 按钮 - 完整特效版 -->
<button
	class="magical-btn"
	class:minimized={isMinimized}
	class:auto-hidden={isAutoHidden}
	class:restoring={isRestoring}
	class:hide-on-mobile={isMobile}
	on:click={handleButtonClick}
	on:mouseenter={handleButtonMouseEnter}
	on:mouseleave={handleButtonMouseLeave}
	style="position: fixed; left: {positionX}px; z-index: 1001;"
	style:bottom={isMinimized
		? buttonMinimizedBottom + "px"
		: positionY + canvasHeight + -80 + "px"}
>
	<!-- 魔法阵光环 -->
	<div class="magic-circle"></div>

	<!-- 樱花环绕 -->
	<div class="sakura-ring">
		<span>🌸</span><span>🌸</span><span>🌸</span><span>🌸</span><span
			>🌸</span
		>
	</div>

	<!-- 星光粒子 -->
	<div class="star-particles">
		<span>✨</span><span>⭐</span><span>🌟</span><span>💫</span><span
			>⭐</span
		>
	</div>

	<!-- 心动波纹 -->
	<div class="heart-waves"></div>

	<!-- 音符飘浮 -->
	<div class="music-notes">
		<span>♪</span><span>♫</span><span>♪</span>
	</div>

	<!-- 星星发饰 -->
	<div class="star-hairpin">
		<div class="star-big">⭐</div>
		<div class="star-small">✨</div>
	</div>

	<!-- 头像框 -->
	<div class="avatar-frame">
		<img
			class="avatar-img"
			src={isMinimized ? avatarMinimized : avatarNormal}
			alt="minimize-btn"
		/>
		<div class="avatar-shine"></div>
	</div>

	<!-- 气泡提示 -->
	<div class="speech-bubble" class:up={isMinimized}>
		<span>{isMinimized ? "ただいま！" : "おやすみ〜"}</span>
		<span class="sub">{isMinimized ? "我回来啦！" : "晚安~"}</span>
	</div>
</button>

<style>
	/* ===== 手机端隐藏 ===== */
	.hide-on-mobile {
		visibility: hidden !important;
		opacity: 0 !important;
		pointer-events: none !important;
	}

	.live2d-model {
		transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		transform: translateX(0);
		cursor: pointer;
	}

	.live2d-model.minimized {
		transform: translateX(-120%);
		cursor: default;
	}

	.live2d-model.auto-hidden {
		transform: translateX(-95%);
	}

	.live2d-model.restoring {
		transform: translateX(-120%);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* ===== 按钮基础样式 ===== */
	.magical-btn {
		position: relative;
		width: 52px;
		height: 52px;
		border-radius: 26px;
		background: linear-gradient(135deg, #ffe6f0, #ffd0e0);
		border: none;
		cursor: pointer;
		padding: 0;
		transition: all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
		box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
	}

	.magical-btn.auto-hidden {
		transform: translateX(-80%);
	}

	.magical-btn.restoring {
		transform: translateX(-120%);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* ===== 魔法阵光环 ===== */
	.magic-circle {
		position: absolute;
		inset: -4px;
		border-radius: 50%;
		background: radial-gradient(
			circle,
			rgba(255, 200, 230, 0) 0%,
			rgba(255, 150, 200, 0.4) 100%
		);
		opacity: 0;
		transition: opacity 0.3s;
		pointer-events: none;
	}

	.magical-btn:hover .magic-circle {
		opacity: 1;
		animation: magicSpin 2s linear infinite;
	}

	@keyframes magicSpin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	/* ===== 樱花环绕 ===== */
	.sakura-ring {
		position: absolute;
		inset: -22px;
		pointer-events: none;
	}

	.sakura-ring span {
		position: absolute;
		font-size: 10px;
		font-family:
			"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji",
			"Segoe UI Symbol", "Android Emoji", EmojiSymbols;
		opacity: 0;
		transition: all 0.3s;
	}

	.magical-btn:hover .sakura-ring span {
		animation: sakuraOrbit 3s linear infinite;
	}

	.sakura-ring span:nth-child(1) {
		top: -10px;
		left: 50%;
		animation-delay: 0s;
	}
	.sakura-ring span:nth-child(2) {
		bottom: -10px;
		left: 50%;
		animation-delay: 1.5s;
	}
	.sakura-ring span:nth-child(3) {
		top: 50%;
		right: -10px;
		animation-delay: 0.75s;
	}
	.sakura-ring span:nth-child(4) {
		top: 50%;
		left: -10px;
		animation-delay: 2.25s;
	}
	.sakura-ring span:nth-child(5) {
		top: -2px;
		left: -2px;
		animation-delay: 0.5s;
	}

	@keyframes sakuraOrbit {
		0% {
			opacity: 0;
			transform: scale(0);
		}
		20% {
			opacity: 1;
			transform: scale(1.2);
		}
		80% {
			opacity: 1;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(0);
		}
	}

	/* ===== 星光粒子 ===== */
	.star-particles {
		position: absolute;
		inset: -15px;
		pointer-events: none;
	}

	.star-particles span {
		position: absolute;
		font-size: 8px;
		font-family:
			"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji",
			"Segoe UI Symbol", "Android Emoji", EmojiSymbols;
		opacity: 0;
	}

	.magical-btn:hover .star-particles span {
		animation: starTwinkle 0.8s ease-out forwards;
	}

	.star-particles span:nth-child(1) {
		top: -6px;
		left: -5px;
		animation-delay: 0s;
	}
	.star-particles span:nth-child(2) {
		top: -3px;
		right: -6px;
		animation-delay: 0.12s;
	}
	.star-particles span:nth-child(3) {
		bottom: -5px;
		left: 40%;
		animation-delay: 0.24s;
	}
	.star-particles span:nth-child(4) {
		top: 30%;
		right: -8px;
		animation-delay: 0.36s;
	}
	.star-particles span:nth-child(5) {
		bottom: -6px;
		right: 20%;
		animation-delay: 0.48s;
	}

	@keyframes starTwinkle {
		0% {
			opacity: 0;
			transform: scale(0);
		}
		30% {
			opacity: 1;
			transform: scale(1.3);
		}
		70% {
			opacity: 1;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(0.5);
		}
	}

	/* ===== 心动波纹 ===== */
	.heart-waves {
		position: absolute;
		inset: -4px;
		border-radius: 50%;
		pointer-events: none;
	}

	.magical-btn:hover .heart-waves::before,
	.magical-btn:hover .heart-waves::after {
		content: "💖";
		position: absolute;
		font-size: 10px;
		font-family:
			"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji",
			"Segoe UI Symbol", "Android Emoji", EmojiSymbols;
		animation: heartWave 1s ease-out infinite;
	}

	.heart-waves::before {
		top: -10px;
		left: -10px;
		animation-delay: 0s;
	}

	.heart-waves::after {
		bottom: -10px;
		right: -6px;
		animation-delay: 0.3s;
	}

	@keyframes heartWave {
		0% {
			opacity: 0;
			transform: scale(0.5);
		}
		50% {
			opacity: 1;
			transform: scale(1.2);
		}
		100% {
			opacity: 0;
			transform: scale(1.5);
		}
	}

	/* ===== 音符飘浮 ===== */
	.music-notes {
		position: absolute;
		inset: -22px;
		pointer-events: none;
	}

	.music-notes span {
		position: absolute;
		font-size: 9px;
		font-family:
			"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji",
			"Segoe UI Symbol", "Android Emoji", EmojiSymbols;
		opacity: 0;
	}

	.magical-btn:hover .music-notes span {
		animation: noteFloat 1.5s ease-out forwards;
	}

	.music-notes span:nth-child(1) {
		top: -15px;
		left: 20%;
		animation-delay: 0s;
	}
	.music-notes span:nth-child(2) {
		bottom: -10px;
		right: 25%;
		animation-delay: 0.3s;
	}
	.music-notes span:nth-child(3) {
		top: 10%;
		right: -15px;
		animation-delay: 0.6s;
	}

	@keyframes noteFloat {
		0% {
			opacity: 0;
			transform: translateY(0) rotate(0deg);
		}
		20% {
			opacity: 1;
			transform: translateY(-3px) rotate(-10deg);
		}
		80% {
			opacity: 1;
			transform: translateY(-10px) rotate(10deg);
		}
		100% {
			opacity: 0;
			transform: translateY(-18px) rotate(0deg);
		}
	}

	/* ===== 星星发饰 ===== */
	.star-hairpin {
		position: absolute;
		top: -14px;
		left: 50%;
		transform: translateX(-50%);
		width: 28px;
		height: 28px;
		pointer-events: none;
		z-index: 5;
	}

	.star-big {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		font-size: 16px;
		font-family:
			"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji",
			"Segoe UI Symbol", "Android Emoji", EmojiSymbols;
		filter: drop-shadow(0 0 3px #ffd700);
		animation: starSpin 3s linear infinite;
	}

	.star-small {
		position: absolute;
		top: 5px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 9px;
		font-family:
			"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji",
			"Segoe UI Symbol", "Android Emoji", EmojiSymbols;
		opacity: 0.8;
		animation: starFloat 1.5s ease-in-out infinite;
	}

	@keyframes starSpin {
		from {
			transform: translateX(-50%) rotate(0deg);
		}
		to {
			transform: translateX(-50%) rotate(360deg);
		}
	}

	@keyframes starFloat {
		0%,
		100% {
			transform: translateX(-50%) translateY(0);
		}
		50% {
			transform: translateX(-50%) translateY(-2px);
		}
	}

	/* ===== 头像框 ===== */
	.avatar-frame {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #ffb6c1, #ffc0cb);
		border-radius: 50%;
		transition: all 0.3s ease;
	}

	.avatar-img {
		width: 42px;
		height: 42px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid white;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	}

	.avatar-shine {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.4) 0%,
			transparent 60%
		);
		pointer-events: none;
	}

	.magical-btn:hover .avatar-frame {
		transform: scale(1.05);
		box-shadow: 0 0 12px rgba(255, 105, 180, 0.5);
	}

	/* ===== 气泡提示 ===== */
	.speech-bubble {
		position: absolute;
		bottom: -52px;
		left: 0;
		transform: translateX(0);
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(8px);
		padding: 6px 12px;
		border-radius: 16px;
		white-space: nowrap;
		opacity: 0;
		transition:
			opacity 0.3s,
			transform 0.2s;
		pointer-events: none;
		font-family: "Comic Neue", "Segoe UI", cursive;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
	}

	.speech-bubble span {
		display: block;
		text-align: center;
	}

	.speech-bubble span:first-child {
		font-size: 13px;
		font-weight: bold;
		color: #ff6b9d;
	}

	.speech-bubble .sub {
		font-size: 11px;
		color: #888;
	}

	.speech-bubble::before {
		content: "";
		position: absolute;
		top: -4px;
		left: 20px;
		transform: translateX(0);
		width: 0;
		height: 0;
		border-left: 4px solid transparent;
		border-right: 4px solid transparent;
		border-bottom: 4px solid rgba(255, 255, 255, 0.95);
	}

	.speech-bubble.up {
		bottom: auto;
		top: -52px;
	}

	.speech-bubble.up::before {
		top: auto;
		bottom: -4px;
		left: 20px;
		border-bottom: none;
		border-top: 4px solid rgba(255, 255, 255, 0.95);
	}

	.magical-btn:hover .speech-bubble {
		opacity: 1;
		transform: translateX(0) translateY(-2px);
	}

	.magical-btn.minimized {
		background: linear-gradient(135deg, #e0f0ff, #d0e8ff);
		box-shadow: 0 4px 12px rgba(100, 150, 255, 0.3);
	}
</style>
