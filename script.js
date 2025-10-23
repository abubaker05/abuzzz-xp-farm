// --- Three.js 3D Mesh Initialization ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.width = '100vw'; 
renderer.domElement.style.zIndex = '0'; 
document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(150, 150, 60, 60);
const material = new THREE.MeshBasicMaterial({
    color: 0xffffff, 
    wireframe: true,
    transparent: true,
    opacity: 0.3, 
});

const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -10;
scene.add(plane);

camera.position.set(0, 15, 30);
camera.lookAt(0, -10, 0);

const positionAttribute = geometry.attributes.position;
const initialZ = [];
for (let i = 0; i < positionAttribute.count; i++) {
    initialZ.push(positionAttribute.getZ(i));
}

function animate() {
    requestAnimationFrame(animate);
    
    plane.rotation.z += 0.0008; 
    plane.rotation.y += 0.0005;

    const time = Date.now() * 0.0005; 
    const positions = positionAttribute.array;
    
    for (let i = 0; i < positions.length; i += 3) {
        const index = i / 3;
        positions[i + 2] = initialZ[index] + Math.sin(positions[i] * 0.8 + time) * 3 + Math.cos(positions[i + 1] * 0.8 + time) * 3; 
    }
    positionAttribute.needsUpdate = true;

    renderer.render(scene, camera);
}
animate();


window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.width = '100vw'; 
    initCarousel(); 
});


// --- Custom JavaScript Logic ---

// FIX: This function now correctly handles smooth scrolling AND closing the Bootstrap menu.
document.querySelectorAll('.nav-link[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        
        const navbarCollapse = document.getElementById('navbarNavAltMarkup');
        const isMobileMenuOpen = navbarCollapse && navbarCollapse.classList.contains('show');
        
        // Prevent the default link jump for smooth scrolling control
        e.preventDefault(); 
        
        // Smooth scroll to the target section
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });

        // Close the mobile menu if open (This must happen AFTER scroll starts)
        if (isMobileMenuOpen) {
            // Use setTimeout to ensure the scroll initiates before the collapse logic runs
            setTimeout(() => {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
                bsCollapse.hide();
            }, 50); 
        }
        // NOTE: Desktop links now rely entirely on the smooth scroll and CSS for highlighting.
    });
});

document.querySelectorAll('a.cta-card-detail').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});


// --- Scroll Reveal Observer Logic ---
document.addEventListener("DOMContentLoaded", () => {
    const observerOptions = {
        root: null, 
        rootMargin: '0px',
        threshold: 0.1 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section, .carousel-container, .schedule-item, .champion-card, .team-card-h, .footer-content').forEach(element => {
        element.classList.add('scroll-hidden');
        observer.observe(element);
    });
    
    initCarousel();
});


// --- 3D Carousel Logic (DYNAMICALLY ADJUSTED FOR MOBILE & ROTATION FIX) ---
let carouselAngle = 0;
const angleIncrement = 120; // 360 / 3 cards

function getTranslateZDistance() {
    return window.innerWidth <= 768 ? 200 : 450; 
}

function initCarousel() {
    const carousel = document.querySelector('.carousel');
    const cards = document.querySelectorAll('.carousel-card');
    const navNext = document.querySelector('.carousel-nav.next');
    const navPrev = document.querySelector('.carousel-nav.prev');
    const detailText = document.getElementById('detail-text');

    const translateZDistance = getTranslateZDistance();

    cards.forEach((card, index) => {
        const cardAngle = index * angleIncrement;
        card.style.transform = `rotateY(${cardAngle}deg) translateZ(${translateZDistance}px)`;
        
        card.addEventListener('click', (e) => {
            const details = card.getAttribute('data-details');
            detailText.textContent = details;
            
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });

    function rotateCarousel(direction) {
        carouselAngle += direction * angleIncrement;
        carousel.style.transform = `rotateY(${carouselAngle}deg)`;
        
        const cardsLength = cards.length;
        let normalizedAngle = -carouselAngle % 360;
        if (normalizedAngle < 0) {
            normalizedAngle += 360;
        }
        const activeIndex = Math.round(normalizedAngle / angleIncrement) % cardsLength;
        
        detailText.textContent = 'Click a card to see its details here.';
        cards.forEach(c => c.classList.remove('active'));
        
        if (cards[activeIndex]) {
             cards[activeIndex].classList.add('active');
             detailText.textContent = cards[activeIndex].getAttribute('data-details');
        }
    }

    if (navNext) navNext.addEventListener('click', () => rotateCarousel(-1)); 
    if (navPrev) navPrev.addEventListener('click', () => rotateCarousel(1)); 
    
    if (cards.length > 0) {
        const cardsLength = cards.length;
        let normalizedAngle = -carouselAngle % 360;
        if (normalizedAngle < 0) {
            normalizedAngle += 360;
        }
        const initialActiveIndex = Math.round(normalizedAngle / angleIncrement) % cardsLength;

        detailText.textContent = cards[initialActiveIndex].getAttribute('data-details');
        cards[initialActiveIndex].classList.add('active');
    }
}