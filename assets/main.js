(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- nav: scrolled state + mobile menu ---------- */
  const nav = $("#nav"), burger = $("#burger"), links = $("#navLinks");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 24);
  onScroll(); addEventListener("scroll", onScroll, { passive: true });
  const closeMenu = () => { links.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); };
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("a", links).forEach(a => a.addEventListener("click", closeMenu));
  addEventListener("keydown", e => e.key === "Escape" && closeMenu());

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      if (en.target.id === "bars") en.target.classList.add("in");
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach(el => io.observe(el));
  const bars = $("#bars"); if (bars) io.observe(bars);

  /* ---------- hero typing effect ---------- */
  const typed = $("#typed");
  if (typed) {
    const text = typed.dataset.text;
    if (reduce) typed.textContent = text;
    else {
      let i = 0;
      setTimeout(function tick() {
        typed.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(tick, 22 + Math.random() * 28);
      }, 1100);
    }
  }

  /* ---------- card spotlight + 3D tilt ---------- */
  $$(".card").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty("--mx", x + "px");
      card.style.setProperty("--my", y + "px");
      if (!reduce && e.pointerType === "mouse") {
        const rx = ((y / r.height) - .5) * -5, ry = ((x / r.width) - .5) * 5;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      }
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });

  /* ---------- hero neural-network canvas ---------- */
  const cv = $("#net");
  if (cv && !reduce) {
    const ctx = cv.getContext("2d");
    let w, h, dpr, pts = [], raf;
    const mouse = { x: -999, y: -999 };
    const cols = ["255,181,71", "255,77,141", "124,92,255", "34,211,238"];
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(110, Math.floor(w * h / 15000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
        r: Math.random() * 1.8 + .8, c: cols[Math.random() * cols.length | 0]
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const max = 140;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 130) { p.x += dx / d * 1.1; p.y += dy / d * 1.1; }
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < max) {
            ctx.strokeStyle = `rgba(${p.c},${(1 - dist / max) * .28})`;
            ctx.lineWidth = .8;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${p.c},.9)`;
        ctx.shadowColor = `rgba(${p.c},.9)`; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(draw);
    };
    resize(); draw();
    addEventListener("resize", resize);
    cv.parentElement.addEventListener("pointermove", e => {
      const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    cv.parentElement.addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf); else draw();
    });
  }

  /* ---------- contact form: validate, then open mail client ---------- */
  /* ===== CONTACT FORM SETUP =====
     1. Go to https://web3forms.com and enter the email that should receive enquiries.
     2. They email you an Access Key. Paste it between the quotes below.
     (The key is designed to be public; it can only send to your registered email.) */
  const WEB3FORMS_ACCESS_KEY = "";

  /* Shared sender used by other pages (e.g. job applications).
     With a key: posts to Web3Forms. Without one: opens the visitor's email app. */
  window.hxSend = (subject, fields) => {
    if (!WEB3FORMS_ACCESS_KEY) {
      const body = Object.entries(fields).map(([k, v]) => `${k}: ${v || "-"}`).join("\n");
      location.href = `mailto:hello@helionixai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      return Promise.resolve({ fallback: true });
    }
    return fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: WEB3FORMS_ACCESS_KEY, subject, from_name: "Helionix AI Systems website", ...fields, botcheck: "" })
    }).then(r => r.json()).then(d => { if (!d.success) throw new Error(d.message || "failed"); return d; });
  };

  const form = $("#contactForm"), note = $("#formNote");
  if (form) { /* hidden spam trap: humans never see or fill this */
    const hp = document.createElement("input");
    hp.type = "checkbox"; hp.name = "botcheck"; hp.tabIndex = -1; hp.autocomplete = "off";
    hp.style.cssText = "position:absolute;left:-9999px;opacity:0;height:0;width:0";
    hp.setAttribute("aria-hidden", "true"); form.appendChild(hp);
  }
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(form);
    const name = (f.get("name") || "").trim(), email = (f.get("email") || "").trim();
    let ok = true;
    ["name", "email"].forEach(id => $("#" + id).classList.remove("err"));
    if (!name) { $("#name").classList.add("err"); ok = false; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { $("#email").classList.add("err"); ok = false; }
    if (!ok) { note.textContent = "Please add your name and a valid work email."; note.style.color = "#ff8a8a"; return; }
    const company = f.get("company") || "-", interest = f.get("interest"), message = f.get("message") || "";

    /* No access key yet -> fall back to the visitor's email app */
    if (!WEB3FORMS_ACCESS_KEY) {
      const body = [`Name: ${name}`, `Email: ${email}`, `Company: ${company}`, `Interested in: ${interest}`, "", message].join("\n");
      location.href = `mailto:hello@helionixai.com?subject=${encodeURIComponent("Inquiry from " + name)}&body=${encodeURIComponent(body)}`;
      note.textContent = "Thanks! Your email app should open with the message ready to send.";
      note.style.color = "#6ee7b7";
      return;
    }

    /* Real delivery through Web3Forms */
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; note.textContent = "Sending..."; note.style.color = "";
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `New website inquiry from ${name}`,
        from_name: "Helionix AI Systems website",
        name, email, company, interested_in: interest, message,
        botcheck: f.get("botcheck") || ""
      })
    })
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.message || "failed");
        form.reset();
        note.textContent = "Thank you! We have your message and will reply within one business day.";
        note.style.color = "#6ee7b7";
      })
      .catch(() => {
        note.innerHTML = 'Sorry, that did not send. Please email us at <a href="mailto:hello@helionixai.com" style="text-decoration:underline">hello@helionixai.com</a>.';
        note.style.color = "#ff8a8a";
      })
      .finally(() => { btn.disabled = false; });
  });

  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();
})();
