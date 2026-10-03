const PROJECT = {
  contract: "3sL58KKh2QdNSfN9VRz8bHGGU5zStdfManVHCTkhpump",
  buyUrl: "https://dexscreener.com/solana/3sL58KKh2QdNSfN9VRz8bHGGU5zStdfManVHCTkhpump",
  xUrl: "https://x.com/Pump_Inu",
  telegramUrl: "https://t.me/PumpInu_Official",
  dexUrl: "https://dexscreener.com/solana/3sL58KKh2QdNSfN9VRz8bHGGU5zStdfManVHCTkhpump",
  founderXUrl: "https://x.com/Pump_Inu",
  tiktokUrl: "https://t.me/PumpInu_Official",
  youtubeUrl: "https://t.me/PumpInu_Official",
};

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  nav.classList.remove("open");
  document.body.classList.remove("menu-open");
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  nav.classList.toggle("open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

function wireLinks(selector, url) {
  document.querySelectorAll(selector).forEach((link) => {
    link.href = url;
    if (url && url.startsWith("http")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  });
}

wireLinks(".js-buy-link", PROJECT.buyUrl);
wireLinks(".js-x-link", PROJECT.xUrl);
wireLinks(".js-telegram-link", PROJECT.telegramUrl);
wireLinks(".js-dex-link", PROJECT.dexUrl);
wireLinks(".js-founder-x-link", PROJECT.founderXUrl);
wireLinks(".js-tiktok-link", PROJECT.tiktokUrl);
wireLinks(".js-youtube-link", PROJECT.youtubeUrl);

// Dynamic Chart Initialization
function initChart() {
  const chartContainer = document.getElementById("chart-container");
  if (chartContainer) {
    if (PROJECT.contract === "TBA" || !PROJECT.contract) {
      chartContainer.innerHTML = `
        <div class="chart-placeholder">
          <div class="placeholder-icon">🔥</div>
          <h3>CHART LAUNCHING SOON</h3>
          <p>The official contract address has not launched yet. Once announced, the live Dexscreener chart will load here.</p>
          <a class="button button-gold js-telegram-link" href="${PROJECT.telegramUrl}" target="_blank" rel="noopener noreferrer">Join Telegram for Launch <span>↗</span></a>
        </div>
      `;
    } else {
      chartContainer.innerHTML = `<iframe src="https://dexscreener.com/solana/${PROJECT.contract}?embed=1&theme=dark&trades=0&info=0"></iframe>`;
    }
  }
}
initChart();

const shortContract = PROJECT.contract.length > 20
  ? `${PROJECT.contract.slice(0, 7)}…${PROJECT.contract.slice(-6)}`
  : PROJECT.contract;
document.querySelectorAll(".js-contract-short").forEach((el) => { el.textContent = shortContract; });
document.querySelectorAll(".js-contract-full").forEach((el) => { el.textContent = PROJECT.contract; });

const toast = document.querySelector(".toast");
let toastTimer;
document.querySelectorAll(".js-copy").forEach((button) => {
  button.addEventListener("click", async () => {
    if (PROJECT.contract === "TBA" || PROJECT.contract === "COMING SOON") {
      toast.textContent = "Contract address will be announced soon!";
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
      return;
    }
    try {
      await navigator.clipboard.writeText(PROJECT.contract);
    } catch {
      const input = document.createElement("textarea");
      input.value = PROJECT.contract;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    toast.textContent = "Contract copied!";
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

document.getElementById("year").textContent = new Date().getFullYear();

// FAQ Accordion Toggle
document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach((el) => el.classList.remove("open"));
    if (!isOpen) {
      item.classList.add("open");
    }
  });
});

// Dexscreener API Data Fetching
async function fetchDexData() {
  if (PROJECT.contract === "TBA" || !PROJECT.contract) {
    document.getElementById("stat-mcap").textContent = "TBA";
    document.getElementById("stat-price").textContent = "TBA";
    document.getElementById("stat-volume").textContent = "TBA";
    document.getElementById("stat-change").textContent = "TBA";
    return;
  }
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${PROJECT.contract}`);
    if (!response.ok) throw new Error("Failed to fetch data");
    const data = await response.json();
    
    const pair = data.pairs && data.pairs[0];
    if (pair) {
      const price = parseFloat(pair.priceUsd || 0);
      const mcap = parseFloat(pair.marketCap || pair.fdv || 0);
      const volume = parseFloat((pair.volume && pair.volume.h24) || 0);
      const change = parseFloat((pair.priceChange && pair.priceChange.h24) || 0);

      const formatUsd = (num) => {
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
        return `$${num.toFixed(2)}`;
      };

      const formatPrice = (num) => {
        if (num === 0) return "$0.00";
        if (num < 0.0001) return `$${num.toFixed(6)}`;
        if (num < 0.01) return `$${num.toFixed(4)}`;
        return `$${num.toFixed(2)}`;
      };

      const formatChange = (num) => {
        const prefix = num > 0 ? "+" : "";
        return `${prefix}${num.toFixed(2)}%`;
      };

      document.getElementById("stat-mcap").textContent = formatUsd(mcap);
      document.getElementById("stat-price").textContent = formatPrice(price);
      document.getElementById("stat-volume").textContent = formatUsd(volume);
      
      const changeEl = document.getElementById("stat-change");
      changeEl.textContent = formatChange(change);
      if (change < 0) {
        changeEl.style.color = "var(--gold)"; // Red highlight in theme
      } else {
        changeEl.style.color = "var(--lime)"; // Green highlight in theme
      }
    }
  } catch (error) {
    console.error("Dexscreener data load error:", error);
    document.getElementById("stat-mcap").textContent = "TBA";
    document.getElementById("stat-price").textContent = "TBA";
    document.getElementById("stat-volume").textContent = "TBA";
    document.getElementById("stat-change").textContent = "TBA";
  }
}

fetchDexData();
setInterval(fetchDexData, 30000);

// Preloader Loading Progress Logic
const preloader = document.getElementById("preloader");
const preloaderBar = document.getElementById("preloader-bar");

let loaderProgress = 0;
const loaderInterval = setInterval(() => {
  if (loaderProgress < 85) {
    loaderProgress += Math.random() * 15;
    if (loaderProgress > 85) loaderProgress = 85;
    if (preloaderBar) preloaderBar.style.width = `${loaderProgress}%`;
  }
}, 80);

function completeLoader() {
  clearInterval(loaderInterval);
  if (preloaderBar) preloaderBar.style.width = "100%";
  setTimeout(() => {
    if (preloader) {
      preloader.classList.add("fade-out");
    }
  }, 350);
}

// Complete loading when the window is fully loaded
window.addEventListener("load", completeLoader);

// Safety timeout: force preloader closure after 2.5 seconds
setTimeout(completeLoader, 2500);

// ==========================================================================
// Meme Generator Logic
// ==========================================================================
const memeState = {
  image: null,
  imageSrc: 'images/rave.jpg',
  topText: '',
  bottomText: '',
  fontSize: 40,
  fontFamily: 'Impact',
};

function initMemeGenerator() {
  const canvas = document.getElementById('meme-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const topTextInput = document.getElementById('top-text-input');
  const bottomTextInput = document.getElementById('bottom-text-input');
  const fontSizeSlider = document.getElementById('font-size-slider');
  const fontSizeVal = document.getElementById('font-size-val');
  const fontFamilySelect = document.getElementById('font-family-select');
  const downloadBtn = document.getElementById('download-meme-btn');
  const resetBtn = document.getElementById('reset-meme-btn');
  const fileUpload = document.getElementById('custom-image-upload');
  const thumbButtons = document.querySelectorAll('.thumb-card[data-src]');
  
  function drawMeme() {
    if (!memeState.image) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cw = canvas.width;
    const ch = canvas.height;
    const imgWidth = memeState.image.width;
    const imgHeight = memeState.image.height;
    
    // Cover scale drawing
    const ratio = Math.max(cw / imgWidth, ch / imgHeight);
    const x = (cw - imgWidth * ratio) / 2;
    const y = (ch - imgHeight * ratio) / 2;
    
    ctx.drawImage(memeState.image, x, y, imgWidth * ratio, imgHeight * ratio);
    
    // Setup stroke and fill for classic impact meme styling
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(4, memeState.fontSize / 6);
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    
    ctx.font = `900 ${memeState.fontSize}px ${memeState.fontFamily}`;
    
    // Draw top text (wrapped to fit)
    if (memeState.topText) {
      ctx.textBaseline = 'top';
      const lines = wrapText(ctx, memeState.topText.toUpperCase(), cw - 40);
      let yOffset = 25;
      lines.forEach(line => {
        ctx.strokeText(line, cw / 2, yOffset);
        ctx.fillText(line, cw / 2, yOffset);
        yOffset += memeState.fontSize * 1.15;
      });
    }
    
    // Draw bottom text (wrapped to fit)
    if (memeState.bottomText) {
      ctx.textBaseline = 'bottom';
      const lines = wrapText(ctx, memeState.bottomText.toUpperCase(), cw - 40);
      let yOffset = ch - 25;
      for (let i = lines.length - 1; i >= 0; i--) {
        ctx.strokeText(lines[i], cw / 2, yOffset);
        ctx.fillText(lines[i], cw / 2, yOffset);
        yOffset -= memeState.fontSize * 1.15;
      }
    }
  }

  function wrapText(context, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(currentLine.trim());
        currentLine = words[n] + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine.trim());
    return lines;
  }

  function loadMemeTemplate(src) {
    const img = new Image();
    img.onload = function() {
      memeState.image = img;
      drawMeme();
    };
    img.src = src;
  }
  
  // Event listeners
  topTextInput.addEventListener('input', (e) => {
    memeState.topText = e.target.value;
    drawMeme();
  });
  
  bottomTextInput.addEventListener('input', (e) => {
    memeState.bottomText = e.target.value;
    drawMeme();
  });
  
  fontSizeSlider.addEventListener('input', (e) => {
    memeState.fontSize = parseInt(e.target.value, 10);
    fontSizeVal.textContent = `${memeState.fontSize}px`;
    drawMeme();
  });
  
  fontFamilySelect.addEventListener('change', (e) => {
    memeState.fontFamily = e.target.value;
    drawMeme();
  });
  
  thumbButtons.forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.template-thumbnails .thumb-card').forEach(el => el.classList.remove('active'));
      button.classList.add('active');
      const src = button.getAttribute('data-src');
      loadMemeTemplate(src);
    });
  });
  
  fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        document.querySelectorAll('.template-thumbnails .thumb-card').forEach(el => el.classList.remove('active'));
        document.querySelector('.upload-thumb').classList.add('active');
        loadMemeTemplate(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  });
  
  resetBtn.addEventListener('click', () => {
    topTextInput.value = '';
    bottomTextInput.value = '';
    fontSizeSlider.value = 40;
    fontSizeVal.textContent = '40px';
    fontFamilySelect.value = 'Impact';
    
    memeState.topText = '';
    memeState.bottomText = '';
    memeState.fontSize = 40;
    memeState.fontFamily = 'Impact';
    
    document.querySelectorAll('.template-thumbnails .thumb-card').forEach(el => el.classList.remove('active'));
    const defaultCard = document.querySelector('.thumb-card[data-src="images/rave.jpg"]');
    if (defaultCard) {
      defaultCard.classList.add('active');
    }
    loadMemeTemplate('images/rave.jpg');
  });
  
  downloadBtn.addEventListener('click', () => {
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'pump-inu-meme.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading meme:', err);
      alert('Could not download image directly. Try right-clicking the canvas to save it.');
    }
  });
  
  // Initial load
  loadMemeTemplate(memeState.imageSrc);
}

// Wire up on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMemeGenerator);
} else {
  initMemeGenerator();
}

