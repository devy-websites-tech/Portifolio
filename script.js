document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* ===== LOADER ===== */
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(function () {
      loader.classList.add('hidden');
    }, 2000);
  }

  /* ===== CANVAS BACKGROUND ===== */
  (function initCanvas() {
    var canvas = document.getElementById('canvas-bg');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H;
    var stars = [];
    var connections = [];
    var nebulae = [];
    var shootingStars = [];
    var mouseX = -1000;
    var mouseY = -1000;
    var STAR_COUNT = 180;
    var CONNECTION_DIST = 120;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function createStar() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.2,
        dx: (Math.random() - 0.5) * 0.15,
        dy: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.8 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseOffset: Math.random() * Math.PI * 2
      };
    }

    function init() {
      resize();
      stars = [];
      for (var i = 0; i < STAR_COUNT; i++) {
        stars.push(createStar());
      }
      for (var i = 0; i < 3; i++) {
        nebulae.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 200 + 100,
          color: ['rgba(124,92,252,0.03)', 'rgba(0,212,255,0.02)', 'rgba(255,107,107,0.02)'][i],
          dx: (Math.random() - 0.5) * 0.1,
          dy: (Math.random() - 0.5) * 0.1
        });
      }
    }

    function createShootingStar() {
      return {
        x: Math.random() * W,
        y: Math.random() * H * 0.3,
        len: Math.random() * 80 + 40,
        speed: Math.random() * 4 + 2,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        alpha: 1,
        life: 1
      };
    }

    function spawnShootingStar() {
      if (Math.random() < 0.003) {
        shootingStars.push(createShootingStar());
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      for (var n = 0; n < nebulae.length; n++) {
        var neb = nebulae[n];
        var grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.r);
        grad.addColorStop(0, neb.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(neb.x - neb.r, neb.y - neb.r, neb.r * 2, neb.r * 2);
        neb.x += neb.dx;
        neb.y += neb.dy;
        if (neb.x < -neb.r) neb.x = W + neb.r;
        if (neb.x > W + neb.r) neb.x = -neb.r;
        if (neb.y < -neb.r) neb.y = H + neb.r;
        if (neb.y > H + neb.r) neb.y = -neb.r;
      }

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var pulse = Math.sin(Date.now() * s.pulseSpeed + s.pulseOffset) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(240, 240, 245, ' + (s.alpha * pulse) + ')';
        ctx.fill();
        s.x += s.dx;
        s.y += s.dy;
        if (s.x < 0) s.x = W;
        if (s.x > W) s.x = 0;
        if (s.y < 0) s.y = H;
        if (s.y > H) s.y = 0;
      }

      var nearbyStars = [];
      var starCount = stars.length;
      var halfDist = CONNECTION_DIST / 2;
      for (var i = 0; i < starCount; i++) {
        var s1 = stars[i];
        var neighbors = 0;
        for (var j = i + 1; j < starCount && neighbors < 3; j++) {
          var s2 = stars[j];
          var dx = s1.x - s2.x;
          var dy = s1.y - s2.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            var alpha = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.strokeStyle = 'rgba(124, 92, 252, ' + alpha + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            neighbors++;
          }
        }
      }

      for (var k = shootingStars.length - 1; k >= 0; k--) {
        var ss = shootingStars[k];
        var tailX = ss.x - Math.cos(ss.angle) * ss.len;
        var tailY = ss.y - Math.sin(ss.angle) * ss.len;
        var grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, 'rgba(167, 139, 250, ' + ss.alpha + ')');
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.life -= 0.008;
        ss.alpha = ss.life;
        if (ss.life <= 0 || ss.x > W + 50 || ss.y > H + 50) {
          shootingStars.splice(k, 1);
        }
      }

      spawnShootingStar();
      requestAnimationFrame(draw);
    }

    init();
    draw();

    window.addEventListener('resize', function () {
      resize();
      init();
    });
  })();

  /* ===== MOUSE GLOW ===== */
  (function mouseGlow() {
    var glow = document.getElementById('mouse-glow');
    if (!glow) return;
    var isVisible = false;
    var timeout;

    document.addEventListener('mousemove', function (e) {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      if (!isVisible) {
        isVisible = true;
        glow.style.opacity = '1';
      }
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        glow.style.opacity = '0';
        isVisible = false;
      }, 3000);
    });
  })();

  /* ===== NAVBAR SCROLL ===== */
  (function navbarScroll() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;
    var lastScroll = 0;

    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY;
      if (scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      lastScroll = scrollY;
    });
  })();

  /* ===== MOBILE MENU ===== */
  (function mobileMenu() {
    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
    });

    var linkItems = links.querySelectorAll('.nav-link');
    for (var i = 0; i < linkItems.length; i++) {
      linkItems[i].addEventListener('click', function () {
        toggle.classList.remove('active');
        links.classList.remove('open');
      });
    }
  })();

  /* ===== ACTIVE NAV LINK ===== */
  (function activeNav() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link');

    function updateActive() {
      var current = '';
      sections.forEach(function (section) {
        var top = section.offsetTop - 150;
        var bottom = top + section.offsetHeight;
        if (window.scrollY >= top && window.scrollY < bottom) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(function (link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', updateActive);
    updateActive();
  })();

  /* ===== TYPEWRITER EFFECT ===== */
  (function typewriter() {
    var el = document.getElementById('typing-text');
    if (!el) return;
    var text = 'Transformando ideias em experiencias digitais';
    var index = 0;
    var isDeleting = false;
    var speed = 60;
    var pause = 3000;

    function type() {
      if (!isDeleting) {
        el.textContent = text.substring(0, index + 1);
        index++;
        if (index >= text.length) {
          isDeleting = true;
          setTimeout(type, pause);
          return;
        }
        setTimeout(type, speed);
      } else {
        el.textContent = text.substring(0, index);
        index--;
        if (index < 0) {
          isDeleting = false;
          setTimeout(type, pause);
          return;
        }
        setTimeout(type, speed / 2);
      }
    }

    setTimeout(type, 500);
  })();

  /* ===== SCROLL REVEAL ===== */
  (function scrollReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  })();

  /* ===== 3D TILT EFFECT ===== */
  (function tiltEffect() {
    var cards = document.querySelectorAll('[data-tilt]');
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = (y - centerY) / centerY * -8;
        var rotateY = (x - centerX) / centerX * 8;
        card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.5s ease';
        setTimeout(function () {
          card.style.transition = '';
        }, 500);
      });
    });
  })();

  /* ===== PARALLAX HERO ===== */
  (function parallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    document.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 20;
      var y = (e.clientY / window.innerHeight - 0.5) * 20;
      hero.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    });

    window.addEventListener('scroll', function () {
      var offset = window.scrollY;
      if (offset < window.innerHeight) {
        hero.style.transform = 'translateY(' + (offset * 0.15) + 'px)';
      }
    });
  })();
});
