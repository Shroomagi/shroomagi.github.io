let audioStarted = false;
let audioSrc;
let audioCtx;

// Modern mobile detection (feature-based)
function isMobileTouchDevice() {
  const hasTouch =
    ('ontouchstart' in window) ||
    navigator.maxTouchPoints > 0;

  const smallScreen = window.matchMedia("(max-width: 768px)").matches;

  return hasTouch && smallScreen;
}

function startReversedAudio() {
  if (audioStarted) return;
  audioStarted = true;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const bgVideo = document.getElementById("bgVideo");
  bgVideo.play();

  const ctaText = document.querySelector('.cta-text');
  if (ctaText) ctaText.remove();

  fetch("intro.mp3")
    .then(r => r.arrayBuffer())
    .then(b => audioCtx.decodeAudioData(b))
    .then(buffer => {
      for (let c = 0; c < buffer.numberOfChannels; c++) {
        Array.prototype.reverse.call(buffer.getChannelData(c));
      }

      audioSrc = audioCtx.createBufferSource();
      audioSrc.buffer = buffer;
      audioSrc.loop = true;

      const gainNode = audioCtx.createGain();
      audioSrc.connect(gainNode).connect(audioCtx.destination);
      audioSrc.start();

      const sliderContainer = document.querySelector('.volume-container');
      sliderContainer.classList.remove('hidden');

      const slider = document.getElementById('volumeSlider');
      slider.addEventListener('input', e => {
        gainNode.gain.value = e.target.value;
      });
    });

  window.removeEventListener("click", startReversedAudio);
  window.removeEventListener("keydown", startReversedAudio);
}

// Global listeners (unchanged)
window.addEventListener("click", startReversedAudio);
window.addEventListener("keydown", startReversedAudio);

// Social buttons
document.querySelectorAll('.social-btn').forEach(button => {
  button.addEventListener('click', () => {
    window.open(button.getAttribute('data-link'), '_blank');
  });
});

// ✅ SAFARI FIX: wait until DOM exists
document.addEventListener("DOMContentLoaded", () => {
  const ctaText = document.querySelector('.cta-text');
  if (!ctaText) return;

  // Desktop / general click still works
  ctaText.addEventListener("click", startReversedAudio, { once: true });

  // Mobile-only play triangle
  if (isMobileTouchDevice()) {
    ctaText.classList.add("mobile-play");
  }
});
