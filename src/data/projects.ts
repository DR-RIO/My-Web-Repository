// Project data configuration file
// Used to manage data for the project display page

export interface Project {
	id: string;                    // 项目唯一标识符，用于路由和数据关联
	title: string;                 // 项目标题/名称
	description: string;           // 项目描述，详细介绍项目功能和特点
	image: string;                 // 项目封面图片路径
	category: "web" | "mobile" | "desktop" | "other";
	// 项目分类：网页应用 | 移动应用 | 桌面应用 | 其他
	techStack: string[];           // 技术栈列表，记录项目使用的技术/框架 
    //示例: techStack: ["Astro", "TypeScript", "Tailwind CSS", "Svelte"],
	status: "completed" | "in-progress" | "planned";
	// 项目状态：已完成 | 进行中 | 计划中
	liveDemo?: string;             // 在线演示地址（可选，通常completed状态时有）
	sourceCode?: string;           // 源代码仓库地址（可选）
	startDate: string;             // 项目开始日期，格式：YYYY-MM-DD
	endDate?: string;              // 项目结束日期（可选，进行中/计划中的项目无此字段）
	featured?: boolean;            // 是否精选展示（可选，用于首页推荐）
	tags?: string[];               // 项目标签（可选，用于分类筛选）
	//示例: tags: ["Blog", "Theme", "Open Source"],
	visitUrl?: string;             // 项目访问链接（可选，用于跳转访问）
}

export const projectsData: Project[] = [
	{
		id: "None for now",
		title: "暂无",
		description:
			"暂时还没有做过项目哦",
		image: "",
		category: "other",
		techStack: [],
		status: "planned",
		liveDemo: "https://blog.example.com",
		sourceCode: "", // 更改为GitHub链接
		visitUrl: "", // 添加前往项目链接
		startDate: "2026-03-21",
		endDate: "至今",
		featured: false,
		tags: [],
	},
];

// 获取项目统计数据
export const getProjectStats = () => {
	const total = projectsData.length;
	const completed = projectsData.filter(
		(p) => p.status === "completed",
	).length;
	const inProgress = projectsData.filter(
		(p) => p.status === "in-progress",
	).length;
	const planned = projectsData.filter((p) => p.status === "planned").length;

	return {
		total,
		byStatus: {
			completed,
			inProgress,
			planned,
		},
	};
};

// 获取项目统计数据
export const getProjectsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return projectsData;
	}
	return projectsData.filter((p) => p.category === category);
};

// 获取精选项目
export const getFeaturedProjects = () => {
	return projectsData.filter((p) => p.featured);
};

// 获取所有技术栈
export const getAllTechStack = () => {
	const techSet = new Set<string>();
	projectsData.forEach((project) => {
		project.techStack.forEach((tech) => {
			techSet.add(tech);
		});
	});
	return Array.from(techSet).sort();
};
