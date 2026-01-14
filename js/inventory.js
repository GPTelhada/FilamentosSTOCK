fetch("data/inventory.json")
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById("inventory-container");

    // apenas cards com filamento disponível
    const hasFilament = (item) => {
      const spoolStock = (item.spool && typeof item.spool.stock === "number") ? item.spool.stock : 0;
      const spoolIncoming = (item.spool && typeof item.spool.incoming === "number") ? item.spool.incoming : 0;
      const refillStock = (item.refill && typeof item.refill.stock === "number") ? item.refill.stock : 0;
      const refillIncoming = (item.refill && typeof item.refill.incoming === "number") ? item.refill.incoming : 0;

      return (spoolStock + spoolIncoming + refillStock + refillIncoming) > 0;
    };

    const materials = {};
    data.forEach(item => {
      if (!materials[item.material]) {
        materials[item.material] = [];
      }
      materials[item.material].push(item);
    });

    Object.keys(materials).forEach(material => {
      // só manter itens com filamento (spool/refill) em stock ou a chegar
      const itemsToShow = materials[material].filter(hasFilament);
      if (itemsToShow.length === 0) return;

      // Título
      const title = document.createElement("h2");
      title.textContent = material;
      container.appendChild(title);

      // Grid
      const grid = document.createElement("div");
      grid.classList.add("grid");

      itemsToShow.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");

        let stockHTML = "";

        // Helper para evitar undefined
        const n = (v) => (typeof v === "number" ? v : 0);

        // Refill
        if (item.refill && typeof item.refill.stock === "number") {
          const stock = n(item.refill.stock);
          const incoming = n(item.refill.incoming);

          stockHTML += `
            <div class="stock-block stock-block--refill">
              <div class="stock-line">
                <span class="label">Refill:</span>
                <span class="value">${stock}</span>
              </div>

              <div class="stock-line soon ${incoming > 0 ? "" : "soon--empty"}">
                ${incoming > 0 ? `Brevemente: ${incoming}` : `Brevemente: 0`}
              </div>
            </div>
          `;
        }

        // Spool
        if (item.spool && typeof item.spool.stock === "number") {
          const stock = n(item.spool.stock);
          const incoming = n(item.spool.incoming);

          stockHTML += `
            <div class="stock-block">
              <div class="stock-line">
                <span class="label">Spool:</span>
                <span class="value">${stock}</span>
              </div>
              <div class="stock-line soon">Brevemente: ${incoming}</div>
            </div>
          `;
        }

        card.innerHTML = `
          <img src="${item.image}" alt="${item.color} ${item.material}">
          <h3>${item.color}</h3>
          <p class="color">${item.material}</p>
          <div class="stock">
            ${stockHTML}
          </div>
        `;

        grid.appendChild(card);
      });

      container.appendChild(grid);
    });
  })
  .catch(err => console.error("Erro ao carregar inventário:", err));