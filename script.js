let audioStarted = false;

function startReversedAudio() {
  if (audioStarted) return;
  audioStarted = true;

  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  fetch("intro.mp3")
    .then(r => r.arrayBuffer())
    .then(b => ctx.decodeAudioData(b))
    .then(buffer => {
      for (let c = 0; c < buffer.numberOfChannels; c++) {
        Array.prototype.reverse.call(buffer.getChannelData(c));
      }

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      src.connect(ctx.destination);
      src.start();
    });

  window.removeEventListener("click", startReversedAudio);
  window.removeEventListener("keydown", startReversedAudio);
}

window.addEventListener("click", startReversedAudio);
window.addEventListener("keydown", startReversedAudio);


const buttons = document.querySelectorAll('.social-btn');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const link = button.getAttribute('data-link');
    window.open(link, '_blank'); // Opens in a new tab
  });
});