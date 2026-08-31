(() => {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const language = document.querySelector('[data-language]');
  const languageButton = language?.querySelector('button');
  const languageMenu = language?.querySelector('[role="menu"], .language-menu');
  const chatPicker = document.querySelector('[data-chat-picker]');
  const chatPickerWhatsapp = chatPicker?.querySelector('[data-chat-picker-whatsapp]');
  const chatPickerTelegram = chatPicker?.querySelector('[data-chat-picker-telegram]');
  let chatPickerTrigger = null;

  const updateHeader = () => header?.classList.toggle('is-sticky', window.scrollY > 18);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const closeMobileMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', menuButton.dataset.menuOpenLabel || 'Open menu');
    mobileMenu.hidden = true;
    document.body.classList.remove('menu-open');
  };

  const finishClosingChatPicker = () => {
    document.body.classList.remove('chat-picker-open');
    chatPickerTrigger?.focus();
    chatPickerTrigger = null;
  };

  const closeChatPicker = () => {
    if (!chatPicker?.hasAttribute('open')) return;
    if (typeof chatPicker.close === 'function') {
      chatPicker.close();
      finishClosingChatPicker();
    }
    else {
      chatPicker.removeAttribute('open');
      finishClosingChatPicker();
    }
  };

  document.querySelectorAll('[data-chat-choice]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      if (!chatPicker || !chatPickerWhatsapp || !chatPickerTelegram) return;
      chatPickerWhatsapp.href = trigger.dataset.chatWhatsapp || chatPickerWhatsapp.href;
      chatPickerTelegram.href = trigger.dataset.chatTelegram || chatPickerTelegram.href;
      chatPickerTrigger = trigger;
      closeMobileMenu();
      document.body.classList.add('chat-picker-open');
      if (typeof chatPicker.showModal === 'function') chatPicker.showModal();
      else chatPicker.setAttribute('open', '');
      chatPicker.querySelector('[data-chat-picker-close]')?.focus();
    });
  });

  chatPicker?.querySelectorAll('[data-chat-picker-close]').forEach((button) => button.addEventListener('click', closeChatPicker));
  chatPicker?.querySelectorAll('.chat-option').forEach((link) => link.addEventListener('click', closeChatPicker));
  chatPicker?.addEventListener('click', (event) => {
    if (event.target === chatPicker) closeChatPicker();
  });
  chatPicker?.addEventListener('close', finishClosingChatPicker);

  menuButton?.addEventListener('click', () => {
    const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(willOpen));
    menuButton.setAttribute('aria-label', willOpen
      ? (menuButton.dataset.menuCloseLabel || 'Close menu')
      : (menuButton.dataset.menuOpenLabel || 'Open menu'));
    mobileMenu.hidden = !willOpen;
    document.body.classList.toggle('menu-open', willOpen);
    if (willOpen) mobileMenu.querySelector('a')?.focus();
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileMenu));

  const closeLanguage = () => {
    if (!languageButton || !languageMenu) return;
    languageButton.setAttribute('aria-expanded', 'false');
    languageMenu.hidden = true;
  };

  languageButton?.addEventListener('click', () => {
    const willOpen = languageButton.getAttribute('aria-expanded') !== 'true';
    languageButton.setAttribute('aria-expanded', String(willOpen));
    languageMenu.hidden = !willOpen;
    if (willOpen) languageMenu.querySelector('a[aria-current="page"], a')?.focus();
  });

  document.addEventListener('click', (event) => {
    if (language && !language.contains(event.target)) closeLanguage();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const pickerWasOpen = chatPicker?.hasAttribute('open');
    closeLanguage();
    closeMobileMenu();
    closeChatPicker();
    if (!pickerWasOpen) languageButton?.focus();
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7%', threshold: 0.08 });
    items.forEach((item) => observer.observe(item));
  }

  document.querySelectorAll('[data-flower-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('[data-flower-track]');
    const viewport = carousel.querySelector('[data-flower-viewport]');
    const slides = [...carousel.querySelectorAll('.flower-category')];
    const tabs = [...carousel.querySelectorAll('[data-flower-tab]')];
    const previous = carousel.querySelector('[data-flower-prev]');
    const next = carousel.querySelector('[data-flower-next]');
    const current = carousel.querySelector('[data-flower-current]');
    const mainControls = carousel.querySelector('.flower-carousel-controls');
    const floatingControls = carousel.querySelector('[data-flower-floating]');
    const floatingPrevious = floatingControls?.querySelector('[data-flower-floating-prev]');
    const floatingNext = floatingControls?.querySelector('[data-flower-floating-next]');
    const floatingCurrent = floatingControls?.querySelector('[data-flower-floating-current]');
    if (!track || !viewport || slides.length < 2) return;

    if (floatingControls) document.body.append(floatingControls);

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const autoplayDelay = Number(carousel.dataset.autoplay) || 3000;
    const manualPauseDelay = Number(carousel.dataset.manualPause) || 8000;
    carousel.style.setProperty('--flower-autoplay', `${autoplayDelay}ms`);

    let activeIndex = 0;
    let autoplayTimer;
    let resumeTimer;
    let manualPauseUntil = 0;
    let isInView = false;
    let isHovering = false;
    let touchStartX = 0;
    let touchStartY = 0;

    const clearTimers = () => {
      clearTimeout(autoplayTimer);
      clearTimeout(resumeTimer);
    };

    const prepareSlide = (index) => {
      slides[index]?.querySelectorAll('img[loading="lazy"]').forEach((image) => {
        image.loading = 'eager';
      });
    };

    const restartProgress = () => {
      carousel.classList.remove('is-running');
      void carousel.offsetWidth;
      carousel.classList.add('is-running');
    };

    const render = () => {
      carousel.style.setProperty('--flower-index', activeIndex);
      slides.forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.toggleAttribute('data-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
        slide.toggleAttribute('inert', !isActive);
      });
      tabs.forEach((tab, index) => {
        const isActive = index === activeIndex;
        tab.setAttribute('aria-selected', String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });
      if (current) current.textContent = String(activeIndex + 1).padStart(2, '0');
      if (floatingCurrent) floatingCurrent.textContent = String(activeIndex + 1).padStart(2, '0');
      if (isInView) {
        prepareSlide(activeIndex);
        prepareSlide((activeIndex + 1) % slides.length);
      }
    };

    const scheduleAutoplay = () => {
      clearTimers();
      carousel.classList.remove('is-running');

      const remainingManualPause = Math.max(0, manualPauseUntil - Date.now());
      carousel.classList.toggle('is-manual-pause', remainingManualPause > 0);
      if (reducedMotion || !isInView || isHovering || document.hidden) return;

      if (remainingManualPause > 0) {
        resumeTimer = setTimeout(scheduleAutoplay, remainingManualPause);
        return;
      }

      restartProgress();
      autoplayTimer = setTimeout(() => {
        activeIndex = (activeIndex + 1) % slides.length;
        render();
        scheduleAutoplay();
      }, autoplayDelay);
    };

    const goTo = (index, isManual = true) => {
      activeIndex = (index + slides.length) % slides.length;
      if (isManual) manualPauseUntil = Date.now() + manualPauseDelay;
      render();
      scheduleAutoplay();
    };

    previous?.addEventListener('click', () => goTo(activeIndex - 1));
    next?.addEventListener('click', () => goTo(activeIndex + 1));
    floatingPrevious?.addEventListener('click', () => goTo(activeIndex - 1));
    floatingNext?.addEventListener('click', () => goTo(activeIndex + 1));
    tabs.forEach((tab) => tab.addEventListener('click', () => goTo(Number(tab.dataset.flowerTab))));

    carousel.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      goTo(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
    });

    viewport.addEventListener('touchstart', (event) => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    viewport.addEventListener('touchend', (event) => {
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.15) return;
      goTo(activeIndex + (deltaX < 0 ? 1 : -1));
    }, { passive: true });

    carousel.addEventListener('mouseenter', () => {
      isHovering = true;
      scheduleAutoplay();
    });
    carousel.addEventListener('mouseleave', () => {
      isHovering = false;
      scheduleAutoplay();
    });
    floatingControls?.addEventListener('mouseenter', () => {
      isHovering = true;
      scheduleAutoplay();
    });
    floatingControls?.addEventListener('mouseleave', () => {
      isHovering = false;
      scheduleAutoplay();
    });
    document.addEventListener('visibilitychange', scheduleAutoplay);

    if ('IntersectionObserver' in window) {
      let carouselIsVisible = false;
      let controlsAreVisible = true;
      const updateFloatingControls = () => {
        if (!floatingControls || !mainControls) return;
        const headerOffset = 88;
        const controlsHavePassed = mainControls.getBoundingClientRect().bottom <= headerOffset;
        const shouldShow = carouselIsVisible && !controlsAreVisible && controlsHavePassed;
        floatingControls.classList.toggle('is-visible', shouldShow);
        floatingControls.setAttribute('aria-hidden', String(!shouldShow));
        floatingControls.toggleAttribute('inert', !shouldShow);
      };

      const carouselObserver = new IntersectionObserver(([entry]) => {
        isInView = entry.isIntersecting;
        if (isInView) render();
        scheduleAutoplay();
      }, { rootMargin: '180px 0px', threshold: 0.05 });
      carouselObserver.observe(carousel);

      if (floatingControls && mainControls) {
        const visibleCarouselObserver = new IntersectionObserver(([entry]) => {
          carouselIsVisible = entry.isIntersecting;
          updateFloatingControls();
        });
        const controlsObserver = new IntersectionObserver(([entry]) => {
          controlsAreVisible = entry.isIntersecting;
          updateFloatingControls();
        }, { rootMargin: '-88px 0px 0px', threshold: 0.01 });
        visibleCarouselObserver.observe(carousel);
        controlsObserver.observe(mainControls);
      }
    } else {
      isInView = true;
    }

    render();
    scheduleAutoplay();
  });

  document.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      document.querySelectorAll('.faq-item[open]').forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
})();
