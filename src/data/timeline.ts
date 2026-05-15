import type { TimelineItem } from "../components/features/timeline/types";

export { type TimelineItem };

export const timelineData: TimelineItem[] = [
	{
		id: "current-study",
		title: "计算机网络技术在读",
		description: "目前就读于计算机网络技术专业，涵盖计算机网络技术各个方向。",
		type: "education",
		startDate: "2023-09-01",
		location: "广东·佛山·南海",
		organization: "广东省佛山市华材职业技术学校",
		skills: ["HTML/CSS", "Visual Studio Code", "JavaScript", "After Effects", "MySQL","Tableau","Photoshop","HBulid X","Linux","Windows server"],
		achievements: [
			"2024-2025学年广东省职业院校技能大赛（中职组）移动应用与开发赛项 一等奖",
			"2025国家奖学金(中职生) 获得者",
			"当前毕业所需学分累计: 170 / 172  *已满足*",
		],
		icon: "material-symbols:school",
		color: "#059669",
		featured: true,
		// 👇 新增图片
		images: ["https://easyimage.isu183s.top/i/2026/05/04/023316.png","https://easyimage.isu183s.top/i/2026/05/04/024631.jpg"],
		imageAlt: ["国家奖学金","三好学生"],
		imageHeight: "400px",
	},
	
];

export const getTimelineStats = () => {
	const total = timelineData.length;
	const byType = {
		education: timelineData.filter((item) => item.type === "education")
			.length,
		work: timelineData.filter((item) => item.type === "work").length,
		project: timelineData.filter((item) => item.type === "project").length,
		achievement: timelineData.filter((item) => item.type === "achievement")
			.length,
	};

	return { total, byType };
};

export const getTimelineByType = (type?: string) => {
	if (!type || type === "all") {
		return timelineData.sort(
			(a, b) =>
				new Date(b.startDate).getTime() -
				new Date(a.startDate).getTime(),
		);
	}
	return timelineData
		.filter((item) => item.type === type)
		.sort(
			(a, b) =>
				new Date(b.startDate).getTime() -
				new Date(a.startDate).getTime(),
		);
};

export const getFeaturedTimeline = () => {
	return timelineData
		.filter((item) => item.featured)
		.sort(
			(a, b) =>
				new Date(b.startDate).getTime() -
				new Date(a.startDate).getTime(),
		);
};

export const getCurrentItems = () => {
	return timelineData.filter((item) => !item.endDate);
};

export const getTotalWorkExperience = () => {
	const workItems = timelineData.filter((item) => item.type === "work");
	let totalMonths = 0;

	workItems.forEach((item) => {
		const startDate = new Date(item.startDate);
		const endDate = item.endDate ? new Date(item.endDate) : new Date();
		const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
		const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
		totalMonths += diffMonths;
	});

	return {
		years: Math.floor(totalMonths / 12),
		months: totalMonths % 12,
	};
};