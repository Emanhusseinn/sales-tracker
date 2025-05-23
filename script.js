const products = {
  sweet: [
    { name: "Chocolate Chip Cookies", image: "images/cookies.png" },
    { name: "Brownies", image: "images/brownies.png" },
    { name: "Kids Cookies", image: "images/kids-cookies.png" },
  ],
  savory: [
    { name: "Yalanji", image: "images/yalanji.png" },
    { name: "Kibbeh", image: "images/kibbeh.png" },
    { name: "Musakhan", image: "images/musakhan.png" },
    { name: "Tabbouleh", image: "images/tabbouleh.png" },
  ]
};

const productsEl = document.getElementById("products");
const finalTotalEl = document.getElementById("final-total");

function getQuantities() {
  return JSON.parse(localStorage.getItem("quantities")) || {};
}

function saveQuantities(data) {
  localStorage.setItem("quantities", JSON.stringify(data));
}

function getPrices() {
  return JSON.parse(localStorage.getItem("prices")) || {};
}

function savePrices(data) {
  localStorage.setItem("prices", JSON.stringify(data));
}

function renderProducts(activeTab = 'sweet') {
  const quantities = getQuantities();
  const prices = getPrices();
  let finalTotal = 0;
  productsEl.innerHTML = "";

  // Create and show tabs
  const tabs = document.createElement("div");
  tabs.className = "tabs";
  tabs.innerHTML = `
    <button class="${activeTab === 'sweet' ? 'active' : ''}" data-tab="sweet">Sweet</button>
    <button class="${activeTab === 'savory' ? 'active' : ''}" data-tab="savory">Savory</button>
  `;
  productsEl.appendChild(tabs);

  const categoriesWrapper = document.createElement("div");
  categoriesWrapper.className = "categories-wrapper";

  Object.entries(products).forEach(([category, items]) => {
    if (category !== activeTab) return;
    const section = document.createElement("div");
    section.className = `category ${category}`;
    section.dataset.category = category;

    const title = document.createElement("h2");
    title.textContent = category === 'sweet' ? 'Sweet Items' : 'Savory Items';
    section.appendChild(title);

    items.forEach((product, i) => {
      const key = `${category}-${i}`;
      const quantity = quantities[key] || 0;
      const price = prices[key] || "";
      const subtotal = price && !isNaN(price) ? quantity * parseFloat(price) : 0;
      finalTotal += subtotal;

      const div = document.createElement("div");
      div.className = "product";
      div.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h3>${product.name}</h3>
          <label>
            Price (JD): 
            <input type="number" step="0.01" min="0"
                   data-key="${key}" value="${price}" class="price-input" />
          </label>
          <div class="counter">
            <button data-action="decrease" data-key="${key}">-</button>
            <span>${quantity}</span>
            <button data-action="increase" data-key="${key}">+</button>
          </div>
          <p class="subtotal">Subtotal: ${subtotal.toFixed(2)} JD</p>
        </div>
      `;
      section.appendChild(div);
    });

    categoriesWrapper.appendChild(section);
  });

  productsEl.appendChild(categoriesWrapper);
  finalTotalEl.textContent = finalTotal.toFixed(2);

  document.querySelectorAll('.category').forEach(cat => {
    cat.classList.remove("active");
    if (cat.dataset.category === activeTab) {
      cat.classList.add("active");
    }
  });
}

productsEl.addEventListener("click", (e) => {
  const isButton = e.target.tagName === "BUTTON";
  const action = e.target.dataset.action;
  const tab = e.target.dataset.tab;

  if (tab) {
    renderProducts(tab); // ✅ بس لما أضغط على زر التبويبة
    return;
  }

  if (isButton && action) {
    const key = e.target.dataset.key;
    const quantities = getQuantities();
    quantities[key] = quantities[key] || 0;

    if (action === "increase") {
      quantities[key]++;
    } else if (action === "decrease" && quantities[key] > 0) {
      quantities[key]--;
    }

    saveQuantities(quantities);
    const currentTab = document.querySelector('.tabs .active')?.dataset.tab || 'sweet';
    renderProducts(currentTab); // ✅ بعد تعديل الكمية فقط
  }
});


productsEl.addEventListener("change", (e) => {
  if (e.target.classList.contains("price-input")) {
    e.stopPropagation();
    const key = e.target.dataset.key;
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      const prices = getPrices();
      prices[key] = value;
      savePrices(prices);

      const quantities = getQuantities();
      const quantity = quantities[key] || 0;

      const subtotal = quantity * value;
      e.target.closest(".product").querySelector(".subtotal").textContent =
        `Subtotal: ${subtotal.toFixed(2)} JD`;

      let total = 0;
      Object.keys(prices).forEach((k) => {
        const price = parseFloat(prices[k]);
        const quantity = quantities[k] || 0;
        if (!isNaN(price)) {
          total += price * quantity;
        }
      });

      finalTotalEl.textContent = total.toFixed(2);
    }
  }
});


// Re-render tabs on screen resize
window.addEventListener("DOMContentLoaded", () => {
  renderProducts('sweet'); // أو 'savory' حسب اللي بدك ياه يظهر أول
});


// window.addEventListener("DOMContentLoaded", () => {
//   const tab = document.querySelector('.tabs .active')?.dataset.tab || 'sweet';
//   renderProducts(tab);
// });
