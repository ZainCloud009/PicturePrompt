/**
 * Picture Prompt - Blog Engine
 * Handles article filtering, detailed reading view, and deep-linking by slug.
 */

document.addEventListener("DOMContentLoaded", () => {
  initBlogPage();
});

function initBlogPage() {
  initTheme();
  
  const posts = (window.BLOG_POSTS_DATA && Array.isArray(window.BLOG_POSTS_DATA))
    ? window.BLOG_POSTS_DATA
    : [];

  const urlParams = new URLSearchParams(window.location.search);
  const postSlug = urlParams.get("post") || urlParams.get("id");

  if (postSlug) {
    const post = posts.find((p) => p.slug === postSlug || p.id === postSlug);
    if (post) {
      showSingleArticle(post);
    } else {
      renderBlogGrid(posts);
    }
  } else {
    renderBlogGrid(posts);
  }

  bindBlogFilters(posts);
  bindNavigation();
}

function renderBlogGrid(posts, filter = "all") {
  const grid = document.getElementById("blogGrid");
  const singleView = document.getElementById("singleArticleView");
  const hero = document.querySelector(".blog-hero");

  if (singleView) singleView.style.display = "none";
  if (grid) grid.style.display = "grid";
  if (hero) hero.style.display = "block";

  if (!grid) return;

  const filtered = filter === "all" ? posts : posts.filter(p => p.category === filter);

  grid.innerHTML = "";
  filtered.forEach((post) => {
    const card = document.createElement("article");
    card.className = "blog-card";
    card.innerHTML = `
      <div class="blog-card-media">
        <a href="blog.html?post=${post.slug}">
          <img src="${post.image}" alt="${escapeHTML(post.title)}" loading="lazy">
        </a>
        <span class="blog-badge">${post.category}</span>
      </div>
      <div class="blog-card-body">
        <div class="blog-meta-sub">
          <span><i class="fa-regular fa-clock"></i> ${post.readTime}</span>
          <span>&bull;</span>
          <span><i class="fa-regular fa-calendar"></i> ${post.date}</span>
        </div>
        <h2 class="blog-card-title">
          <a href="blog.html?post=${post.slug}">${escapeHTML(post.title)}</a>
        </h2>
        <p class="blog-card-excerpt">${escapeHTML(post.excerpt)}</p>
        <div class="blog-card-footer">
          <a href="blog.html?post=${post.slug}" class="blog-read-link">
            Read Full Guide <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>
    `;

    // Click to view post inline
    card.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        window.history.pushState({}, "", `blog.html?post=${post.slug}`);
        showSingleArticle(post);
      });
    });

    grid.appendChild(card);
  });
}

function showSingleArticle(post) {
  const grid = document.getElementById("blogGrid");
  const singleView = document.getElementById("singleArticleView");
  const hero = document.querySelector(".blog-hero");

  if (grid) grid.style.display = "none";
  if (hero) hero.style.display = "none";
  if (!singleView) return;

  singleView.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });

  document.title = `${post.title} — Picture Prompt Blog`;

  const catEl = document.getElementById("articleCategory");
  if (catEl) catEl.textContent = post.category;

  const readEl = document.getElementById("articleReadTime");
  if (readEl) readEl.textContent = post.readTime;

  const titleEl = document.getElementById("articleTitle");
  if (titleEl) titleEl.textContent = post.title;

  const authorEl = document.getElementById("articleAuthor");
  if (authorEl) authorEl.textContent = post.author;

  const dateEl = document.getElementById("articleDate");
  if (dateEl) dateEl.textContent = post.date;

  const imgEl = document.getElementById("articleFeaturedImage");
  if (imgEl) {
    imgEl.src = post.image;
    imgEl.alt = post.title;
  }

  const bodyEl = document.getElementById("articleBody");
  if (bodyEl) {
    bodyEl.innerHTML = post.content;
  }
}

function bindBlogFilters(posts) {
  const filterBtns = document.querySelectorAll(".blog-filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-filter");
      renderBlogGrid(posts, category);
    });
  });

  const backBtn = document.getElementById("backToBlogListBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.pushState({}, "", "blog.html");
      document.title = "Blog & AI Prompt Guides — Picture Prompt";
      renderBlogGrid(posts);
    });
  }
}

function bindNavigation() {
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
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.querySelector("#themeToggleBtn i");
  if (icon) {
    icon.className = theme === "light" ? "fa-solid fa-moon" : "fa-solid fa-sun";
  }
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
