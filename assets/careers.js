/* Careers page: renders open roles from /jobs.json and handles applications.
   To add/edit/remove jobs, edit jobs.json only - see HOW-TO-POST-JOBS.md */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const list = $("#jobList"), empty = $("#jobEmpty"), filters = $("#jobFilters");
  const roleSel = $("#applyRole"), form = $("#applyForm"), note = $("#applyNote");
  if (!list) return;

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ul = a => Array.isArray(a) && a.length ? `<ul>${a.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
  const section = (t, a) => ul(a) ? `<h4>${t}</h4>${ul(a)}` : "";
  const today = new Date().toISOString().slice(0, 10);
  const fmt = d => { const x = new Date(d + "T00:00:00"); return isNaN(x) ? "" : x.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); };
  const slug = j => (j.id || j.title || "").toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  let jobs = [];

  function isOpen(j) {
    if (!j || !j.title) return false;
    if ((j.status || "open").toLowerCase() !== "open") return false;
    if (j.expires && j.expires < today) return false;
    return true;
  }

  function render() {
    const dept = $("#fDept")?.value || "", type = $("#fType")?.value || "";
    const shown = jobs.filter(j => (!dept || j.department === dept) && (!type || j.type === type));
    list.innerHTML = shown.map(j => `
      <article class="job" id="${esc(slug(j))}">
        <button class="job__head" aria-expanded="false" aria-controls="b-${esc(slug(j))}">
          <span class="job__title">${esc(j.title)}</span>
          <span class="job__meta">
            ${j.department ? `<i>${esc(j.department)}</i>` : ""}
            ${j.location ? `<i>${esc(j.location)}</i>` : ""}
            ${j.type ? `<i>${esc(j.type)}</i>` : ""}
          </span>
          <span class="job__chev" aria-hidden="true"></span>
        </button>
        <div class="job__body" id="b-${esc(slug(j))}" hidden>
          ${j.summary ? `<p class="job__sum">${esc(j.summary)}</p>` : ""}
          ${section("What you'll do", j.responsibilities)}
          ${section("What you bring", j.requirements)}
          ${section("Nice to have", j.niceToHave)}
          ${j.salary ? `<p class="job__sal"><b>Compensation:</b> ${esc(j.salary)}</p>` : ""}
          <div class="job__foot">
            <button class="btn btn--glow btn--sm" data-apply="${esc(slug(j))}">Apply for this role</button>
            ${j.posted ? `<small>Posted ${esc(fmt(j.posted))}</small>` : ""}
          </div>
        </div>
      </article>`).join("");
    empty.hidden = jobs.length > 0;
    if (filters) filters.hidden = jobs.length < 2;
    $("#jobCount").textContent = jobs.length ? `${shown.length} open role${shown.length === 1 ? "" : "s"}` : "";
  }

  function setupFilters() {
    const uniq = k => [...new Set(jobs.map(j => j[k]).filter(Boolean))].sort();
    const fill = (id, k, label) => { const s = $(id); s.innerHTML = `<option value="">${label}</option>` + uniq(k).map(v => `<option>${esc(v)}</option>`).join(""); s.onchange = render; };
    fill("#fDept", "department", "All teams"); fill("#fType", "type", "All types");
  }

  function setupApply() {
    roleSel.innerHTML = `<option value="General application">General application (no specific role)</option>` +
      jobs.map(j => `<option value="${esc(j.title)}" data-id="${esc(slug(j))}">${esc(j.title)}</option>`).join("");
  }

  function jsonLd() {
    jobs.forEach(j => {
      const s = document.createElement("script"); s.type = "application/ld+json";
      const remote = /remote/i.test(j.location || "");
      const ld = {
        "@context": "https://schema.org", "@type": "JobPosting", title: j.title,
        description: [j.summary, ...(j.responsibilities || []), ...(j.requirements || [])].filter(Boolean).join(" "),
        datePosted: j.posted || today, employmentType: (j.type || "").toUpperCase().replace(/[\s-]+/g, "_") || undefined,
        hiringOrganization: { "@type": "Organization", name: "Helionix AI Systems", sameAs: "https://helionixai.com" },
        directApply: false
      };
      if (j.expires) ld.validThrough = j.expires;
      if (remote) ld.jobLocationType = "TELECOMMUTE";
      if (j.location) ld.jobLocation = { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: j.location } };
      s.textContent = JSON.stringify(ld); document.head.appendChild(s);
    });
  }

  function open(card, yes) {
    const b = card.querySelector(".job__body"), h = card.querySelector(".job__head");
    b.hidden = !yes; h.setAttribute("aria-expanded", String(yes)); card.classList.toggle("open", yes);
  }

  list.addEventListener("click", e => {
    const apply = e.target.closest("[data-apply]");
    if (apply) {
      const opt = [...roleSel.options].find(o => o.dataset.id === apply.dataset.apply);
      if (opt) roleSel.value = opt.value;
      $("#apply").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => $("#aName")?.focus({ preventScroll: true }), 600);
      return;
    }
    const head = e.target.closest(".job__head");
    if (head) { const card = head.closest(".job"); open(card, head.getAttribute("aria-expanded") !== "true"); }
  });

  form?.addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(form), name = (f.get("name") || "").trim(), email = (f.get("email") || "").trim();
    ["aName", "aEmail"].forEach(id => $("#" + id).classList.remove("err"));
    let ok = true;
    if (!name) { $("#aName").classList.add("err"); ok = false; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { $("#aEmail").classList.add("err"); ok = false; }
    if (!ok) { note.textContent = "Please add your name and a valid email."; note.style.color = "#ff8a8a"; return; }
    if (f.get("website")) return; /* honeypot */
    const btn = form.querySelector('button[type="submit"]'); btn.disabled = true; note.textContent = "Sending..."; note.style.color = "";
    window.hxSend(`Job application: ${f.get("role")} - ${name}`, {
      role: f.get("role"), name, email, phone: f.get("phone") || "", profile_or_resume_link: f.get("link") || "", message: f.get("message") || ""
    }).then(r => {
      if (!r.fallback) form.reset();
      note.textContent = r.fallback ? "Thanks! Your email app should open with your application ready to send." : "Thank you! We have your application and will be in touch if there is a fit.";
      note.style.color = "#6ee7b7";
    }).catch(() => {
      note.innerHTML = 'Sorry, that did not send. Please email us at <a href="mailto:hello@helionixai.com" style="text-decoration:underline">hello@helionixai.com</a>.';
      note.style.color = "#ff8a8a";
    }).finally(() => { btn.disabled = false; });
  });

  fetch("jobs.json", { cache: "no-cache" })
    .then(r => { if (!r.ok) throw 0; return r.json(); })
    .catch(() => ({ jobs: [] }))
    .then(d => {
      jobs = (d.jobs || []).filter(isOpen);
      setupFilters(); render(); setupApply(); jsonLd();
      const hash = decodeURIComponent(location.hash.slice(1));
      const card = hash && document.getElementById(hash);
      if (card && card.classList.contains("job")) { open(card, true); setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "center" }), 300); }
    });
})();
