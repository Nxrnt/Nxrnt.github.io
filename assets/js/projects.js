const badgeText = {
    new: "new",
    progress: "in progress",
    hot: "hot",
    old: "archived",
    onhold: "on hold",
};

function hasBadge(p, badge) {
    return Array.isArray(p.badges) && p.badges.includes(badge);
}

// lower number = earlier in list
function sortKey(p) {
    // archived ALWAYS at the bottom
    if (hasBadge(p, "old")) return 2;

    // hot projects at the start
    if (hasBadge(p, "hot")) return 0;

    // everything else in the middle
    return 1;
}

async function initProjects() {
    const grid = document.getElementById("projectsGrid");
    const tpl = document.getElementById("projectCardTemplate");

    const res = await fetch("data/projects.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load projects.json (${res.status})`);
    const projects = await res.json();

    // remove template entries
    const filtered = projects.filter((p) => p.title !== "Template");

    // stable sort: preserve original order within each group
    const sorted = filtered
        .map((p, i) => ({ p, i }))
        .sort((a, b) => sortKey(a.p) - sortKey(b.p) || a.i - b.i)
        .map((x) => x.p);

    sorted.forEach((p) => {
        const node = tpl.content.cloneNode(true);

        const img = node.querySelector("img");
        img.src = p.img || "images/pic02.png";
        img.alt = p.title || "";

        node.querySelector("h3").textContent = p.title || "Untitled";
        node.querySelector("p").textContent = p.desc || "";

        const badgesWrap = node.querySelector(".project-badges");
        (p.badges || []).forEach((b) => {
            const span = document.createElement("span");
            span.className = `badge-tag ${b}`;
            span.textContent = badgeText[b] || b;
            badgesWrap.appendChild(span);
        });

        grid.appendChild(node);
    });
}

initProjects().catch(console.error);
