/**
 * 图片预加载处理器
 * 用于提前加载日记和时间线中的图片，提升用户体验
 */

interface PreloadOptions {
	/** 并行预加载数量 */
	parallel?: number;
	/** 是否使用 requestIdleCallback（不支持时降级到 setTimeout） */
	useIdleCallback?: boolean;
	/** 空闲回调超时时间（ms） */
	idleTimeout?: number;
}

/**
 * 图片预加载工具类
 */
export class ImagePreloadHandler {
	private preloadedImages = new Set<string>();
	private isPreloading = false;
	private options: Required<PreloadOptions>;

	constructor(options: PreloadOptions = {}) {
		this.options = {
			parallel: options.parallel ?? 3,
			useIdleCallback: options.useIdleCallback ?? true,
			idleTimeout: options.idleTimeout ?? 2000,
		};
	}

	/**
	 * 预加载单张图片
	 */
	private preloadImage(src: string): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.preloadedImages.has(src)) {
				resolve();
				return;
			}

			const img = new Image();
			img.onload = () => {
				this.preloadedImages.add(src);
				resolve();
			};
			img.onerror = () => {
				// 图片加载失败也标记为已处理，避免重复尝试
				this.preloadedImages.add(src);
				console.warn(`[ImagePreload] Failed to preload: ${src}`);
				resolve();
			};
			img.src = src;
		});
	}

	/**
	 * 并行预加载多张图片
	 */
	private async preloadBatch(images: string[]): Promise<void> {
		const chunks: string[][] = [];
		for (let i = 0; i < images.length; i += this.options.parallel) {
			chunks.push(images.slice(i, i + this.options.parallel));
		}

		for (const chunk of chunks) {
			await Promise.all(chunk.map((src) => this.preloadImage(src)));
		}
	}

	/**
	 * 使用 requestIdleCallback 或 setTimeout 在空闲时执行
	 */
	private schedulePreload(images: string[]): void {
		if (this.isPreloading || images.length === 0) return;

		this.isPreloading = true;
		const imagesToPreload = images.filter((src) => !this.preloadedImages.has(src));

		if (imagesToPreload.length === 0) {
			this.isPreloading = false;
			return;
		}

		const executePreload = () => {
			this.preloadBatch(imagesToPreload)
				.then(() => {
					console.log(`[ImagePreload] Preloaded ${imagesToPreload.length} images`);
				})
				.finally(() => {
					this.isPreloading = false;
				});
		};

		if (this.options.useIdleCallback && "requestIdleCallback" in window) {
			(window as any).requestIdleCallback(executePreload, {
				timeout: this.options.idleTimeout,
			});
		} else {
			setTimeout(executePreload, 100);
		}
	}

	/**
	 * 收集页面上所有需要预加载的图片
	 */
	private collectPageImages(): string[] {
		const images: string[] = [];

		// 收集日记图片
		document.querySelectorAll(".diary-images img").forEach((img) => {
			const src = img.getAttribute("src");
			if (src) images.push(src);
		});

		// 收集时间线图片
		document.querySelectorAll(".timeline-thumb img").forEach((img) => {
			const src = img.getAttribute("src");
			if (src) images.push(src);
		});

		// 收集 Fancybox 灯箱可能用到的图片（data-src 属性）
		document.querySelectorAll("[data-fancybox]").forEach((el) => {
			const src =
				el.getAttribute("data-src") ||
				(el as HTMLAnchorElement).href;
			if (src && src.startsWith("http")) images.push(src);
		});

		return [...new Set(images)];
	}

	/**
	 * 收集视口上方即将进入视口的图片（智能预加载）
	 */
	private collectUpcomingImages(): string[] {
		const viewportHeight = window.innerHeight;
		const preloadMargin = viewportHeight * 1.5; // 预加载视口下方 1.5 倍高度的图片
		const images: string[] = [];

		// 收集日记图片
		document.querySelectorAll(".diary-images img").forEach((img) => {
			const src = img.getAttribute("src");
			if (!src) return;

			const rect = img.getBoundingClientRect();
			// 图片在视口下方一定范围内
			if (rect.top <= viewportHeight + preloadMargin) {
				images.push(src);
			}
		});

		// 收集时间线图片
		document.querySelectorAll(".timeline-thumb img").forEach((img) => {
			const src = img.getAttribute("src");
			if (!src) return;

			const rect = img.getBoundingClientRect();
			if (rect.top <= viewportHeight + preloadMargin) {
				images.push(src);
			}
		});

		return [...new Set(images)];
	}

	/**
	 * 预加载当前页面的所有相关图片
	 */
	preloadPageImages(): void {
		const images = this.collectPageImages();
		this.schedulePreload(images);
	}

	/**
	 * 智能预加载 - 只预加载即将进入视口的图片
	 * 适合长页面，配合滚动监听使用
	 */
	preloadUpcomingImages(): void {
		const images = this.collectUpcomingImages();
		this.schedulePreload(images);
	}

	/**
	 * 预加载指定图片数组
	 */
	preloadImages(urls: string[]): void {
		const filtered = urls.filter((url) => !this.preloadedImages.has(url));
		this.schedulePreload(filtered);
	}

	/**
	 * 获取已预加载的图片数量
	 */
	getPreloadedCount(): number {
		return this.preloadedImages.size;
	}

	/**
	 * 检查图片是否已预加载
	 */
	isPreloaded(src: string): boolean {
		return this.preloadedImages.has(src);
	}
}

// 全局实例
let globalPreloadHandler: ImagePreloadHandler | null = null;

/**
 * 获取全局图片预加载处理器实例
 */
export function getImagePreloadHandler(options?: PreloadOptions): ImagePreloadHandler {
	if (!globalPreloadHandler) {
		globalPreloadHandler = new ImagePreloadHandler(options);
	}
	return globalPreloadHandler;
}

/**
 * 便捷函数：预加载页面图片
 */
export function preloadPageImages(options?: PreloadOptions): void {
	const handler = getImagePreloadHandler(options);
	handler.preloadPageImages();
}

/**
 * 便捷函数：智能预加载即将进入视口的图片
 */
export function preloadUpcomingImages(options?: PreloadOptions): void {
	const handler = getImagePreloadHandler(options);
	handler.preloadUpcomingImages();
}
