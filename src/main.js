import './style.css'

const LEAD_RECIPIENT_EMAIL = 'hello@customcarify.com'

document.addEventListener('DOMContentLoaded', () => {
  const setMenuIcon = (button, iconName) => {
    if (!button || !window.feather?.icons?.[iconName]) {
      return
    }

    button.innerHTML = feather.icons[iconName].toSvg({
      'aria-hidden': 'true'
    })
  }

  // --- Typewriter Animation ---
  const typeTarget = document.getElementById('typing-target')
  const textToType = "Run Your Printing Business Like a Pro"
  let index = 0

  function type() {
    if (index < textToType.length) {
      typeTarget.textContent += textToType.charAt(index)
      index++
      setTimeout(type, 70) // Adjust speed here
    }
  }

  // Initialize Feather Icons
  feather.replace()

  // Start typewriter after a small delay
  setTimeout(type, 800)

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

  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  }

  const revealOnScroll = new IntersectionObserver(function (entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return
      } else {
        entry.target.classList.add('active')
        observer.unobserve(entry.target)
      }
    })
  }, revealOptions)

  revealElements.forEach(el => revealOnScroll.observe(el))

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

  // Quick in-view Before / After Split
  const comparisonScrollTrack = document.querySelector('[data-scroll-split]')

  if (comparisonScrollTrack) {
    const comparisonShell = comparisonScrollTrack.querySelector('.comparison-shell')
    let hasSplitActivated = false

    const setSplitProgress = (isSplit) => {
      if (!comparisonShell) {
        return
      }

      comparisonShell.style.setProperty('--split-progress', isSplit ? '1' : '0')
      comparisonShell.classList.toggle('is-split', isSplit)
    }

    const splitObserver = new IntersectionObserver((entries) => {
      const entry = entries[0]

      if (!entry || hasSplitActivated) {
        return
      }

      if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
        hasSplitActivated = true
        setSplitProgress(true)
        splitObserver.disconnect()
      }
    }, {
      threshold: [0.2],
      rootMargin: '0px 0px -8% 0px'
    })

    splitObserver.observe(comparisonScrollTrack)
    setSplitProgress(false)
  }

  // Lead Form
  const auditForm = document.getElementById('audit-form')
  const auditFormStatus = document.getElementById('audit-form-status')

  if (auditForm) {
    auditForm.addEventListener('submit', (event) => {
      event.preventDefault()

      const formData = new FormData(auditForm)
      const fullName = formData.get('fullName')?.toString().trim() || ''
      const businessName = formData.get('businessName')?.toString().trim() || ''
      const email = formData.get('email')?.toString().trim() || ''
      const phone = formData.get('phone')?.toString().trim() || ''
      const volume = formData.get('volume')?.toString().trim() || ''
      const challenge = formData.get('challenge')?.toString().trim() || ''

      const subject = `Workflow audit request from ${businessName}`
      const body = [
        'New workflow audit request',
        '',
        `Full name: ${fullName}`,
        `Business name: ${businessName}`,
        `Work email: ${email}`,
        `Phone / WhatsApp: ${phone}`,
        `Monthly order volume: ${volume}`,
        '',
        'Biggest workflow bottleneck:',
        challenge
      ].join('\n')

      const mailtoUrl = `mailto:${LEAD_RECIPIENT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

      if (auditFormStatus) {
        auditFormStatus.textContent = `Opening your email app for ${LEAD_RECIPIENT_EMAIL}...`
      }

      window.location.href = mailtoUrl

      window.setTimeout(() => {
        if (auditFormStatus) {
          auditFormStatus.textContent = `If your email app does not open, send your details manually to ${LEAD_RECIPIENT_EMAIL}.`
        }
      }, 1200)
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

  // Signal FOUC readiness
  document.body.classList.add('fouc-ready');
})
