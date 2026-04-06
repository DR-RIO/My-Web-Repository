<script>
  import { onMount } from 'svelte';
  import * as PIXI from 'pixi.js';
  import { Live2DModel } from 'pixi-live2d-display-lipsyncpatch/cubism4';

  export let modelPath = '/pio/models/MIHARI/Mihari_V1.model3.json';
  export let canvasWidth = 200;
  export let canvasHeight = 360;
  export let positionX = 5;
  export let positionY = 0;

  let canvasElement;
  let model;
  let app;
  let isMinimized = false;
  let isMobile = false;
  let userMinimized = false;
  let showDialog = false;
  let dialogMessage = { text: '', translation: '', emotion: '' };
  let dialogTimer = null;
  let clickTimeout = null;
  
  let isAutoHidden = false;
  let autoHideTimer = null;
  let isRestoring = false;

  const buttonNormalBottom = positionY + canvasHeight + 20;
  const buttonMinimizedBottom = 20;

  const avatarNormal = '/pio/models/MIHARI/Mihari_Notxt.jpg';
  const avatarMinimized = '/pio/models/MIHARI/Mihari_Notxt.jpg';

  const messages = [
    { text: 'こんにちは！', translation: '你好呀！', emotion: '🌸' },
    { text: '今日も頑張ってね！', translation: '今天也要加油哦！', emotion: '💪' },
    { text: '一緒に遊ぼう！', translation: '一起Play吧！', emotion: '🎮' },
    { text: 'お腹すいたな〜', translation: '肚子饿了呢~', emotion: '🍜' },
    { text: '好きだよ〜', translation: '喜欢你哟~', emotion: '😘' }
  ];

  function loadSavedState() {
    const saved = localStorage.getItem('live2d_minimized');
    if (saved !== null) {
      userMinimized = saved === 'true';
      return userMinimized;
    }
    return false;
  }

  function saveState(state) {
    localStorage.setItem('live2d_minimized', state);
  }

  function startAutoHideTimer() {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      autoHideTimer = null;
    }
    
    if (isMinimized && !isMobile && !isAutoHidden && !isRestoring) {
      autoHideTimer = setTimeout(() => {
        if (isMinimized && !isMobile && !isRestoring) {
          isAutoHidden = true;
        }
      }, 3000);
    }
  }

  function cancelAutoHide() {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      autoHideTimer = null;
    }
    isAutoHidden = false;
    isRestoring = false;
  }

  function restoreToMinimized() {
    if (!isAutoHidden) return;
    
    isRestoring = true;
    isAutoHidden = false;
    
    setTimeout(() => {
      isRestoring = false;
      if (isMinimized && !isMobile) {
        startAutoHideTimer();
      }
    }, 400);
  }

  function checkScreenSize() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      isMinimized = true;
      cancelAutoHide();
      return;
    }
    
    if (wasMobile && !isMobile) {
      isAutoHidden = false;
      isRestoring = false;
      if (autoHideTimer) clearTimeout(autoHideTimer);
      
      isMinimized = userMinimized;
      if (!userMinimized) {
        isMinimized = false;
      } else {
        startAutoHideTimer();
      }
      return;
    }
    
    if (!userMinimized) {
      isMinimized = false;
      cancelAutoHide();
    }
  }

  function closeDialog() {
    showDialog = false;
    if (dialogTimer) {
      clearTimeout(dialogTimer);
      dialogTimer = null;
    }
  }

  function toggleMinimize() {
    if (isMobile) return;
    
    // 半隐藏状态：直接展开
    if (isAutoHidden) {
      cancelAutoHide();
      userMinimized = false;
      isMinimized = false;
      saveState(userMinimized);
      return;
    }
    
    // 正常切换最小化/展开
    userMinimized = !isMinimized;
    isMinimized = !isMinimized;
    saveState(userMinimized);
    
    cancelAutoHide();
    
    if (isMinimized) {
      closeDialog();
      startAutoHideTimer();
    }
  }

  function handleModelClick() {
    if (isMobile) return;
    
    if (isAutoHidden) {
      restoreToMinimized();
      return;
    }
    if (isMinimized) return;
    if (clickTimeout) return;

    if (dialogTimer) {
      clearTimeout(dialogTimer);
      dialogTimer = null;
    }

    const randomIndex = Math.floor(Math.random() * messages.length);
    dialogMessage = messages[randomIndex];
    showDialog = true;

    dialogTimer = setTimeout(() => {
      showDialog = false;
      dialogTimer = null;
    }, 4000);

    clickTimeout = setTimeout(() => {
      clickTimeout = null;
    }, 500);
  }

  function handleButtonClick(e) {
    if (isMobile) return;
    e.stopPropagation();
    toggleMinimize();
  }

  function handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      handleModelClick();
    }
  }

  onMount(async () => {
    window.PIXI = PIXI;
    
    userMinimized = loadSavedState();
    isMinimized = userMinimized;
    
    checkScreenSize();
    
    if (isMinimized && !isMobile) {
      startAutoHideTimer();
    }

    app = new PIXI.Application({
      view: canvasElement,
      width: canvasWidth,
      height: canvasHeight,
      backgroundAlpha: 0,
      autoStart: true,
      antialias: true,
      resolution: window.devicePixelRatio,
      autoDensity: true,
    });

    try {
      model = await Live2DModel.from(modelPath);
      
      model.anchor.set(0.5, 0.5);
      model.x = canvasWidth / 2;
      model.y = canvasHeight / 2;
      model.scale.set(0.1, 0.1);
      app.stage.addChild(model);

      model.on('click', () => {
        handleModelClick();
      });

      window.addEventListener('resize', () => {
        checkScreenSize();
      });

      console.log('模型加载成功');

    } catch (error) {
      console.error('Live2D 模型加载失败:', error);
    }

    return () => {
      if (app) app.destroy(true, { children: true });
      if (dialogTimer) clearTimeout(dialogTimer);
      if (clickTimeout) clearTimeout(clickTimeout);
      if (autoHideTimer) clearTimeout(autoHideTimer);
    };
  });
</script>

<!-- 看板娘 -->
<div
  class="live2d-model"
  class:minimized={isMinimized}
  class:auto-hidden={isAutoHidden}
  class:restoring={isRestoring}
  class:hide-on-mobile={isMobile}
  style="position: fixed; bottom: {positionY}px; left: {positionX}px; z-index: 1000; cursor: pointer;"
  on:click={handleModelClick}
  on:keydown={handleKeydown}
  role="button"
  tabindex="0"
>
  <div>
    <canvas bind:this={canvasElement} width={canvasWidth} height={canvasHeight}></canvas>
  </div>
</div>

<!-- 对话框 -->
<div 
  class="dialog-container"
  class:show={showDialog}
  style="position: fixed; bottom: {positionY + canvasHeight / 2 + 20}px; left: {positionX + canvasWidth - 30}px; z-index: 1002;"
>
  <div class="dialog-content">
    <div class="dialog-arrow"></div>
    <div class="dialog-header">
      <span class="dialog-name">Mihari</span>
      <span class="dialog-emotion">{dialogMessage.emotion}</span>
    </div>
    <div class="dialog-text">
      <span class="japanese">{dialogMessage.text}</span>
      <span class="translation">「{dialogMessage.translation}」</span>
    </div>
    <div class="dialog-footer">
      <div class="dialog-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  </div>
</div>

<!-- 按钮 - 完整特效版 -->
<button
  class="magical-btn"
  class:minimized={isMinimized}
  class:auto-hidden={isAutoHidden}
  class:restoring={isRestoring}
  class:hide-on-mobile={isMobile}
  on:click={handleButtonClick}
  style="position: fixed; left: {positionX + 20}px; z-index: 1001;"
  style:bottom={isMinimized ? buttonMinimizedBottom + 'px' :(positionY + canvasHeight + 5) + 'px'}
>
  <!-- 魔法阵光环 -->
  <div class="magic-circle"></div>
  
  <!-- 樱花环绕 -->
  <div class="sakura-ring">
    <span>🌸</span><span>🌸</span><span>🌸</span><span>🌸</span><span>🌸</span>
  </div>
  
  <!-- 星光粒子 -->
  <div class="star-particles">
    <span>✨</span><span>⭐</span><span>🌟</span><span>💫</span><span>⭐</span>
  </div>
  
  <!-- 心动波纹 -->
  <div class="heart-waves"></div>
  
  <!-- 音符飘浮 -->
  <div class="music-notes">
    <span>♪</span><span>♫</span><span>♪</span>
  </div>
  
  <!-- 星星发饰 -->
  <div class="star-hairpin">
    <div class="star-big">⭐</div>
    <div class="star-small">✨</div>
  </div>
  
  <!-- 头像框 -->
  <div class="avatar-frame">
    <img 
      class="avatar-img" 
      src={isMinimized ? avatarMinimized : avatarNormal}
      alt="minimize-btn"
    />
    <div class="avatar-shine"></div>
  </div>
  
  <!-- 气泡提示 -->
  <div class="speech-bubble" class:up={isMinimized}>
    <span>{isMinimized ? 'ただいま！' : 'おやすみ〜'}</span>
    <span class="sub">{isMinimized ? '我回来啦！' : '晚安~'}</span>
  </div>
</button>

<style>
  /* ===== 手机端隐藏 ===== */
  .hide-on-mobile {
    display: none !important;
  }
  
  .live2d-model {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(0);
    cursor: pointer;
  }
  
  .live2d-model.minimized {
    transform: translateX(-120%);
    cursor: default;
  }
  
  .live2d-model.auto-hidden {
    transform: translateX(-95%);
  }
  
  .live2d-model.restoring {
    transform: translateX(-120%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* ===== 按钮基础样式 ===== */
  .magical-btn {
    position: relative;
    width: 52px;
    height: 52px;
    border-radius: 26px;
    background: linear-gradient(135deg, #ffe6f0, #ffd0e0);
    border: none;
    cursor: pointer;
    padding: 0;
    transition: all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
    box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
  }
  
  .magical-btn.auto-hidden {
    transform: translateX(-95%);
  }
  
  .magical-btn.restoring {
    transform: translateX(-120%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* ===== 魔法阵光环 ===== */
  .magic-circle {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,200,230,0) 0%, rgba(255,150,200,0.4) 100%);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }
  
  .magical-btn:hover .magic-circle {
    opacity: 1;
    animation: magicSpin 2s linear infinite;
  }
  
  @keyframes magicSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  /* ===== 樱花环绕 ===== */
  .sakura-ring {
    position: absolute;
    inset: -22px;
    pointer-events: none;
  }
  
  .sakura-ring span {
    position: absolute;
    font-size: 10px;
    opacity: 0;
    transition: all 0.3s;
  }
  
  .magical-btn:hover .sakura-ring span {
    animation: sakuraOrbit 3s linear infinite;
  }
  
  .sakura-ring span:nth-child(1) { top: -10px; left: 50%; animation-delay: 0s; }
  .sakura-ring span:nth-child(2) { bottom: -10px; left: 50%; animation-delay: 1.5s; }
  .sakura-ring span:nth-child(3) { top: 50%; right: -10px; animation-delay: 0.75s; }
  .sakura-ring span:nth-child(4) { top: 50%; left: -10px; animation-delay: 2.25s; }
  .sakura-ring span:nth-child(5) { top: -2px; left: -2px; animation-delay: 0.5s; }
  
  @keyframes sakuraOrbit {
    0% { opacity: 0; transform: scale(0); }
    20% { opacity: 1; transform: scale(1.2); }
    80% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0); }
  }
  
  /* ===== 星光粒子 ===== */
  .star-particles {
    position: absolute;
    inset: -15px;
    pointer-events: none;
  }
  
  .star-particles span {
    position: absolute;
    font-size: 8px;
    opacity: 0;
  }
  
  .magical-btn:hover .star-particles span {
    animation: starTwinkle 0.8s ease-out forwards;
  }
  
  .star-particles span:nth-child(1) { top: -6px; left: -5px; animation-delay: 0s; }
  .star-particles span:nth-child(2) { top: -3px; right: -6px; animation-delay: 0.12s; }
  .star-particles span:nth-child(3) { bottom: -5px; left: 40%; animation-delay: 0.24s; }
  .star-particles span:nth-child(4) { top: 30%; right: -8px; animation-delay: 0.36s; }
  .star-particles span:nth-child(5) { bottom: -6px; right: 20%; animation-delay: 0.48s; }
  
  @keyframes starTwinkle {
    0% { opacity: 0; transform: scale(0); }
    30% { opacity: 1; transform: scale(1.3); }
    70% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.5); }
  }
  
  /* ===== 心动波纹 ===== */
  .heart-waves {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    pointer-events: none;
  }
  
  .magical-btn:hover .heart-waves::before,
  .magical-btn:hover .heart-waves::after {
    content: '💖';
    position: absolute;
    font-size: 10px;
    animation: heartWave 1s ease-out infinite;
  }
  
  .heart-waves::before {
    top: -10px;
    left: -10px;
    animation-delay: 0s;
  }
  
  .heart-waves::after {
    bottom: -10px;
    right: -6px;
    animation-delay: 0.3s;
  }
  
  @keyframes heartWave {
    0% { opacity: 0; transform: scale(0.5); }
    50% { opacity: 1; transform: scale(1.2); }
    100% { opacity: 0; transform: scale(1.5); }
  }
  
  /* ===== 音符飘浮 ===== */
  .music-notes {
    position: absolute;
    inset: -22px;
    pointer-events: none;
  }
  
  .music-notes span {
    position: absolute;
    font-size: 9px;
    opacity: 0;
  }
  
  .magical-btn:hover .music-notes span {
    animation: noteFloat 1.5s ease-out forwards;
  }
  
  .music-notes span:nth-child(1) { top: -15px; left: 20%; animation-delay: 0s; }
  .music-notes span:nth-child(2) { bottom: -10px; right: 25%; animation-delay: 0.3s; }
  .music-notes span:nth-child(3) { top: 10%; right: -15px; animation-delay: 0.6s; }
  
  @keyframes noteFloat {
    0% { opacity: 0; transform: translateY(0) rotate(0deg); }
    20% { opacity: 1; transform: translateY(-3px) rotate(-10deg); }
    80% { opacity: 1; transform: translateY(-10px) rotate(10deg); }
    100% { opacity: 0; transform: translateY(-18px) rotate(0deg); }
  }
  
  /* ===== 星星发饰 ===== */
  .star-hairpin {
    position: absolute;
    top: -14px;
    left: 50%;
    transform: translateX(-50%);
    width: 28px;
    height: 28px;
    pointer-events: none;
    z-index: 5;
  }
  
  .star-big {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    font-size: 16px;
    filter: drop-shadow(0 0 3px #ffd700);
    animation: starSpin 3s linear infinite;
  }
  
  .star-small {
    position: absolute;
    top: 5px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 9px;
    opacity: 0.8;
    animation: starFloat 1.5s ease-in-out infinite;
  }
  
  @keyframes starSpin {
    from { transform: translateX(-50%) rotate(0deg); }
    to { transform: translateX(-50%) rotate(360deg); }
  }
  
  @keyframes starFloat {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(-2px); }
  }
  
  /* ===== 头像框 ===== */
  .avatar-frame {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ffb6c1, #ffc0cb);
    border-radius: 50%;
    transition: all 0.3s ease;
  }
  
  .avatar-img {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  }
  
  .avatar-shine {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%);
    pointer-events: none;
  }
  
  .magical-btn:hover .avatar-frame {
    transform: scale(1.05);
    box-shadow: 0 0 12px rgba(255,105,180,0.5);
  }
  
  /* ===== 气泡提示 ===== */
  .speech-bubble {
    position: absolute;
    bottom: -52px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(8px);
    padding: 6px 12px;
    border-radius: 16px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s, transform 0.2s;
    pointer-events: none;
    font-family: 'Comic Neue', 'Segoe UI', cursive;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }
  
  .speech-bubble span {
    display: block;
    text-align: center;
  }
  
  .speech-bubble span:first-child {
    font-size: 13px;
    font-weight: bold;
    color: #ff6b9d;
  }
  
  .speech-bubble .sub {
    font-size: 11px;
    color: #888;
  }
  
  .speech-bubble::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid rgba(255,255,255,0.95);
  }
  
  .speech-bubble.up {
    bottom: auto;
    top: -52px;
  }
  
  .speech-bubble.up::before {
    top: auto;
    bottom: -4px;
    border-bottom: none;
    border-top: 4px solid rgba(255,255,255,0.95);
  }
  
  .magical-btn:hover .speech-bubble {
    opacity: 1;
    transform: translateX(-50%) translateY(-2px);
  }
  
  .magical-btn.minimized {
    background: linear-gradient(135deg, #e0f0ff, #d0e8ff);
    box-shadow: 0 4px 12px rgba(100, 150, 255, 0.3);
  }
  
  /* ===== 对话框样式 ===== */
  .dialog-container {
    opacity: 0;
    transform: translateX(-20px) scale(0.95);
    transition: all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
    pointer-events: none;
  }
  
  .dialog-container.show {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  
  .dialog-content {
    position: relative;
    background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,245,250,0.98));
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 16px 20px;
    min-width: 220px;
    max-width: 280px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255,255,255,0.5);
    animation: dialogGlow 2s ease-in-out infinite;
  }
  
  @keyframes dialogGlow {
    0%, 100% { box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255,255,255,0.5); }
    50% { box-shadow: 0 20px 50px rgba(255,105,180,0.25), 0 0 0 2px rgba(255,105,180,0.3); }
  }
  
  .dialog-arrow {
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-right: 10px solid rgba(255,255,255,0.98);
    filter: drop-shadow(-2px 0 4px rgba(0,0,0,0.05));
  }
  
  .dialog-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid rgba(255,105,180,0.3);
  }
  
  .dialog-name {
    font-size: 14px;
    font-weight: bold;
    background: linear-gradient(135deg, #ff6b9d, #ff9a9e);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    letter-spacing: 1px;
  }
  
  .dialog-emotion {
    font-size: 16px;
    animation: emotionBounce 0.5s ease-out;
  }
  
  @keyframes emotionBounce {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }
  
  .dialog-text {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }
  
  .japanese {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    letter-spacing: 1px;
    animation: textSlideIn 0.3s ease-out;
  }
  
  .translation {
    font-size: 12px;
    color: #888;
    font-style: italic;
    animation: textSlideIn 0.3s ease-out 0.1s both;
  }
  
  @keyframes textSlideIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
  
  .dialog-dots {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  
  .dialog-dots span {
    width: 6px;
    height: 6px;
    background: #ff6b9d;
    border-radius: 50%;
    animation: dotPulse 1.4s ease-in-out infinite;
  }
  
  .dialog-dots span:nth-child(1) { animation-delay: 0s; }
  .dialog-dots span:nth-child(2) { animation-delay: 0.2s; }
  .dialog-dots span:nth-child(3) { animation-delay: 0.4s; }
  
  @keyframes dotPulse {
    0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
    30% { opacity: 1; transform: scale(1.2); }
  }
</style>