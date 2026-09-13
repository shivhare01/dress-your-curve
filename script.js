const descriptions = {
  'Rang mirror-work vest': 'A statement men’s vest alive with hand-applied mirror work and colourful geometric embroidery. Wear it over a simple kurta for a celebration-ready layer that does all the talking.',
  'Neel embroidered vest': 'A royal-blue vest with fine gold motifs and a vibrant embroidered placket. Its polished silhouette brings a festive finish to kurta-pajama sets and occasion dressing.',
  'Meher mirror-work lehenga set': 'A rich maroon lehenga set detailed with glimmering gold lines, a fitted blouse and a matching drape. A graceful choice for sangeet nights, weddings and festive gatherings.',
  'Noor contrast lehenga set': 'A dramatic black-and-crimson lehenga with ornate borders and a statement dupatta. The contrasting panels create movement and make this set feel instantly celebratory.',
  'Rani black-and-gold lehenga': 'A timeless black lehenga brought to life with gold detailing, bold circular accents and a crimson dupatta. Designed to feel elegant, comfortable and memorable.',
  'Neel mustard tassel lehenga': 'A jewel-blue lehenga with a sunny mustard border, shell tassels and a flowing dupatta. The playful contrast makes it a beautiful choice for daytime festivities.'
};

const modal = document.querySelector('#product-modal');
const detailImage = document.querySelector('#detail-image');
const detailName = document.querySelector('#detail-name');
const detailPrice = document.querySelector('#detail-price');
const detailDescription = document.querySelector('#detail-description');
const imageWrap = document.querySelector('.detail-image-wrap');
const closeButton = document.querySelector('.modal-close');
let opener;

function openProduct(card) {
  const image = card.querySelector('img');
  const name = card.querySelector('h3').textContent;
  detailImage.src = image.src;
  detailImage.alt = image.alt;
  detailName.textContent = name;
  detailPrice.textContent = card.querySelector('p').textContent;
  detailDescription.textContent = descriptions[name] || 'A thoughtfully crafted occasionwear piece, designed for comfort, confidence and celebration.';
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

document.querySelectorAll('.product-grid article').forEach(card => {
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `View details for ${card.querySelector('h3').textContent}`);
  card.addEventListener('click', event => { if (!event.target.closest('.heart')) openProduct(card); });
  card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProduct(card); } });
});

document.querySelectorAll('.heart').forEach(button => button.addEventListener('click', event => {
  event.stopPropagation();
  button.textContent = button.textContent === '♡' ? '♥' : '♡';
}));

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
  document.querySelector('.checkout-message').textContent = selected === 'zelle'
    ? 'Zelle payment instructions will appear here once the business Zelle address is connected.'
    : 'Secure Stripe checkout will open here once this product has a Stripe Payment Link.';
});

document.querySelector('.newsletter form').addEventListener('submit', event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  button.innerHTML = 'You’re on the list <span>✓</span>';
});
