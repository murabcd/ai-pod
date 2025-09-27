(() => {
  const Config = {
    EXTENSION_ID: "page-summarizer-extension",
    // API_ENDPOINT: 'https://your-deployment.vercel.app/api/podcast',
    API_ENDPOINT: "http://localhost:3001/api/podcast", // for local dev!

    BLOCKED_DOMAINS: [
      "github.com",
      "google.com",
      "youtube.com",
      "twitter.com",
      "x.com",
      "facebook.com",
      "instagram.com",
      "linkedin.com",
      "reddit.com",
      "gmail.com",
      "outlook.com",
      "netflix.com",
      "spotify.com",
      "amazon.com",
      "ebay.com",
    ],

    AUDIO: {
      SKIP_SECONDS: 10,
      WAVEFORM: {
        BAR_WIDTH: 2,
        BAR_GAP: 1,
        MIN_HEIGHT_PCT: 6,
        MAX_BARS: 320,
        MIN_BARS: 60,
      },
    },

    EVENTS: {
      TOGGLE: "page-summarizer-toggle",
    },
  };

  // Generate CSS class names
  const Css = {
    player: `${Config.EXTENSION_ID}-player`,
    disabled: `${Config.EXTENSION_ID}-disabled`,
    entering: `${Config.EXTENSION_ID}-entering`,
    surface: `${Config.EXTENSION_ID}-surface`,
    waveform: `${Config.EXTENSION_ID}-waveform`,
    waveformLayer: `${Config.EXTENSION_ID}-waveform-layer`,
    waveformBase: `${Config.EXTENSION_ID}-waveform-base`,
    waveformOverlay: `${Config.EXTENSION_ID}-waveform-overlay`,
    timeDisplay: `${Config.EXTENSION_ID}-time-display`,
    currentTime: `${Config.EXTENSION_ID}-current-time`,
    remaining: `${Config.EXTENSION_ID}-remaining`,
    controls: `${Config.EXTENSION_ID}-controls`,
    controlsGroup: `${Config.EXTENSION_ID}-controls-group`,
    control: `${Config.EXTENSION_ID}-control`,
    playPause: `${Config.EXTENSION_ID}-play-pause`,
    playIcon: `${Config.EXTENSION_ID}-play-icon`,
    pauseIcon: `${Config.EXTENSION_ID}-pause-icon`,
    overlayButton: `${Config.EXTENSION_ID}-overlay-button`,
    brandLeft: `${Config.EXTENSION_ID}-brand-left`,
    spinner: `${Config.EXTENSION_ID}-spinner`,
    speakerIndicator: `${Config.EXTENSION_ID}-speaker-indicator`,
    alex: `${Config.EXTENSION_ID}-alex`,
    sarah: `${Config.EXTENSION_ID}-sarah`,
  };

  const DomUtils = {
    findFirstHeading() {
      return document.querySelector("h1") || document.querySelector("h2");
    },

    extractPageText() {
      const body = document.body.cloneNode(true);

      // Remove unwanted elements
      const excludedSelectors = `script, style, noscript, [class*="${Config.EXTENSION_ID}"]`;
      for (const el of body.querySelectorAll(excludedSelectors)) {
        el.remove();
      }

      return body.innerText || body.textContent || "";
    },

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    },

    isDomainBlocked(hostname) {
      const domain = hostname.replace("www.", "");
      return Config.BLOCKED_DOMAINS.some((blocked) => domain.includes(blocked));
    },
  };

  const UiComponents = {
    createPlayerHTML() {
      return `
        <audio id="${Config.EXTENSION_ID}-audio" preload="auto" playsinline></audio>

        <div class="${Css.surface}">
          <div class="${Css.speakerIndicator}">Alex</div>
          <div class="${Css.waveform}"></div>
          <div class="${Css.timeDisplay}">
            <span class="${Css.currentTime}">0:00</span>
            <span class="${Css.remaining}">-0:00</span>
          </div>
        </div>

        <div class="${Css.controls}">
          ${this.createBrandLeft()}
          ${this.createControlsGroup()}
        </div>

        ${this.createOverlayButton()}
      `;
    },

    createBrandLeft() {
      return `
        <span class="${Css.brandLeft}" aria-label="Podcast">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-audio-waveform-icon lucide-audio-waveform">
            <path d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2"/>
          </svg>
          AI PODCAST
        </span>
      `;
    },

    createControlsGroup() {
      return `
        <div class="${Css.controlsGroup}">
          <button class="${Css.control}" data-action="rewind" disabled>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m10 5-7 7 7 7v-6.5c5 0 8.5 1.5 11 5.5-1-5-4-10-11-11V5z"/>
            </svg>
          </button>
          <button class="${Css.control} ${Css.playPause}" data-action="play" disabled>
            <svg class="${Css.playIcon}" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4v16l14-8z"/>
            </svg>
            <svg class="${Css.pauseIcon}" style="display:none;" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
          </button>
          <button class="${Css.control}" data-action="forward" disabled>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m14 5 7 7-7 7v-6.5c-5 0-8.5 1.5-11 5.5 1-5 4-10 11-11V5z"/>
            </svg>
          </button>
        </div>
      `;
    },

    createOverlayButton() {
      return `
        <button class="${Css.overlayButton}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
            <path d="M20 2v4"/>
            <path d="M22 4h-4"/>
            <circle cx="4" cy="20" r="2"/>
          </svg>
          <span>Generate podcast</span>
        </button>
      `;
    },

    createLoadingSpinner() {
      return `
        <svg class="${Css.spinner}" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>Generating...</span>
      `;
    },

    createErrorState() {
      return `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4m0 4h.01"/>
        </svg>
        <span>Error - Try Again</span>
      `;
    },
  };

  const ApiService = {
    async requestSummary(text, url, title) {
      console.log("Requesting podcast for:", {
        url,
        title,
        textLength: text.length,
      });

      try {
        const response = await fetch(Config.API_ENDPOINT, {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, url, title }),
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const audioSegments = await response.json();
        console.log("Podcast segments received:", {
          segmentCount: audioSegments.length,
          segments: audioSegments.map((s) => ({
            speaker: s.speaker,
            size: s.audio.length,
          })),
        });

        return this.createAudioSegments(audioSegments);
      } catch (error) {
        console.error("Podcast request failed:", error);
        throw error;
      }
    },

    createAudioSegments(audioSegments) {
      return audioSegments.map((segment) => {
        // Convert array back to Uint8Array, then to Blob
        const uint8Array = new Uint8Array(segment.audio);
        const audioBlob = new Blob([uint8Array], {
          type: segment.mediaType || "audio/mpeg",
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        return new Promise((resolve, reject) => {
          const testAudio = new Audio(audioUrl);

          testAudio.addEventListener("loadedmetadata", () => {
            console.log(
              `Audio segment verified for ${segment.speaker}, duration:`,
              testAudio.duration
            );
            resolve({
              speaker: segment.speaker,
              audioUrl,
              duration: testAudio.duration,
            });
          });

          testAudio.addEventListener("error", (error) => {
            console.error(
              `Audio loading failed for ${segment.speaker}:`,
              error
            );
            URL.revokeObjectURL(audioUrl);
            reject(new Error(`Failed to load audio for ${segment.speaker}`));
          });
        });
      });
    },
  };

  class AudioPlayer {
    constructor(container) {
      this.container = container;
      this.audioElement = container.querySelector(
        `#${Config.EXTENSION_ID}-audio`
      );
      this.audioContext = null;
      this.audioSegments = [];
      this.currentSegmentIndex = 0;
      this.rafId = null;
      this.lastDisplayedSec = -1;
      this.totalDuration = 0;
      this.currentSpeaker = null;
    }

    async loadAudioSegments(audioSegments, autoplay = false) {
      this.audioSegments = audioSegments;
      this.currentSegmentIndex = 0;
      this.totalDuration = audioSegments.reduce(
        (total, segment) => total + segment.duration,
        0
      );

      this.setupEventListeners();
      await this.renderWaveform();
      this.loadCurrentSegment();

      if (autoplay) {
        this.play();
      }
    }

    loadCurrentSegment() {
      if (this.currentSegmentIndex < this.audioSegments.length) {
        const segment = this.audioSegments[this.currentSegmentIndex];
        this.audioElement.src = segment.audioUrl;
        this.currentSpeaker = segment.speaker;
        this.updateSpeakerIndicator();
      }
    }

    updateSpeakerIndicator() {
      const speakerIndicator = this.container.querySelector(
        `.${Css.speakerIndicator}`
      );
      if (speakerIndicator) {
        speakerIndicator.textContent =
          this.currentSpeaker === "ALEX" ? "Alex" : "Sarah";
        speakerIndicator.className = `${Css.speakerIndicator} ${Css[this.currentSpeaker.toLowerCase()]}`;
      }
    }

    setupEventListeners() {
      this.audioElement.addEventListener("play", () => this.onPlay());
      this.audioElement.addEventListener("pause", () => this.onPause());
      this.audioElement.addEventListener("ended", () => this.onEnded());
      this.audioElement.addEventListener("loadedmetadata", () =>
        this.onMetadataLoaded()
      );
    }

    async play() {
      try {
        await this.audioElement.play();
        return true;
      } catch (error) {
        console.warn("Playback failed:", error);
        return false;
      }
    }

    pause() {
      this.audioElement.pause();
    }

    togglePlayPause() {
      if (this.audioElement.paused) {
        this.play();
      } else {
        this.pause();
      }
    }

    skip(seconds) {
      this.audioElement.currentTime += seconds;
    }

    seekToPercent(percent) {
      if (this.audioElement.duration > 0) {
        this.audioElement.currentTime = percent * this.audioElement.duration;
        this.updateProgress();
      }
    }

    onPlay() {
      this.updatePlayButton(true);
      this.startProgressAnimation();
      // Add playing class for enhanced animations
      const waveform = this.container.querySelector(`.${Css.waveform}`);
      if (waveform) {
        waveform.classList.add("playing");
      }
    }

    onPause() {
      this.updatePlayButton(false);
      this.stopProgressAnimation();
      // Remove playing class
      const waveform = this.container.querySelector(`.${Css.waveform}`);
      if (waveform) {
        waveform.classList.remove("playing");
      }
    }

    onEnded() {
      this.currentSegmentIndex++;
      if (this.currentSegmentIndex < this.audioSegments.length) {
        // Move to next segment
        this.loadCurrentSegment();
        this.play();
      } else {
        // All segments finished
        this.updatePlayButton(false);
        this.stopProgressAnimation();
        this.currentSegmentIndex = 0;
        this.loadCurrentSegment();
      }
    }

    onMetadataLoaded() {
      const remainingSpan = this.container.querySelector(`.${Css.remaining}`);
      if (remainingSpan) {
        remainingSpan.textContent = `-${DomUtils.formatTime(this.audioElement.duration)}`;
      }
    }

    updatePlayButton(isPlaying) {
      const button = this.container.querySelector(`.${Css.playPause}`);
      if (!button) {
        return;
      }

      const playIcon = button.querySelector(`.${Css.playIcon}`);
      const pauseIcon = button.querySelector(`.${Css.pauseIcon}`);

      if (playIcon && pauseIcon) {
        playIcon.style.display = isPlaying ? "none" : "block";
        pauseIcon.style.display = isPlaying ? "block" : "none";
      }
    }

    calculateTotalElapsed() {
      const current = this.audioElement.currentTime || 0;
      let totalElapsed = 0;
      for (let i = 0; i < this.currentSegmentIndex; i++) {
        totalElapsed += this.audioSegments[i].duration;
      }
      totalElapsed += current;
      return totalElapsed;
    }

    updateWaveformOverlay(totalElapsed) {
      const totalProgress =
        this.totalDuration > 0 ? totalElapsed / this.totalDuration : 0;
      if (this.totalDuration > 0) {
        const overlay = this.container.querySelector(`.${Css.waveformOverlay}`);
        if (overlay) {
          const PercentageMultiplier = 100;
          overlay.style.width = `${totalProgress * PercentageMultiplier}%`;
        }
      }
    }

    updateTimeDisplays(totalElapsed) {
      const wholeSec = Math.floor(totalElapsed);
      if (wholeSec !== this.lastDisplayedSec) {
        this.lastDisplayedSec = wholeSec;

        const currentTimeSpan = this.container.querySelector(
          `.${Css.currentTime}`
        );
        const remainingSpan = this.container.querySelector(`.${Css.remaining}`);

        if (currentTimeSpan) {
          currentTimeSpan.textContent = DomUtils.formatTime(totalElapsed);
        }
        if (remainingSpan && this.totalDuration > 0) {
          remainingSpan.textContent = `-${DomUtils.formatTime(Math.max(0, this.totalDuration - totalElapsed))}`;
        }
      }
    }

    updateProgress() {
      const totalElapsed = this.calculateTotalElapsed();
      this.updateWaveformOverlay(totalElapsed);
      this.updateTimeDisplays(totalElapsed);
    }

    startProgressAnimation() {
      this.stopProgressAnimation();

      const tick = () => {
        if (!this.audioElement || this.audioElement.paused) {
          return;
        }
        this.updateProgress();
        this.rafId = requestAnimationFrame(tick);
      };

      this.rafId = requestAnimationFrame(tick);
    }

    stopProgressAnimation() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    async renderWaveform() {
      const waveformEl = this.container.querySelector(`.${Css.waveform}`);
      if (!(waveformEl && this.audioUrl)) {
        return;
      }

      try {
        if (!this.audioContext) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          this.audioContext = new AudioContext();
        }

        const rect = waveformEl.getBoundingClientRect();
        const maxBars = Math.min(
          Config.AUDIO.WAVEFORM.MAX_BARS,
          Math.max(
            Config.AUDIO.WAVEFORM.MIN_BARS,
            Math.floor(
              rect.width /
                (Config.AUDIO.WAVEFORM.BAR_WIDTH +
                  Config.AUDIO.WAVEFORM.BAR_GAP)
            )
          )
        );

        const response = await fetch(this.audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer =
          await this.audioContext.decodeAudioData(arrayBuffer);

        const peaks = this.extractPeaks(audioBuffer, maxBars);
        const barsHtml = this.generateWaveformBars(peaks);

        waveformEl.innerHTML = `
          <div class="${Css.waveformLayer} ${Css.waveformBase}">${barsHtml}</div>
          <div class="${Css.waveformLayer} ${Css.waveformOverlay}">${barsHtml}</div>
        `;

        this.updateProgress();
      } catch (error) {
        console.error("Failed to render waveform:", error);
        this.renderPlaceholderWaveform();
      }
    }

    renderPlaceholderWaveform() {
      const waveformEl = this.container.querySelector(`.${Css.waveform}`);
      if (!waveformEl) {
        return;
      }

      const rect = waveformEl.getBoundingClientRect();
      const MinBarCount = 60;
      const MaxBarCount = 320;
      const count = Math.max(
        MinBarCount,
        Math.min(
          MaxBarCount,
          Math.floor(
            rect.width /
              (Config.AUDIO.WAVEFORM.BAR_WIDTH + Config.AUDIO.WAVEFORM.BAR_GAP)
          )
        )
      );

      const bars = [];
      const Wave1Frequency = 4;
      const Wave1Amplitude = 0.3;
      const Wave2Frequency = 8;
      const Wave2Amplitude = 0.2;
      const Wave3Frequency = 16;
      const Wave3Amplitude = 0.1;
      const BaseAmplitude = 0.1;
      const PercentageMultiplier = 100;
      const RandomVariationFactor = 0.2;
      const MaxAnimationDelay = 2;

      for (let i = 0; i < count; i++) {
        const t = count <= 1 ? 0 : i / (count - 1);
        // Create a more natural waveform pattern with multiple sine waves
        const wave1 = Math.sin(t * Math.PI * Wave1Frequency) * Wave1Amplitude;
        const wave2 = Math.sin(t * Math.PI * Wave2Frequency) * Wave2Amplitude;
        const wave3 = Math.sin(t * Math.PI * Wave3Frequency) * Wave3Amplitude;
        const combined = Math.abs(wave1 + wave2 + wave3) + BaseAmplitude;
        const _pct = Math.max(
          Config.AUDIO.WAVEFORM.MIN_HEIGHT_PCT,
          Math.round(combined * PercentageMultiplier)
        );

        // Add random variation and animation delay for more natural look
        const RandomOffset = 0.5;
        const randomVariation =
          (Math.random() - RandomOffset) * RandomVariationFactor;
        const finalPct = Math.max(
          Config.AUDIO.WAVEFORM.MIN_HEIGHT_PCT,
          Math.round((combined + randomVariation) * PercentageMultiplier)
        );
        const animationDelay = Math.random() * MaxAnimationDelay; // Random delay 0-2s

        bars.push(
          `<span style="height:${finalPct}%; animation-delay: ${animationDelay}s;" class="waveform-bar"></span>`
        );
      }

      const barsHtml = bars.join("");
      waveformEl.innerHTML = `
        <div class="${Css.waveformLayer} ${Css.waveformBase}">${barsHtml}</div>
        <div class="${Css.waveformLayer} ${Css.waveformOverlay}" style="width:0%">${barsHtml}</div>
      `;
    }

    extractChannelData(audioBuffer) {
      const { numberOfChannels } = audioBuffer;
      const channels = [];
      for (let c = 0; c < numberOfChannels; c++) {
        channels.push(audioBuffer.getChannelData(c));
      }
      return channels;
    }

    calculateBarRMS(channels, start, end, numberOfChannels) {
      let sumSq = 0;
      let count = 0;
      const SampleStep = 64;

      for (let s = start; s < end; s += SampleStep) {
        let v = 0;
        for (let c = 0; c < numberOfChannels; c++) {
          v += channels[c][s] || 0;
        }
        v /= numberOfChannels;
        sumSq += v * v;
        count++;
      }

      return count ? Math.sqrt(sumSq / count) : 0;
    }

    extractPeaks(audioBuffer, barCount) {
      const { length, numberOfChannels } = audioBuffer;
      const samplesPerBar = Math.floor(length / barCount);
      const channels = this.extractChannelData(audioBuffer);
      const peaks = new Array(barCount).fill(0);

      for (let i = 0; i < barCount; i++) {
        const start = i * samplesPerBar;
        const end = i === barCount - 1 ? length : start + samplesPerBar;
        peaks[i] = this.calculateBarRMS(channels, start, end, numberOfChannels);
      }

      return this.normalizePeaks(peaks);
    }

    normalizePeaks(peaks) {
      const MinThreshold = 1e-6;
      const PowerExponent = 0.5;
      const max = Math.max(MinThreshold, Math.max(...peaks));
      const normalized = peaks.map((p) => (p / max) ** PowerExponent);

      const smoothed = new Array(normalized.length);
      for (let i = 0; i < normalized.length; i++) {
        const a = normalized[i - 1] ?? normalized[i];
        const b = normalized[i];
        const c = normalized[i + 1] ?? normalized[i];
        const SmoothingDivisor = 4;
        smoothed[i] = (a + 2 * b + c) / SmoothingDivisor;
      }

      return smoothed;
    }

    generateWaveformBars(peaks) {
      return peaks
        .map((value, index) => {
          const MaxPercentage = 100;
          const PercentageMultiplier = 100;
          const pct = Math.max(
            Config.AUDIO.WAVEFORM.MIN_HEIGHT_PCT,
            Math.min(MaxPercentage, Math.round(value * PercentageMultiplier))
          );
          // Add subtle animation delay based on position for wave-like effect
          const animationDelay = (index / peaks.length) * 2;
          return `<span style="height:${pct}%; animation-delay: ${animationDelay}s;" class="waveform-bar"></span>`;
        })
        .join("");
    }

    destroy() {
      this.stopProgressAnimation();
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.src = "";
      }
      if (this.audioSegments) {
        for (const segment of this.audioSegments) {
          if (segment.audioUrl) {
            URL.revokeObjectURL(segment.audioUrl);
          }
        }
        this.audioSegments = [];
      }
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
    }
  }

  class PagePodcaster {
    constructor() {
      this.isInitialized = false;
      this.playerContainer = null;
      this.targetHeading = null;
      this.audioPlayer = null;
      this.shouldAutoplay = false;
      this.removalObserver = null;
    }

    init() {
      if (this.isInitialized) {
        return;
      }

      if (DomUtils.isDomainBlocked(window.location.hostname)) {
        console.log(`Page Podcaster: Disabled on ${window.location.hostname}`);
        return;
      }

      this.isInitialized = true;

      const heading = DomUtils.findFirstHeading();
      if (heading) {
        this.targetHeading = heading;
        this.injectPlayer(heading);
        this.observeRemoval();
      }
    }

    injectPlayer(heading) {
      if (heading.nextElementSibling?.classList.contains(Css.player)) {
        this.playerContainer = heading.nextElementSibling;
        return;
      }

      this.playerContainer = document.createElement("div");
      this.playerContainer.className = `${Css.player} ${Css.disabled} ${Css.entering}`;
      this.playerContainer.setAttribute(
        "data-extension-id",
        Config.EXTENSION_ID
      );
      this.playerContainer.innerHTML = UiComponents.createPlayerHTML();

      heading.insertAdjacentElement("afterend", this.playerContainer);

      requestAnimationFrame(() => {
        this.playerContainer.classList.remove(Css.entering);
      });

      this.attachEventListeners();
      this.audioPlayer = new AudioPlayer(this.playerContainer);
      this.audioPlayer.renderPlaceholderWaveform();
    }

    attachEventListeners() {
      const overlayButton = this.playerContainer.querySelector(
        `.${Css.overlayButton}`
      );
      if (overlayButton) {
        overlayButton.addEventListener("click", (e) => this.handlePodcast(e));
      }

      const playPauseBtn = this.playerContainer.querySelector(
        '[data-action="play"]'
      );
      const rewindBtn = this.playerContainer.querySelector(
        '[data-action="rewind"]'
      );
      const forwardBtn = this.playerContainer.querySelector(
        '[data-action="forward"]'
      );

      if (playPauseBtn) {
        playPauseBtn.addEventListener("click", () =>
          this.audioPlayer?.togglePlayPause()
        );
      }
      if (rewindBtn) {
        rewindBtn.addEventListener("click", () =>
          this.audioPlayer?.skip(-Config.AUDIO.SKIP_SECONDS)
        );
      }
      if (forwardBtn) {
        forwardBtn.addEventListener("click", () =>
          this.audioPlayer?.skip(Config.AUDIO.SKIP_SECONDS)
        );
      }

      const waveform = this.playerContainer.querySelector(`.${Css.waveform}`);
      if (waveform) {
        waveform.addEventListener("click", (e) => this.handleWaveformClick(e));
      }
    }

    handleWaveformClick(event) {
      if (!this.audioPlayer) {
        return;
      }

      const waveform = event.currentTarget;
      const rect = waveform.getBoundingClientRect();
      const percent = (event.clientX - rect.left) / rect.width;

      this.audioPlayer.seekToPercent(percent);
    }

    async handlePodcast(event) {
      const button = event.currentTarget;
      this.shouldAutoplay = true;

      button.disabled = true;
      button.innerHTML = UiComponents.createLoadingSpinner();

      try {
        const pageText = DomUtils.extractPageText();
        console.log("Page text extracted, length:", pageText.length);

        const audioSegments = await ApiService.requestSummary(
          pageText,
          window.location.href,
          document.title
        );

        if (audioSegments && audioSegments.length > 0) {
          // Wait for all segments to be processed
          const processedSegments = await Promise.all(audioSegments);
          await this.activatePlayer(processedSegments);
        }
      } catch (error) {
        console.error("Podcast generation failed:", error);
        button.innerHTML = UiComponents.createErrorState();
        button.disabled = false;
      }
    }

    async activatePlayer(audioSegments) {
      this.playerContainer.classList.remove(Css.disabled);

      const overlayButton = this.playerContainer.querySelector(
        `.${Css.overlayButton}`
      );
      if (overlayButton) {
        overlayButton.remove();
      }

      const controls = this.playerContainer.querySelectorAll(`.${Css.control}`);
      for (const control of controls) {
        control.disabled = false;
      }

      await this.audioPlayer.loadAudioSegments(
        audioSegments,
        this.shouldAutoplay
      );
      this.shouldAutoplay = false;
    }

    observeRemoval() {
      this.removalObserver = new MutationObserver((_mutations) => {
        if (
          this.playerContainer &&
          !document.body.contains(this.playerContainer)
        ) {
          console.log("Player was removed, re-injecting...");

          if (
            this.targetHeading &&
            document.body.contains(this.targetHeading)
          ) {
            this.injectPlayer(this.targetHeading);
          } else {
            this.targetHeading = DomUtils.findFirstHeading();
            if (this.targetHeading) {
              this.injectPlayer(this.targetHeading);
            }
          }
        }
      });

      this.removalObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    toggle() {
      if (
        this.playerContainer &&
        document.body.contains(this.playerContainer)
      ) {
        this.destroy();
      } else {
        this.init();
      }
    }

    destroy() {
      if (this.audioPlayer) {
        this.audioPlayer.destroy();
        this.audioPlayer = null;
      }

      if (this.playerContainer) {
        this.playerContainer.remove();
        this.playerContainer = null;
      }

      if (this.removalObserver) {
        this.removalObserver.disconnect();
        this.removalObserver = null;
      }

      this.targetHeading = null;
      this.isInitialized = false;
    }
  }

  const pagePodcaster = new PagePodcaster();

  // Listen for toggle event from background script
  window.addEventListener(Config.EVENTS.TOGGLE, () => {
    pagePodcaster.toggle();
  });

  // Initialize on injection
  pagePodcaster.init();
})();
