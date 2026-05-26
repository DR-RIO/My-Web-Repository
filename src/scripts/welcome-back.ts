export function initWelcomeBack() {
	const originalTitle = document.title;
	const welcomeTitle = 'ヾ(≧▽≦*)o 欢迎回来~';
	let isVisible = true;

	function handleVisibilityChange() {
		if (document.hidden) {
			isVisible = false;
		} else if (!isVisible) {
			isVisible = true;
			document.title = welcomeTitle;
			setTimeout(() => {
				if (!document.hidden) {
					document.title = originalTitle;
				}
			}, 2000);
		}
	}

	document.addEventListener('visibilitychange', handleVisibilityChange);

	return function cleanup() {
		document.removeEventListener('visibilitychange', handleVisibilityChange);
	};
}