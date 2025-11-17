// Simple demo pages: later these will be generated from user text.
const defaultPages = [
  {
    text: "Page 1 — This is the beginning of your interactive collection. Imagine a cosy beige background and a looping 8-second video below.",
    video: ""
  },
  {
    text: "Page 2 — Each page will have its own paragraph and matching looping video, perfect for stories, study notes or invitations.",
    video: ""
  },
  {
    text: "Page 3 — After the narrator finishes reading, the app will auto-flick to the next page and keep the flow going.",
    video: ""
  }
];

let pages = [...defaultPages];
let currentPage = 0;
let isSpeaking = false;
let currentUtterance = null;
let uploadedVideoURL = null;

// grab DOM elements
const pageCounterEl = document.getElementById("pageCounter");
const pageTextEl = document.getElementById("pageText");
const pageVideoEl = document.getElementById("pageVideo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const playBtn = document.getElementById("playBtn");

// NEW: builder elements
const storyInput = document.getElementById("storyInput");
const videoInput = document.getElementById("videoInput");
const buildBtn = document.getElementById("buildBtn");

// prefill textarea with demo text so you see something
if (storyInput) {
  storyInput.value = defaultPages.map(p => p.text).join("\n\n");
}

// handle video upload (create a local blob URL)
if (videoInput) {
  videoInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    if (uploadedVideoURL) URL.revokeObjectURL(uploadedVideoURL);
    uploadedVideoURL = URL.createObjectURL(file);
  });
}

// build pages from textarea + video
if (buildBtn) {
  buildBtn.addEventListener("click", () => {
    const raw = (storyInput.value || "").trim();
    if (!raw) {
      alert("Write or paste some text first.");
      return;
    }

    // split by blank lines → pages (max 15)
    const chunks = raw
      .split(/\n\s*\n/)
      .map(c => c.trim())
      .filter(c => c.length > 0)
      .slice(0, 15);

    pages = chunks.map(text => ({
      text,
      video: uploadedVideoURL || ""
    }));

    currentPage = 0;
    showPage(0);
  });
}


function showPage(index) {
  currentPage = index;

  const page = pages[currentPage];
  pageTextEl.textContent = page.text;
  pageCounterEl.textContent = `Page ${currentPage + 1} / ${pages.length}`;

  if (page.video) {
    pageVideoEl.src = page.video;
    pageVideoEl.style.display = "block";
    pageVideoEl.play().catch(()=>{});
  } else {
    pageVideoEl.pause();
    pageVideoEl.style.display = "none";
  }
}

// manual navigation
function goNext() {
  const next = (currentPage + 1) % pages.length;
  showPage(next);
}

function goPrev() {
  const prev = (currentPage - 1 + pages.length) % pages.length;
  showPage(prev);
}

// narration using browser tts for now
function playNarration() {
  if (!("speechSynthesis" in window)) {
    alert("TTS not supported in this browser.");
    return;
  }

  // if already speaking, stop
  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    playBtn.textContent = "▶ Play narration";
    return;
  }

  const text = pages[currentPage].text;
  const utter = new SpeechSynthesisUtterance(text);
  currentUtterance = utter;
  isSpeaking = true;
  playBtn.textContent = "⏸ pause narration";

  utter.rate = 1;
  utter.pitch = 1;

  utter.onend = () => {
    isSpeaking = false;
    playBtn.textContent = "▶ Play narration";
    // wait 8 seconds then auto-flick
    setTimeout(goNext, 8000);
  };

  utter.onerror = () => {
    isSpeaking = false;
    playBtn.textContent = "▶ Play narration";
  };

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// hook buttons
prevBtn.addEventListener("click", () => {
  window.speechSynthesis.cancel();
  isSpeaking = false;
  playBtn.textContent = "▶ Play narration";
  goPrev();
});

nextBtn.addEventListener("click", () => {
  window.speechSynthesis.cancel();
  isSpeaking = false;
  playBtn.textContent = "▶ Play narration";
  goNext();
});

playBtn.addEventListener("click", playNarration);

// initial page
showPage(0);

