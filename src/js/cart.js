(function () {
  var configEl = document.getElementById("ordering-config");
  if (!configEl) return;

  var config;
  try {
    config = JSON.parse(configEl.textContent);
  } catch (e) {
    return;
  }

  var STORAGE_KEY = "ordering_cart_v1";
  var memoryCart = [];

  function readCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return memoryCart;
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : memoryCart;
    } catch (e) {
      return memoryCart;
    }
  }

  function writeCart(cart) {
    memoryCart = cart;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      // Storage unavailable (e.g. Safari private mode) — memoryCart still
      // keeps the cart working for the rest of this page load.
    }
  }

  function lineKey(id, variant) {
    return id + "::" + (variant || "");
  }

  function addToCart(id, name, price, variant) {
    var cart = readCart();
    var key = lineKey(id, variant);
    var existing = cart.find(function (line) {
      return lineKey(line.id, line.variant) === key;
    });
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: id, name: name, price: price, variant: variant || "", qty: 1 });
    }
    writeCart(cart);
    renderAll();
  }

  function changeQty(id, variant, delta) {
    var cart = readCart();
    var key = lineKey(id, variant);
    var line = cart.find(function (l) {
      return lineKey(l.id, l.variant) === key;
    });
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) {
      cart = cart.filter(function (l) {
        return lineKey(l.id, l.variant) !== key;
      });
    }
    writeCart(cart);
    renderAll();
  }

  function removeLine(id, variant) {
    var key = lineKey(id, variant);
    var cart = readCart().filter(function (l) {
      return lineKey(l.id, l.variant) !== key;
    });
    writeCart(cart);
    renderAll();
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderBadge(cart) {
    var badge = document.querySelector("[data-cart-count]");
    if (!badge) return;
    var count = cart.reduce(function (sum, l) {
      return sum + l.qty;
    }, 0);
    if (count > 0) {
      badge.textContent = String(count);
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }

  function buildWhatsAppLink(cart) {
    var lines = cart.map(function (l) {
      var variantText = l.variant ? " (" + l.variant + ")" : "";
      return "- " + l.qty + "x " + l.name + variantText;
    });
    // Naive qty * price subtotal — doesn't account for by-weight `unit`
    // pricing (e.g. "per lb"). Fine here since a human reads the final
    // WhatsApp message, but worth knowing if a future clone needs it.
    var total = cart.reduce(function (sum, l) {
      return sum + l.qty * (parseFloat(l.price) || 0);
    }, 0);
    var message =
      config.intro + "\n" + lines.join("\n") + "\n\nTotal: $" + total.toFixed(2) + "\n\n" + config.outro;
    var digits = (config.number || "").replace(/\D/g, "");
    return "https://wa.me/" + digits + "?text=" + encodeURIComponent(message);
  }

  function renderPanel(cart) {
    var panel = document.querySelector("[data-cart-panel]");
    if (!panel) return;

    var emptyEl = panel.querySelector("[data-cart-empty]");
    var linesEl = panel.querySelector("[data-cart-lines]");
    var totalEl = panel.querySelector("[data-cart-total]");
    var totalAmountEl = panel.querySelector("[data-cart-total-amount]");
    var whatsappLink = panel.querySelector("[data-cart-whatsapp-link]");

    if (cart.length === 0) {
      emptyEl.hidden = false;
      linesEl.innerHTML = "";
      totalEl.hidden = true;
      whatsappLink.hidden = true;
      whatsappLink.href = "#";
      return;
    }

    emptyEl.hidden = true;
    totalEl.hidden = false;
    whatsappLink.hidden = false;
    linesEl.innerHTML = "";

    var total = 0;
    cart.forEach(function (line) {
      var lineTotal = line.qty * (parseFloat(line.price) || 0);
      total += lineTotal;
      var nameText = line.name + (line.variant ? " (" + line.variant + ")" : "");

      var row = document.createElement("div");
      row.className = "cart-line";

      var info = document.createElement("div");
      info.innerHTML = "<strong>" + escapeHtml(nameText) + "</strong>";
      row.appendChild(info);

      var qtyWrap = document.createElement("div");
      qtyWrap.className = "cart-line__qty";

      var minusBtn = document.createElement("button");
      minusBtn.type = "button";
      minusBtn.textContent = "−";
      minusBtn.setAttribute("aria-label", "Decrease quantity of " + nameText);
      minusBtn.addEventListener("click", function () {
        changeQty(line.id, line.variant, -1);
      });

      var qtyText = document.createElement("span");
      qtyText.textContent = String(line.qty);

      var plusBtn = document.createElement("button");
      plusBtn.type = "button";
      plusBtn.textContent = "+";
      plusBtn.setAttribute("aria-label", "Increase quantity of " + nameText);
      plusBtn.addEventListener("click", function () {
        changeQty(line.id, line.variant, 1);
      });

      qtyWrap.appendChild(minusBtn);
      qtyWrap.appendChild(qtyText);
      qtyWrap.appendChild(plusBtn);
      row.appendChild(qtyWrap);

      var removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "cart-line__remove";
      removeBtn.textContent = "Remove";
      removeBtn.setAttribute("aria-label", "Remove " + nameText + " from cart");
      removeBtn.addEventListener("click", function () {
        removeLine(line.id, line.variant);
      });
      row.appendChild(removeBtn);

      linesEl.appendChild(row);
    });

    totalAmountEl.textContent = "$" + total.toFixed(2);
    whatsappLink.href = buildWhatsAppLink(cart);
  }

  function renderAll() {
    var cart = readCart();
    renderBadge(cart);
    renderPanel(cart);
  }

  document.addEventListener("click", function (e) {
    var addBtn = e.target.closest("[data-add-to-cart]");
    if (!addBtn) return;
    var row = addBtn.closest("[data-item-id]");
    if (!row) return;
    var variantSelect = row.querySelector(".menu-row__variant");
    addToCart(
      row.dataset.itemId,
      row.dataset.itemName,
      row.dataset.itemPrice,
      variantSelect ? variantSelect.value : ""
    );
  });

  renderAll();
})();
