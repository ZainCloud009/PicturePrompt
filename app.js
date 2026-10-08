/**
 * PICTURE PROMPT (pictureprompt.world)
 * Interactive Engine with Infinite Scroll & 900+ AI Photo Prompts Dataset
 */

// Fallback seed prompts in case external data file is delayed
const FALLBACK_SEED_PROMPTS = [
  {
    id: "seed-1",
    title: "Red Aesthetic Boy — Same Face Locked",
    category: "same-face",
    model: "chatgpt",
    aspectRatio: "9:16",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80",
    copies: 384,
    likes: 142,
    date: "2026-03-28",
    tags: ["same face", "aesthetic", "boy", "red light", "cinematic", "portrait"],
    promptText: "aspect ratio 9:16, Keep the person exactly as shown in the reference image with 100% identical facial features, bone structure, eye shape, and realistic skin texture. Ultra-realistic cinematic 4K vertical portrait of the young man wearing an oversized crimson red hoodie with black drawstrings. Soft crimson ambient neon lighting casting dramatic highlights on the cheekbones, dark moody urban background with blurred city bokeh, shot on 85mm f/1.4 lens, shallow depth of field, natural candid posture."
  },
  {
    id: "seed-2",
    title: "Thar Lifestyle Outdoor Portrait ✨🔥",
    category: "vehicles",
    model: "chatgpt",
    aspectRatio: "4:5",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=700&q=80",
    copies: 620,
    likes: 285,
    date: "2026-04-01",
    tags: ["thar", "car photoshoot", "boy", "lifestyle", "mahindra", "instagram"],
    promptText: "Create an ultra-realistic vertical 4:5 lifestyle fashion photograph of a handsome young South Asian man casually leaning beside a glossy pitch-black Mahindra Thar 4x4 SUV parked in an upscale modern city avenue during golden hour. The man is wearing a fitted olive green utility overshirt over a black fitted crewneck t-shirt, relaxed dark cargo trousers, and clean white sneakers, with stylish dark aviator sunglasses. Cinematic golden sunlight reflecting softly off the car's metallic body, natural depth of field, shot on Sony A7IV 50mm f/1.2 GM lens."
  },
  {
    id: "seed-3",
    title: "Waterfall Photoshoot | Bali Travel Aesthetic",
    category: "girls",
    model: "gemini",
    aspectRatio: "9:16",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=80",
    copies: 495,
    likes: 210,
    date: "2026-03-30",
    tags: ["waterfall", "girl", "travel", "bali", "aesthetic", "nature"],
    promptText: "Ultra-photorealistic vertical 9:16 travel editorial portrait. Recreate the subject using the uploaded photo as exact facial reference: retain 100% authentic facial features and serene expression. A graceful young woman standing naturally near the base of a majestic tropical jungle waterfall in Bali. Gentle water mist in the air creating ethereal light rays from the sun filtering through dense emerald palm leaves. She wears a relaxed beige linen sleeveless resort dress, hair wet and naturally flowing, shot on Canon EOS R5 with 35mm lens, high dynamic range."
  },
  {
    id: "seed-4",
    title: "Kawasaki Ninja ZX-10R Action Chase 🏍️💨",
    category: "vehicles",
    model: "chatgpt",
    aspectRatio: "9:16",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=700&q=80",
    copies: 812,
    likes: 390,
    date: "2026-04-02",
    tags: ["bike", "kawasaki ninja", "action", "cinematic", "speed", "boy"],
    promptText: "🔥 COPY-PASTE AI PHOTO PROMPT — KAWASAKI NINJA ACTION CHASE | SAME FACE LOCKED. Create an ultra-photorealistic, high-end cinematic vertical 9:16 action photograph. The subject must have the exact facial features, jawline, and skin tone of the reference image. The man is riding an aggressive lime-green and black Kawasaki Ninja ZX-10R superbike on a curving coastal highway. Wearing a sleek matte black Dainese leather riding jacket with carbon fiber shoulder sliders. Dynamic motion blur in the asphalt and guardrails conveying high speed, sharp focus on the rider's determined eyes through a slightly raised smoked helmet visor, golden hour sunset glow."
  },
  {
    id: "seed-5",
    title: "Elegant Black Saree Studio Portrait ✨",
    category: "traditional",
    model: "gemini",
    aspectRatio: "4:5",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80",
    copies: 730,
    likes: 340,
    date: "2026-03-25",
    tags: ["saree", "traditional", "indian", "studio", "luxury", "girl"],
    promptText: "Create a full-length luxury studio portrait of an elegant South Asian woman (exact facial features matching uploaded reference image). She is draped in a sophisticated jet-black organza saree with delicate golden zari border detailing, paired with a sequined sleeveless V-neck designer blouse. Minimalist antique gold jhumka earrings and delicate glass bangles. Dramatic Rembrandt studio lighting with a warm subtle golden rim light outlining her silhouette against a textured charcoal backdrop, shot on Hasselblad H6D-100c, 100mm lens, ultra-fine fabric texture."
  }
];

class PicturePromptApp {
  constructor() {
    this.allPrompts = [];
    this.filteredList = [];
    this.renderedCount = 0;
    this.pageSize = 24;
    this.isLoadingMore = false;
    this.loopCycle = 0;

    this.currentCategory = "all";
    this.currentModel = "all";
    this.searchQuery = "";
    this.sortBy = "popular";
    this.favorites = new Set();
    this.likedPrompts = new Set();
    this.showingOnlyFavorites = false;
    this.activeModalPrompt = null;

    this.init();
  }

  init() {
    this.loadStateFromStorage();
    this.cacheDOMElements();
    this.bindEvents();
    this.setupInfiniteScroll();
    this.applyFilterAndRender();
    this.updateCustomizerOutput();
    this.updateFavoritesCountBadge();
  }

  // Load from prompts_data.js and LocalStorage
  loadStateFromStorage() {
    // 1. Load massive dataset (930+ prompts)
    const dataset = (window.ALL_PROMPTS_DATA && Array.isArray(window.ALL_PROMPTS_DATA))
      ? window.ALL_PROMPTS_DATA
      : FALLBACK_SEED_PROMPTS;

    // 2. Load user-added custom prompts
    const savedCustom = localStorage.getItem("pp_custom_prompts");
    const customList = savedCustom ? JSON.parse(savedCustom) : [];

    // Combine custom prompts on top
    this.allPrompts = [...customList, ...dataset];

    // Load favorites & likes
    const savedFavs = localStorage.getItem("pp_favorites");
    if (savedFavs) {
      try {
        this.favorites = new Set(JSON.parse(savedFavs));
      } catch (e) {
        this.favorites = new Set();
      }
    }

    const savedLikes = localStorage.getItem("pp_likes");
    if (savedLikes) {
      try {
        this.likedPrompts = new Set(JSON.parse(savedLikes));
      } catch (e) {
        this.likedPrompts = new Set();
      }
    }
  }

  saveCustomPromptsToStorage(newPrompt) {
    const savedCustom = localStorage.getItem("pp_custom_prompts");
    const customList = savedCustom ? JSON.parse(savedCustom) : [];
    customList.unshift(newPrompt);
    localStorage.setItem("pp_custom_prompts", JSON.stringify(customList));
  }

  saveFavoritesToStorage() {
    localStorage.setItem("pp_favorites", JSON.stringify([...this.favorites]));
  }

  saveLikesToStorage() {
    localStorage.setItem("pp_likes", JSON.stringify([...this.likedPrompts]));
  }

  cacheDOMElements() {
    this.promptsGrid = document.getElementById("promptsGrid");
    this.emptyState = document.getElementById("emptyState");
    this.visibleCountEl = document.getElementById("visibleCount");
    this.savedCountEl = document.getElementById("savedCount");
    this.searchInput = document.getElementById("searchInput");
    this.sortSelect = document.getElementById("sortSelect");
    this.categoryNav = document.getElementById("categoryNav");
    this.modelFilter = document.getElementById("modelFilter");
    this.favoritesBtn = document.getElementById("favoritesBtn");
    this.addPromptBtn = document.getElementById("addPromptBtn");
    this.customizerBtn = document.getElementById("customizerBtn");

    // Infinite Scroll
    this.scrollSentinel = document.getElementById("scrollSentinel");
    this.scrollLoader = document.getElementById("scrollLoader");

    // Modals
    this.detailModal = document.getElementById("promptDetailModal");
    this.closeDetailModalBtn = document.getElementById("closeDetailModal");
    this.addModal = document.getElementById("addPromptModal");
    this.closeAddModalBtn = document.getElementById("closeAddModal");
    this.cancelAddBtn = document.getElementById("cancelAddBtn");
    this.addPromptForm = document.getElementById("addPromptForm");
    this.infoModal = document.getElementById("infoModal");
    this.closeInfoModalBtn = document.getElementById("closeInfoModal");

    // Toast
    this.toastNotification = document.getElementById("toastNotification");
    this.toastMessage = document.getElementById("toastMessage");

    // Customizer Elements
    this.custSubject = document.getElementById("custSubject");
    this.custOutfit = document.getElementById("custOutfit");
    this.custLocation = document.getElementById("custLocation");
    this.custLighting = document.getElementById("custLighting");
    this.custCamera = document.getElementById("custCamera");
    this.custFaceLock = document.getElementById("custFaceLock");
    this.customPromptOutput = document.getElementById("customPromptOutput");
    this.copyCustomPromptBtn = document.getElementById("copyCustomPromptBtn");
  }

  bindEvents() {
    // Search input
    this.searchInput.addEventListener("input", (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.applyFilterAndRender();
    });

    // Keyboard shortcut (Ctrl+K or Cmd+K)
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.searchInput.focus();
      }
    });

    // Quick tag clicks in Hero
    document.querySelectorAll(".quick-tag").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tag = btn.getAttribute("data-tag");
        this.searchInput.value = tag;
        this.searchQuery = tag.toLowerCase();
        this.applyFilterAndRender();
        this.scrollToGallery();
      });
    });

    // Category navigation clicks
    this.categoryNav.addEventListener("click", (e) => {
      const btn = e.target.closest(".cat-btn");
      if (!btn) return;
      this.categoryNav.querySelectorAll(".cat-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      this.currentCategory = btn.getAttribute("data-category");
      this.showingOnlyFavorites = false;
      this.applyFilterAndRender();
    });

    // Model filter clicks
    this.modelFilter.addEventListener("click", (e) => {
      const btn = e.target.closest(".model-btn");
      if (!btn) return;
      this.modelFilter.querySelectorAll(".model-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      this.currentModel = btn.getAttribute("data-model");
      this.applyFilterAndRender();
    });

    // Sort select
    this.sortSelect.addEventListener("change", (e) => {
      this.sortBy = e.target.value;
      this.applyFilterAndRender();
    });

    // Favorites toggle button
    this.favoritesBtn.addEventListener("click", () => {
      this.showingOnlyFavorites = !this.showingOnlyFavorites;
      if (this.showingOnlyFavorites) {
        this.favoritesBtn.classList.add("btn-primary");
        this.favoritesBtn.classList.remove("btn-outline");
      } else {
        this.favoritesBtn.classList.remove("btn-primary");
        this.favoritesBtn.classList.add("btn-outline");
      }
      this.applyFilterAndRender();
      this.scrollToGallery();
    });

    // Customizer Scroll Button
    this.customizerBtn.addEventListener("click", () => {
      document.getElementById("customizerSection").scrollIntoView({ behavior: "smooth" });
    });

    // Reset filters button
    document.getElementById("resetFiltersBtn").addEventListener("click", () => {
      this.resetAllFilters();
    });

    // Add Prompt Modal triggers
    this.addPromptBtn.addEventListener("click", () => {
      this.addModal.showModal();
    });

    this.closeAddModalBtn.addEventListener("click", () => {
      this.addModal.close();
    });

    this.cancelAddBtn.addEventListener("click", () => {
      this.addModal.close();
    });

    this.addPromptForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleAddNewPrompt();
    });

    // Detail Modal triggers
    this.closeDetailModalBtn.addEventListener("click", () => {
      this.detailModal.close();
    });

    document.getElementById("copyModalPromptBtn").addEventListener("click", () => {
      if (this.activeModalPrompt) {
        this.copyPromptText(this.activeModalPrompt.promptText, this.activeModalPrompt.id);
      }
    });

    document.getElementById("modalPrimaryCopyBtn").addEventListener("click", () => {
      if (this.activeModalPrompt) {
        this.copyPromptText(this.activeModalPrompt.promptText, this.activeModalPrompt.id);
      }
    });

    // Direct Launch AI buttons
    document.getElementById("launchChatGPT").addEventListener("click", () => {
      if (this.activeModalPrompt) {
        this.copyPromptText(this.activeModalPrompt.promptText, this.activeModalPrompt.id);
      }
    });

    document.getElementById("launchGemini").addEventListener("click", () => {
      if (this.activeModalPrompt) {
        this.copyPromptText(this.activeModalPrompt.promptText, this.activeModalPrompt.id);
      }
    });

    // Modal click out to close
    this.detailModal.addEventListener("click", (e) => {
      if (e.target === this.detailModal) this.detailModal.close();
    });
    this.addModal.addEventListener("click", (e) => {
      if (e.target === this.addModal) this.addModal.close();
    });
    this.infoModal.addEventListener("click", (e) => {
      if (e.target === this.infoModal) this.infoModal.close();
    });
    this.closeInfoModalBtn.addEventListener("click", () => {
      this.infoModal.close();
    });

    // Customizer input changes
    [
      this.custSubject,
      this.custOutfit,
      this.custLocation,
      this.custLighting,
      this.custCamera,
      this.custFaceLock
    ].forEach((input) => {
      input.addEventListener("input", () => this.updateCustomizerOutput());
      input.addEventListener("change", () => this.updateCustomizerOutput());
    });

    this.copyCustomPromptBtn.addEventListener("click", () => {
      const generated = this.customPromptOutput.textContent.trim();
      this.copyPromptText(generated);
    });

    // Footer info links
    document.getElementById("aboutLink").addEventListener("click", (e) => {
      e.preventDefault();
      this.showInfoModal("About Picture Prompt", `
        <p><strong>Picture Prompt (pictureprompt.world)</strong> is a massive global directory of over 10,000+ AI photography prompts for ChatGPT, Google Gemini, Midjourney, and Bing Image Creator.</p>
        <p style="margin-top: 0.75rem;">Curated for social media influencers and creators wanting 1-click photorealistic results with identical facial consistency (Same Face Lock) and high viral appeal.</p>
      `);
    });

    document.getElementById("privacyLink").addEventListener("click", (e) => {
      e.preventDefault();
      this.showInfoModal("Privacy Policy", `
        <p>At <strong>Picture Prompt</strong>, we respect user privacy. All prompt bookmarks and favorites are stored strictly locally in your browser's LocalStorage.</p>
        <p style="margin-top: 0.75rem;">No user tracking, personal data collection, or account sign-up is required to copy or browse prompts.</p>
      `);
    });

    document.getElementById("termsLink").addEventListener("click", (e) => {
      e.preventDefault();
      this.showInfoModal("Terms of Service", `
        <p>All prompts hosted on Picture Prompt are completely free for personal and commercial creative work.</p>
        <p style="margin-top: 0.75rem;">You may freely generate, alter, and monetize images produced with these prompts on your AI generation platforms.</p>
      `);
    });

    document.getElementById("dmcaLink").addEventListener("click", (e) => {
      e.preventDefault();
      this.showInfoModal("DMCA & Copyright", `
        <p>Picture Prompt hosts community prompts and creative text descriptions. All images are displayed for illustrative reference purposes.</p>
        <p style="margin-top: 0.75rem;">If you are a copyright owner and wish to request content removal, contact us with domain verification for immediate compliance.</p>
      `);
    });

    // Footer category filter links
    document.querySelectorAll(".footer-filter-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const cat = link.getAttribute("data-category");
        const btn = document.querySelector(`.cat-btn[data-category="${cat}"]`);
        if (btn) btn.click();
        this.scrollToGallery();
      });
    });

    // Back to top floating button
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

  // Set up Infinite Scroll Engine
  setupInfiniteScroll() {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        const first = entries[0];
        if (first.isIntersecting && !this.isLoadingMore) {
          this.loadNextBatch();
        }
      }, {
        root: null,
        rootMargin: "350px",
        threshold: 0.05
      });

      if (this.scrollSentinel) {
        observer.observe(this.scrollSentinel);
      }
    } else {
      // Fallback window scroll listener
      window.addEventListener("scroll", () => {
        if (this.isLoadingMore) return;
        const scrollPosition = window.innerHeight + window.scrollY;
        const bodyHeight = document.documentElement.offsetHeight - 450;
        if (scrollPosition >= bodyHeight) {
          this.loadNextBatch();
        }
      });
    }
  }

  scrollToGallery() {
    this.promptsGrid.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  showInfoModal(title, html) {
    document.getElementById("infoModalTitle").textContent = title;
    document.getElementById("infoModalBody").innerHTML = html;
    this.infoModal.showModal();
  }

  resetAllFilters() {
    this.currentCategory = "all";
    this.currentModel = "all";
    this.searchQuery = "";
    this.sortBy = "popular";
    this.showingOnlyFavorites = false;
    this.searchInput.value = "";
    this.sortSelect.value = "popular";

    this.categoryNav.querySelectorAll(".cat-btn").forEach((b) => b.classList.remove("active"));
    document.querySelector('.cat-btn[data-category="all"]').classList.add("active");

    this.modelFilter.querySelectorAll(".model-btn").forEach((b) => b.classList.remove("active"));
    document.querySelector('.model-btn[data-model="all"]').classList.add("active");

    this.favoritesBtn.classList.remove("btn-primary");
    this.favoritesBtn.classList.add("btn-outline");

    this.applyFilterAndRender();
  }

  updateFavoritesCountBadge() {
    this.savedCountEl.textContent = this.favorites.size;
  }

  // Filter & Sorting Computation
  computeFilteredList() {
    return this.allPrompts
      .filter((item) => {
        // Saved favorites filter
        if (this.showingOnlyFavorites && !this.favorites.has(item.id)) {
          return false;
        }

        // Category filter
        if (this.currentCategory !== "all" && item.category !== this.currentCategory) {
          return false;
        }

        // Model filter
        if (this.currentModel !== "all" && item.model !== this.currentModel) {
          return false;
        }

        // Search Query filter
        if (this.searchQuery) {
          const matchTitle = item.title.toLowerCase().includes(this.searchQuery);
          const matchPrompt = item.promptText.toLowerCase().includes(this.searchQuery);
          const matchCategory = item.category.toLowerCase().includes(this.searchQuery);
          const matchModel = item.model.toLowerCase().includes(this.searchQuery);
          const matchTags = item.tags && item.tags.some((t) => t.toLowerCase().includes(this.searchQuery));

          return matchTitle || matchPrompt || matchCategory || matchModel || matchTags;
        }

        return true;
      })
      .sort((a, b) => {
        if (this.sortBy === "popular") {
          return b.copies - a.copies;
        }
        if (this.sortBy === "likes") {
          return b.likes - a.likes;
        }
        if (this.sortBy === "newest") {
          return new Date(b.date || 0) - new Date(a.date || 0);
        }
        return 0;
      });
  }

  applyFilterAndRender() {
    this.filteredList = this.computeFilteredList();
    this.renderedCount = 0;
    this.loopCycle = 0;
    this.promptsGrid.innerHTML = "";

    if (this.filteredList.length === 0) {
      this.emptyState.style.display = "block";
      this.scrollLoader.style.display = "none";
      this.visibleCountEl.textContent = "0";
      return;
    }

    this.emptyState.style.display = "none";
    this.loadNextBatch();
  }

  // Infinite Scroll Batch Loader
  loadNextBatch() {
    if (this.isLoadingMore || this.filteredList.length === 0) return;
    this.isLoadingMore = true;
    this.scrollLoader.style.display = "flex";

    // Small timeout for super smooth 60fps rendering
    setTimeout(() => {
      const startIndex = this.renderedCount % this.filteredList.length;
      let nextBatch = [];

      if (startIndex + this.pageSize <= this.filteredList.length) {
        nextBatch = this.filteredList.slice(startIndex, startIndex + this.pageSize);
      } else {
        // If we reach the end of the filtered list, wrap around so the scroll never ends!
        const part1 = this.filteredList.slice(startIndex);
        const remainder = this.pageSize - part1.length;
        const part2 = this.filteredList.slice(0, remainder);
        nextBatch = [...part1, ...part2];
        this.loopCycle++;
      }

      const fragment = document.createDocumentFragment();
      nextBatch.forEach((item, index) => {
        // Clone item with unique DOM key if looping
        const domId = this.loopCycle > 0 ? `${item.id}-loop${this.loopCycle}-${index}` : item.id;
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = this.createCardHTML(item, domId);
        const cardElement = tempDiv.firstElementChild;
        this.attachSingleCardListeners(cardElement, item);
        fragment.appendChild(cardElement);
      });

      this.promptsGrid.appendChild(fragment);
      this.renderedCount += nextBatch.length;

      // Update visible count in meta bar
      this.visibleCountEl.textContent = `${this.renderedCount} of ${this.allPrompts.length}+`;

      this.isLoadingMore = false;
      this.scrollLoader.style.display = "none";
    }, 180);
  }

  createCardHTML(item, domId) {
    const isLiked = this.likedPrompts.has(item.id);
    const isSaved = this.favorites.has(item.id);
    const isSameFace = item.category === "same-face" || (item.tags && item.tags.includes("same face"));

    const modelNameMap = {
      chatgpt: "ChatGPT",
      gemini: "Gemini",
      midjourney: "Midjourney",
      bing: "Bing",
      flux: "FLUX.1"
    };
    const displayModel = modelNameMap[item.model] || item.model.toUpperCase();

    return `
      <article class="prompt-card" data-domid="${domId}" data-id="${item.id}">
        <div class="card-image-box" data-action="view">
          <img 
            src="${item.image}" 
            alt="${item.title} - AI Photo Prompt" 
            loading="lazy" 
            referrerpolicy="no-referrer"
            onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=80'"
          >
          <div class="card-badges-top">
            <span class="badge-tag badge-model">${displayModel}</span>
            ${isSameFace ? '<span class="badge-tag badge-sameface"><i class="fa-solid fa-lock"></i> Same Face</span>' : `<span class="badge-tag">${item.aspectRatio}</span>`}
          </div>
          <div class="card-hover-overlay">
            <button class="view-full-btn" data-action="view">
              <i class="fa-regular fa-eye"></i> View Full Prompt
            </button>
          </div>
        </div>

        <div class="card-content">
          <h3 class="card-title" data-action="view">${item.title}</h3>
          <p class="card-prompt-snippet">${this.escapeHTML(item.promptText)}</p>

          <div class="card-footer-meta">
            <div class="card-stats">
              <span title="${item.copies} total copies"><i class="fa-regular fa-copy"></i> <span class="copies-count">${item.copies}</span></span>
              <span title="${item.likes} total likes"><i class="fa-regular fa-heart"></i> <span class="likes-count">${item.likes}</span></span>
            </div>

            <div class="card-actions">
              <button class="icon-action-btn ${isLiked ? 'active-like' : ''}" data-action="like" title="Like prompt" aria-label="Like prompt">
                <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
              </button>

              <button class="icon-action-btn ${isSaved ? 'active-saved' : ''}" data-action="save" title="Save bookmark" aria-label="Save prompt">
                <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
              </button>

              <button class="copy-card-btn" data-action="copy" title="Copy prompt to clipboard">
                <i class="fa-solid fa-copy"></i> Copy
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  attachSingleCardListeners(card, item) {
    card.addEventListener("click", (e) => {
      const actionEl = e.target.closest("[data-action]");
      if (!actionEl) return;
      const action = actionEl.getAttribute("data-action");

      if (action === "view") {
        this.openDetailModal(item);
      } else if (action === "copy") {
        this.copyPromptText(item.promptText, item.id);
      } else if (action === "like") {
        this.toggleLike(item, card);
      } else if (action === "save") {
        this.toggleSave(item, card);
      }
    });
  }

  openDetailModal(item) {
    this.activeModalPrompt = item;

    document.getElementById("modalTitle").textContent = item.title;
    const modalImg = document.getElementById("modalImage");
    modalImg.src = item.image;
    modalImg.referrerPolicy = "no-referrer";
    document.getElementById("modalRatio").innerHTML = `<i class="fa-solid fa-crop-simple"></i> ${item.aspectRatio}`;
    document.getElementById("modalModel").innerHTML = `<i class="fa-solid fa-robot"></i> ${item.model.toUpperCase()}`;
    document.getElementById("modalCopies").textContent = item.copies;
    document.getElementById("modalLikes").textContent = item.likes;
    document.getElementById("modalPromptText").textContent = item.promptText;

    // Show/hide face lock tip
    const isSameFace = item.category === "same-face" || (item.tags && item.tags.includes("same face"));
    document.getElementById("faceLockTip").style.display = isSameFace ? "flex" : "none";

    // Tags list
    const tagsContainer = document.getElementById("modalTags");
    if (item.tags && item.tags.length > 0) {
      tagsContainer.innerHTML = item.tags.map((t) => `<span class="modal-tag">#${t}</span>`).join("");
    } else {
      tagsContainer.innerHTML = "";
    }

    this.detailModal.showModal();
  }

  copyPromptText(text, promptId = null) {
    if (!text) return;

    const onSuccess = () => {
      this.showToast("Prompt copied to clipboard! Paste in ChatGPT or Gemini ✨");

      // Increment copies count
      if (promptId) {
        const target = this.allPrompts.find((p) => p.id === promptId);
        if (target) {
          target.copies += 1;
          const cards = this.promptsGrid.querySelectorAll(`.prompt-card[data-id="${promptId}"]`);
          cards.forEach((card) => {
            const countEl = card.querySelector(".copies-count");
            if (countEl) countEl.textContent = target.copies;
          });
          if (this.activeModalPrompt && this.activeModalPrompt.id === promptId) {
            document.getElementById("modalCopies").textContent = target.copies;
          }
        }
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
        this.fallbackCopyText(text, onSuccess);
      });
    } else {
      this.fallbackCopyText(text, onSuccess);
    }
  }

  fallbackCopyText(text, callback) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      if (callback) callback();
    } catch (err) {
      this.showToast("Error copying prompt. Please manually copy.");
    }
    document.body.removeChild(textArea);
  }

  toggleLike(item, cardEl) {
    const likeBtn = cardEl.querySelector('[data-action="like"]');
    const likeCountEl = cardEl.querySelector(".likes-count");

    if (this.likedPrompts.has(item.id)) {
      this.likedPrompts.delete(item.id);
      item.likes = Math.max(0, item.likes - 1);
      likeBtn.classList.remove("active-like");
      likeBtn.querySelector("i").className = "fa-regular fa-heart";
    } else {
      this.likedPrompts.add(item.id);
      item.likes += 1;
      likeBtn.classList.add("active-like");
      likeBtn.querySelector("i").className = "fa-solid fa-heart";
      this.showToast("Added to likes! ❤️");
    }

    if (likeCountEl) likeCountEl.textContent = item.likes;
    this.saveLikesToStorage();
  }

  toggleSave(item, cardEl) {
    const saveBtn = cardEl.querySelector('[data-action="save"]');

    if (this.favorites.has(item.id)) {
      this.favorites.delete(item.id);
      saveBtn.classList.remove("active-saved");
      saveBtn.querySelector("i").className = "fa-regular fa-bookmark";
      this.showToast("Removed from bookmarks.");
    } else {
      this.favorites.add(item.id);
      saveBtn.classList.add("active-saved");
      saveBtn.querySelector("i").className = "fa-solid fa-bookmark";
      this.showToast("Saved to your bookmarks! 🔖");
    }

    this.saveFavoritesToStorage();
    this.updateFavoritesCountBadge();

    if (this.showingOnlyFavorites) {
      this.applyFilterAndRender();
    }
  }

  handleAddNewPrompt() {
    const title = document.getElementById("newTitle").value.trim();
    const category = document.getElementById("newCategory").value;
    const model = document.getElementById("newModel").value;
    const aspectRatio = document.getElementById("newRatio").value;
    const promptText = document.getElementById("newPromptText").value.trim();
    const imageInput = document.getElementById("newImageUrl").value.trim();
    const tagsInput = document.getElementById("newTags").value.trim();

    if (!title || !promptText) {
      alert("Please enter title and prompt text.");
      return;
    }

    const tags = tagsInput
      ? tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [category, model];

    const fallbackImages = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80"
    ];
    const image = imageInput || fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

    const newPrompt = {
      id: "custom-" + Date.now(),
      title,
      category,
      model,
      aspectRatio,
      promptText,
      image,
      copies: 1,
      likes: 1,
      date: new Date().toISOString().split("T")[0],
      tags
    };

    this.allPrompts.unshift(newPrompt);
    this.saveCustomPromptsToStorage(newPrompt);

    this.addPromptForm.reset();
    this.addModal.close();

    this.applyFilterAndRender();
    this.showToast("🎉 Your AI Prompt has been published successfully!");
    this.scrollToGallery();
  }

  updateCustomizerOutput() {
    const subject = this.custSubject.value.trim() || "A handsome young person";
    const outfit = this.custOutfit.value.trim() || "modern casual attire";
    const location = this.custLocation.value.trim() || "cinematic urban setting";
    const lighting = this.custLighting.value;
    const camera = this.custCamera.value;
    const faceLock = this.custFaceLock.value;

    const generated = `Create an ultra-photorealistic image. ${faceLock} Subject: ${subject}, ${outfit}. Environment: ${location}. Lighting: ${lighting}. Camera & Details: ${camera}. Highest aesthetic quality, flawless composition, natural colors.`;

    this.customPromptOutput.textContent = generated;
  }

  showToast(message) {
    this.toastMessage.textContent = message;
    this.toastNotification.classList.add("show");

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastNotification.classList.remove("show");
    }, 3200);
  }

  escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new PicturePromptApp();
});
