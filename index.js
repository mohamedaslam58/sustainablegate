// Navigation Page Switching
function updateActiveNavLink(cleanId) {
  // Clear 'active' from all nav items
  const navLinks = document.querySelectorAll('.nav-links a, .nav-link, .nav-menu a');
  navLinks.forEach(link => link.classList.remove('active'));

  // Target specific link by element ID first (e.g., id="nav-services")
  const targetById = document.getElementById(`nav-${cleanId}`);
  if (targetById) {
    targetById.classList.add('active');
    return;
  }

  // Fallback check against href or onclick attributes
  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    const onclickStr = link.getAttribute('onclick') || '';

    if (
      href.includes(cleanId) ||
      onclickStr.includes(`'${cleanId}'`) ||
      onclickStr.includes(`"${cleanId}"`)
    ) {
      link.classList.add('active');
    }
  });
}

/**
 * Helper to check if current page is index.html or root directory
 */
function isIndexPage() {
  const currentPath = window.location.pathname.toLowerCase();
  return (
    currentPath.endsWith('index.html') ||
    currentPath.endsWith('/') ||
    !currentPath.includes('.html')
  );
}

/**
 * Opens separate HTML subpages safely on local file systems (file:///)
 */
function openSubpage(pageName, event) {
  if (event) event.preventDefault();

  // Strip leading slashes to prevent stripping the parent directory (/SG/)
  const cleanPage = pageName.replace(/^\//, '');

  // Redirect within the current directory
  window.location.href = `./${cleanPage}`;
}

/**
 * Handles section switching on index.html and returning from subpages
 */
function navigateTo(sectionId, event) {
  if (event) event.preventDefault();

  const cleanId = sectionId.replace('#', '').replace('page-', '');

  if (!isIndexPage()) {
    // Return to index.html within the same directory without dropping /SG/
    window.location.href = `./index.html#${cleanId}`;
    return;
  }

  // Section display logic for index.html
  const targetSection = document.getElementById(cleanId) || document.getElementById(`page-${cleanId}`);

  if (targetSection) {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
      page.style.display = 'none';
    });

    targetSection.classList.add('active');
    targetSection.style.display = 'block';

    targetSection.scrollIntoView({ behavior: 'smooth' });

    if (history.pushState) {
      history.pushState(null, null, `#${cleanId}`);
    } else {
      window.location.hash = cleanId;
    }

    // Update active underline state on navbar
    updateActiveNavLink(cleanId);
  }
}

// Ensure proper page and active nav loading ONLY on index.html
document.addEventListener('DOMContentLoaded', () => {
  initClientsCarousel();

  if (isIndexPage()) {
    const hash = window.location.hash.replace('#', '') || 'home';
    navigateTo(hash);
  }
});

window.addEventListener('hashchange', () => {
  if (isIndexPage()) {
    const hash = window.location.hash.replace('#', '') || 'home';
    navigateTo(hash);
  }
});

// Listen to browser back/forward buttons
window.addEventListener('popstate', () => {
  if (isIndexPage()) {
    const hash = window.location.hash.replace('#', '') || 'home';
    navigateTo(hash);
  }
});

// Modal Functionality
function openModal(title, description) {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalDescription").innerText = description;
  document.getElementById("serviceModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("serviceModal").style.display = "none";
}

// Service Filtering
function filterServices(category) {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => btn.classList.remove("active"));
  if (event && event.target) {
    event.target.classList.add("active");
  }

  const cards = document.querySelectorAll("#full-services-grid .service-card");
  cards.forEach((card) => {
    if (category === "all" || card.getAttribute("data-category") === category) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

// Auto-playing Carousel with Navigation Arrows
(function initHomeServicesCarousel() {
  const carousel = document.getElementById("home-services-carousel");
  if (!carousel) return;

  const originalLinks = Array.from(
    carousel.querySelectorAll(".service-card-link"),
  );
  if (originalLinks.length < 2) return;

  // 1. Inject CSS for Carousel & Navigation Arrows
  const style = document.createElement("style");
  style.textContent = `
    .carousel-container-relative {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
    }
    .carousel-wrapper {
      overflow: hidden;
      width: 100%;
    }
    #home-services-carousel {
      display: flex;
      flex-wrap: nowrap;
      gap: 24px;
      transition: transform 0.5s ease-in-out;
      will-change: transform;
    }
    #home-services-carousel .service-card-link {
      flex: 0 0 calc(25% - 18px);
      min-width: calc(25% - 18px);
      box-sizing: border-box;
    }
    @media (max-width: 900px) {
      #home-services-carousel .service-card-link {
        flex: 0 0 calc(50% - 12px);
        min-width: calc(50% - 12px);
      }
    }
    @media (max-width: 600px) {
      #home-services-carousel .service-card-link {
        flex: 0 0 100%;
        min-width: 100%;
      }
    }

    /* Carousel Nav Arrows */
    .carousel-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 42px;
      height: 42px;
      background-color: #ffffff;
      color: #2D3258;
      border: 1px solid #e2e8f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: all 0.25s ease;
    }
    .carousel-arrow:hover {
      background-color: #008844;
      color: #ffffff;
      border-color: #008844;
    }
    .carousel-arrow.prev-btn {
      left: -20px;
    }
    .carousel-arrow.next-btn {
      right: -20px;
    }

    @media (max-width: 768px) {
      .carousel-arrow.prev-btn { left: -10px; }
      .carousel-arrow.next-btn { right: -10px; }
      .carousel-arrow { width: 36px; height: 36px; }
    }
  `;
  document.head.appendChild(style);

  // 2. Wrap Carousel & Insert Arrow Controls
  let outerContainer = carousel.parentElement;
  if (!outerContainer.classList.contains("carousel-container-relative")) {
    const relWrapper = document.createElement("div");
    relWrapper.className = "carousel-container-relative";

    const innerWrapper = document.createElement("div");
    innerWrapper.className = "carousel-wrapper";

    carousel.parentNode.insertBefore(relWrapper, carousel);
    relWrapper.appendChild(innerWrapper);
    innerWrapper.appendChild(carousel);

    // Create Left & Right Arrow Buttons
    const prevBtn = document.createElement("button");
    prevBtn.className = "carousel-arrow prev-btn";
    prevBtn.setAttribute("aria-label", "Previous Slide");
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';

    const nextBtn = document.createElement("button");
    nextBtn.className = "carousel-arrow next-btn";
    nextBtn.setAttribute("aria-label", "Next Slide");
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';

    relWrapper.appendChild(prevBtn);
    relWrapper.appendChild(nextBtn);

    prevBtn.addEventListener("click", () => movePrev());
    nextBtn.addEventListener("click", () => moveNext());

    relWrapper.addEventListener("mouseenter", stopTimer);
    relWrapper.addEventListener("mouseleave", startTimer);
  }

  // 3. Clone elements for infinite loop
  originalLinks.forEach((card) => {
    const clone = card.cloneNode(true);
    carousel.appendChild(clone);
  });

  let index = 0;
  let timer = null;

  function getStepDistance() {
    const cardWidth = carousel.children[0].getBoundingClientRect().width;
    return cardWidth + 24; // Card width + gap
  }

  function moveNext() {
    index++;
    const step = getStepDistance();
    carousel.style.transition = "transform 0.5s ease-in-out";
    carousel.style.transform = `translateX(-${index * step}px)`;

    if (index >= originalLinks.length) {
      setTimeout(() => {
        carousel.style.transition = "none";
        index = 0;
        carousel.style.transform = "translateX(0)";
      }, 500);
    }
  }

  function movePrev() {
    if (index <= 0) {
      index = originalLinks.length;
      const step = getStepDistance();
      carousel.style.transition = "none";
      carousel.style.transform = `translateX(-${index * step}px)`;

      // Force repaint before transitioning
      carousel.offsetHeight;
    }

    index--;
    const step = getStepDistance();
    carousel.style.transition = "transform 0.5s ease-in-out";
    carousel.style.transform = `translateX(-${index * step}px)`;
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(moveNext, 3500);
  }

  function stopTimer() {
    if (timer) clearInterval(timer);
  }

  window.addEventListener("resize", () => {
    carousel.style.transition = "none";
    index = 0;
    carousel.style.transform = "translateX(0)";
  });

  startTimer();
})();

// Close modal when clicking outside box
window.onclick = function (event) {
  const modal = document.getElementById("serviceModal");
  if (event.target == modal) {
    closeModal();
  }
};

// Auto-playing Client Logos Carousel (Without Arrows)
function initClientsCarousel() {
  const carousel = document.getElementById('clients-carousel');
  if (!carousel) return;

  const originalCards = Array.from(carousel.querySelectorAll('.client-logo-card'));
  if (originalCards.length < 2) return;

  // Clone items to form a continuous loop
  originalCards.forEach(card => {
    const clone = card.cloneNode(true);
    carousel.appendChild(clone);
  });

  let index = 0;
  let timer = null;

  function getStepDistance() {
    const cardWidth = carousel.children[0].getBoundingClientRect().width;
    const gap = 32; // Matches CSS gap
    return cardWidth + gap;
  }

  function moveNext() {
    index++;
    const step = getStepDistance();
    carousel.style.transition = 'transform 0.6s ease-in-out';
    carousel.style.transform = `translateX(-${index * step}px)`;

    // Reset position seamlessly when reaching cloned set
    if (index >= originalCards.length) {
      setTimeout(() => {
        carousel.style.transition = 'none';
        index = 0;
        carousel.style.transform = 'translateX(0)';
      }, 600);
    }
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(moveNext, 2000); // Transitions every 2 seconds
  }

  function stopTimer() {
    if (timer) clearInterval(timer);
  }

  // Pause scrolling when user hovers over logos
  if (carousel.parentElement) {
    carousel.parentElement.addEventListener('mouseenter', stopTimer);
    carousel.parentElement.addEventListener('mouseleave', startTimer);
  }

  window.addEventListener('resize', () => {
    carousel.style.transition = 'none';
    index = 0;
    carousel.style.transform = 'translateX(0)';
  });

  startTimer();
}

function sendToWhatsApp(event) {
  event.preventDefault();

  // Replace with your company WhatsApp number (including country code, without + or spaces)
  const companyPhoneNumber = "971528417547"; 

  const name = document.getElementById('wa-name').value;
  const phone = document.getElementById('wa-phone').value;
  const service = document.getElementById('wa-service').value;
  const message = document.getElementById('wa-message').value;

  const formattedMessage = 
    `*New Service Inquiry*%0A%0A` +
    `*Name:* ${encodeURIComponent(name)}%0A` +
    `*Phone:* ${encodeURIComponent(phone)}%0A` +
    `*Service:* ${encodeURIComponent(service)}%0A` +
    `*Project Details:* ${encodeURIComponent(message || 'N/A')}`;

  const whatsappUrl = `https://wa.me/${companyPhoneNumber}?text=${formattedMessage}`;

  window.open(whatsappUrl, '_blank');
}

function toggleMobileMenu() {
  const navLinks = document.getElementById('nav-links');
  const toggleBtn = document.getElementById('hamburger-toggle');
  
  navLinks.classList.toggle('mobile-open');
  toggleBtn.classList.toggle('active');
}

function handleMobileNav(page, event) {
  // Call your existing navigateTo function
  if (typeof navigateTo === 'function') {
    navigateTo(page, event);
  }

  // Auto-close mobile drawer when a link is clicked
  const navLinks = document.getElementById('nav-links');
  const toggleBtn = document.getElementById('hamburger-toggle');
  if (navLinks.classList.contains('mobile-open')) {
    navLinks.classList.remove('mobile-open');
    toggleBtn.classList.remove('active');
  }
}