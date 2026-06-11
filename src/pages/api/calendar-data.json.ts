import { getSortedPosts } from "../../utils/content-utils";
import { getDiaryList } from "../../data/diary";

export async function GET() {
	const posts = await getSortedPosts();
	const diaryList = getDiaryList();

	const allPostsData = [
		...posts.map((post) => {
			const date = new Date(post.data.published);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");

			return {
				id: post.id,
				title: post.data.title,
				date: `${year}-${month}-${day}`,
				type: "post",
			};
		}),
		...diaryList.map((diary) => {
			const date = new Date(diary.date);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");

			// Extract first line of content as title
			const title = diary.content.split("\n")[0].trim().slice(0, 50);

			return {
				id: diary.id,
				title: title || "日记",
				date: `${year}-${month}-${day}`,
				type: "diary",
			};
		}),
	];

	return new Response(JSON.stringify(allPostsData), {
		headers: {
			"Content-Type": "application/json",
		},
	});
}
