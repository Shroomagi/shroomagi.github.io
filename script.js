let audioStarted = false;
let audioSrc;
let audioCtx;

// Modern mobile detection (touch device + small screen)
function isMobileTouchDevice() {
  const hasTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const smallScreen = window.matchMedia("(max-width: 768px)").matches;
  return hasTouch && smallScreen;
}

function startReversedAudio() {
  if (audioStarted) return;
  audioStarted = true;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const bgVideo = document.getElementById("bgVideo");
  bgVideo.play();

  // Remove CTA text if present
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

      // Gain node for volume control
      const gainNode = audioCtx.createGain();
      audioSrc.connect(gainNode).connect(audioCtx.destination);
      audioSrc.start();

      // Show slider now
      const sliderContainer = document.querySelector('.volume-container');
      sliderContainer.classList.remove('hidden');

      // Connect slider
      const slider = document.getElementById('volumeSlider');
      slider.addEventListener('input', e => {
        gainNode.gain.value = e.target.value;
      });
    });

  window.removeEventListener("click", startReversedAudio);
  window.removeEventListener("keydown", startReversedAudio);
}

// Normal desktop/touch listeners
window.addEventListener("click", startReversedAudio);
window.addEventListener("keydown", startReversedAudio);

// Social buttons open links
const buttons = document.querySelectorAll('.social-btn');
buttons.forEach(button => {
  button.addEventListener('click', () => {
    const link = button.getAttribute('data-link');
    window.open(link, '_blank');
  });
});

// CTA text click listener for desktop/touch
const ctaText = document.querySelector('.cta-text');
if (ctaText) ctaText.addEventListener("click", startReversedAudio, { once: true });

// Mobile-only: replace CTA text with play triangle
if (isMobileTouchDevice()) {
  if (ctaText) {
    ctaText.classList.add("mobile-play");
    ctaText.addEventListener("click", startReversedAudio, { once: true });
  }
}
