const modal = document.querySelector('#product-modal');
const detailImage = document.querySelector('#detail-image');
const detailName = document.querySelector('#detail-name');
const detailPrice = document.querySelector('#detail-price');
const detailDescription = document.querySelector('#detail-description');
const imageWrap = document.querySelector('.detail-image-wrap');
const closeButton = document.querySelector('.modal-close');
const productGrid = document.querySelector('.product-grid');
let opener;

const formatPrice = price => `₹${Number(price).toLocaleString('en-IN')}`;

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
  card.dataset.stripeLink = product.stripe_checkout_url || '';

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
  opener = card;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  closeButton.focus();
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

document.querySelectorAll('.method').forEach(method => method.addEventListener('click', () => {
  document.querySelectorAll('.method').forEach(item => item.classList.remove('selected'));
  method.classList.add('selected');
}));
document.querySelector('.checkout-button').addEventListener('click', () => {
  const selected = document.querySelector('.method.selected')?.dataset.payment;
  const stripeLink = opener?.dataset.stripeLink;
  if (selected === 'stripe' && /^https:\/\/(?:buy|checkout)\.stripe\.com\//.test(stripeLink || '')) {
    window.location.assign(stripeLink);
    return;
  }
  document.querySelector('.checkout-message').textContent = selected === 'zelle'
    ? 'Zelle payment instructions will appear here once the business Zelle address is connected.'
    : 'Secure Stripe checkout will open here once this product has a Stripe Payment Link.';
});

document.querySelector('.newsletter form').addEventListener('submit', event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  button.innerHTML = 'You’re on the list <span>✓</span>';
});

loadCatalog();
