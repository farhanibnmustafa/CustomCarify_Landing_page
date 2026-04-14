import './style.css'
import { createIconElement, replaceIcons } from './icons.js'

const LEAD_RECIPIENT_EMAIL = 'hello@customcarify.com'
const AUDIT_REQUEST_ENDPOINT = '/api/audit-request'

document.addEventListener('DOMContentLoaded', () => {
  const setMenuIcon = (button, iconName) => {
    if (!button) {
      return
    }

    button.replaceChildren(createIconElement(iconName))
  }

  // --- Typewriter Animation ---
  const typeTarget = document.getElementById('typing-target')
  const textToType = 'Run Your Printing Business Like a Pro'
  let index = 0

  function type() {
    if (typeTarget && index < textToType.length) {
      typeTarget.textContent += textToType.charAt(index)
      index++
      setTimeout(type, 70) // Adjust speed here
    }
  }

  // Initialize local icon sprite replacements.
  replaceIcons()

  // Start typewriter after a small delay
  if (typeTarget) {
    setTimeout(type, 800)
  }

  // --- Dashboard Stat Count Up ---
  const animateValue = (id, start, end, duration) => {
    const obj = document.querySelector(`.color-${id}`);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  const dashboard = document.querySelector('.dashboard-window');

  // --- Dashboard Scroll Animation (Tilt to Flat) ---
  const handleDashboardScroll = () => {
    if (!dashboard) return;

    // Disable on mobile
    if (window.innerWidth < 768) {
      dashboard.style.transform = 'perspective(1200px) rotateX(0deg) scale(1)';
      return;
    }

    const scrollY = window.scrollY;
    const threshold = 600; // Animation completes after 600px of scroll
    const progress = Math.min(scrollY / threshold, 1);

    const rotateX = 15 - (15 * progress);
    const scale = 0.9 + (0.1 * progress);

    requestAnimationFrame(() => {
      dashboard.style.transform = `perspective(1200px) rotateX(${rotateX}deg) scale(${scale})`;
    });
  };

  // Observer to trigger count-up when dashboard is visible
  if (dashboard) {
    window.addEventListener('scroll', handleDashboardScroll);
    handleDashboardScroll(); // Initial call

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateValue('orange', 0, 47, 2000);
        animateValue('yellow', 0, 12, 1500);
        animateValue('green', 0, 31, 1800);
        observer.unobserve(dashboard);
      }
    }, { threshold: 0.5 });
    observer.observe(dashboard);
  }

  // --- Scroll Reveal Animation ---
  const revealElements = document.querySelectorAll('.reveal')

  revealElements.forEach((element) => {
    element.classList.add('reveal-ready')
  })

  if ('IntersectionObserver' in window) {
    const revealOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    }

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return
        }

        entry.target.classList.add('active')
        observer.unobserve(entry.target)
      })
    }, revealOptions)

    revealElements.forEach((element) => revealOnScroll.observe(element))
  } else {
    revealElements.forEach((element) => {
      element.classList.add('active')
    })
  }

  // --- Mouse Spotlight Effect ---
  // Tracks mouse and moves a glowing background element slightly
  const spotlight = document.querySelector('.spotlight')

  if (spotlight) {
    window.addEventListener('mousemove', (e) => {
      const x = e.clientX
      const y = e.clientY

      // We calculate percentage of screen to move spotlight
      const xPercent = (x / window.innerWidth) * 100
      const yPercent = (y / window.innerHeight) * 100

      requestAnimationFrame(() => {
        spotlight.style.background = `
          radial-gradient(circle at 14% 12%, rgba(132, 214, 154, 0.05) 0%, transparent 30%),
          radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(47, 158, 68, 0.015) 0%, transparent 36%)
        `
      })
    })
  }

  // Scroll-linked Before / After Split
  const comparisonScrollTrack = document.querySelector('[data-scroll-split]')

  if (comparisonScrollTrack) {
    const comparisonShell = comparisonScrollTrack.querySelector('.comparison-shell')
    const comparisonStage = comparisonScrollTrack.querySelector('.comparison-stage')
    const comparisonButtons = Array.from(
      comparisonScrollTrack.querySelectorAll('[data-compare-target]')
    )
    const comparisonToggle = comparisonScrollTrack.querySelector('[data-compare-toggle]')
    const comparisonPanels = Array.from(
      comparisonScrollTrack.querySelectorAll('[data-compare-panel]')
    )
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let comparisonAnimationFrame = null
    let mobileCompareView = 'before'
    let touchStartX = 0
    let touchStartY = 0
    let hasAutoSwappedMobileCompare = false
    let comparisonAutoSwapTimer = null

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
    const mobileCompareBreakpoint = 1080

    const setMobileCompareView = (view) => {
      if (!comparisonShell) {
        return
      }

      mobileCompareView = view === 'after' ? 'after' : 'before'
      comparisonShell.dataset.mobileCompare = mobileCompareView

      comparisonButtons.forEach((button) => {
        const isActive = button.dataset.compareTarget === mobileCompareView
        button.classList.toggle('is-active', isActive)
        button.setAttribute('aria-selected', String(isActive))
        button.tabIndex = isActive ? 0 : -1
      })

      comparisonPanels.forEach((panel) => {
        const isActive = panel.dataset.comparePanel === mobileCompareView
        panel.classList.toggle('is-active', isActive)
        panel.hidden = window.innerWidth <= mobileCompareBreakpoint ? !isActive : false
        panel.setAttribute(
          'aria-hidden',
          String(window.innerWidth <= mobileCompareBreakpoint ? !isActive : false)
        )
      })

      if (comparisonToggle) {
        const nextViewLabel =
          mobileCompareView === 'before'
            ? 'Show clean organized system'
            : 'Show messy dashboard'
        comparisonToggle.setAttribute('aria-label', nextViewLabel)
      }
    }

    const syncMobileCompareMode = () => {
      if (!comparisonShell) {
        return
      }

      if (window.innerWidth <= mobileCompareBreakpoint) {
        comparisonShell.classList.add('is-mobile-compare')
        comparisonToggle?.setAttribute('tabindex', '0')
        setMobileCompareView(mobileCompareView)
        return
      }

      comparisonShell.classList.remove('is-mobile-compare')
      comparisonShell.dataset.mobileCompare = 'split'
      comparisonShell.classList.remove('is-mobile-compare-autoplay')
      comparisonToggle?.setAttribute('tabindex', '-1')

      comparisonButtons.forEach((button) => {
        button.classList.remove('is-active')
        button.tabIndex = -1
        button.setAttribute('aria-selected', 'false')
      })

      comparisonPanels.forEach((panel) => {
        panel.hidden = false
        panel.classList.remove('is-active')
        panel.setAttribute('aria-hidden', 'false')
      })
    }

    const stopMobileCompareAutoSwap = (markComplete = false) => {
      window.clearTimeout(comparisonAutoSwapTimer)
      comparisonShell?.classList.remove('is-mobile-compare-autoplay')

      if (markComplete) {
        hasAutoSwappedMobileCompare = true
      }
    }

    const queueMobileCompareAutoSwap = () => {
      if (
        !comparisonShell ||
        hasAutoSwappedMobileCompare ||
        prefersReducedMotion.matches ||
        window.innerWidth > mobileCompareBreakpoint
      ) {
        return
      }

      window.clearTimeout(comparisonAutoSwapTimer)
      comparisonShell.classList.add('is-mobile-compare-autoplay')

      comparisonAutoSwapTimer = window.setTimeout(() => {
        setMobileCompareView('after')
        hasAutoSwappedMobileCompare = true
        comparisonShell.classList.remove('is-mobile-compare-autoplay')
      }, 420)
    }

    const mobileCompareAutoSwapObserver = new IntersectionObserver((entries) => {
      const entry = entries[0]

      if (!entry || !entry.isIntersecting) {
        return
      }

      queueMobileCompareAutoSwap()
    }, {
      threshold: 0.45,
      rootMargin: '0px 0px -12% 0px'
    })

    const setSplitProgress = (progress) => {
      if (!comparisonShell) {
        return
      }

      const normalizedProgress = clamp(progress, 0, 1)
      comparisonShell.style.setProperty('--split-progress', normalizedProgress.toFixed(3))
      comparisonShell.classList.toggle('is-split', normalizedProgress > 0.04)
    }

    const updateSplitProgress = () => {
      comparisonAnimationFrame = null

      if (!comparisonShell) {
        return
      }

      if (window.innerWidth <= 1080 || prefersReducedMotion.matches) {
        setSplitProgress(1)
        return
      }

      const rect = comparisonScrollTrack.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const animationStart = viewportHeight * 0.88
      const animationEnd = viewportHeight * 0.28

      if (rect.top >= animationStart) {
        setSplitProgress(0)
        return
      }

      if (rect.bottom <= animationEnd) {
        setSplitProgress(1)
        return
      }

      const progress = (animationStart - rect.top) / Math.max(animationStart - animationEnd, 1)
      setSplitProgress(progress)
    }

    const queueSplitUpdate = () => {
      if (comparisonAnimationFrame !== null) {
        return
      }

      comparisonAnimationFrame = window.requestAnimationFrame(updateSplitProgress)
    }

    window.addEventListener('scroll', queueSplitUpdate, { passive: true })
    window.addEventListener('resize', () => {
      syncMobileCompareMode()
      queueSplitUpdate()
    })

    if (typeof prefersReducedMotion.addEventListener === 'function') {
      prefersReducedMotion.addEventListener('change', () => {
        syncMobileCompareMode()
        queueSplitUpdate()
      })
    } else if (typeof prefersReducedMotion.addListener === 'function') {
      prefersReducedMotion.addListener(() => {
        syncMobileCompareMode()
        queueSplitUpdate()
      })
    }

    comparisonButtons.forEach((button) => {
      button.addEventListener('click', () => {
        stopMobileCompareAutoSwap(true)
        setMobileCompareView(button.dataset.compareTarget)
      })
    })

    comparisonToggle?.addEventListener('click', () => {
      stopMobileCompareAutoSwap(true)
      setMobileCompareView(mobileCompareView === 'before' ? 'after' : 'before')
    })

    comparisonStage?.addEventListener('touchstart', (event) => {
      const touch = event.changedTouches[0]

      if (!touch || window.innerWidth > mobileCompareBreakpoint) {
        return
      }

      touchStartX = touch.clientX
      touchStartY = touch.clientY
    }, { passive: true })

    comparisonStage?.addEventListener('touchend', (event) => {
      const touch = event.changedTouches[0]

      if (!touch || window.innerWidth > mobileCompareBreakpoint) {
        return
      }

      const deltaX = touch.clientX - touchStartX
      const deltaY = touch.clientY - touchStartY

      if (Math.abs(deltaX) < 42 || Math.abs(deltaX) <= Math.abs(deltaY)) {
        return
      }

      stopMobileCompareAutoSwap(true)
      setMobileCompareView(deltaX < 0 ? 'after' : 'before')
    }, { passive: true })

    mobileCompareAutoSwapObserver.observe(comparisonScrollTrack)
    syncMobileCompareMode()
    updateSplitProgress()
  }

  // --- Feature Mockup Carousel ---
  const featureMockupDeck = document.querySelector('[data-feature-mockup]')

  if (featureMockupDeck) {
    const featureMockupStage = featureMockupDeck.querySelector('[data-feature-mockup-stage]')
    const featureMockupCards = Array.from(featureMockupDeck.querySelectorAll('[data-feature-mockup-card]'))
    const featureMockupPrev = featureMockupDeck.querySelector('[data-feature-mockup-prev]')
    const featureMockupNext = featureMockupDeck.querySelector('[data-feature-mockup-next]')
    const featureMockupDots = Array.from(featureMockupDeck.querySelectorAll('[data-feature-mockup-dot]'))
    const featureMockupProgress = featureMockupDeck.querySelector('[data-feature-mockup-progress]')
    let featureMockupIndex = 0
    let featureMockupPointerActive = false
    let featureMockupPointerStartX = 0
    let featureMockupPointerStartY = 0

    const getFeatureMockupPosition = (index) => {
      const delta = (index - featureMockupIndex + featureMockupCards.length) % featureMockupCards.length

      if (delta === 0) {
        return 'active'
      }

      if (delta === 1) {
        return 'next'
      }

      if (delta === 2) {
        return 'far'
      }

      return 'prev'
    }

    const renderFeatureMockups = () => {
      featureMockupCards.forEach((card, index) => {
        const position = getFeatureMockupPosition(index)
        card.dataset.position = position
        card.setAttribute('aria-hidden', String(position !== 'active'))
      })

      featureMockupDots.forEach((dot, index) => {
        const isActive = index === featureMockupIndex
        dot.classList.toggle('is-active', isActive)
        dot.setAttribute('aria-pressed', String(isActive))
      })

      if (featureMockupProgress) {
        const current = String(featureMockupIndex + 1).padStart(2, '0')
        const total = String(featureMockupCards.length).padStart(2, '0')
        featureMockupProgress.textContent = `${current} / ${total}`
      }
    }

    const setFeatureMockupIndex = (nextIndex) => {
      if (!featureMockupCards.length) {
        return
      }

      featureMockupIndex = (nextIndex + featureMockupCards.length) % featureMockupCards.length
      renderFeatureMockups()
    }

    featureMockupPrev?.addEventListener('click', () => {
      setFeatureMockupIndex(featureMockupIndex - 1)
    })

    featureMockupNext?.addEventListener('click', () => {
      setFeatureMockupIndex(featureMockupIndex + 1)
    })

    featureMockupDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        setFeatureMockupIndex(index)
      })
    })

    featureMockupStage?.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setFeatureMockupIndex(featureMockupIndex - 1)
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setFeatureMockupIndex(featureMockupIndex + 1)
      }
    })

    featureMockupStage?.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) {
        return
      }

      featureMockupPointerActive = true
      featureMockupPointerStartX = event.clientX
      featureMockupPointerStartY = event.clientY
      event.currentTarget?.setPointerCapture?.(event.pointerId)
    })

    featureMockupStage?.addEventListener('pointerup', (event) => {
      if (event.pointerType !== 'mouse' || !featureMockupPointerActive) {
        return
      }

      featureMockupPointerActive = false
      event.currentTarget?.releasePointerCapture?.(event.pointerId)

      const deltaX = event.clientX - featureMockupPointerStartX
      const deltaY = event.clientY - featureMockupPointerStartY

      if (Math.abs(deltaX) < 42 || Math.abs(deltaX) <= Math.abs(deltaY)) {
        return
      }

      setFeatureMockupIndex(deltaX < 0 ? featureMockupIndex + 1 : featureMockupIndex - 1)
    })

    featureMockupStage?.addEventListener('pointercancel', (event) => {
      if (event.pointerType !== 'mouse') return
      featureMockupPointerActive = false
    })

    featureMockupStage?.addEventListener('touchstart', (event) => {
      const touch = event.changedTouches[0]
      if (!touch) return
      
      featureMockupPointerActive = true
      featureMockupPointerStartX = touch.clientX
      featureMockupPointerStartY = touch.clientY
    }, { passive: true })

    featureMockupStage?.addEventListener('touchend', (event) => {
      if (!featureMockupPointerActive) return
      const touch = event.changedTouches[0]
      if (!touch) return

      featureMockupPointerActive = false
      const deltaX = touch.clientX - featureMockupPointerStartX
      const deltaY = touch.clientY - featureMockupPointerStartY

      if (Math.abs(deltaX) < 42 || Math.abs(deltaX) <= Math.abs(deltaY)) {
        return
      }

      setFeatureMockupIndex(deltaX < 0 ? featureMockupIndex + 1 : featureMockupIndex - 1)
    }, { passive: true })

    featureMockupStage?.addEventListener('touchcancel', () => {
      featureMockupPointerActive = false
    })

    renderFeatureMockups()
  }

  // Lead Form
  const auditForm = document.getElementById('audit-form')
  const auditFormStatus = document.getElementById('audit-form-status')
  const auditSubmitButton = auditForm?.querySelector('button[type="submit"]')

  const setAuditFormStatus = (state, message) => {
    if (!auditFormStatus) {
      return
    }

    auditFormStatus.className = 'form-status'

    if (state) {
      auditFormStatus.classList.add(`is-${state}`)
    }

    auditFormStatus.textContent = message
  }

  if (auditForm) {
    auditForm.addEventListener('submit', async (event) => {
      event.preventDefault()

      const formData = new FormData(auditForm)
      const payload = {
        fullName: formData.get('fullName')?.toString().trim() || '',
        businessName: formData.get('businessName')?.toString().trim() || '',
        email: formData.get('email')?.toString().trim() || '',
        phone: formData.get('phone')?.toString().trim() || '',
        volume: formData.get('volume')?.toString().trim() || '',
        challenge: formData.get('challenge')?.toString().trim() || '',
        website: formData.get('website')?.toString().trim() || ''
      }

      auditSubmitButton?.setAttribute('disabled', 'true')
      auditForm.setAttribute('aria-busy', 'true')
      setAuditFormStatus('pending', 'Sending your workflow audit request...')

      try {
        const response = await fetch(AUDIT_REQUEST_ENDPOINT, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        let result = null

        try {
          result = await response.json()
        } catch {
          result = null
        }

        if (!response.ok) {
          throw new Error(
            result?.error ||
            `We could not send the request right now. Email ${LEAD_RECIPIENT_EMAIL} directly.`
          )
        }

        setAuditFormStatus(
          'success',
          result?.message || 'Thanks. Your audit request is in and our team will reach out soon.'
        )
        auditForm.reset()
      } catch (error) {
        const fallbackMessage = `We could not send the request right now. Email ${LEAD_RECIPIENT_EMAIL} directly.`
        const message =
          error instanceof Error && error.message
            ? error.message
            : fallbackMessage

        setAuditFormStatus('error', message)
      } finally {
        auditSubmitButton?.removeAttribute('disabled')
        auditForm.removeAttribute('aria-busy')
      }
    })
  }

  // Mobile Menu Toggle
  const navbar = document.querySelector('.navbar')
  const menuToggle = document.getElementById('menu-toggle')
  const navLinks = document.querySelector('.nav-links')
  const menuBackdrop = document.getElementById('menu-backdrop')

  if (menuToggle && navLinks) {
    const setMenuState = (isOpen) => {
      navLinks.classList.toggle('active', isOpen)
      menuBackdrop?.classList.toggle('active', isOpen)
      navLinks.setAttribute('aria-hidden', String(!isOpen))
      menuBackdrop?.setAttribute('aria-hidden', String(!isOpen))
      menuToggle.setAttribute('aria-expanded', String(isOpen))
      document.body.classList.toggle('menu-open', isOpen)
      navbar?.classList.toggle('menu-open', isOpen)
      setMenuIcon(menuToggle, isOpen ? 'x' : 'menu')
    }

    menuToggle.addEventListener('click', (event) => {
      event.stopPropagation()
      const isOpen = !navLinks.classList.contains('active')
      setMenuState(isOpen)
    })

    navLinks.addEventListener('click', (event) => {
      event.stopPropagation()
    })

    menuBackdrop?.addEventListener('click', () => {
      setMenuState(false)
    })

    window.addEventListener('resize', () => {
      if (window.innerWidth > 991) {
        setMenuState(false)
      }
    })

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setMenuState(false)
      }
    })

    setMenuState(false)

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        setMenuState(false)
      })
    })
  }

  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled')
      } else {
        navbar.classList.remove('scrolled')
      }
    })
  }
})
