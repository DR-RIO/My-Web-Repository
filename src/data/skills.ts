// Skill data configuration file
// Used to manage data for the skill display page

export interface Skill {
	id: string;                    // 技能唯一标识符，用于路由和数据关联
	name: string;                  // 技能名称
	description: string;           // 技能描述，详细介绍技能内容和应用场景
	icon: string;                  // Iconify 图标名称，如 "logos:javascript"
	category: "frontend" | "backend" | "database" | "tools" | "other";
	// 分类：   "前端"   |   "后端"   |  "数据库"  | "工具" |  "其他"
	level: "unlearned" | "beginner" | "intermediate" | "advanced" | "expert";
	// 等级："未学习"  |    "入门"   |    "中级"     |   "高级"   |  "专家"
	experience: {
		years: number;             // 经验年数
		months: number;            // 经验月数
	};
	projects?: string[];           // 关联项目ID列表，用于关联到具体项目
	certifications?: string[];     // 相关认证证书列表（可选）
	color?: string;                // 技能卡片主题色，十六进制颜色码（可选）
}

export const skillsData: Skill[] = [
	// Frontend Skills
	{
		id: "HTML-5",
		name: "HTML-5",
		description:
			"现代 JavaScript 开发，涵盖 ES6+ 语法、异步编程以及模块化开发。",
		icon: "logos:html-5",
		category: "frontend",
		level: "intermediate",
		experience: { years: 2, months: 0 },
		projects: [],
		color: "#ffa200",
	},
	{
		id: "CSS-3",
		name: "CSS-3",
		description:
			"现代 CSS3 开发，涵盖弹性布局、网格布局以及动画与过渡特效。",
		icon: "logos:html-5",
		category: "frontend",
		level: "intermediate",
		experience: { years: 2, months: 0 },
		projects: [],
		color: "#264de4",
	},
	{
		id: "javascript",
		name: "JavaScript",
		description:
			"现代 JavaScript 开发，涵盖 ES6+ 语法、异步编程以及模块化开发。",
		icon: "logos:javascript",
		category: "frontend",
		level: "beginner",
		experience: { years: 0, months: 1 },
		projects: [],
		color: "#F7DF1E",
	},
	{
		id: "typescript",
		name: "TypeScript",
		description:
			"JavaScript 的类型安全超集，可提升代码质量与开发效率。",
		icon: "logos:typescript-icon",
		category: "frontend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#3178C6",
	},
	{
		id: "react",
		name: "React",
		description:
			"一个用于构建用户界面的 JavaScript 库，包含 Hooks、Context 以及状态管理。",
		icon: "logos:react",
		category: "frontend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#61DAFB",
	},
	{
		id: "vue",
		name: "Vue.js",
		description:
			"一个渐进式的 JavaScript 框架，易于学习和使用，适合快速开发。",
		icon: "logos:vue",
		category: "frontend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#4FC08D",
	},
	{
		id: "angular",
		name: "Angular",
		description:
			"一个由谷歌开发的企业级前端框架，提供完整的单页应用解决方案。",
		icon: "logos:angular-icon",
		category: "frontend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#DD0031",
	},
	{
		id: "nextjs",
		name: "Next.js",
		description:
			"一个生产级 React 框架，支持服务端渲染、静态站点生成及全栈开发。",
		icon: "logos:nextjs-icon",
		category: "frontend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#616161", // 更改为深灰色，避免纯黑色
	},
	{
		id: "nuxtjs",
		name: "Nuxt.js",
		description:
			"一个直观的 Vue.js 框架，支持服务端渲染和静态站点生成。",
		icon: "logos:nuxt-icon",
		category: "frontend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#00DC82",
	},
	{
		id: "astro",
		name: "Astro",
		description:
			"一个现代化的静态站点生成器，支持多框架集成，性能卓越。",
		icon: "logos:astro-icon",
		category: "frontend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#FF5D01",
	},
	{
		id: "tailwindcss",
		name: "Tailwind CSS",
		description:
			"一个实用优先的 CSS 框架，用于快速构建现代用户界面。",
		icon: "logos:tailwindcss-icon",
		category: "frontend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#06B6D4",
	},
	{
		id: "sass",
		name: "Sass/SCSS",
		description:
			"一个提供变量、嵌套、混入等高级功能的 CSS 预处理器。",
		icon: "logos:sass",
		category: "frontend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#CF649A",
	},
	{
		id: "webpack",
		name: "Webpack",
		description:
			"一个用于现代 JavaScript 应用程序的静态模块打包工具。",
		icon: "logos:webpack",
		category: "frontend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#8DD6F9",
	},
	{
		id: "vite",
		name: "Vite",
		description:
			"新一代前端构建工具，具有快速冷启动和热更新的特点。",
		icon: "logos:vitejs",
		category: "frontend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#646CFF",
	},

	// 后端技术栈
	{
		id: "nodejs",
		name: "Node.js",
		description:
			"一个基于 Chrome V8 引擎的 JavaScript 运行时，用于服务端开发。",
		icon: "logos:nodejs-icon",
		category: "backend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#339933",
	},
	{
		id: "python",
		name: "Python",
		description:
			"一种通用编程语言，适用于 Web 开发、数据分析、机器学习等多个领域。",
		icon: "logos:python",
		category: "backend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		color: "#3776AB",
	},
	{
		id: "java",
		name: "Java",
		description:
			"一种用于企业应用开发的主流编程语言，跨平台且面向对象。",
		icon: "logos:java",
		category: "backend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#ED8B00",
	},
	{
		id: "csharp",
		name: "C#",
		description:
			"一种由微软开发的现代化面向对象编程语言，适用于 .NET 生态系统。",
		icon: "devicon:csharp",
		category: "backend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#239120",
	},
	{
		id: "go",
		name: "Go",
		description: "一种由 Google 开发的高效编程语言，适用于云原生与微服务开发。",
		icon: "logos:go",
		category: "backend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#00ADD8",
	},
	{
		id: "rust",
		name: "Rust",
		description: "一门注重安全、速度与并发的系统级编程语言，无需垃圾回收机制。",
		icon: "logos:rust",
		category: "backend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#CE422B",
	},
	{
		id: "cpp",
		name: "C++",
		description: "一种高性能的系统级编程语言，广泛应用于游戏开发、系统软件及嵌入式开发领域。",
		icon: "logos:c-plusplus",
		category: "backend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#00599C",
	},
	{
		id: "c",
		name: "C",
		description: "一种底层的系统级编程语言，是操作系统与嵌入式系统开发的基石。",
		icon: "logos:c",
		category: "backend",
		level: "beginner",
		experience: { years: 0, months: 1 },
		projects: [],
		color: "#A8B9CC",
	},
	{
		id: "kotlin",
		name: "Kotlin",
		description: "由 JetBrains 开发的现代化编程语言，与 Java 完全兼容，是 Android 开发的首选语言。",
		icon: "logos:kotlin-icon",
		category: "backend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#7F52FF",
	},
	{
		id: "swift",
		name: "Swift",
		description: "由 Apple 开发的现代化编程语言，用于 iOS、macOS、watchOS 及 tvOS 应用开发。",
		icon: "logos:swift",
		category: "backend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#FA7343",
	},
	{
		id: "ruby",
		name: "Ruby",
		description: "一门动态、开源的编程语言，注重简洁与开发效率，是 Rails 框架的基础。",
		icon: "logos:ruby",
		category: "backend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#CC342D",
	},
	{
		id: "php",
		name: "PHP",
		description: "一种广泛使用的服务端脚本语言，尤其适合 Web 开发。",
		icon: "logos:php",
		category: "backend",
		level: "beginner",
		experience: { years: 0, months: 2 },
		projects: [],
		color: "#777BB4",
	},
	{
		id: "express",
		name: "Express.js",
		description: "一个快速、极简的 Node.js Web 应用框架。",
		icon: "simple-icons:express",
		category: "backend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#616161",
	},
	{
		id: "spring",
		name: "Spring Boot",
		description: "Java 生态中最流行的企业级应用开发框架。",
		icon: "logos:spring-icon",
		category: "backend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#6DB33F",
	},
	{
		id: "django",
		name: "Django",
		description: "一个高级 Python Web 框架，倡导快速开发和清晰实用的设计。",
		icon: "logos:django-icon",
		category: "backend",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#092E20",
	},

	// 数据库技能
	{
		id: "mysql",
		name: "MySQL",
		description: "全球最流行的开源关系型数据库管理系统，广泛应用于 Web 应用。",
		icon: "logos:mysql-icon",
		category: "database",
		level: "beginner",
		experience: { years: 1, months: 0 },
		projects: [],
		color: "#4479A1",
	},
	{
		id: "postgresql",
		name: "PostgreSQL",
		description: "一个功能强大的开源关系型数据库管理系统。",
		icon: "logos:postgresql",
		category: "database",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#336791",
	},
	{
		id: "redis",
		name: "Redis",
		description: "高性能的内存数据结构存储系统，用作数据库、缓存和消息代理。",
		icon: "logos:redis",
		category: "database",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#DC382D",
	},
	{
		id: "mongodb",
		name: "MongoDB",
		description: "一种文档型 NoSQL 数据库，具有灵活的数据模型。",
		icon: "logos:mongodb-icon",
		category: "database",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		color: "#47A248",
	},
	{
		id: "sqlite",
		name: "SQLite",
		description: "轻量级嵌入式关系型数据库，适用于移动应用和小型项目。",
		icon: "simple-icons:sqlite",
		category: "database",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#003B57",
	},
	{
		id: "firebase",
		name: "Firebase",
		description: "Google 的移动和 Web 应用开发平台，提供实时数据库与身份验证服务。",
		icon: "simple-icons:firebase",
		category: "database",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#FFCA28",
	},

	// 工具
	{
		id: "git",
		name: "Git",
		description: "分布式版本控制系统，是代码管理与团队协作的必备工具。",
		icon: "logos:git-icon",
		category: "tools",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		color: "#F05032",
	},
	{
		id: "vscode",
		name: "VS Code",
		description: "轻量但功能强大的代码编辑器，拥有丰富的插件生态。",
		icon: "logos:visual-studio-code",
		category: "tools",
		level: "intermediate",
		experience: { years: 2, months: 0 },
		color: "#007ACC",
	},
	{
		id: "webstorm",
		name: "WebStorm",
		description: "JetBrains 出品的专业 JavaScript 与 Web 开发 IDE，提供智能代码辅助。",
		icon: "logos:webstorm",
		category: "tools",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#00CDD7",
	},
	{
		id: "intellij",
		name: "IntelliJ IDEA",
		description: "JetBrains 旗舰级 IDE，Java 开发的首选工具，拥有强大的智能编码辅助功能。",
		icon: "logos:intellij-idea",
		category: "tools",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#616161",
	},
	{
		id: "pycharm",
		name: "PyCharm",
		description: "JetBrains 出品的专业 Python IDE，提供智能代码分析与调试功能。",
		icon: "logos:pycharm",
		category: "tools",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#21D789",
	},
	{
		id: "rider",
		name: "Rider",
		description: "JetBrains 出品的跨平台 .NET IDE，支持 C#、VB.NET、F# 等语言开发。",
		icon: "logos:rider",
		category: "tools",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#616161",
	},
	{
		id: "goland",
		name: "GoLand",
		description: "JetBrains 出品的专业 Go 语言 IDE，提供智能编码辅助与调试工具。",
		icon: "logos:goland",
		category: "tools",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#3D7BF7",
	},
	{
		id: "docker",
		name: "Docker",
		description: "容器化平台，可简化应用的部署与环境管理。",
		icon: "logos:docker-icon",
		category: "tools",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		color: "#2496ED",
	},
	{
		id: "kubernetes",
		name: "Kubernetes",
		description: "容器编排平台，用于自动化容器化应用的部署、扩缩容与管理。",
		icon: "logos:kubernetes",
		category: "tools",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#326CE5",
	},
	{
		id: "nginx",
		name: "Nginx",
		description: "高性能的 Web 服务器与反向代理服务器。",
		icon: "logos:nginx",
		category: "tools",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#009639",
	},
	{
		id: "apache",
		name: "Apache HTTP Server",
		description: "全球最流行的 Web 服务器软件，稳定可靠的 HTTP 服务器。",
		icon: "logos:apache",
		category: "tools",
		level: "beginner",
		experience: { years: 0, months: 1 },
		projects: [],
		color: "#D22128",
	},
	{
		id: "openresty",
		name: "OpenResty",
		description: "基于 Nginx 与 LuaJIT 的高性能 Web 平台，支持动态 Web 应用开发。",
		icon: "simple-icons:nginx",
		category: "tools",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#00A693",
	},
	{
		id: "tomcat",
		name: "Apache Tomcat",
		description: "Java Servlet 容器与 Web 服务器，是 Java Web 应用的标准部署环境。",
		icon: "logos:tomcat",
		category: "tools",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#F8DC75",
	},
	{
		id: "aws",
		name: "AWS",
		description: "亚马逊的云服务平台，提供全面的云计算解决方案。",
		icon: "logos:aws",
		category: "tools",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#FF9900",
	},
	{
		id: "linux",
		name: "Linux",
		description: "开源操作系统，是服务器部署与开发环境的首选。",
		icon: "logos:linux-tux",
		category: "tools",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#FCC624",
	},
	{
		id: "postman",
		name: "Postman",
		description: "API 开发与测试工具，简化 API 的设计、测试与文档工作。",
		icon: "logos:postman-icon",
		category: "tools",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#FF6C37",
	},
	{
		id: "figma",
		name: "Figma",
		description: "协作式界面设计工具，用于 UI/UX 设计与原型制作。",
		icon: "logos:figma",
		category: "tools",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		color: "#F24E1E",
	},
	{
		id: "photoshop",
		name: "Photoshop",
		description: "专业的图像编辑与设计软件。",
		icon: "logos:adobe-photoshop",
		category: "tools",
		level: "intermediate",
		experience: { years: 3, months: 0 },
		projects: [],
		color: "#31A8FF",
	},

	// 其他技能
	{
		id: "graphql",
		name: "GraphQL",
		description: "一种 API 查询语言及运行时，提供更高效、强大且灵活的数据获取方式。",
		icon: "logos:graphql",
		category: "other",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#E10098",
	},
	{
		id: "elasticsearch",
		name: "Elasticsearch",
		description: "分布式搜索与分析引擎，用于全文搜索和数据分析。",
		icon: "logos:elasticsearch",
		category: "other",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#005571",
	},
	{
		id: "jest",
		name: "Jest",
		description: "一款注重简洁与易用性的 JavaScript 测试框架。",
		icon: "logos:jest",
		category: "other",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#C21325",
	},
	{
		id: "cypress",
		name: "Cypress",
		description: "一个现代化的 Web 应用端到端测试框架。",
		icon: "logos:cypress-icon",
		category: "other",
		level: "unlearned",
		experience: { years: 0, months: 0 },
		projects: [],
		color: "#17202C",
	},
];

// Get skill statistics
export const getSkillStats = () => {
	const total = skillsData.length;
	const byLevel = {
		beginner: skillsData.filter((s) => s.level === "beginner").length,
		intermediate: skillsData.filter((s) => s.level === "intermediate")
			.length,
		advanced: skillsData.filter((s) => s.level === "advanced").length,
		expert: skillsData.filter((s) => s.level === "expert").length,
	};
	const byCategory = {
		frontend: skillsData.filter((s) => s.category === "frontend").length,
		backend: skillsData.filter((s) => s.category === "backend").length,
		database: skillsData.filter((s) => s.category === "database").length,
		tools: skillsData.filter((s) => s.category === "tools").length,
		other: skillsData.filter((s) => s.category === "other").length,
	};

	return { total, byLevel, byCategory };
};

// Get skills by category
export const getSkillsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return skillsData;
	}
	return skillsData.filter((s) => s.category === category);
};

// Get advanced skills
export const getAdvancedSkills = () => {
	return skillsData.filter(
		(s) => s.level === "advanced" || s.level === "expert",
	);
};

// Calculate total years of experience
export const getTotalExperience = () => {
	const totalMonths = skillsData.reduce((total, skill) => {
		return total + skill.experience.years * 12 + skill.experience.months;
	}, 0);
	return {
		years: Math.floor(totalMonths / 12),
		months: totalMonths % 12,
	};
};
