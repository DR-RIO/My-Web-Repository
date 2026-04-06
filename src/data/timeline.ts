// Timeline data configuration file
// Used to manage data for the timeline page

export interface TimelineItem {
	id: string;                    // 时间线项目唯一标识符
	title: string;                 // 标题/名称
	description: string;           // 详细描述
	type: "education" | "work" | "project" | "achievement";
	// 类型：  "教育经历"   |  "工作经历" |  "项目经历" |  "成就荣誉"
	startDate: string;             // 开始日期，格式：YYYY-MM-DD
	endDate?: string;              // 结束日期（可选，为空表示至今）
	location?: string;             // 地点/位置（可选）
	organization?: string;         // 组织/机构名称（可选）
	position?: string;             // 职位/角色（可选）
	skills?: string[];             // 相关技能列表（可选）
	achievements?: string[];       // 主要成就/成果列表（可选）
	links?: {
		name: string;               // 链接显示名称
		url: string;                // 链接地址
		type: "website" | "certificate" | "project" | "other";
		// 类型："网站" | "证书" | "项目" | "其他"
	}[];                           // 相关链接列表（可选）
	icon?: string;                 // Iconify 图标名称（可选）
	color?: string;                // 主题色，十六进制颜色码（可选）
	featured?: boolean;            // 是否精选展示（可选）
}

export const timelineData: TimelineItem[] = [
	// 示例：
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
	},
	
];

// 获取时间线统计数据
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

// 根据类型筛选时间线条目
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

// 获取精选时间线项目
export const getFeaturedTimeline = () => {
	return timelineData
		.filter((item) => item.featured)
		.sort(
			(a, b) =>
				new Date(b.startDate).getTime() -
				new Date(a.startDate).getTime(),
		);
};

// 获取当前进行中的项目
export const getCurrentItems = () => {
	return timelineData.filter((item) => !item.endDate);
};

// 计算总工作年限
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
