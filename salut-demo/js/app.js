/* ===== Салют-Огонь, Пятигорск — каталог ===== */

const PHONE = "+7 (934) 831-11-09";
const PHONE_LINK = "tel:+79348311109";

/* WhatsApp: ссылка с заранее вписанным текстом про салюты */
const WA_BASE = "https://wa.me/79348311109?text=";
const WA_DEFAULT_TEXT = "Здравствуйте! Меня интересует салют из вашего каталога. Подскажите, пожалуйста, наличие и цену.";
const WA_LINK = WA_BASE + encodeURIComponent(WA_DEFAULT_TEXT);

/* ===== Загрузка картинок небольшими кусками =====
   Сеть иногда «залипает» на больших ответах Cloudflare, поэтому картинку
   запрашиваем по 20 КБ и собираем обратно уже в браузере. */
const IMAGE_CHUNK = 20000;
const TINY_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
const imageCache = new Map();

async function loadImageBlob(url) {
  if (imageCache.has(url)) return imageCache.get(url);

  const first = await fetch(url, {
    headers: { Range: `bytes=0-${IMAGE_CHUNK - 1}` },
  });

  if (first.status !== 206) {
    const blob = await first.blob();
    imageCache.set(url, blob);
    return blob;
  }

  const contentRange = first.headers.get("content-range") || "";
  const total = Number(contentRange.split("/")[1]) || 0;
  const parts = [new Uint8Array(await first.arrayBuffer())];

  for (let start = IMAGE_CHUNK; start < total; start += IMAGE_CHUNK) {
    const end = Math.min(start + IMAGE_CHUNK - 1, total - 1);
    const response = await fetch(url, {
      headers: { Range: `bytes=${start}-${end}` },
    });
    parts.push(new Uint8Array(await response.arrayBuffer()));
  }

  const blob = new Blob(parts, { type: "image/jpeg" });
  imageCache.set(url, blob);
  return blob;
}

async function hydrateImage(img) {
  const url = img.dataset.src;
  if (!url || img.dataset.loading) return;
  img.dataset.loading = "1";

  try {
    const blob = await loadImageBlob(url);
    img.src = URL.createObjectURL(blob);
  } catch (error) {
    img.src = url;
  }
}

function hydrateImages(root = document) {
  root.querySelectorAll("img[data-src]").forEach(hydrateImage);
}

/* Пять салютов. Порядок = порядок цен: 12 000 → 21 000 ₽ */
const PRODUCTS = [
  {
    id: "russkiy",
    name: "Батарея «Русский фейерверк»",
    category: "Батареи",
    price: 12000,
    badge: "Хит продаж",
    hue: 38,
    image: "images/7155265999.jpg",
    desc: "Классическая батарея с плотными залпами и тёплыми золотистыми разрывами. Хороший выбор для первого большого салюта во дворе или на даче.",
    meta: "36 залпов · золотой · для двора",
    specs: [
      ["Тип", "Батарея залпового огня"],
      ["Количество залпов", "36"],
      ["Время работы", "~60 секунд"],
      ["Калибр", "20 мм"],
      ["Высота подъёма", "до 30 м"],
      ["Радиус разлёта", "до 20 м"],
    ],
  },
  {
    id: "prazdnichniy",
    name: "Фейерверк «Праздничный»",
    category: "Фейерверки",
    price: 14000,
    badge: "Новинка",
    hue: 275,
    image: "images/newpic-002006-big-file.jpg",
    desc: "Яркий набор с разными эффектами — подойдёт для дня рождения, свадьбы или корпоратива. Смотрится весело и не требует большой площадки.",
    meta: "разные эффекты · для праздника",
    specs: [
      ["Тип", "Фейерверк"],
      ["Эффекты", "разноцветные разрывы"],
      ["Время работы", "~70 секунд"],
      ["Калибр", "25 мм"],
      ["Высота подъёма", "до 35 м"],
      ["Радиус разлёта", "до 25 м"],
    ],
  },
  {
    id: "syurpriz",
    name: "Батарея «Сюрприз»",
    category: "Батареи",
    price: 15000,
    badge: "Компактный",
    hue: 190,
    image: "images/7xqcd95yebqrh01nl6cbn7d53qlrll44.jpeg",
    desc: "Небольшая батарея с неожиданными переходами: несколько эффектов в одной коробке. Удобно брать на дачу или ставить рядом с основной коллекцией.",
    meta: "13 залпов · сюрприз · компактный",
    specs: [
      ["Тип", "Батарея залпового огня"],
      ["Количество залпов", "13"],
      ["Время работы", "~35 секунд"],
      ["Калибр", "20 мм"],
      ["Высота подъёма", "до 25 м"],
      ["Радиус разлёта", "до 18 м"],
    ],
  },
  {
    id: "fireworks-collection",
    name: "Коллекция Fireworks, 36 залпов",
    category: "Коллекции",
    price: 18000,
    badge: "36 залпов",
    hue: 350,
    image: "images/ba4cdff75f41c9f271fbadf793acdbf0.jpg",
    desc: "Готовая коллекция на 36 залпов: несколько эффектов и уверенный финал. Оптимальный вариант, если нужен один салют на весь вечер.",
    meta: "36 залпов · коллекция · финал",
    specs: [
      ["Тип", "Коллекция / батарея"],
      ["Количество залпов", "36"],
      ["Время работы", "~90 секунд"],
      ["Калибр", "25 мм"],
      ["Высота подъёма", "до 35 м"],
      ["Радиус разлёта", "до 25 м"],
    ],
  },
  {
    id: "zhelanniy-podarok",
    name: "Батарея «Желанный подарок» MB-120",
    category: "Подарочные",
    price: 21000,
    badge: "Премиум",
    hue: 45,
    image: "images/mb120-2-1000x1000.jpg",
    desc: "Самая масштабная позиция в подборке — для тех, кто хочет по-настоящему большой финал. Хорошо подходит для свадьбы, Нового года и городского праздника.",
    meta: "120 · подарок · максимум эффекта",
    specs: [
      ["Тип", "Батарея премиум-класса"],
      ["Модель", "MB-120"],
      ["Количество залпов", "120"],
      ["Время работы", "~120 секунд"],
      ["Калибр", "30 мм"],
      ["Высота подъёма", "до 45 м"],
      ["Радиус разлёта", "до 35 м"],
    ],
  },
];

const formatPrice = (value) => new Intl.NumberFormat("ru-RU").format(value) + " ₽";

/* ===== Каталог ===== */

const grid = document.getElementById("productGrid");

function cardTemplate(product) {
  const old = product.oldPrice ? `<s>${formatPrice(product.oldPrice)}</s>` : "";

  return `
    <article class="product-card" data-id="${product.id}">
      <div class="product-card__visual" style="--hue:${product.hue}">
        ${product.badge ? `<span class="product-card__badge">${product.badge}</span>` : ""}
        <img class="is-photo" src="${TINY_PIXEL}" data-src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-card__body">
        <span class="product-card__cat">${product.category}</span>
        <h3>${product.name}</h3>
        <p class="product-card__desc">${product.desc}</p>
        <span class="product-card__meta">${product.meta}</span>
        <div class="product-card__footer">
          <div class="price">${formatPrice(product.price)}${old}</div>
          <button class="btn btn--small" type="button" data-open="${product.id}">Подробнее</button>
        </div>
      </div>
    </article>
  `;
}

function renderProducts(filter = "all") {
  if (!grid) return;

  const list =
    filter === "all" ? PRODUCTS : PRODUCTS.filter((product) => product.category === filter);

  grid.innerHTML = list.map(cardTemplate).join("");
  observeReveals(grid.querySelectorAll(".product-card"));
  hydrateImages(grid);
}

/* ===== Фильтры ===== */

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-selected", "false");
    });

    button.classList.add("is-active");
    button.setAttribute("aria-selected", "true");
    renderProducts(button.dataset.filter);
  });
});

/* ===== Модальное окно ===== */

const modal = document.getElementById("modal");
const modalVisual = document.getElementById("modalVisual");
const modalCat = document.getElementById("modalCat");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalSpecs = document.getElementById("modalSpecs");
const modalPrice = document.getElementById("modalPrice");
const modalCall = document.getElementById("modalCall");
const modalWa = document.getElementById("modalWa");

let lastFocused = null;

function openModal(product) {
  if (!modal) return;

  if (modalVisual) {
    modalVisual.style.setProperty("--hue", product.hue);
    modalVisual.innerHTML = `<img class="is-photo" src="${TINY_PIXEL}" data-src="${product.image}" alt="${product.name}">`;
    hydrateImages(modalVisual);
  }

  modalCat.textContent = product.category;
  modalTitle.textContent = product.name;
  modalDesc.textContent = product.desc;
  modalPrice.textContent = formatPrice(product.price);

  modalSpecs.innerHTML = product.specs
    .map(([label, value]) => `<li><span>${label}</span><strong>${value}</strong></li>`)
    .join("");

  modalCall.href = PHONE_LINK;

  /* В окне товара пишем продавцу сразу про конкретный салют */
  const waText = `Здравствуйте! Меня интересует товар: ${product.name} (${formatPrice(product.price)}). Подскажите, пожалуйста, наличие и условия заказа.`;
  modalWa.href = WA_BASE + encodeURIComponent(waText);

  lastFocused = document.activeElement;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  modal.querySelector(".modal__close")?.focus();
}

function closeModal() {
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (lastFocused instanceof HTMLElement) lastFocused.focus();
}

document.addEventListener("click", (event) => {
  const opener = event.target.closest("[data-open]");
  if (opener) {
    const product = PRODUCTS.find((item) => item.id === opener.dataset.open);
    if (product) openModal(product);
    return;
  }

  if (event.target.closest("[data-close]") || event.target.closest(".modal__close")) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
});

/* ===== Мобильное меню ===== */

const burger = document.querySelector(".burger");
const nav = document.getElementById("nav");

if (burger && nav) {
  burger.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(isOpen));
    burger.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  });

  nav.addEventListener("click", (event) => {
    if (event.target.tagName === "A" && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Открыть меню");
    }
  });
}

/* ===== Появление при скролле ===== */

const observer =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px" }
      )
    : null;

function observeReveals(elements) {
  elements.forEach((element) => {
    element.classList.add("reveal");
    if (observer) observer.observe(element);
    else element.classList.add("is-visible");
  });
}

/* ===== Старт ===== */

observeReveals(document.querySelectorAll(".reveal"));
renderProducts();

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());
