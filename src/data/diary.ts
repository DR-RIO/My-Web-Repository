// 日记数据配置
// 用于管理日记页面的数据

export interface DiaryItem {
	id: number;
	content: string;
	date: string;
	images?: string[];
	location?: string;
	mood?: string;
	tags?: string[];
	pinned?: boolean; // ⭐ 是否置顶
}

// 日记数据
const diaryData: DiaryItem[] = [
	// {
	// 	id: ,
	// 	content:"",
	// 	date: "yyyy-MM-dd HH:mm:ssZ",
	// 	images: [
	// 		"",
	// 		""
	// 	],
	// 	location: "",
	// 	mood: "",
	// 	tags: [""],
	// 	pinned: true/false,
	// },
	

	{
		id: 7,
		content: `真心喜欢一位音乐制作人 @PIKASONIC　
		[在站内搜索PIKASONIC的歌](music://search/PIKASONIC)　[PIKASONIC_ナナツカゼ](https://space.bilibili.com/262995951?spm_id_from=333.337.0.0)`,
		date: "2026-06-03T04:24:00Z",
		images: [
			"https://easyimage.isu183s.top/i/2026/06/07/030352.jpg",
			"https://easyimage.isu183s.top/i/2026/06/07/030400.jpg",
			"https://easyimage.isu183s.top/i/2026/06/07/030404.jpg"
		],
		location: "Bilibili",
		mood: "仰望",
		tags: ["音乐"],
		pinned: false,
	},

	{
		id: 6,
		content: `Welcome to the world of photography!　　　　tips:黄埔军校不给拍照，差点当罕见了`,		
		date: "2026-06-03T04:24:00Z",
		images: [
			"https://easyimage.isu183s.top/i/2026/06/05/022101.jpg",
			"https://easyimage.isu183s.top/i/2026/06/05/022307.jpg"
		],
		location: "佛山市  → 黄埔军校",
		mood: "累",
		tags: ["黄埔军校"],
		pinned: false,
	},

	{
		id: 5,
		content: `今日份主谓祈使句: "猫！你去把老鼠打败！"　[为了打败老鼠特地买了个狸花猫](https://www.bilibili.com/video/BV1BdGy6dEeh/?spm_id_from=333.337.search-card.all.click&vd_source=6a6cd981e4537c9742d3abfd226b8198)`,
		date: "2026-05-30T01:00:00Z",
		images: [
			"https://easyimage.isu183s.top/i/2026/05/30/045006.png",
		],
		location: "bilibili",
		mood: "笑不活了",
		tags: ["bilibili"],
		pinned: false
	},

	{
		id: 4,
		content: `Today:　　　　　　　　　　　　　　*OS:王牌一代目自然是可爱！`,
		date: "2026-04-23T04:24:00Z",
		images: [
			"https://easyimage.isu183s.top/i/2026/04/25/003620.png",
			"https://easyimage.isu183s.top/i/2026/04/25/003659.png",
			"https://easyimage.isu183s.top/i/2026/04/25/034411.png",
		],
		location: "异环",
		mood: "开心",
		tags: ["二次元","摄影"],
		pinned: false
	},

	{
		id: 3,
		content:
			`"写代码不无聊吗？" 　　"是的先生,收获的正向反馈不比游戏少。" `,
		date: "2026-04-23T04:24:00Z",
		images: [
			"https://easyimage.isu183s.top/i/2026/04/23/6vcfkt.png",
			"https://easyimage.isu183s.top/i/2026/04/23/6x4rex.png"
		],
		location: "Windows文件管理器",
		mood: "兴奋",
		tags: ["网站调试过程","截图"],
		pinned: false
	},

	{
		id: 2,
		content: `“到底要多优秀，才能配得上她呢？”
			
				　　谁说完美的恋情一定是两个人都很优秀的？ 也许只要有一个人足够优秀，另一个人就会觉得自己很幸运了吧。
				
				　　　　　　　　　　　　　　　　　　　　“喜欢一个女孩子，就多给她一点偏爱吧。"`,
		date: "2026-04-20T00:00:00Z",
		images: [
			"https://easyimage.isu183s.top/app/thumb.php?img=/i/2026/04/20/6u5mv.webp"
		],
		location: "心里",
		mood: "疑难杂症",
		tags: ["自我思考"],
		pinned: false,
	},

	{
		id: 1,
		content:
			"你知道吗？ 你一句: “我一直等着你。” 　　—— 对于我来说是多大的救赎吗？",
		date: "2026-04-19T01:00:00Z",
		images: [
			"https://easyimage.isu183s.top/i/2026/04/19/12ybk7v-0.jpg",
			"https://easyimage.isu183s.top/i/2026/04/19/12yao4y-0.jpg"
		],
		location: "心里",
		mood: "期待",
		tags: ["I crsuh"],
		pinned: true, // ⭐ 这条置顶
	},

];

// 获取日记统计数据
export const getDiaryStats = () => {
	const total = diaryData.length;

	const hasImages = diaryData.filter(
		(item) => item.images && item.images.length > 0
	).length;

	const hasLocation = diaryData.filter((item) => item.location).length;
	const hasMood = diaryData.filter((item) => item.mood).length;

	const safePercent = (count: number) =>
		total > 0 ? Math.round((count / total) * 100) : 0;

	return {
		total,
		hasImages,
		hasLocation,
		hasMood,
		imagePercentage: safePercent(hasImages),
		locationPercentage: safePercent(hasLocation),
		moodPercentage: safePercent(hasMood)
	};
};

// 获取日记列表（⭐ 支持置顶）
export const getDiaryList = (limit?: number) => {
	const sortedData = [...diaryData].sort((a, b) => {
		// ⭐ 1. 先按置顶
		const aPinned = a.pinned ? 1 : 0;
		const bPinned = b.pinned ? 1 : 0;

		if (aPinned !== bPinned) {
			return bPinned - aPinned;
		}

		// ⭐ 2. 再按时间倒序
		return new Date(b.date).getTime() - new Date(a.date).getTime();
	});

	return limit && limit > 0 ? sortedData.slice(0, limit) : sortedData;
};

// 获取最新的日记
export const getLatestDiary = () => {
	const list = getDiaryList(1);
	return list.length > 0 ? list[0] : null;
};

// 根据ID获取日记
export const getDiaryById = (id: number) => {
	return diaryData.find((item) => item.id === id);
};

// 获取包含图片的日记
export const getDiaryWithImages = () => {
	return diaryData.filter(
		(item) => item.images && item.images.length > 0
	);
};

// 根据标签筛选日记
export const getDiaryByTag = (tag: string) => {
	return diaryData
		.filter((item) => item.tags?.includes(tag))
		.sort(
			(a, b) =>
				new Date(b.date).getTime() -
				new Date(a.date).getTime()
		);
};

// 获取所有标签
export const getAllTags = () => {
	const tags = new Set<string>();

	diaryData.forEach((item) => {
		if (item.tags) {
			item.tags.forEach((tag) => tags.add(tag));
		}
	});

	return Array.from(tags).sort();
};

export default diaryData;