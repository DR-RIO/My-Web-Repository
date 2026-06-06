import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { initPostIdMap } from "@utils/permalink-utils";
import { getCategoryUrl, getPostUrl } from "@utils/url-utils";
import { type CollectionEntry, getCollection } from "astro:content";

/**
 * Extract and simplify URL for display
 * @param url The full URL
 * @param maxLength Maximum display length
 */
function simplifyUrl(url: string, maxLength: number = 30): string {
	try {
		const parsedUrl = new URL(url);
		let display = parsedUrl.hostname + parsedUrl.pathname;
		if (display.startsWith("www.")) {
			display = display.slice(4);
		}
		if (display.length > maxLength) {
			display = display.slice(0, maxLength - 3) + "...";
		}
		return display;
	} catch {
		if (url.length > maxLength) {
			return url.slice(0, maxLength - 3) + "...";
		}
		return url;
	}
}

/**
 * Convert URLs in content to clickable links
 * @param content The content string
 */
export function linkifyContent(content: string): string {
	console.log('🔗 linkifyContent 开始处理:', content);
	let result = content;
	
	// 先处理音乐搜索链接格式 [显示文字](music://search/搜索关键词)
	const musicLinkPattern = /\[([^\]]+)\]\(music:\/\/search\/([^\)]+)\)/g;
	const musicProcessedMarkers: string[] = [];
	let musicMarkerIndex = 0;
	
	result = result.replace(musicLinkPattern, (_, displayText, keyword) => {
		console.log('🎵 发现音乐链接:', displayText, keyword);
		const marker = `__MUSIC_LINK_${musicMarkerIndex}__`;
		musicMarkerIndex++;
		const html = `<a href="javascript:void(0)" data-music-search="${encodeURIComponent(keyword)}" class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--btn-plain-bg)] text-[var(--primary)] text-xs md:text-sm hover:bg-[var(--btn-plain-bg-hover)] transition-colors cursor-pointer">🎵 ${displayText}</a>`;
		musicProcessedMarkers.push(html);
		console.log('🎵 生成的HTML:', html);
		return marker;
	});
	
	// 再处理普通 Markdown 链接格式 [别名](链接)
	// 临时标记一下已处理的链接，避免后面的正则再次匹配
	const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
	const processedMarkers: string[] = [];
	let markerIndex = 0;
	
	result = result.replace(markdownLinkPattern, (_, displayText, url) => {
		const marker = `__MARKDOWN_LINK_${markerIndex}__`;
		markerIndex++;
		processedMarkers.push(
			`<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--btn-plain-bg)] text-[var(--primary)] text-xs md:text-sm hover:bg-[var(--btn-plain-bg-hover)] transition-colors">🔗 ${displayText}</a>`
		);
		return marker;
	});
	
	// 再处理普通 URL 链接
	const urlPattern = /https?:\/\/[^\s]+/g;
	result = result.replace(urlPattern, (url) => {
		const displayText = simplifyUrl(url);
		return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--btn-plain-bg)] text-[var(--primary)] text-xs md:text-sm hover:bg-[var(--btn-plain-bg-hover)] transition-colors">🔗 ${displayText}</a>`;
	});
	
	// 先替换音乐链接标记
	for (let i = 0; i < musicMarkerIndex; i++) {
		result = result.replace(`__MUSIC_LINK_${i}__`, musicProcessedMarkers[i]);
	}
	
	// 再替换普通链接标记
	for (let i = 0; i < markerIndex; i++) {
		result = result.replace(`__MARKDOWN_LINK_${i}__`, processedMarkers[i]);
	}
	
	return result;
}

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		// 首先按置顶状态排序，置顶文章在前
		if (a.data.pinned && !b.data.pinned) {
			return -1;
		}
		if (!a.data.pinned && b.data.pinned) {
			return 1;
		}

		// 如果置顶状态相同，优先按 Priority 排序（数值越小越靠前）
		if (a.data.pinned && b.data.pinned) {
			const priorityA = a.data.priority;
			const priorityB = b.data.priority;
			if (priorityA !== undefined && priorityB !== undefined) {
				if (priorityA !== priorityB) {
					return priorityA - priorityB;
				}
			} else if (priorityA !== undefined) {
				return -1;
			} else if (priorityB !== undefined) {
				return 1;
			}
		}

		// 否则按发布日期排序
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].id;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].id;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export interface PostForList {
	id: string;
	data: CollectionEntry<"posts">["data"];
	url?: string; // 预计算的文章 URL
}
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// 初始化文章 ID 映射（用于 permalink 功能）
	initPostIdMap(sortedFullPosts);

	// delete post.body，并预计算 URL
	const sortedPostsList = sortedFullPosts.map((post) => ({
		id: post.id,
		data: post.data,
		url: getPostUrl(post),
	}));

	return sortedPostsList;
}
export interface Tag {
	name: string;
	count: number;
}

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: Record<string, number> = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) {
				countMap[tag] = 0;
			}
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export interface Category {
	name: string;
	count: number;
	url: string;
}

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: Record<string, number> = {};
	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}

/**
 * 对标题进行分词，支持中英文混合
 *
 * - 优先使用 Intl.Segmenter（在支持的运行时中效果更好）
 * - 在不支持 Segmenter 的环境（如部分 Node 运行时）下
 *   回退到基于正则的简单分词，以避免构建报错
 * - 过滤标点和空白，英文统一小写
 */
function tokenizeTitle(title: string): Set<string> {
	const tokens = new Set<string>();

	// 运行时可能不支持 Intl.Segmenter（例如部分 Node 环境）
	// 为了避免 SSR/构建时报错，这里做兼容处理
	const hasSegmenter =
		typeof Intl !== "undefined" &&
		"Segmenter" in Intl &&
		typeof (Intl as any).Segmenter === "function";

	if (!hasSegmenter) {
		// 简单回退方案：按照空白和标点拆分
		const basicTokens = title
			.toLowerCase()
			.split(/[\s\p{P}]+/gu)
			.filter(Boolean);
		for (const t of basicTokens) {
			tokens.add(t);
		}
		return tokens;
	}

	// 使用 Intl.Segmenter 进行更精细的中英文混合分词
	const segmenter = new (Intl as any).Segmenter("zh", {
		granularity: "word",
	});
	for (const { segment, isWordLike } of segmenter.segment(title)) {
		if (!isWordLike) {continue;}
		tokens.add((segment as string).toLowerCase());
	}
	return tokens;
}

/**
 * 计算两个集合的 Jaccard 相似度
 */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
	if (a.size === 0 && b.size === 0) {return 0;}
	let intersection = 0;
	for (const item of a) {
		if (b.has(item)) {intersection++;}
	}
	const union = a.size + b.size - intersection;
	return union === 0 ? 0 : intersection / union;
}

/**
 * 获取相关文章推荐
 * 评分公式: totalScore = tagMatchScore + titleSimilarityScore + timeFreshnessScore + categoryBonus
 * - tagMatchScore (0-100): 标签 Jaccard 相似度 × 100
 * - titleSimilarityScore (0-100): 标题分词 Jaccard 相似度 × 100
 * - timeFreshnessScore (0-30): 6 个月半衰期指数衰减
 * - categoryBonus (0 or 10): 同分类加 10 分
 */
export async function getRelatedPosts(
	currentPost: CollectionEntry<"posts">,
	maxCount = 5,
): Promise<PostForList[]> {
	const allPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	// 排除自身和加密文章
	const candidates = allPosts.filter(
		(p) => p.id !== currentPost.id && !p.data.password,
	);

	const currentTags = new Set(currentPost.data.tags || []);
	const currentTokens = tokenizeTitle(currentPost.data.title);
	const currentCategory = currentPost.data.category || "";
	const now = Date.now();

	const scored = candidates.map((post) => {
		const postTags = new Set(post.data.tags || []);

		// tagMatchScore (0-100)
		const tagMatchScore = jaccardSimilarity(currentTags, postTags) * 100;

		// titleSimilarityScore (0-100)
		const postTokens = tokenizeTitle(post.data.title);
		const titleSimilarityScore =
			jaccardSimilarity(currentTokens, postTokens) * 100;

		// timeFreshnessScore (0-30): 6 个月半衰期
		const daysSincePublished =
			(now - new Date(post.data.published).getTime()) /
			(1000 * 60 * 60 * 24);
		const timeFreshnessScore =
			30 * Math.exp((-Math.LN2 * daysSincePublished) / 180);

		// categoryBonus (0 or 10)
		const postCategory = post.data.category || "";
		const categoryBonus =
			currentCategory && postCategory && currentCategory === postCategory
				? 10
				: 0;

		const totalScore =
			tagMatchScore +
			titleSimilarityScore +
			timeFreshnessScore +
			categoryBonus;

		return {
			post,
			totalScore,
			tagMatchScore,
			timeFreshnessScore,
			categoryBonus,
		};
	});

	// 按总分降序排列
	scored.sort((a, b) => b.totalScore - a.totalScore);

	// 优先取有标签匹配的
	const withTagMatch = scored.filter((s) => s.tagMatchScore > 0);
	const withoutTagMatch = scored.filter((s) => s.tagMatchScore === 0);

	const result: PostForList[] = [];

	for (const s of withTagMatch) {
		if (result.length >= maxCount) {break;}
		result.push({ id: s.post.id, data: s.post.data });
	}

	// 不足时从剩余候选中按 timeFreshnessScore + categoryBonus 降序补充
	if (result.length < maxCount) {
		withoutTagMatch.sort(
			(a, b) =>
				b.timeFreshnessScore +
				b.categoryBonus -
				(a.timeFreshnessScore + a.categoryBonus),
		);
		for (const s of withoutTagMatch) {
			if (result.length >= maxCount) {break;}
			result.push({ id: s.post.id, data: s.post.data });
		}
	}

	return result;
}
