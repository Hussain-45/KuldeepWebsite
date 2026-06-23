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

    // Close menu when links are clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            header.classList.remove('nav-active');
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

            // Fetch registration info
            const playerDetails = {
                playerName: document.getElementById('playerName').value,
                playerAge: document.getElementById('playerAge').value,
                program: document.getElementById('programSelect').value,
                parentName: document.getElementById('parentName').value,
                phone: document.getElementById('parentPhone').value,
                email: document.getElementById('parentEmail').value,
                preferredDate: document.getElementById('preferredDate').value,
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
    // 10. Scrollspy Navigation Active Highlighting
    // ==========================================================================
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
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                
                if (activeLink) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    activeLink.classList.add('active');
                }
            }
        });
    }, scrollspyObserverOptions);

    sections.forEach(section => scrollspyObserver.observe(section));
});
