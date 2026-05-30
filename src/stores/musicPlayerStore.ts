import Key from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";

import {
	DEFAULT_SONG,
	LOCAL_PLAYLIST,
	SKIP_ERROR_DELAY,
	STORAGE_KEY_VOLUME,
} from "@/components/widgets/music-player/constants";
import type { RepeatMode, Song } from "@/components/widgets/music-player/types";
import { musicPlayerConfig } from "@/config";

export interface MusicPlayerState {
	currentSong: Song;
	playlist: Song[];
	currentIndex: number;
	isPlaying: boolean;
	isLoading: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	isMuted: boolean;
	isShuffled: boolean;
	isRepeating: RepeatMode;
	showPlaylist: boolean;
	errorMessage: string;
	showError: boolean;
	isExpanded: boolean;
	isHidden: boolean;
	autoplayFailed: boolean;
	willAutoPlay: boolean;
	isSearchMode: boolean;
}

function getAssetPath(path: string): string {
	if (!path) {
		return "";
	}
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}
	if (path.startsWith("/")) {
		return path;
	}
	return `/${path}`;
}

class MusicPlayerStore {
	private audio: HTMLAudioElement | null = null;
	private state: MusicPlayerState;
	private originalPlaylist: Song[] = [];
	private originalRepeatMode: RepeatMode = 0;
	private isInitialized = false;
	private unregisterInteraction: (() => void) | undefined;
	private listeners = new Set<(state: MusicPlayerState) => void>();

	constructor() {
		this.state = this.createInitialState();
	}

	private createInitialState(): MusicPlayerState {
		return {
			currentSong: { ...DEFAULT_SONG },
			playlist: [],
			currentIndex: 0,
			isPlaying: false,
			isLoading: false,
			currentTime: 0,
			duration: 0,
			volume: 0.8,
			isMuted: false,
			isShuffled: false,
			isRepeating: 0,
			showPlaylist: false,
			errorMessage: "",
			showError: false,
			isExpanded: false,
			isHidden: false,
			autoplayFailed: false,
			willAutoPlay: false,
			isSearchMode: false,
		};
	}

	private createSnapshot(): MusicPlayerState {
		return {
			...this.state,
			currentSong: { ...this.state.currentSong },
			playlist: this.state.playlist.map((song) => ({ ...song })),
		};
	}

	getState(): MusicPlayerState {
		return this.createSnapshot();
	}

	getAudio(): HTMLAudioElement | null {
		return this.audio;
	}

	subscribe(listener: (state: MusicPlayerState) => void): () => void {
		this.listeners.add(listener);
		listener(this.createSnapshot());
		return () => {
			this.listeners.delete(listener);
		};
	}

	async initialize(): Promise<void> {
		if (typeof window === "undefined") {
			return;
		}
		if (this.isInitialized) {
			// 即使已经初始化，也尝试重新加载播放列表
			await this.loadPlaylist();
			return;
		}
		this.isInitialized = true;

		if (!musicPlayerConfig.enable) {
			return;
		}

		this.audio = new Audio();
		this.setupAudioListeners();
		this.loadVolumeFromStorage();
		this.registerInteractionHandler();
		await this.loadPlaylist();
	}

	private setupAudioListeners(): void {
		if (!this.audio) {
			return;
		}

		this.audio.volume = this.state.volume;
		this.audio.muted = this.state.isMuted;

		this.audio.addEventListener("play", () => {
			this.state.isPlaying = true;
			this.broadcastState();
		});

		this.audio.addEventListener("pause", () => {
			this.state.isPlaying = false;
			this.broadcastState();
		});

		this.audio.addEventListener("timeupdate", () => {
			if (this.audio) {
				this.state.currentTime = this.audio.currentTime;
				this.broadcastState();
			}
		});

		this.audio.addEventListener("ended", () => {
			this.handleAudioEnded();
		});

		this.audio.addEventListener("error", () => {
			this.handleAudioError();
		});

		this.audio.addEventListener("loadeddata", () => {
			this.handleAudioLoaded();
		});

		this.audio.addEventListener("loadstart", () => {
			this.state.isLoading = true;
			this.broadcastState();
		});
	}

	private handleAudioEnded(): void {
		if (this.state.isRepeating === 1) {
			if (this.audio) {
				this.audio.currentTime = 0;
				this.audio.play().catch(() => {});
			}
		} else {
			this.next(true);
		}
	}

	private handleAudioError(): void {
		this.state.isLoading = false;
		this.showError(i18n(Key.musicPlayerErrorSong));

		if (this.state.playlist.length > 1) {
			// 修改为 false，跳转到下一首时不自动播放
			setTimeout(() => this.next(false), SKIP_ERROR_DELAY);
		} else if (this.state.playlist.length <= 1) {
			this.showError(i18n(Key.musicPlayerErrorEmpty));
		}
		this.broadcastState();
	}

	private handleAudioLoaded(): void {
		this.state.isLoading = false;
		if (this.audio?.duration && this.audio.duration > 1) {
			this.state.duration = Math.floor(this.audio.duration);
			this.state.currentSong = {
				...this.state.currentSong,
				duration: this.state.duration,
			};
		}

		// 只有明确需要自动播放时才播放（移除了 || this.state.isPlaying 条件）
		if (this.state.willAutoPlay) {
			const playPromise = this.audio?.play();
			if (playPromise !== undefined) {
				playPromise
					.then(() => {
						this.state.isPlaying = true;
						this.broadcastState();
					})
					.catch(() => {
						this.state.autoplayFailed = true;
						this.state.isPlaying = false;
						this.broadcastState();
					});
			}
		}
		this.broadcastState();
	}

	private loadVolumeFromStorage(): void {
		if (typeof localStorage !== "undefined") {
			const savedVolume = localStorage.getItem(STORAGE_KEY_VOLUME);
			if (savedVolume) {
				const volume = parseFloat(savedVolume);
				if (!isNaN(volume) && volume >= 0 && volume <= 1) {
					this.state.volume = volume;
					this.state.isMuted = volume === 0;
					if (this.audio) {
						this.audio.volume = volume;
						this.audio.muted = this.state.isMuted;
					}
				}
			}
		}
	}

	

	

	private registerInteractionHandler(): void {
		const handler = () => {
			if (this.state.autoplayFailed && this.audio) {
				const playPromise = this.audio.play();
				if (playPromise !== undefined) {
					playPromise
						.then(() => {
							this.state.autoplayFailed = false;
						})
						.catch(() => {});
				}
			}
		};
		document.addEventListener("click", handler, { once: true });
		document.addEventListener("keydown", handler, { once: true });
		this.unregisterInteraction = () => {
			document.removeEventListener("click", handler);
			document.removeEventListener("keydown", handler);
		};
	}

	private async loadPlaylist(): Promise<void> {
		const mode = musicPlayerConfig.mode ?? "meting";
		const meting_api =
			musicPlayerConfig.meting_api ??
			"https://music.isu183s.top/?server=:server&type=:type&id=:id&r=:r";
		const meting_id = musicPlayerConfig.id ?? "17845098657";
		const meting_server = musicPlayerConfig.server ?? "netease";
		const meting_type = musicPlayerConfig.type ?? "playlist";

		if (mode === "meting") {
			const meting_auth = musicPlayerConfig.auth ?? "";
			await this.fetchMetingPlaylist(
				meting_api,
				meting_server,
				meting_type,
				meting_id,
				meting_auth,
			);
		} else {
			this.loadLocalPlaylist();
		}
	}

	private async fetchMetingPlaylist(
		api: string,
		server: string,
		type: string,
		id: string,
		auth: string = "",
	): Promise<void> {
		if (!api || !id) {
			return;
		}

		this.state.isLoading = true;
		this.broadcastState();

		const apiUrl = api
			.replace(":server", server)
			.replace(":type", type)
			.replace(":id", id)
			.replace(":auth", auth)
			.replace(":r", Date.now().toString());

		try {
			const res = await fetch(apiUrl);
			if (!res.ok) {
				throw new Error("meting api error");
			}
			const list: any[] = await res.json();
			this.state.playlist = list.map((song) =>
				this.convertMetingSong(song),
			);
			// 保存原始歌单
			this.originalPlaylist = [...this.state.playlist];
			this.state.isLoading = false;

			if (this.state.playlist.length > 0) {
				// 修改为 false，页面刷新后不自动播放
				this.loadSong(this.state.playlist[0], false);
			}
		} catch (e) {
			this.showError(i18n(Key.musicPlayerErrorPlaylist));
			this.state.isLoading = false;
		}
		this.broadcastState();
	}

	async searchSongs(keyword: string): Promise<void> {
		if (!keyword.trim()) {
			await this.loadPlaylist();
			return;
		}

		const api = musicPlayerConfig.meting_api;
		const server = musicPlayerConfig.server ?? "netease";

		if (!api) {
			return;
		}

		this.state.isLoading = true;
		this.broadcastState();

		// 保存当前播放模式，然后切换到单曲循环
		this.originalRepeatMode = this.state.isRepeating;
		this.state.isRepeating = 1;

		const searchApi = api
			.replace(":server", server)
			.replace(":type", "search")
			.replace(":id", "")
			.replace(":r", Date.now().toString()) + `&keyword=${encodeURIComponent(keyword.trim())}`;

		console.log('Search API URL:', searchApi);

		try {
			const res = await fetch(searchApi);
			
			console.log('Fetch response:', res);
			
			if (!res.ok) {
				const errorText = await res.text();
				console.error(`Search API error: ${res.status} - ${errorText}`);
				throw new Error(`HTTP error ${res.status}`);
			}
			
			const result = await res.json();
			console.log('Search result:', result);
			
			if (!Array.isArray(result)) {
				console.warn('Search result is not an array:', result);
				this.showError("搜索结果格式异常");
				this.state.isLoading = false;
				this.broadcastState();
				return;
			}
			
			const list: any[] = result;
			this.state.playlist = list.map((song) => this.convertMetingSong(song));
			this.state.isSearchMode = true;
			this.state.isLoading = false;

			if (this.state.playlist.length === 0) {
				this.showError("未找到相关歌曲");
			} else {
				if (this.state.currentSong) {
					const currentSongIndex = this.state.playlist.findIndex(
						song => song.title === this.state.currentSong.title && 
							   song.artist === this.state.currentSong.artist
					);
					this.state.currentIndex = currentSongIndex;
				} else {
					this.state.currentIndex = -1;
				}
			}
		} catch (e) {
			console.error('Search error:', e);
			
			if ((e as Error).message.includes('CORS')) {
				this.showError("搜索服务暂时不可用");
			} else {
				this.showError("搜索失败，请重试");
			}
			this.state.isLoading = false;
		}
		this.broadcastState();
	}

	async restorePlaylist(): Promise<void> {
		this.state.isSearchMode = false;
		this.state.playlist = [...this.originalPlaylist];
		// 恢复原来的播放模式
		this.state.isRepeating = this.originalRepeatMode;
		// 取消高亮，不匹配任何歌曲
		this.state.currentIndex = -1;
		this.broadcastState();
	}

	private convertMetingSong(song: any): Song {
		const title = song.name ?? song.title ?? i18n(Key.unknownSong);
		const artist = song.artist ?? song.author ?? i18n(Key.unknownArtist);
		let dur = song.duration ?? 0;
		if (typeof dur === "string") {
			dur = parseInt(dur, 10);
		}
		if (dur > 10000) {
			dur = Math.floor(dur / 1000);
		}
		if (!Number.isFinite(dur) || dur <= 0) {
			dur = 0;
		}

		return {
		id:
			typeof song.id === "string"
				? parseInt(song.id, 10)
				: (song.id ?? 0),
		title,
		artist,
		cover: song.pic ?? "",
		url: song.url ?? "",
		duration: dur,
		lyric: song.lyric ?? song.lrc ?? "",
	};
	}

	private loadLocalPlaylist(): void {
		this.state.playlist = [...LOCAL_PLAYLIST];
		// 保存原始歌单
		this.originalPlaylist = [...this.state.playlist];
		if (this.state.playlist.length === 0) {
			this.showError("本地播放列表为空");
		} else {
			// 修改为 false，页面刷新后不自动播放
			this.loadSong(this.state.playlist[0], false);
		}
	}

	private async loadSong(song: Song, autoPlay = false): Promise<void> {
		if (!song) {
			return;
		}
		if (song.url !== this.state.currentSong.url) {
			// 复制歌曲信息
			const newSong = { ...song };
			
			// 如果歌词是URL，尝试获取歌词内容
			if (newSong.lyric && (newSong.lyric.startsWith('http://') || newSong.lyric.startsWith('https://'))) {
				try {
					const response = await fetch(newSong.lyric);
					if (response.ok) {
						newSong.lyric = await response.text();
					}
				} catch (error) {
					console.error('Failed to fetch lyrics:', error);
					// 如果获取失败，保持原URL
				}
			}
			
			this.state.currentSong = newSong;
			if (song.url) {
				this.state.isLoading = true;
			} else {
				this.state.isLoading = false;
			}
		}
		this.state.willAutoPlay = autoPlay;
		this.state.isPlaying = false;  // 重置播放状态
		if (this.audio) {
			this.audio.src = getAssetPath(song.url);
			this.audio.load();
		} else {
		}
		this.broadcastState();
	}

	

	private showError(message: string): void {
		this.state.errorMessage = message;
		this.state.showError = true;
		setTimeout(() => {
			this.state.showError = false;
			this.broadcastState();
		}, 3000);
		this.broadcastState();
	}

	hideError(): void {
		this.state.showError = false;
		this.broadcastState();
	}

	toggle(): void {
		if (!this.audio || !this.state.currentSong.url) {
			return;
		}
		if (this.state.isPlaying) {
			this.audio.pause();
		} else {
			this.audio.play().catch(() => {});
		}
	}

	play(): void {
		if (!this.audio || !this.state.currentSong.url) {
			return;
		}
		this.audio.play().catch(() => {});
	}

	pause(): void {
		if (!this.audio) {
			return;
		}
		this.audio.pause();
	}

	next(autoPlay = true): void {
		if (this.state.playlist.length <= 1) {
			return;
		}

		let newIndex: number;
		if (this.state.isShuffled) {
			do {
				newIndex = Math.floor(
					Math.random() * this.state.playlist.length,
				);
			} while (
				newIndex === this.state.currentIndex &&
				this.state.playlist.length > 1
			);
		} else {
			newIndex =
				this.state.currentIndex < this.state.playlist.length - 1
					? this.state.currentIndex + 1
					: 0;
		}

		this.state.currentIndex = newIndex;
		this.loadSong(this.state.playlist[newIndex], autoPlay);
	}

	prev(): void {
		if (this.state.playlist.length <= 1) {
			return;
		}
		const newIndex =
			this.state.currentIndex > 0
				? this.state.currentIndex - 1
				: this.state.playlist.length - 1;
		this.state.currentIndex = newIndex;
		this.loadSong(this.state.playlist[newIndex], true);
	}

	playIndex(index: number): void {
		if (index < 0 || index >= this.state.playlist.length) {
			return;
		}
		this.state.currentIndex = index;
		this.loadSong(this.state.playlist[index], true);
	}

	seek(time: number): void {
		if (!this.audio) {
			return;
		}
		if (time >= 0 && time <= this.state.duration) {
			this.audio.currentTime = time;
			this.state.currentTime = time;
			this.broadcastState();
		}
	}

	setVolume(volume: number): void {
		const clampedVolume = Math.max(0, Math.min(1, volume));
		this.state.volume = clampedVolume;
		this.state.isMuted = clampedVolume === 0;
		if (this.audio) {
			this.audio.volume = clampedVolume;
			this.audio.muted = this.state.isMuted;
		}
		if (typeof localStorage !== "undefined") {
			localStorage.setItem(STORAGE_KEY_VOLUME, String(clampedVolume));
		}
		this.broadcastState();
	}

	toggleMute(): void {
		this.state.isMuted = !this.state.isMuted;
		if (this.audio) {
			this.audio.muted = this.state.isMuted;
		}
		this.broadcastState();
	}

	toggleShuffle(): void {
		this.state.isShuffled = !this.state.isShuffled;
		if (this.state.isShuffled) {
			this.state.isRepeating = 0;
		}
		this.broadcastState();
	}

	toggleRepeat(): void {
		this.state.isRepeating = ((this.state.isRepeating + 1) %
			3) as RepeatMode;
		if (this.state.isRepeating !== 0) {
			this.state.isShuffled = false;
		}
		this.broadcastState();
	}

	toggleMode(): void {
		if (this.state.isShuffled) {
			this.toggleShuffle();
			return;
		}
		if (this.state.isRepeating === 2) {
			this.toggleRepeat();
			this.toggleShuffle();
			return;
		}
		this.toggleRepeat();
	}

	togglePlaylist(): void {
		this.state.showPlaylist = !this.state.showPlaylist;
		this.broadcastState();
	}

	toggleExpanded(): void {
		this.state.isExpanded = !this.state.isExpanded;
		if (this.state.isExpanded) {
			this.state.showPlaylist = false;
			this.state.isHidden = false;
		}
		this.broadcastState();
	}

	toggleHidden(): void {
		this.state.isHidden = !this.state.isHidden;
		if (this.state.isHidden) {
			this.state.isExpanded = false;
			this.state.showPlaylist = false;
		}
		this.broadcastState();
	}

	canSkip(): boolean {
		return this.state.playlist.length > 1;
	}

	setProgress(percent: number): void {
		if (!this.audio) {
			return;
		}
		const newTime = percent * this.state.duration;
		this.audio.currentTime = newTime;
		this.state.currentTime = newTime;
		this.broadcastState();
	}

	private broadcastState(): void {
		const snapshot = this.createSnapshot();

		for (const listener of this.listeners) {
			listener(snapshot);
		}

		if (typeof window === "undefined") {
			return;
		}
		window.dispatchEvent(
			new CustomEvent("music-sidebar:state", {
				detail: snapshot,
			}),
		);
	}

	destroy(): void {
		if (this.unregisterInteraction) {
			this.unregisterInteraction();
		}
		if (this.audio) {
			this.audio.pause();
			this.audio.src = "";
			this.audio = null;
		}
		this.isInitialized = false;
	}
}

export const musicPlayerStore = new MusicPlayerStore();

// 将音乐播放器存储暴露到全局，以便其他脚本可以访问
if (typeof window !== "undefined") {
	(window as any).musicPlayerStore = musicPlayerStore;
}

// 导出一个方法来确保音乐播放器被初始化
export async function ensureMusicPlayerInitialized(): Promise<void> {
	await musicPlayerStore.initialize();
	
}