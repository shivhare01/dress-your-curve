const modal = document.querySelector('#product-modal');
const detailImage = document.querySelector('#detail-image');
const detailName = document.querySelector('#detail-name');
const detailPrice = document.querySelector('#detail-price');
const detailDescription = document.querySelector('#detail-description');
const imageWrap = document.querySelector('.detail-image-wrap');
const closeButton = document.querySelector('.modal-close');
const productGrid = document.querySelector('.product-grid');
const checkoutButton = document.querySelector('.checkout-button');
const checkoutMessage = document.querySelector('.checkout-message');
const addToBagButton = document.querySelector('.add-to-bag-button');
const bagButton = document.querySelector('.bag');
const bagCount = bagButton?.querySelector('b');
const bagDrawer = document.querySelector('#bag-drawer');
const bagItems = document.querySelector('.bag-items');
const bagEmpty = document.querySelector('.bag-empty');
const bagTotal = document.querySelector('.bag-total strong');
const bagBackdrop = document.querySelector('.bag-backdrop');
const bagClose = document.querySelector('.bag-close');
const zellePanel = document.querySelector('.zelle-panel');
const zelleProductName = document.querySelector('#zelle-product-name');
const menuButton = document.querySelector('.menu');
const siteNav = document.querySelector('#site-nav');
let opener;
let bag = JSON.parse(localStorage.getItem('sakhi-mohini-bag') || '[]');

menuButton?.addEventListener('click', () => {
  const isOpen = document.body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  menuButton.textContent = isOpen ? '×' : '☰';
});
siteNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  document.body.classList.remove('menu-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open menu');
  if (menuButton) menuButton.textContent = '☰';
}));

const formatPrice = price => `$${Number(price).toLocaleString('en-US')}`;

function addProductCardInteractions(card) {
  card.addEventListener('click', event => { if (!event.target.closest('.heart')) openProduct(card); });
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProduct(card); }
  });
  card.querySelector('.heart').addEventListener('click', event => {
    event.stopPropagation();
    event.currentTarget.textContent = event.currentTarget.textContent === '♡' ? '♥' : '♡';
  });
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `View details for ${product.name}`);
  card.dataset.description = product.description || '';
  card.dataset.productName = product.name;

  const imageBox = document.createElement('div');
  imageBox.className = 'product-image';
  if (product.label) {
    const label = document.createElement('span');
    label.textContent = product.label;
    imageBox.append(label);
  }
  const heart = document.createElement('button');
  heart.className = 'heart';
  heart.type = 'button';
  heart.setAttribute('aria-label', `Save ${product.name}`);
  heart.textContent = '♡';
  const image = document.createElement('img');
  image.src = product.image;
  image.alt = product.alt || product.name;
  image.loading = 'lazy';
  imageBox.append(heart, image);

  const name = document.createElement('h3');
  name.textContent = product.name;
  const price = document.createElement('p');
  price.textContent = formatPrice(product.price);
  const category = document.createElement('p');
  category.className = 'product-type';
  category.textContent = product.category || 'Celebration edit';
  const swatches = document.createElement('div');
  swatches.className = 'swatches';
  for (let i = 0; i < 3; i += 1) swatches.append(document.createElement('i'));
  card.append(imageBox, name, price, category, swatches);
  addProductCardInteractions(card);
  return card;
}

async function loadCatalog() {
  try {
    const response = await fetch('products.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Catalog could not be loaded');
    const products = await response.json();
    const visibleProducts = products.filter(product => product.visible !== false);
    productGrid.replaceChildren(...visibleProducts.map(createProductCard));
  } catch (error) {
    productGrid.innerHTML = '<p class="catalog-status">The collection is temporarily unavailable. Please refresh the page.</p>';
  }
}

function openProduct(card) {
  const image = card.querySelector('img');
  const name = card.querySelector('h3').textContent;
  detailImage.src = image.src;
  detailImage.alt = image.alt;
  detailName.textContent = name;
  detailPrice.textContent = card.querySelector('p').textContent;
  detailDescription.textContent = card.dataset.description || 'A thoughtfully crafted occasionwear piece, designed for comfort, confidence and celebration.';
  zelleProductName.textContent = name;
  selectPaymentMethod('stripe');
  opener = card;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  closeButton.focus();
}

function saveBag() {
  localStorage.setItem('sakhi-mohini-bag', JSON.stringify(bag));
  renderBag();
}

function renderBag() {
  const count = bag.reduce((sum, item) => sum + item.quantity, 0);
  const total = bag.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  if (bagCount) bagCount.textContent = count;
  if (bagItems) {
    bagItems.replaceChildren(...bag.map(item => {
      const row = document.createElement('div');
      row.className = 'bag-item';
      row.innerHTML = `<img src="${item.image}" alt=""><div><h3></h3><p>${formatPrice(item.price)} · Qty ${item.quantity}</p><button type="button" class="bag-item-checkout">Checkout</button></div><button type="button" class="bag-remove" aria-label="Remove ${item.name}">×</button>`;
      row.querySelector('h3').textContent = item.name;
      row.querySelector('.bag-remove').addEventListener('click', () => { bag = bag.filter(entry => entry.name !== item.name); saveBag(); });
      row.querySelector('.bag-item-checkout').addEventListener('click', () => beginStripeCheckout(item.name));
      return row;
    }));
  }
  bagEmpty.hidden = count > 0;
  document.querySelector('.bag-total').hidden = count === 0;
  document.querySelector('.bag-help').hidden = count === 0;
  bagTotal.textContent = formatPrice(total);
}

function openBag() {
  renderBag();
  bagDrawer.classList.add('open');
  bagDrawer.setAttribute('aria-hidden', 'false');
  bagBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  bagClose.focus();
}

function closeBag() {
  bagDrawer.classList.remove('open');
  bagDrawer.setAttribute('aria-hidden', 'true');
  bagBackdrop.hidden = true;
  document.body.style.overflow = modal.classList.contains('open') ? 'hidden' : '';
  bagButton?.focus();
}

function closeProduct() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  imageWrap.classList.remove('zooming');
  detailImage.style.transformOrigin = 'center';
  opener?.focus();
}

closeButton.addEventListener('click', closeProduct);
document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('open')) closeProduct(); });

function updateZoom(event) {
  const box = imageWrap.getBoundingClientRect();
  const x = Math.max(0, Math.min(100, ((event.clientX - box.left) / box.width) * 100));
  const y = Math.max(0, Math.min(100, ((event.clientY - box.top) / box.height) * 100));
  detailImage.style.transformOrigin = `${x}% ${y}%`;
}

imageWrap.addEventListener('pointerdown', event => {
  imageWrap.setPointerCapture(event.pointerId);
  updateZoom(event);
  imageWrap.classList.add('zooming');
});
imageWrap.addEventListener('pointermove', event => { if (imageWrap.classList.contains('zooming')) updateZoom(event); });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => imageWrap.addEventListener(type, () => imageWrap.classList.remove('zooming')));

function selectPaymentMethod(payment) {
  document.querySelectorAll('.method').forEach(item => item.classList.remove('selected'));
  document.querySelector(`.method[data-payment="${payment}"]`)?.classList.add('selected');
  const isZelle = payment === 'zelle';
  zellePanel.hidden = !isZelle;
  checkoutButton.hidden = isZelle;
  checkoutMessage.textContent = isZelle
    ? 'Use the QR code in your Zelle-enabled bank app. Payments are verified manually.'
    : '';
}

document.querySelectorAll('.method').forEach(method => method.addEventListener('click', () => {
  selectPaymentMethod(method.dataset.payment);
}));
async function beginStripeCheckout() {
  const checkoutApi = window.SAKHI_MOHINI_CHECKOUT_API;
  const productName = arguments[0] || opener?.dataset.productName;

  if (!checkoutApi || !productName) {
    checkoutMessage.textContent = 'Secure checkout is being connected. Please try again shortly.';
    return;
  }

  checkoutButton.disabled = true;
  checkoutButton.innerHTML = 'Opening secure checkout <span>…</span>';
  checkoutMessage.textContent = '';
  try {
    const response = await fetch(checkoutApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName, quantity: 1 })
    });
    const result = await response.json();
    if (!response.ok || !result.url) throw new Error(result.error || 'Checkout could not be started.');
    window.location.assign(result.url);
  } catch (error) {
    checkoutMessage.textContent = error.message || 'Checkout could not be started. Please try again.';
    checkoutButton.disabled = false;
    checkoutButton.innerHTML = 'Secure checkout <span>→</span>';
  }
}

document.querySelector('.checkout-button').addEventListener('click', () => {
  const selected = document.querySelector('.method.selected')?.dataset.payment;
  if (selected === 'stripe') {
    beginStripeCheckout();
    return;
  }
  checkoutMessage.textContent = selected === 'zelle'
    ? 'Use the QR code in your Zelle-enabled bank app. Payments are verified manually.'
    : 'Secure Stripe checkout is unavailable. Please try again shortly.';
});

addToBagButton.addEventListener('click', () => {
  if (!opener) return;
  const name = opener.dataset.productName;
  const price = Number(opener.querySelector('p').textContent.replace(/[^0-9.]/g, ''));
  const image = opener.querySelector('img');
  const existing = bag.find(item => item.name === name);
  if (existing) existing.quantity += 1;
  else bag.push({ name, price, image: image.src, alt: image.alt, quantity: 1 });
  saveBag();
  closeProduct();
  openBag();
});

bagButton?.addEventListener('click', openBag);
bagClose?.addEventListener('click', closeBag);
bagBackdrop?.addEventListener('click', closeBag);

document.querySelector('.newsletter form').addEventListener('submit', event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  button.innerHTML = 'You’re on the list <span>✓</span>';
});

loadCatalog();
renderBag();
