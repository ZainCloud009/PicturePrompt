/**
 * Picture Prompt - Dedicated Prompt Showcase Page Engine
 * Handles URL slug lookup, SEO meta injection, 1-click copying, related prompts & social sharing.
 */

document.addEventListener("DOMContentLoaded", () => {
  initPromptPage();
});

function initPromptPage() {
  initTheme();
  
  const dataset = (window.ALL_PROMPTS_DATA && Array.isArray(window.ALL_PROMPTS_DATA))
    ? window.ALL_PROMPTS_DATA
    : [];

  // Parse prompt identifier from URL query (?p=slug or ?id=slug) or pathname (/prompt/slug)
  const urlParams = new URLSearchParams(window.location.search);
  let promptQuery = urlParams.get("p") || urlParams.get("id");

  if (!promptQuery) {
    // Check if pathname contains /prompt/xyz
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const promptIdx = pathParts.indexOf("prompt");
    if (promptIdx !== -1 && pathParts[promptIdx + 1]) {
      promptQuery = pathParts[promptIdx + 1].replace(".html", "");
    }
  }

  // Lookup prompt in dataset
  let currentPrompt = null;
  if (promptQuery) {
    currentPrompt = dataset.find((item) => 
      item.slug === promptQuery || 
      item.id === promptQuery ||
      item.slug.endsWith(promptQuery) ||
      (item.title && item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").includes(promptQuery.toLowerCase()))
    );
  }

  // Fallback to first prompt if not found
  if (!currentPrompt && dataset.length > 0) {
    currentPrompt = dataset[0];
  }

  if (!currentPrompt) return;

  renderPromptDetails(currentPrompt);
  renderRelatedPrompts(currentPrompt, dataset);
  bindPromptActions(currentPrompt);
  bindGlobalEvents();
}

function renderPromptDetails(item) {
  const modelMap = {
    chatgpt: "ChatGPT (DALL-E 3)",
    gemini: "Google Gemini",
    midjourney: "Midjourney v6",
    bing: "Bing Image Creator",
    flux: "FLUX.1"
  };
  const displayModel = modelMap[item.model] || item.model.toUpperCase();
  const categoryNice = formatCategoryName(item.category);

  // 1. Dynamic SEO Meta Tags
  const fullTitle = `${item.title} — AI Photo Prompt | Picture Prompt`;
  const cleanSnippet = item.promptText ? item.promptText.slice(0, 155).replace(/[\r\n]+/g, " ") : "";
  const metaDescription = `1-Click Copy AI Photo Prompt: "${cleanSnippet}...". Optimized for ${displayModel} with same face consistency.`;
  const canonicalUrl = `https://pictureprompt.world/prompt.html?p=${item.slug}`;

  document.title = fullTitle;
  setElementText("pageTitle", fullTitle);
  setElementAttribute("metaDesc", "content", metaDescription);
  setElementAttribute("canonicalLink", "href", canonicalUrl);

  // Open Graph & Twitter
  setElementAttribute("ogTitle", "content", fullTitle);
  setElementAttribute("ogDesc", "content", metaDescription);
  setElementAttribute("ogUrl", "content", canonicalUrl);
  setElementAttribute("ogImage", "content", item.image);

  setElementAttribute("twTitle", "content", fullTitle);
  setElementAttribute("twDesc", "content", metaDescription);
  setElementAttribute("twUrl", "content", canonicalUrl);
  setElementAttribute("twImage", "content", item.image);

  // Schema.org JSON-LD
  const schemaScript = document.getElementById("schemaScript");
  if (schemaScript) {
    schemaScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ImageObject",
      "name": item.title,
      "description": metaDescription,
      "contentUrl": item.image,
      "thumbnailUrl": item.image,
      "datePublished": item.date || "2026-10-08",
      "author": {
        "@type": "Organization",
        "name": "Picture Prompt",
        "url": "https://pictureprompt.world/"
      },
      "interactionStatistic": [
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/ShareAction",
          "userInteractionCount": item.copies || 100
        },
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/LikeAction",
          "userInteractionCount": item.likes || 25
        }
      ]
    });
  }

  // 2. Breadcrumbs
  const breadcrumbCat = document.getElementById("breadcrumbCategory");
  if (breadcrumbCat) {
    breadcrumbCat.textContent = categoryNice;
    breadcrumbCat.href = `index.html?category=${encodeURIComponent(item.category)}`;
  }
  setElementText("breadcrumbCurrentTitle", item.title);

  // 3. Media & Badges
  const showcaseImg = document.getElementById("showcaseImage");
  if (showcaseImg) {
    showcaseImg.src = item.image;
    showcaseImg.alt = `${item.title} - AI Photo Prompt Preview`;
  }

  setElementText("showcaseModelBadge", displayModel);
  setElementText("showcaseRatioBadge", item.aspectRatio || "9:16");
  
  const isSameFace = item.category === "same-face" || (item.tags && item.tags.some(t => t.toLowerCase().includes("same face")));
  const sameFaceBadge = document.getElementById("showcaseSameFaceBadge");
  if (sameFaceBadge) {
    sameFaceBadge.style.display = isSameFace ? "inline-flex" : "none";
  }

  const faceLockCard = document.getElementById("showcaseFaceLockCard");
  if (faceLockCard) {
    faceLockCard.style.display = isSameFace ? "block" : "block";
  }

  setElementText("showcaseCopies", item.copies || 0);
  setElementText("showcaseLikes", item.likes || 0);

  // 4. Content Showcase
  setElementText("showcaseCategoryTag", categoryNice);
  setElementText("showcaseTitle", item.title);
  setElementText("showcaseModelName", displayModel);
  setElementText("showcasePromptText", item.promptText);

  // 5. Keyword Tags Cloud
  const tagsContainer = document.getElementById("showcaseTagsList");
  if (tagsContainer) {
    tagsContainer.innerHTML = "";
    const tags = Array.isArray(item.tags) ? item.tags : [item.category, item.model];
    tags.forEach((tag) => {
      const tagLink = document.createElement("a");
      tagLink.className = "prompt-tag-pill";
      tagLink.href = `index.html?search=${encodeURIComponent(tag)}`;
      tagLink.innerHTML = `<i class="fa-solid fa-hashtag"></i> ${tag}`;
      tagsContainer.appendChild(tagLink);
    });
  }

  // View More Category Button
  const viewMoreBtn = document.getElementById("viewMoreCategoryBtn");
  if (viewMoreBtn) {
    viewMoreBtn.href = `index.html?category=${encodeURIComponent(item.category)}`;
    viewMoreBtn.innerHTML = `Explore All ${categoryNice} Prompts <i class="fa-solid fa-arrow-right"></i>`;
  }
}

function renderRelatedPrompts(currentPrompt, dataset) {
  const container = document.getElementById("relatedPromptsGrid");
  if (!container) return;

  // Filter similar prompts: same category first, or sharing tags, excluding current
  let related = dataset.filter((p) => p.id !== currentPrompt.id && p.category === currentPrompt.category);
  
  if (related.length < 6) {
    const additional = dataset.filter((p) => p.id !== currentPrompt.id && p.category !== currentPrompt.category);
    related = [...related, ...additional];
  }

  // Shuffle related prompts slightly for variety
  related = shuffleList(related).slice(0, 6);

  container.innerHTML = "";
  related.forEach((item) => {
    const modelNice = item.model.toUpperCase();
    const isSameFace = item.category === "same-face" || (item.tags && item.tags.includes("same face"));

    const card = document.createElement("article");
    card.className = "prompt-card";
    card.innerHTML = `
      <div class="card-image-box">
        <a href="prompt.html?p=${item.slug}" class="card-img-link" aria-label="View ${escapeHTML(item.title)}">
          <img 
            src="${item.image}" 
            alt="${escapeHTML(item.title)} - AI Photo Prompt" 
            loading="lazy"
            referrerpolicy="no-referrer"
            onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=80'"
          >
        </a>
        <div class="card-badges-top">
          <span class="badge-tag badge-model">${modelNice}</span>
          ${isSameFace ? '<span class="badge-tag badge-sameface"><i class="fa-solid fa-lock"></i> Same Face</span>' : `<span class="badge-tag">${item.aspectRatio}</span>`}
        </div>
      </div>
      <div class="card-content">
        <h3 class="card-title">
          <a href="prompt.html?p=${item.slug}">${escapeHTML(item.title)}</a>
        </h3>
        <p class="card-prompt-snippet">${escapeHTML(item.promptText)}</p>
        <div class="card-footer-meta">
          <div class="card-stats">
            <span><i class="fa-regular fa-copy"></i> ${item.copies}</span>
            <span><i class="fa-regular fa-heart"></i> ${item.likes}</span>
          </div>
          <div class="card-actions">
            <button class="copy-card-btn" data-copy="${escapeHTML(item.promptText)}" title="Copy Prompt">
              <i class="fa-solid fa-copy"></i> Copy
            </button>
            <a href="prompt.html?p=${item.slug}" class="icon-action-btn" title="View Full Page" aria-label="View Full Page">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </div>
        </div>
      </div>
    `;

    // Copy button listener
    const copyBtn = card.querySelector(".copy-card-btn");
    copyBtn.addEventListener("click", () => {
      copyToClipboard(item.promptText);
    });

    container.appendChild(card);
  });
}

function bindPromptActions(item) {
  // Primary copy buttons
  const primaryCopyBtn = document.getElementById("primaryCopyBtn");
  const copyPromptCodeBtn = document.getElementById("copyPromptCodeBtn");

  const copyAction = () => {
    copyToClipboard(item.promptText);
    const btnText = document.getElementById("primaryCopyBtnText");
    if (btnText) {
      const original = btnText.textContent;
      btnText.textContent = "Copied to Clipboard!";
      setTimeout(() => {
        btnText.textContent = original;
      }, 2000);
    }
  };

  if (primaryCopyBtn) primaryCopyBtn.addEventListener("click", copyAction);
  if (copyPromptCodeBtn) copyPromptCodeBtn.addEventListener("click", copyAction);

  // Like & Bookmark Sync
  const likeBtn = document.getElementById("toggleLikePromptBtn");
  const saveBtn = document.getElementById("toggleSavePromptBtn");
  const likesCountEl = document.getElementById("showcaseLikes");

  let likedSet = new Set(JSON.parse(localStorage.getItem("pp_likes") || "[]"));
  let savedSet = new Set(JSON.parse(localStorage.getItem("pp_favorites") || "[]"));

  const updateLikeUI = () => {
    const isLiked = likedSet.has(item.id);
    const icon = document.getElementById("likeIcon");
    if (icon) {
      icon.className = isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart";
      icon.style.color = isLiked ? "#ec4899" : "";
    }
  };

  const updateSaveUI = () => {
    const isSaved = savedSet.has(item.id);
    const icon = document.getElementById("saveIcon");
    if (icon) {
      icon.className = isSaved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark";
      icon.style.color = isSaved ? "#f59e0b" : "";
    }
    const navSaved = document.getElementById("savedCountNav");
    if (navSaved) navSaved.textContent = savedSet.size;
  };

  updateLikeUI();
  updateSaveUI();

  if (likeBtn) {
    likeBtn.addEventListener("click", () => {
      if (likedSet.has(item.id)) {
        likedSet.delete(item.id);
        item.likes = Math.max(0, item.likes - 1);
      } else {
        likedSet.add(item.id);
        item.likes = (item.likes || 0) + 1;
        showToast("Added to liked prompts! ❤️");
      }
      localStorage.setItem("pp_likes", JSON.stringify([...likedSet]));
      if (likesCountEl) likesCountEl.textContent = item.likes;
      updateLikeUI();
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (savedSet.has(item.id)) {
        savedSet.delete(item.id);
        showToast("Removed from saved bookmarks.");
      } else {
        savedSet.add(item.id);
        showToast("Saved to your bookmarks! 🔖");
      }
      localStorage.setItem("pp_favorites", JSON.stringify([...savedSet]));
      updateSaveUI();
    });
  }

  // Social Share Buttons
  const currentUrl = window.location.href;
  const shareText = encodeURIComponent(`Check out this viral AI Photo Prompt: ${item.title}`);
  const encodedUrl = encodeURIComponent(currentUrl);

  bindShareButton("shareWhatsApp", `https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`);
  bindShareButton("shareTwitter", `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`);
  bindShareButton("shareFacebook", `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
  bindShareButton("sharePinterest", `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(item.image)}&description=${shareText}`);

  const shareCopyLink = document.getElementById("shareCopyLink");
  if (shareCopyLink) {
    shareCopyLink.addEventListener("click", () => {
      copyToClipboard(currentUrl, "Page link copied to clipboard!");
    });
  }
}

function bindGlobalEvents() {
  // Search input in header
  const searchInput = document.getElementById("headerSearchInput");
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && searchInput.value.trim()) {
        window.location.href = `index.html?search=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }

  // Floating back to top
  const backToTopBtn = document.getElementById("backToTopBtn");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    }, { passive: true });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

// Light / Dark Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem("pp_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("pp_theme", next);
      updateThemeIcon(next);
      showToast(`Switched to ${next === "light" ? "Light" : "Dark"} mode`);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.querySelector("#themeToggleBtn i");
  if (icon) {
    icon.className = theme === "light" ? "fa-solid fa-moon" : "fa-solid fa-sun";
  }
}

// Utility Helpers
function copyToClipboard(text, customMsg = null) {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(customMsg || "Prompt copied to clipboard! 📋");
    }).catch(() => fallbackCopy(text, customMsg));
  } else {
    fallbackCopy(text, customMsg);
  }
}

function fallbackCopy(text, customMsg) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
    showToast(customMsg || "Prompt copied to clipboard! 📋");
  } catch (err) {
    showToast("Failed to copy automatically. Please select text.");
  }
  document.body.removeChild(textArea);
}

function showToast(msg) {
  const toast = document.getElementById("toastNotification");
  const toastMsg = document.getElementById("toastMessage");
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.add("show");
  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function bindShareButton(id, url) {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener("click", () => {
      window.open(url, "_blank", "width=600,height=500,scrollbars=yes,resizable=yes");
    });
  }
}

function formatCategoryName(cat) {
  const catNames = {
    "all": "All Prompts",
    "same-face": "Same Face Locked",
    "boys": "Boys & Men",
    "girls": "Girls & Women",
    "couples": "Couples",
    "vehicles": "Thar & Bikes",
    "aesthetic": "Aesthetic & Vibe",
    "traditional": "Ethnic & Saree",
    "professional": "Professional Headshot",
    "cyberpunk": "Cyberpunk & Neon",
    "vintage": "Vintage & 90s Film",
    "3d-avatar": "3D & Anime"
  };
  return catNames[cat] || cat;
}

function shuffleList(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function setElementText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setElementAttribute(id, attr, val) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, val);
}

function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
