(() => {
    "use strict";

    const badgeEmoji = {
        hot: "🔥",
        new: "✨",
        old: "💀",
        progress: "🛠️"
    };

    // lower = earlier
    function sortKey(p) {
        const b = p.badge;
        if (b === "hot") return 0;
        if (b === "new") return 1;
        if (b === "old") return 3;
        return 2; // no badge (or unknown) goes in the middle after "new"
    }

    async function initProjects() {
        const grid = document.getElementById("projectsGrid");
        const tpl = document.getElementById("projectCardTemplate");

        const res = await fetch("data/projects.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load projects.json (${res.status})`);
        const projects = await res.json();

        const filtered = (Array.isArray(projects) ? projects : [])
            .filter((p) => p?.title && p.title !== "Template");

        // stable sort (keeps original order within groups)
        const sorted = filtered
            .map((p, i) => ({ p, i }))
            .sort((a, b) => sortKey(a.p) - sortKey(b.p) || a.i - b.i)
            .map((x) => x.p);

        grid.innerHTML = "";

        sorted.forEach((p) => {
            const node = tpl.content.cloneNode(true);

            // image
            const img = node.querySelector("img");
            img.src = p.img || "images/pic02.png";
            img.alt = p.title || "";

            // title + desc
            node.querySelector(".mcard-title").textContent = p.title || "Untitled";
            node.querySelector(".mcard-subtitle").textContent = p.desc || "";

            // tech chips
            const stackWrap = node.querySelector(".mcard-stack");
            if (stackWrap) {
                stackWrap.innerHTML = "";

                (p.stack || []).forEach((t) => {
                    const chip = document.createElement("span");

                    // Optional: auto classify for nicer colors (can remove if you want all same)
                    const lower = String(t).toLowerCase();
                    let kind = "tool";
                    if (["c#", "c++", "python", "gdscript", "typescript", "javascript"].includes(lower)) kind = "lang";
                    if (["unity", "godot", "unreal", "unreal engine", "unity engine"].includes(lower)) kind = "engine";

                    chip.className = `tech-chip ${kind}`;
                    chip.textContent = t;

                    stackWrap.appendChild(chip);
                });
            }

            const badgeEmoji = { hot: "🔥", new: "✨", old: "💀", progress: "🛠️" };

            const badgeEl = node.querySelector(".mcard-badge");
            if (badgeEl) {
                const b = p.badge;
                if (b && badgeEmoji[b]) {
                    badgeEl.hidden = false;
                    badgeEl.className = `mcard-badge ${b}`;
                    badgeEl.textContent = badgeEmoji[b];
                } else {
                    badgeEl.hidden = true;
                }
            }


            grid.appendChild(node);
        });
    }

    initProjects().catch(console.error);
})();
