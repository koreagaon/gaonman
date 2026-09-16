// Explain: Handles form submissions, navigation overlay, and the home notice popup.
document.addEventListener('DOMContentLoaded', function() {
    var mobileBookButton = document.getElementById('mobileBookButton');
    var bookingOverlay = document.getElementById('bookingOverlay');
    var closeBookingOverlay = document.getElementById('closeBookingOverlay');
    var bookingForm = document.getElementById('bookingForm');
    var overlayBookingForm = document.getElementById('overlayBookingForm');

    // Navigation Overlay Elements
    var navOpenButton = document.getElementById('navOpenButton');
    var navCloseButton = document.getElementById('navCloseButton');
    var navOverlay = document.getElementById('navOverlay');
    var navCloseLinks = document.querySelectorAll('.nav-close-link');

    // Form Status Handlers
    function showStatus(formEl, type, message) {
        var key = formEl && formEl.id === 'overlayBookingForm' ? 'overlay' : 'booking';
        var status = document.querySelector('[data-form-status="' + key + '"]');
        if (!status) {
            return;
        }
        status.textContent = message;
        status.classList.remove('success', 'error');
        status.classList.add(type);
    }

    function setSubmitting(formEl, isSubmitting) {
        if (!formEl) {
            return;
        }
        var button = formEl.querySelector('button[type="submit"]');
        if (!button) {
            return;
        }
        button.disabled = isSubmitting;
        button.textContent = isSubmitting ? 'Sending...' : 'Contact';
    }

    function submitBookingForm(formEl) {
        if (!formEl) {
            return;
        }
        if (!formEl.checkValidity()) {
            formEl.reportValidity();
            return;
        }
        if (!window.MessagesSystem || typeof window.MessagesSystem.submit !== 'function') {
            showStatus(formEl, 'error', 'Booking is temporarily unavailable. Please try again shortly.');
            return;
        }

        setSubmitting(formEl, true);
        showStatus(formEl, 'success', 'Sending your message...');

        window.MessagesSystem.submit([
            { label: 'Name', value: formEl.name.value, type: 'text' },
            { label: 'Email', value: formEl.email.value, type: 'email' },
            { label: 'Message', value: formEl.message.value, type: 'textarea' }
        ], formEl).then(function(response) {
            if (response && response.success) {
                formEl.reset();
                showStatus(formEl, 'success', 'Thank you! We will get back to you soon.');
            } else {
                showStatus(formEl, 'error', response && response.error ? response.error : 'Your message could not be sent. Please try again.');
            }
        }).catch(function() {
            showStatus(formEl, 'error', 'A connection issue prevented sending. Please try again.');
        }).finally(function() {
            setSubmitting(formEl, false);
        });
    }

    // Overlay controls for Booking
    function openBookingOverlay() {
        if (!bookingOverlay) {
            return;
        }
        bookingOverlay.classList.add('is-open');
        bookingOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        var firstInput = bookingOverlay.querySelector('input[name="name"]');
        if (firstInput) {
            firstInput.focus();
        }
    }

    function closeBookingOverlayFn() {
        if (!bookingOverlay) {
            return;
        }
        bookingOverlay.classList.remove('is-open');
        bookingOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Overlay controls for Navigation
    function openNav() {
        if (!navOverlay) return;
        navOverlay.classList.remove('hidden');
        navOverlay.classList.add('flex');
        navOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        if (!navOverlay) return;
        navOverlay.classList.add('hidden');
        navOverlay.classList.remove('flex');
        navOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Listeners for Forms and Bookings
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            submitBookingForm(event.currentTarget);
        });
    }

    if (overlayBookingForm) {
        overlayBookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            submitBookingForm(event.currentTarget);
        });
    }

    if (mobileBookButton) {
        mobileBookButton.addEventListener('click', openBookingOverlay);
    }

    if (closeBookingOverlay) {
        closeBookingOverlay.addEventListener('click', closeBookingOverlayFn);
    }

    if (bookingOverlay) {
        bookingOverlay.addEventListener('click', function(event) {
            if (event.target === bookingOverlay) {
                closeBookingOverlayFn();
            }
        });
    }

    // Listeners for Navigation Menu
    if (navOpenButton) {
        navOpenButton.addEventListener('click', openNav);
    }

    if (navCloseButton) {
        navCloseButton.addEventListener('click', closeNav);
    }

    if (navCloseLinks) {
        navCloseLinks.forEach(function(link) {
            link.addEventListener('click', closeNav);
        });
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeBookingOverlayFn();
            closeNav();
        }
    });

    // Home Notice Popup
    var noticeModal = document.getElementById('homeNoticeModal');
    var closeNoticeBtn = document.getElementById('closeNoticeBtn');
    var hideNoticeToday = document.getElementById('hideNoticeToday');
    
    if (noticeModal) {
        var noticeHiddenDate = localStorage.getItem('hideNoticeDate');
        var today = new Date().toDateString();
        
        // 홈 화면에서만 자동으로 띄우기 (히어로 섹션 존재 여부로 확인)
        var isHomePage = document.querySelector('.hero-split') !== null;
        
        if (isHomePage && noticeHiddenDate !== today) {
            setTimeout(function() {
                noticeModal.showModal();
            }, 300);
        }
        
        // 우측 하단 플로팅 버튼 클릭 시 팝업 수동 열기
        var openNoticeBtn = document.getElementById('openNoticeBtn');
        if (openNoticeBtn) {
            openNoticeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                noticeModal.showModal();
            });
        }
        
        var saveHidePreference = function() {
            if (hideNoticeToday && hideNoticeToday.checked) {
                localStorage.setItem('hideNoticeDate', today);
            }
        };
        
        if (closeNoticeBtn) {
            closeNoticeBtn.addEventListener('click', function() {
                saveHidePreference();
                noticeModal.close();
            });
        }
        
        noticeModal.addEventListener('close', saveHidePreference);
    }
});