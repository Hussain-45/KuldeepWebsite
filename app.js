/* ==========================================================================
   Apex Football Academy - Core Interactions Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. Navigation & Header Sticky Behavior
    // ==========================================================================
    const header = document.querySelector('.header');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky header toggle
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile nav toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            header.classList.toggle('nav-active');
            document.body.classList.toggle('no-scroll');
        });
    }

    // Close menu when links or logo are clicked
    const closeTriggers = document.querySelectorAll('.nav-link, .logo');
    closeTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('active');
            if (header) header.classList.remove('nav-active');
            document.body.classList.remove('no-scroll');
        });
    });


    // ==========================================================================
    // 2. Scroll Triggered Entrance Animations (Intersection Observer)
    // ==========================================================================
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const scrollObserverOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // If this is a stats card, trigger counter animation
                if (entry.target.classList.contains('stat-card')) {
                    const numberEl = entry.target.querySelector('.stat-number');
                    if (numberEl && !numberEl.classList.contains('counted')) {
                        animateCounter(numberEl);
                    }
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, scrollObserverOptions);

    animatedElements.forEach(el => scrollObserver.observe(el));


    // ==========================================================================
    // 3. Stats Dashboard Counter Animation
    // ==========================================================================
    function animateCounter(counterEl) {
        counterEl.classList.add('counted');
        const target = parseInt(counterEl.getAttribute('data-target'), 10);
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        function updateCount(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Easing function (easeOutQuad)
            const easeProgress = progress * (2 - progress);
            const currentValue = Math.floor(easeProgress * target);

            counterEl.textContent = currentValue + (target === 98 || target === 15 || target === 30 || target === 500 && currentValue >= target ? '+' : '');

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                counterEl.textContent = target + (target === 98 ? '%' : '+');
            }
        }

        requestAnimationFrame(updateCount);
    }


    // ==========================================================================
    // 4. Schedule Tabs Switching
    // ==========================================================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const scheduleTables = document.querySelectorAll('.schedule-table');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Deactivate current active states
            tabBtns.forEach(b => b.classList.remove('active'));
            scheduleTables.forEach(t => t.classList.remove('active'));

            // Activate chosen state
            btn.classList.add('active');
            const targetTable = document.getElementById(`schedule-${targetTab}`);
            if (targetTable) {
                targetTable.classList.add('active');
            }
        });
    });


    // ==========================================================================
    // 5. Testimonial Slider System
    // ==========================================================================
    const track = document.getElementById('testimonialTrack');
    const slides = Array.from(track ? track.children : []);
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const dotsContainer = document.getElementById('sliderDots');
    
    if (track && slides.length > 0) {
        let currentIndex = 0;
        let slideInterval;

        // Build Navigation Dots dynamically
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => moveToSlide(index));
            if (dotsContainer) dotsContainer.appendChild(dot);
        });

        const dots = Array.from(dotsContainer ? dotsContainer.children : []);

        // Move to specific slide
        function moveToSlide(index) {
            track.style.transform = `translateX(-${index * 100}%)`;
            
            // Update Active Slide Classes
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');

            // Update Dots
            if (dots.length > 0) {
                dots.forEach(dot => dot.classList.remove('active'));
                dots[index].classList.add('active');
            }
            
            currentIndex = index;
            resetAutoplay();
        }

        // Navigate Next/Prev
        function nextSlide() {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= slides.length) nextIndex = 0;
            moveToSlide(nextIndex);
        }

        function prevSlide() {
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) prevIndex = slides.length - 1;
            moveToSlide(prevIndex);
        }

        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        // Autoplay logic
        function startAutoplay() {
            slideInterval = setInterval(nextSlide, 6000);
        }

        function resetAutoplay() {
            clearInterval(slideInterval);
            startAutoplay();
        }

        startAutoplay();
    }


    // ==========================================================================
    // 6. FAQ Accordion Toggles
    // ==========================================================================
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const answer = question.nextElementSibling;
            const isActive = item.classList.contains('active');

            // Collapse other items
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
            });

            // Toggle clicked item
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });


    // ==========================================================================
    // 7. Booking Modal Overlay & Portal Control
    // ==========================================================================
    const modal = document.getElementById('bookingModal');
    const modalClose = document.getElementById('modalClose');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const programSelect = document.getElementById('programSelect');
    const bookingForm = document.getElementById('bookingForm');
    const preferredDateInput = document.getElementById('preferredDate');

    // Set minimum booking date to today
    if (preferredDateInput) {
        const today = new Date().toISOString().split('T')[0];
        preferredDateInput.min = today;
    }

    // Open Modal Function
    function openModal(programName = '') {
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('no-scroll');
            
            // Pre-select program if specified
            if (programName && programSelect) {
                programSelect.value = programName;
            }

            // Close mobile menu if open
            if (navMenu) navMenu.classList.remove('active');
            if (header) header.classList.remove('nav-active');
        }
    }

    // Close Modal Function
    function closeModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.classList.remove('no-scroll');
            if (bookingForm) bookingForm.reset();
        }
    }

    // Attach Open Events
    openModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const program = btn.getAttribute('data-program') || '';
            openModal(program);
        });
    });

    // Attach Close Events
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Escape Key Modal Close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });


    // ==========================================================================
    // 8. Booking Form Submission & Toast Alert
    // ==========================================================================
    const toastContainer = document.getElementById('toastContainer');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Fetch registration info safely
            const playerNameEl = document.getElementById('playerName');
            const playerAgeEl = document.getElementById('playerAge');
            const programSelectEl = document.getElementById('programSelect');
            const parentNameEl = document.getElementById('parentName');
            const parentPhoneEl = document.getElementById('parentPhone');
            const parentEmailEl = document.getElementById('parentEmail');
            const preferredDateEl = document.getElementById('preferredDate');

            const playerDetails = {
                playerName: playerNameEl ? playerNameEl.value : '',
                playerAge: playerAgeEl ? playerAgeEl.value : '',
                program: programSelectEl ? programSelectEl.value : '',
                parentName: parentNameEl ? parentNameEl.value : '',
                phone: parentPhoneEl ? parentPhoneEl.value : '',
                email: parentEmailEl ? parentEmailEl.value : '',
                preferredDate: preferredDateEl ? preferredDateEl.value : '',
                timestamp: new Date().toISOString()
            };

            // Save to localStorage for demo persistence
            const existingBookings = JSON.parse(localStorage.getItem('apex_bookings') || '[]');
            existingBookings.push(playerDetails);
            localStorage.setItem('apex_bookings', JSON.stringify(existingBookings));

            // Close booking modal
            closeModal();

            // Display Toast notification
            showToast(`Success! Free trial booking confirmed for ${playerDetails.playerName}.`);
        });
    }

    function showToast(message) {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.innerHTML = `
            <span class="toast-success-icon">⚽</span>
            <span class="toast-message">${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Auto remove toast after 5 seconds
        setTimeout(() => {
            toast.classList.add('removing');
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 5000);
    }

    // ==========================================================================
    // 9. Card Hover Spotlight & 3D Tilt Effects
    // ==========================================================================
    const spotlightCards = document.querySelectorAll('.spotlight-card');

    spotlightCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // 3D Tilt calculation
            const width = rect.width;
            const height = rect.height;
            const centerX = width / 2;
            const centerY = height / 2;
            const rotateX = ((centerY - y) / centerY) * 8; // Max 8 degrees
            const rotateY = ((x - centerX) / centerX) * 8; // Max 8 degrees

            card.style.setProperty('--rotate-x', `${rotateX}deg`);
            card.style.setProperty('--rotate-y', `${rotateY}deg`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.removeProperty('--rotate-x');
            card.style.removeProperty('--rotate-y');
        });
    });

    // ==========================================================================
    // 10. Active Page Link Selection & Scrollspy
    // ==========================================================================
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'index.html';

    // Resolve active state based on current page and hash
    function updateActiveNavLink() {
        const currentHash = window.location.hash;

        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (!linkHref) return;

            // Separate page from hash
            const [linkPage, linkHash] = linkHref.split('#');
            const cleanLinkPage = linkPage || 'index.html';

            const isSamePage = (cleanLinkPage === pageName || 
                                (pageName === 'index.html' && cleanLinkPage === '') ||
                                (pageName === '' && cleanLinkPage === 'index.html'));

            if (isSamePage) {
                if (linkHash) {
                    // This is an anchor link on the current page
                    if (currentHash === '#' + linkHash) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                } else {
                    // This is the page link itself
                    if (!currentHash || currentHash === '#') {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                }
            } else {
                // Different page
                // Check if link is to an anchor on the index page while we are on index page
                if (linkHash && cleanLinkPage === 'index.html' && pageName === 'index.html') {
                    if (currentHash === '#' + linkHash) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                } else {
                    link.classList.remove('active');
                }
            }
        });
    }

    // Run active link updates
    updateActiveNavLink();
    window.addEventListener('hashchange', updateActiveNavLink);

    // Only run scrollspy on the home page (index.html or root path)
    if (pageName === 'index.html' || pageName === '') {
        const sections = document.querySelectorAll('section[id]');
        
        const scrollspyObserverOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px', // Trigger when section is in the middle of viewport
            threshold: 0
        };

        const scrollspyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    // Match local anchor
                    const activeLink = document.querySelector(`.nav-link[href="#${id}"]`) || 
                                       document.querySelector(`.nav-link[href="index.html#${id}"]`);
                    
                    if (activeLink) {
                        navLinks.forEach(link => link.classList.remove('active'));
                        activeLink.classList.add('active');
                    } else if (['hero', 'why-apex', 'pathway', 'news'].includes(id)) {
                        const homeLink = document.querySelector('.nav-link[href="index.html"]');
                        if (homeLink) {
                            navLinks.forEach(link => link.classList.remove('active'));
                            homeLink.classList.add('active');
                        }
                    }
                }
            });
        }, scrollspyObserverOptions);

        sections.forEach(section => scrollspyObserver.observe(section));
    }

    // ==========================================================================
    // 11. Shopping Cart & Checkout System
    // ==========================================================================
    // Inject Cart Drawer and Modal Overlays dynamically to ensure presence on all pages
    const cartDrawerHTML = `
        <!-- Cart Drawer Overlay -->
        <div class="cart-drawer-overlay" id="cartDrawerOverlay">
            <div class="cart-drawer" id="cartDrawer">
                <div class="cart-drawer-header">
                    <h3>Shopping Cart</h3>
                    <button class="cart-close-btn" id="cartCloseBtn" aria-label="Close Cart">&times;</button>
                </div>
                <div class="cart-drawer-body" id="cartDrawerBody">
                    <!-- Cart items loaded dynamically -->
                </div>
                <div class="cart-drawer-footer" id="cartDrawerFooter">
                    <div class="cart-total-row">
                        <span>Subtotal:</span>
                        <span id="cartSubtotal">₹0</span>
                    </div>
                    <button class="btn btn-primary btn-full checkout-btn" id="checkoutBtn">Proceed to Checkout</button>
                </div>
            </div>
        </div>

        <!-- Checkout Form Modal Overlay -->
        <div class="modal-overlay" id="checkoutModalOverlay">
            <div class="modal-container checkout-modal-container">
                <button class="modal-close-btn" id="checkoutModalCloseBtn" aria-label="Close Checkout">&times;</button>
                <div class="modal-header">
                    <h3 class="modal-title highlight">Complete Purchase</h3>
                    <p class="modal-subtitle">Enter your billing and shipping details to complete your order</p>
                </div>
                <form id="checkoutForm" class="modal-form">
                    <div class="modal-form-columns">
                        <div class="modal-form-column customer-info-column">
                            <h4 class="column-subtitle">Customer Information</h4>
                            <div class="form-group">
                                <label for="checkoutName">Full Name</label>
                                <input type="text" id="checkoutName" placeholder="Enter your full name" required>
                            </div>
                            <div class="form-group">
                                <label for="checkoutEmail">Email Address</label>
                                <input type="email" id="checkoutEmail" placeholder="you@example.com" required>
                            </div>
                            <div class="form-group">
                                <label for="checkoutPhone">Phone Number</label>
                                <input type="tel" id="checkoutPhone" placeholder="Enter phone number" required>
                            </div>
                        </div>
                        <div class="modal-form-column shipping-info-column">
                            <h4 class="column-subtitle">Shipping Address</h4>
                            <div class="form-group">
                                <label for="checkoutAddress">Street Address</label>
                                <input type="text" id="checkoutAddress" placeholder="123 Main St, Apt 4B" required>
                            </div>
                            <div class="form-group">
                                <label for="checkoutCity">City</label>
                                <input type="text" id="checkoutCity" placeholder="New Delhi" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group half-width">
                                    <label for="checkoutState">State</label>
                                    <input type="text" id="checkoutState" placeholder="Delhi" required>
                                </div>
                                <div class="form-group half-width">
                                    <label for="checkoutZip">ZIP Code</label>
                                    <input type="text" id="checkoutZip" placeholder="110001" required>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="order-summary-panel">
                        <h4 class="column-subtitle">Order Summary</h4>
                        <div class="checkout-summary-items" id="checkoutSummaryItems">
                            <!-- Items loaded dynamically -->
                        </div>
                        <div class="checkout-summary-total">
                            <span>Total (incl. taxes):</span>
                            <span id="checkoutGrandTotal" class="highlight">₹0</span>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-full pulse-glow form-submit">Complete Purchase & Order ➔</button>
                </form>
            </div>
        </div>

        <!-- Success Modal Overlay -->
        <div class="modal-overlay" id="successModalOverlay">
            <div class="modal-container success-modal-container text-center">
                <button class="modal-close-btn" id="successModalCloseBtn" aria-label="Close Modal">&times;</button>
                <div class="success-icon">🎉</div>
                <h3 class="modal-title highlight">Order Placed Successfully!</h3>
                <p class="modal-subtitle">Your official Apex FC gear is registered and on its way.</p>
                <div class="receipt-box">
                    <div class="receipt-row">
                        <span>Order Reference:</span>
                        <strong id="receiptOrderNum">APEX-10001</strong>
                    </div>
                    <div class="receipt-row">
                        <span>Total Paid:</span>
                        <strong id="receiptAmount" class="highlight">₹0</strong>
                    </div>
                    <div class="receipt-row">
                        <span>Delivery Estimate:</span>
                        <strong>3-5 Business Days</strong>
                    </div>
                </div>
                <button class="btn btn-primary" id="successCloseBtn">Continue Shopping</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', cartDrawerHTML);

    // Product Database mapping data-item in HTML to full product info
    const productDatabase = {
        "Apex Home Jersey": { name: "Apex FC Home Match Jersey", price: 1499, image: "images/product_home_jersey.png" },
        "Apex Away Jersey": { name: "Apex FC Away Match Jersey", price: 1499, image: "images/product_away_jersey.png" },
        "Apex Training Jacket": { name: "Apex Elite Training Jacket", price: 2499, image: "images/product_training_jacket.png" },
        "Apex Training Kit Set": { name: "Apex Pro Training Kit Set", price: 2999, image: "images/product_training_kit.png" }
    };

    // State
    let cart = JSON.parse(localStorage.getItem('apex_cart')) || [];

    // DOM Elements
    const cartBtn = document.getElementById('cartBtn');
    const cartCount = document.getElementById('cartCount');
    const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
    const cartDrawerBody = document.getElementById('cartDrawerBody');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartCloseBtn = document.getElementById('cartCloseBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartDrawerFooter = document.getElementById('cartDrawerFooter');

    const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
    const checkoutModalCloseBtn = document.getElementById('checkoutModalCloseBtn');
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutSummaryItems = document.getElementById('checkoutSummaryItems');
    const checkoutGrandTotal = document.getElementById('checkoutGrandTotal');

    const successModalOverlay = document.getElementById('successModalOverlay');
    const successModalCloseBtn = document.getElementById('successModalCloseBtn');
    const successCloseBtn = document.getElementById('successCloseBtn');
    const receiptOrderNum = document.getElementById('receiptOrderNum');
    const receiptAmount = document.getElementById('receiptAmount');

    // Load initial cart display
    updateCartUI();

    // Toggle Cart Drawer
    if (cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (navMenu) navMenu.classList.remove('active');
            if (header) header.classList.remove('nav-active');
            document.body.classList.remove('no-scroll');
            cartDrawerOverlay.classList.add('active');
        });
    }

    if (cartCloseBtn) {
        cartCloseBtn.addEventListener('click', () => {
            cartDrawerOverlay.classList.remove('active');
        });
    }

    if (cartDrawerOverlay) {
        cartDrawerOverlay.addEventListener('click', (e) => {
            if (e.target === cartDrawerOverlay) {
                cartDrawerOverlay.classList.remove('active');
            }
        });
    }

    // Add to Cart Logic
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const dataItem = btn.getAttribute('data-item');
            const product = productDatabase[dataItem];
            
            if (product) {
                addToCart(dataItem, product);
            } else {
                // Fallback for custom or missing product mappings
                const fallbackProduct = {
                    name: btn.closest('.product-info')?.querySelector('.product-name')?.textContent || dataItem || 'Official Gear',
                    price: parseInt(btn.closest('.product-info')?.querySelector('.product-price')?.textContent.replace(/[^0-9]/g, '')) || 999,
                    image: btn.closest('.product-card')?.querySelector('.product-img')?.getAttribute('src') || 'images/logo.png'
                };
                addToCart(dataItem || fallbackProduct.name, fallbackProduct);
            }
        });
    });

    function addToCart(id, product) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        localStorage.setItem('apex_cart', JSON.stringify(cart));
        updateCartUI();
        showToast(`Success! Added ${product.name} to your cart.`);
        
        // Micro-animation badge pop
        if (cartCount) {
            cartCount.style.transform = 'scale(1.4)';
            setTimeout(() => {
                cartCount.style.transform = 'scale(1)';
            }, 300);
        }
    }

    // Qty and Remove Handlers
    if (cartDrawerBody) {
        cartDrawerBody.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            if (!id) return;

            if (e.target.classList.contains('qty-plus')) {
                updateQuantity(id, 1);
            } else if (e.target.classList.contains('qty-minus')) {
                updateQuantity(id, -1);
            } else if (e.target.classList.contains('cart-item-remove')) {
                removeFromCart(id);
            }
        });
    }

    function updateQuantity(id, change) {
        const item = cart.find(item => item.id === id);
        if (!item) return;

        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== id);
        }

        localStorage.setItem('apex_cart', JSON.stringify(cart));
        updateCartUI();
    }

    function removeFromCart(id) {
        const item = cart.find(item => item.id === id);
        const name = item ? item.name : 'Item';
        
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('apex_cart', JSON.stringify(cart));
        updateCartUI();
        showToast(`Removed ${name} from your cart.`);
    }

    function updateCartUI() {
        if (!cartDrawerBody) return;

        if (cart.length === 0) {
            cartDrawerBody.innerHTML = `
                <div class="cart-empty-message">
                    <span class="cart-empty-icon">🛒</span>
                    <h4>Your Cart is Empty</h4>
                    <p>Gear up! Visit our store page to browse official academy apparel and training kit sets.</p>
                </div>
            `;
            if (cartDrawerFooter) cartDrawerFooter.style.display = 'none';
            if (cartCount) {
                cartCount.textContent = '0';
                cartCount.style.display = 'none';
            }
        } else {
            let total = 0;
            let count = 0;
            let itemsHTML = '';

            cart.forEach(item => {
                const sub = item.price * item.quantity;
                total += sub;
                count += item.quantity;

                itemsHTML += `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='images/stadium_hero.png';">
                        <div class="cart-item-details">
                            <h4 class="cart-item-name">${item.name}</h4>
                            <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
                            <div class="cart-item-qty">
                                <button class="qty-btn qty-minus" data-id="${item.id}">-</button>
                                <span class="cart-item-qty-val">${item.quantity}</span>
                                <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
                            </div>
                        </div>
                        <button class="cart-item-remove" data-id="${item.id}">Remove</button>
                    </div>
                `;
            });

            cartDrawerBody.innerHTML = itemsHTML;
            if (cartDrawerFooter) cartDrawerFooter.style.display = 'block';
            if (cartSubtotal) cartSubtotal.textContent = `₹${total.toLocaleString('en-IN')}`;
            if (cartCount) {
                cartCount.textContent = count;
                cartCount.style.display = 'inline-flex';
            }
        }
    }

    // Checkout Modal Trigger
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            cartDrawerOverlay.classList.remove('active');
            
            // Build summary
            if (checkoutSummaryItems) {
                let summaryHTML = '';
                let total = 0;
                
                cart.forEach(item => {
                    total += item.price * item.quantity;
                    summaryHTML += `
                        <div class="checkout-summary-item">
                            <span>${item.name} (x${item.quantity})</span>
                            <span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                    `;
                });
                
                checkoutSummaryItems.innerHTML = summaryHTML;
                if (checkoutGrandTotal) checkoutGrandTotal.textContent = `₹${total.toLocaleString('en-IN')}`;
            }
            
            checkoutModalOverlay.classList.add('active');
        });
    }

    if (checkoutModalCloseBtn) {
        checkoutModalCloseBtn.addEventListener('click', () => {
            checkoutModalOverlay.classList.remove('active');
        });
    }

    if (checkoutModalOverlay) {
        checkoutModalOverlay.addEventListener('click', (e) => {
            if (e.target === checkoutModalOverlay) {
                checkoutModalOverlay.classList.remove('active');
            }
        });
    }

    // Checkout Form Submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Extract customer & shipping info
            const orderDetails = {
                name: document.getElementById('checkoutName').value,
                email: document.getElementById('checkoutEmail').value,
                phone: document.getElementById('checkoutPhone').value,
                address: document.getElementById('checkoutAddress').value,
                city: document.getElementById('checkoutCity').value,
                state: document.getElementById('checkoutState').value,
                zip: document.getElementById('checkoutZip').value,
                items: [...cart],
                orderNum: 'APEX-' + Math.floor(10000 + Math.random() * 90000),
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                timestamp: new Date().toISOString()
            };

            // Save order to history in local storage
            const orders = JSON.parse(localStorage.getItem('apex_orders')) || [];
            orders.push(orderDetails);
            localStorage.setItem('apex_orders', JSON.stringify(orders));

            // Populate Success screen
            if (receiptOrderNum) receiptOrderNum.textContent = orderDetails.orderNum;
            if (receiptAmount) receiptAmount.textContent = `₹${orderDetails.total.toLocaleString('en-IN')}`;

            // Reset cart
            cart = [];
            localStorage.removeItem('apex_cart');
            updateCartUI();

            // Close checkout, open success
            checkoutModalOverlay.classList.remove('active');
            successModalOverlay.classList.add('active');

            showToast("Order placed successfully! Receipt generated.");
        });
    }

    // Success Modal Close
    if (successModalCloseBtn) {
        successModalCloseBtn.addEventListener('click', () => {
            successModalOverlay.classList.remove('active');
        });
    }

    if (successCloseBtn) {
        successCloseBtn.addEventListener('click', () => {
            successModalOverlay.classList.remove('active');
        });
    }

    if (successModalOverlay) {
        successModalOverlay.addEventListener('click', (e) => {
            if (e.target === successModalOverlay) {
                successModalOverlay.classList.remove('active');
            }
        });
    }

    // ==========================================================================
    // 12. Academy Locations Map Switcher
    // ==========================================================================
    const locationCards = document.querySelectorAll('.location-hub-card');
    const mapIframe = document.getElementById('mapIframe');
    const facilityAmenities = document.getElementById('facilityAmenities');

    const locationData = {
        delhi: {
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.4475459397984!2d77.05436667630743!3d28.58632617569116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1ad33e387063%3A0xe96c42954a29a1e0!2sDwarka%20Sector%2011%20Sports%20Complex!5e0!3m2!1sen!2sin!4v1719149000000!5m2!1sen!2sin",
            amenities: `
                <li>⚽ <strong>Pitch Type:</strong> FIFA-pro Grade Artificial Turf</li>
                <li>⚽ <strong>Head Coach:</strong> Coach Marcus Vance</li>
                <li>⚽ <strong>Facilities:</strong> Indoor Changing, Video Analysis Suite, GPS Trackers</li>
                <li>⚽ <strong>Phone:</strong> +91 98765 43210</li>
            `
        },
        mumbai: {
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.793738090729!2d72.8687707760773!3d19.072803252062325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c8e14b2d6a59%3A0x2f90ef762d08a54d!2sBandra%20Kurla%20Complex%20Sports%20Ground!5e0!3m2!1sen!2sin!4v1719149100000!5m2!1sen!2sin",
            amenities: `
                <li>⚽ <strong>Pitch Type:</strong> Hybrid Natural Turf</li>
                <li>⚽ <strong>Head Coach:</strong> Coach Sarah Jenkins</li>
                <li>⚽ <strong>Facilities:</strong> Recovery Pool, S&C Gym, Physio Center</li>
                <li>⚽ <strong>Phone:</strong> +91 98765 43211</li>
            `
        },
        bengaluru: {
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.973950454359!2d77.5912852762283!3d12.973507014838634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1679d63f5383%3A0x6b1464c05e19dc2f!2sSree%20Kanteerava%20Stadium!5e0!3m2!1sen!2sin!4v1719149200000!5m2!1sen!2sin",
            amenities: `
                <li>⚽ <strong>Pitch Type:</strong> Professional Turf (Natural Grass)</li>
                <li>⚽ <strong>Head Coach:</strong> Coach Alex Mercer</li>
                <li>⚽ <strong>Facilities:</strong> Floodlit Arena, Medical Suite, Tactical Board Room</li>
                <li>⚽ <strong>Phone:</strong> +91 98765 43212</li>
            `
        }
    };

    locationCards.forEach(card => {
        card.addEventListener('click', () => {
            const locKey = card.getAttribute('data-location');
            if (locationData[locKey]) {
                // Remove active class from all cards
                locationCards.forEach(c => c.classList.remove('active'));
                // Add active class to clicked card
                card.classList.add('active');

                // Update map URL
                if (mapIframe) {
                    mapIframe.src = locationData[locKey].mapUrl;
                }

                // Update amenities with fade transition effect
                if (facilityAmenities) {
                    facilityAmenities.style.opacity = 0;
                    setTimeout(() => {
                        facilityAmenities.innerHTML = locationData[locKey].amenities;
                        facilityAmenities.style.opacity = 1;
                    }, 200);
                }
            }
        });
    });

    // ==========================================================================
    // 13. Player Journey Pathway (Roadmap) Interaction
    // ==========================================================================
    const pathwaySteps = document.querySelectorAll('.pathway-step');
    const stageContents = document.querySelectorAll('.pathway-stage-content');

    pathwaySteps.forEach(step => {
        step.addEventListener('click', () => {
            const targetStage = step.getAttribute('data-stage');
            
            // Remove active class from all steps
            pathwaySteps.forEach(s => s.classList.remove('active'));
            // Add active class to clicked step
            step.classList.add('active');

            // Hide all content blocks
            stageContents.forEach(content => {
                content.classList.remove('active');
            });

            // Show selected content block
            const targetContent = document.getElementById(`stage-${targetStage}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
});
