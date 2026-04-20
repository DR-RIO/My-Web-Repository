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
}

// 日记数据
const diaryData: DiaryItem[] = [
	{
		id: 2,
		content:
		 	`“到底要多优秀，才能配得上她呢？”
			
	        　　谁说完美的恋情一定是两个人都很优秀的？ 也许只要有一个人足够优秀，另一个人就会觉得自己很幸运了吧。
			 　　　　　　　　　　　　　　　　“喜欢一个女孩子，就多给她一点偏爱吧。”
			`,
		date: "2026-04-20T00:00:00Z",
		images: ["https://easyimage.isu183s.top/app/thumb.php?img=/i/2026/04/20/6u5mv.webp"],
	},

	{
		id: 1,
		content:
			"你知道吗？ 一句: 我一直等着你。 —— 对于我来说是多大的救赎吗？",
		date: "2026-04-19T01:00:00Z",
		images: ["https://easyimage.isu183s.top/i/2026/04/19/12ybk7v-0.jpg", "https://easyimage.isu183s.top/i/2026/04/19/12yao4y-0.jpg"],
	},
	

];

// 获取日记统计数据
export const getDiaryStats = () => {
	const total = diaryData.length;
	const hasImages = diaryData.filter(
		(item) => item.images && item.images.length > 0,
	).length;
	const hasLocation = diaryData.filter((item) => item.location).length;
	const hasMood = diaryData.filter((item) => item.mood).length;

	return {
		total,
		hasImages,
		hasLocation,
		hasMood,
		imagePercentage: Math.round((hasImages / total) * 100),
		locationPercentage: Math.round((hasLocation / total) * 100),
		moodPercentage: Math.round((hasMood / total) * 100),
	};
};

// 获取日记列表（按时间倒序）
export const getDiaryList = (limit?: number) => {
	const sortedData = diaryData.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);

	if (limit && limit > 0) {
		return sortedData.slice(0, limit);
	}

	return sortedData;
};

// 获取最新的日记
export const getLatestDiary = () => {
	return getDiaryList(1)[0];
};

// 根据ID获取日记
export const getDiaryById = (id: number) => {
	return diaryData.find((item) => item.id === id);
};

// 获取包含图片的日记
export const getDiaryWithImages = () => {
	return diaryData.filter((item) => item.images && item.images.length > 0);
};

// 根据标签筛选日记
export const getDiaryByTag = (tag: string) => {
	return diaryData
		.filter((item) => item.tags?.includes(tag))
		.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
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
