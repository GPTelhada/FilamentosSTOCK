// ── Tab group definitions ─────────────────────────────────
const TAB_GROUPS = [
  { label: "PLA",             id: "pla",    prefixes: ["PLA"] },
  { label: "PETG",            id: "petg",   prefixes: ["PETG"] },
  { label: "ABS & ASA",       id: "absasa", prefixes: ["ABS", "ASA"] },
  { label: "TPU",             id: "tpu",    prefixes: ["TPU"] },
  { label: "PA6, PAHT & PET", id: "pa",     prefixes: ["PA6", "PAHT", "PET"] },
  { label: "Outros",          id: "outros", prefixes: ["Build Plate (X1, P1, A1, P2)", "AMS"] },
];

// Match a material name to a tab's prefix list.
// Uses word-boundary matching so "PETG" never matches prefix "PET".
const materialBelongsTo = (materialName, prefixes) =>
  prefixes.some(p =>
    materialName === p ||
    materialName.startsWith(p + " ") ||
    materialName.startsWith(p + "-")
  );

// ── Main ──────────────────────────────────────────────────
fetch("data/inventory.json")
  .then(response => response.json())
  .then(data => {
    const tabsNav = document.getElementById("material-tabs");
    const container = document.getElementById("inventory-container");

    const n = (v) => (typeof v === "number" ? v : 0);

    // Returns true if an item has any stock (on-hand or incoming)
    const hasFilament = (item) => {
      const spoolStock = n(item.spool?.stock);
      const spoolIncoming = n(item.spool?.incoming);

      const refillStock = n(item.refill?.stock);
      const refillIncoming = n(item.refill?.incoming);

      const quantityStock = n(item.quantity?.stock);
      const quantityIncoming = n(item.quantity?.incoming);

      return (
        spoolStock +
        spoolIncoming +
        refillStock +
        refillIncoming +
        quantityStock +
        quantityIncoming
      ) > 0;
    };

    // Group raw items by material name
    const byMaterial = {};

    data.forEach(item => {
      if (!byMaterial[item.material]) {
        byMaterial[item.material] = [];
      }

      byMaterial[item.material].push(item);
    });

    // Build each tab button + panel
    TAB_GROUPS.forEach((group, idx) => {

      // ── Tab button ──────────────────────────────────────
      const btn = document.createElement("button");

      btn.className = "tab-btn" + (idx === 0 ? " active" : "");
      btn.textContent = group.label;
      btn.dataset.tab = group.id;

      tabsNav.appendChild(btn);

      // ── Panel ───────────────────────────────────────────
      const panel = document.createElement("div");

      panel.className = "tab-panel" + (idx === 0 ? " active" : "");
      panel.id = "tab-" + group.id;

      // Find materials that belong to this tab
      const matchingMaterials = Object.keys(byMaterial)
        .filter(material =>
          materialBelongsTo(material, group.prefixes)
        );

      let hasAnyContent = false;

      matchingMaterials.forEach(material => {

        const itemsToShow = byMaterial[material]
          .filter(hasFilament);

        if (itemsToShow.length === 0) {
          return;
        }

        hasAnyContent = true;

        // ── Section heading ───────────────────────────────
        const title = document.createElement("h2");

        title.textContent = material;

        panel.appendChild(title);

        // ── Card grid ─────────────────────────────────────
        const grid = document.createElement("div");

        grid.classList.add("grid");

        itemsToShow.forEach(item => {

          const card = document.createElement("div");

          card.classList.add("card");

          let stockHTML = "";

          // ── Refill row ──────────────────────────────────
          if (
            item.refill &&
            typeof item.refill.stock === "number"
          ) {
            const stock = n(item.refill.stock);
            const incoming = n(item.refill.incoming);

            stockHTML += `
              <div class="stock-block stock-block--refill">

                <div class="stock-line">
                  <span class="label">Refill:</span>
                  <span class="value">${stock}</span>
                </div>

                ${
                  incoming > 0
                    ? `<div class="stock-line soon">
                         Brevemente: ${incoming}
                       </div>`
                    : ""
                }

              </div>
            `;
          }

          // ── Spool row ───────────────────────────────────
          if (
            item.spool &&
            typeof item.spool.stock === "number"
          ) {
            const stock = n(item.spool.stock);
            const incoming = n(item.spool.incoming);

            stockHTML += `
              <div class="stock-block">

                <div class="stock-line">
                  <span class="label">Spool:</span>
                  <span class="value">${stock}</span>
                </div>

                ${
                  incoming > 0
                    ? `<div class="stock-line soon">
                         Brevemente: ${incoming}
                       </div>`
                    : ""
                }

              </div>
            `;
          }

          // ── Quantity row ────────────────────────────────
          if (
            item.quantity &&
            typeof item.quantity.stock === "number"
          ) {
            const stock = n(item.quantity.stock);
            const incoming = n(item.quantity.incoming);

            stockHTML += `
              <div class="stock-block">

                <div class="stock-line">
                  <span class="label">Quantidade:</span>
                  <span class="value">${stock}</span>
                </div>

                ${
                  incoming > 0
                    ? `<div class="stock-line soon">
                         Brevemente: ${incoming}
                       </div>`
                    : ""
                }

              </div>
            `;
          }

          // ── Card content ────────────────────────────────
          card.innerHTML = `
            <img
              src="${item.image}"
              alt="${item.color} ${item.material}"
            >

            <h3>${item.color}</h3>

            <p class="color">
              ${item.material}
            </p>

            <div class="stock">
              ${stockHTML}
            </div>
          `;

          grid.appendChild(card);
        });

        panel.appendChild(grid);
      });

      // ── Empty state ─────────────────────────────────────
      if (!hasAnyContent) {
        const empty = document.createElement("p");

        empty.className = "tab-empty";
        empty.textContent = "Sem stock disponível de momento.";

        panel.appendChild(empty);
      }

      container.appendChild(panel);
    });

    // ── Tab switching ────────────────────────────────────
    tabsNav.addEventListener("click", (e) => {

      const btn = e.target.closest(".tab-btn");

      if (!btn) {
        return;
      }

      document
        .querySelectorAll(".tab-btn")
        .forEach(button =>
          button.classList.remove("active")
        );

      document
        .querySelectorAll(".tab-panel")
        .forEach(panel =>
          panel.classList.remove("active")
        );

      btn.classList.add("active");

      document
        .getElementById("tab-" + btn.dataset.tab)
        .classList.add("active");
    });
  })

  .catch(err =>
    console.error(
      "Erro ao carregar inventário:",
      err
    )
  );