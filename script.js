// ===== Data =====
// Sample videos (fictional channels). Thumbnails are drawn with CSS gradients + an icon.
const videos = [
    { id: "v1", title: "Learn CSS Grid in 20 Minutes", channel: "Code Corner", subs: "312K", views: 245000, daysAgo: 3, duration: "20:14", category: "CSS", icon: "grid_view", colors: ["#2563eb", "#7c3aed"], likes: 8400 },
    { id: "v2", title: "JavaScript Array Methods You Must Know", channel: "Byte Academy", subs: "1.2M", views: 1320000, daysAgo: 21, duration: "18:02", category: "JavaScript", icon: "javascript", colors: ["#f59e0b", "#b45309"], likes: 41000 },
    { id: "v3", title: "Build a Responsive Navbar with HTML & CSS", channel: "Frontend Lab", subs: "98K", views: 67000, daysAgo: 6, duration: "14:37", category: "HTML", icon: "menu_open", colors: ["#ef4444", "#9f1239"], likes: 2100 },
    { id: "v4", title: "Figma for Beginners: Design Your First App", channel: "Pixel Studio", subs: "540K", views: 890000, daysAgo: 45, duration: "32:50", category: "Design", icon: "palette", colors: ["#ec4899", "#7c3aed"], likes: 27000 },
    { id: "v5", title: "Flexbox vs Grid: When to Use Which?", channel: "Code Corner", subs: "312K", views: 154000, daysAgo: 10, duration: "11:26", category: "CSS", icon: "dashboard", colors: ["#0ea5e9", "#1e3a8a"], likes: 6200 },
    { id: "v6", title: "Async/Await Explained Simply", channel: "Byte Academy", subs: "1.2M", views: 610000, daysAgo: 90, duration: "15:09", category: "JavaScript", icon: "sync", colors: ["#eab308", "#854d0e"], likes: 19500 },
    { id: "v7", title: "How I Got My First Front-End Job", channel: "Dev Journey", subs: "76K", views: 43000, daysAgo: 2, duration: "22:41", category: "Career", icon: "work", colors: ["#10b981", "#065f46"], likes: 3900 },
    { id: "v8", title: "Semantic HTML: Write Better Markup", channel: "Frontend Lab", subs: "98K", views: 38000, daysAgo: 14, duration: "09:58", category: "HTML", icon: "html", colors: ["#f97316", "#9a3412"], likes: 1700 },
    { id: "v9", title: "Color Theory for UI Designers", channel: "Pixel Studio", subs: "540K", views: 276000, daysAgo: 30, duration: "13:15", category: "Design", icon: "color_lens", colors: ["#a855f7", "#db2777"], likes: 11800 },
    { id: "v10", title: "10 JavaScript Projects for Your Portfolio", channel: "Dev Journey", subs: "76K", views: 128000, daysAgo: 7, duration: "27:33", category: "JavaScript", icon: "rocket_launch", colors: ["#f43f5e", "#f59e0b"], likes: 7300 },
    { id: "v11", title: "CSS Animations: From Zero to Hero", channel: "Code Corner", subs: "312K", views: 97000, daysAgo: 1, duration: "25:00", category: "CSS", icon: "animation", colors: ["#06b6d4", "#4f46e5"], likes: 4500 },
    { id: "v12", title: "Writing a Developer Resume That Gets Interviews", channel: "Dev Journey", subs: "76K", views: 59000, daysAgo: 60, duration: "16:44", category: "Career", icon: "description", colors: ["#22c55e", "#15803d"], likes: 2800 },
];

const CATEGORIES = ["All", "JavaScript", "CSS", "HTML", "Design", "Career"];
const STORAGE_KEY = "yt-clone-state";

// ===== Elements =====
const grid = document.getElementById("video-grid");
const chipsBar = document.getElementById("chips");
const viewTitle = document.getElementById("view-title");
const emptyState = document.getElementById("empty-state");
const emptyText = document.getElementById("empty-text");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const menuButton = document.getElementById("menu-btn");
const backdrop = document.getElementById("backdrop");
const navLinks = document.querySelectorAll(".nav-link");
const dialog = document.getElementById("watch-dialog");

// ===== State (liked, saved, subscriptions persist in the browser) =====
function loadSaved() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (saved && typeof saved === "object") return saved;
    } catch {
        // ignore corrupted or unavailable storage
    }
    return {};
}

const saved = loadSaved();
const liked = new Set(saved.liked || []);
const watchLater = new Set(saved.watchLater || []);
const subscribed = new Set(saved.subscribed || []);

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            liked: [...liked],
            watchLater: [...watchLater],
            subscribed: [...subscribed],
        }));
    } catch {
        // storage unavailable: everything still works for this visit
    }
}

const state = { view: "home", category: "All", query: "" };

// ===== Formatting helpers =====
function formatViews(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(".0", "") + "M";
    if (n >= 1e3) return Math.round(n / 1e3) + "K";
    return String(n);
}

function formatAgo(days) {
    if (days < 1) return "today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (days < 30) {
        const w = Math.floor(days / 7);
        return w === 1 ? "1 week ago" : `${w} weeks ago`;
    }
    if (days < 365) {
        const m = Math.floor(days / 30);
        return m === 1 ? "1 month ago" : `${m} months ago`;
    }
    const y = Math.floor(days / 365);
    return y === 1 ? "1 year ago" : `${y} years ago`;
}

// Stable color per channel for the letter avatar
function channelColor(name) {
    const palette = ["#c2185b", "#7b1fa2", "#1976d2", "#00897b", "#f57c00", "#5d4037"];
    let hash = 0;
    for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return palette[hash % palette.length];
}

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function materialIcon(name, className = "") {
    const icon = el("i", ("material-icons " + className).trim(), name);
    icon.setAttribute("aria-hidden", "true");
    return icon;
}

// ===== Rendering =====
function renderChips() {
    chipsBar.replaceChildren(...CATEGORIES.map((category) => {
        const chip = el("button", "chip" + (category === state.category ? " active" : ""), category);
        chip.type = "button";
        chip.setAttribute("role", "tab");
        chip.setAttribute("aria-selected", String(category === state.category));
        chip.addEventListener("click", () => {
            state.category = category;
            render();
        });
        return chip;
    }));
}

function createCard(video) {
    const card = el("button", "video-card");
    card.type = "button";
    card.setAttribute("aria-label", `${video.title}, ${video.channel}, ${formatViews(video.views)} views, ${video.duration}`);

    const thumb = el("div", "thumb");
    thumb.style.setProperty("--c1", video.colors[0]);
    thumb.style.setProperty("--c2", video.colors[1]);
    thumb.append(
        el("span", "thumb-label", video.category),
        materialIcon(video.icon, "thumb-icon"),
        el("span", "duration", video.duration)
    );

    const details = el("div", "video-details");
    const avatar = el("span", "channel-avatar", video.channel.charAt(0));
    avatar.style.backgroundColor = channelColor(video.channel);

    const info = el("div", "video-info-text");
    const title = el("h3", "video-title", video.title);
    const channel = el("p", "channel-name", video.channel);
    const stats = el("p", "video-stats", `${formatViews(video.views)} views • ${formatAgo(video.daysAgo)}`);
    if (liked.has(video.id)) {
        stats.append(" ", materialIcon("thumb_up", "liked-badge"));
    }
    info.append(title, channel, stats);

    details.append(avatar, info);
    card.append(thumb, details);
    card.addEventListener("click", () => openVideo(video));
    return card;
}

function getVisibleVideos() {
    let list = [...videos];

    if (state.view === "trending") list.sort((a, b) => b.views - a.views);
    if (state.view === "liked") list = list.filter((v) => liked.has(v.id));
    if (state.view === "watch-later") list = list.filter((v) => watchLater.has(v.id));
    if (state.view === "subscriptions") list = list.filter((v) => subscribed.has(v.channel));
    if (state.view === "home" || state.view === "subscriptions") list.sort((a, b) => a.daysAgo - b.daysAgo);

    if (state.category !== "All") list = list.filter((v) => v.category === state.category);

    const q = state.query.trim().toLowerCase();
    if (q) {
        list = list.filter((v) =>
            v.title.toLowerCase().includes(q) ||
            v.channel.toLowerCase().includes(q) ||
            v.category.toLowerCase().includes(q));
    }
    return list;
}

const VIEW_TITLES = {
    trending: "Trending",
    liked: "Liked videos",
    "watch-later": "Watch later",
    subscriptions: "Subscriptions",
};

const EMPTY_MESSAGES = {
    liked: "Videos you like will show up here.",
    "watch-later": "Save videos to watch later and they'll show up here.",
    subscriptions: "Subscribe to a channel and its videos will show up here.",
};

function render() {
    renderChips();

    const list = getVisibleVideos();
    grid.replaceChildren(...list.map(createCard));

    const q = state.query.trim();
    if (q) {
        viewTitle.textContent = `Results for "${q}"`;
    } else {
        viewTitle.textContent = VIEW_TITLES[state.view] || "";
    }
    viewTitle.hidden = !viewTitle.textContent;

    emptyState.hidden = list.length > 0;
    emptyText.textContent = q || state.category !== "All"
        ? "No videos match your search."
        : EMPTY_MESSAGES[state.view] || "No videos found.";
}

// ===== Watch dialog =====
const watchEls = {
    player: document.getElementById("player"),
    title: document.getElementById("watch-title"),
    avatar: document.getElementById("watch-avatar"),
    channel: document.getElementById("watch-channel"),
    subs: document.getElementById("watch-subs"),
    subscribe: document.getElementById("subscribe-btn"),
    like: document.getElementById("like-btn"),
    likeCount: document.getElementById("like-count"),
    later: document.getElementById("later-btn"),
    stats: document.getElementById("watch-stats"),
    description: document.getElementById("watch-description"),
};

let currentVideo = null;

function updateWatchButtons() {
    const v = currentVideo;
    const isLiked = liked.has(v.id);
    watchEls.like.classList.toggle("active", isLiked);
    watchEls.like.setAttribute("aria-pressed", String(isLiked));
    watchEls.likeCount.textContent = formatViews(v.likes + (isLiked ? 1 : 0));

    const isSaved = watchLater.has(v.id);
    watchEls.later.classList.toggle("active", isSaved);
    watchEls.later.setAttribute("aria-pressed", String(isSaved));
    watchEls.later.querySelector("span").textContent = isSaved ? "Saved" : "Save";

    const isSub = subscribed.has(v.channel);
    watchEls.subscribe.classList.toggle("subscribed", isSub);
    watchEls.subscribe.textContent = isSub ? "Subscribed" : "Subscribe";
}

function openVideo(video) {
    currentVideo = video;
    watchEls.player.style.setProperty("--c1", video.colors[0]);
    watchEls.player.style.setProperty("--c2", video.colors[1]);
    watchEls.title.textContent = video.title;
    watchEls.avatar.textContent = video.channel.charAt(0);
    watchEls.avatar.style.backgroundColor = channelColor(video.channel);
    watchEls.channel.textContent = video.channel;
    watchEls.subs.textContent = `${video.subs} subscribers`;
    watchEls.stats.textContent = `${video.views.toLocaleString("en-US")} views • ${formatAgo(video.daysAgo)}`;
    watchEls.description.textContent =
        `In this ${video.category} video from ${video.channel}, we walk through "${video.title}" step by step with practical examples you can follow along with.`;
    updateWatchButtons();
    dialog.showModal();
}

function toggleIn(set, value) {
    if (set.has(value)) set.delete(value);
    else set.add(value);
    persist();
    updateWatchButtons();
}

watchEls.like.addEventListener("click", () => toggleIn(liked, currentVideo.id));
watchEls.later.addEventListener("click", () => toggleIn(watchLater, currentVideo.id));
watchEls.subscribe.addEventListener("click", () => toggleIn(subscribed, currentVideo.channel));

document.getElementById("close-dialog").addEventListener("click", () => dialog.close());

// Close when clicking outside the dialog box
dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
});

// Refresh the grid so liked badges and filtered views stay current
dialog.addEventListener("close", render);

// ===== Search =====
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    state.query = searchInput.value;
    render();
});

searchInput.addEventListener("input", () => {
    state.query = searchInput.value;
    render();
});

document.getElementById("mic-btn").addEventListener("click", () => searchInput.focus());

// ===== Sidebar =====
function isWide() {
    return window.innerWidth > 1100;
}

function closeOverlaySidebar() {
    document.body.classList.remove("sidebar-open");
    backdrop.hidden = true;
}

menuButton.addEventListener("click", () => {
    if (isWide()) {
        document.body.classList.toggle("sidebar-collapsed");
    } else {
        const open = document.body.classList.toggle("sidebar-open");
        backdrop.hidden = !open;
    }
});

backdrop.addEventListener("click", closeOverlaySidebar);

window.addEventListener("resize", () => {
    if (isWide()) closeOverlaySidebar();
});

const WORKING_VIEWS = ["home", "trending", "liked", "watch-later", "subscriptions"];

navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const view = link.dataset.view;
        if (!WORKING_VIEWS.includes(view)) return; // demo-only links

        state.view = view;
        state.category = "All";
        state.query = "";
        searchInput.value = "";
        navLinks.forEach((l) => l.classList.toggle("active", l === link));
        closeOverlaySidebar();
        render();
    });
});

// Logo goes back home
document.getElementById("logo-link").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector('.nav-link[data-view="home"]').click();
});

render();
