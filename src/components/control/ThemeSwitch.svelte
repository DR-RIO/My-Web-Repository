<script lang="ts">
import { DARK_MODE, LIGHT_MODE } from "@constants/constants";
import Icon from "@iconify/svelte";
import { getStoredTheme, setTheme } from "@utils/setting-utils";
import { onMount } from "svelte";

import type { LIGHT_DARK_MODE } from "@/types/config.ts";

let mode: LIGHT_DARK_MODE = $state(LIGHT_MODE);
let isChanging = false;

onMount(() => {
    mode = getStoredTheme();
});

function switchScheme(newMode: LIGHT_DARK_MODE) {
    if (isChanging) return;
    isChanging = true;
    mode = newMode;
    setTheme(newMode);
    setTimeout(() => {
        isChanging = false;
    }, 50);
}

function toggleScheme() {
    if (isChanging) return;
    const newMode = mode === LIGHT_MODE ? DARK_MODE : LIGHT_MODE;
    switchScheme(newMode);
}

// Swup 钩子监听
if (typeof window !== "undefined") {
    const handleContentReplace = () => {
        requestAnimationFrame(() => {
            const newMode = getStoredTheme();
            if (mode !== newMode) {
                mode = newMode;
            }
        });
    };

    if ((window as any).swup && (window as any).swup.hooks) {
        (window as any).swup.hooks.on("content:replace", handleContentReplace);
    } else {
        document.addEventListener("swup:enable", () => {
            if ((window as any).swup && (window as any).swup.hooks) {
                (window as any).swup.hooks.on("content:replace", handleContentReplace);
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        requestAnimationFrame(() => {
            const newMode = getStoredTheme();
            if (mode !== newMode) {
                mode = newMode;
            }
        });
    });
}
</script>

<div class="relative z-50">
    <button
        aria-label="Light/Dark Mode"
        class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90 theme-switch-btn"
        id="scheme-switch"
        onclick={toggleScheme}
        data-mode={mode}
    >
        <div class="absolute transition-all duration-300 ease-in-out" class:opacity-0={mode !== LIGHT_MODE} class:rotate-180={mode !== LIGHT_MODE}>
            <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem]"></Icon>
        </div>
        <div class="absolute transition-all duration-300 ease-in-out" class:opacity-0={mode !== DARK_MODE} class:rotate-180={mode !== DARK_MODE}>
            <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem]"></Icon>
        </div>
    </button>
</div>

<style>
    /* 确保主题切换按钮的背景色即时更新 */
    .theme-switch-btn::before {
        transition: transform 75ms ease-out, background-color 0ms !important;
    }
</style>