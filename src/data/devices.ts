// 设备数据配置文件

export interface Device {
	name: string;
	image: string;
	specs: string;
	description: string;
	link: string;
}

// 设备类别类型，支持品牌和自定义类别
export type DeviceCategory = Record<string, Device[]> & {
	自定义?: Device[];
};

export const devicesData: DeviceCategory = {
	移动终端: [
		{
			name: "OnePlus 15",
			image: "https://easyimage.isu183s.top/i/2026/04/21/in827i.png",
			specs: "原色沙丘 / 12G + 256GB",
			description:
				"第五代骁龙®8至尊版移动平台，1.5K分辨率165Hz高刷屏，7300mAh串联双电芯，120W 超级闪充",
			link: "https://www.oneplus.com/cn/15",
		},

		{
			name: "Xiaomi 12",
			image: "https://easyimage.isu183s.top/i/2026/04/21/khoum6.png",
			specs: "蓝色 / 8G + 128GB",
			description:
				"全新一代骁龙®8，2K分辨率120Hz刷新率6.28″曲面屏，4500mAh单电芯，67W超级快充",
			link: "https://www.mi.com/mi12",
		},
	],

	计算机设备: [
		{
			name:"机械革命 蛟龙16 pro 2023",
			image:"https://easyimage.isu183s.top/i/2026/04/21/m8imyk.png",
			specs:"AMD R7-7745HX / RTX4060laptop",
			description:"平民性价比，但是只适合过度使用。",
			link:"https://detail.zol.com.cn/notebook/index2106511.shtml?skuId=21711485",

		},

		{
			name:"Windows Server 2025 服务器",
			image:"https://easyimage.isu183s.top/i/2026/04/21/n9xec0.jpg",
			specs:"i3-12100F / NVIDIA GeForce GT730",
			description:"支撑我网站服务的核心设备，性能一般。",
			link:"https://www.maxsun.com.cn/2023/0206/5881.html",

		},
	],
	
	路由器: [
		{
			name: "TL-WDR5620千兆版",
			image: "https://easyimage.isu183s.top/i/2026/04/21/kp4mg0.png",
			specs: "无线速率高达1167Mbps 2.5G/5GHz双频信号",
			description:
				"IEEE 802.11a/b/g/n/ac无线协议，最高无线速率1167Mbps（2.4GHz:300Mbps，5GHz:867Mbps）",
			link: "https://www.tp-link.com.cn/product_831.html",
		},
	],
};
