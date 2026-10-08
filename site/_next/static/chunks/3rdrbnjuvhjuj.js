(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,82926,e=>{"use strict";let t=[{group:"Overview"},{href:"/admin",key:"dashboard",label:"Dashboard"},{group:"Marketplace"},{href:"/admin/templates",key:"templates",label:"Templates"},{href:"/admin/templates/new",key:"template-new",label:"New template"},{href:"/admin/submissions",key:"submissions",label:"Submissions",count:"pendingSubmissions"},{group:"Taxonomy"},{href:"/admin/categories",key:"categories",label:"Categories"},{href:"/admin/tags",key:"tags",label:"Tags"},{href:"/admin/publishers",key:"publishers",label:"Publishers"},{group:"Insights"},{href:"/admin/analytics",key:"analytics",label:"Analytics"},{href:"/admin/registry",key:"registry",label:"Registry"},{group:"System"},{href:"/admin/admins",key:"admins",label:"Admins"},{href:"/admin/activity",key:"activity",label:"Activity"},{href:"/admin/settings",key:"settings",label:"Settings"}];class a extends Error{constructor(e,{status:t=0,code:a="error",details:n}={}){super(e),this.status=t,this.code=a,this.details=n}}async function n(e,{method:t="GET",body:i,formData:s}={}){let r,o={method:t,credentials:"same-origin",headers:{}};s?o.body=s:void 0!==i&&(o.headers["Content-Type"]="application/json",o.body=JSON.stringify(i));try{r=await fetch(e,o)}catch{throw new a("Cannot reach the server. Is it still running?",{code:"network"})}let l=await r.text(),d=null;if(l)try{d=JSON.parse(l)}catch{d=null}if(!r.ok){let t=d?.error?.message;t||(t=405===r.status||window.location.hostname.endsWith("github.io")?"GitHub Pages is static. Admin sign-in requires the Node.js server (run 'node scripts/start.js' locally at http://localhost:8787/admin).":`Request failed (${r.status})`);let n=new a(t,{status:r.status,code:d?.error?.code,details:d?.error?.details});throw 401!==r.status||e.endsWith("/login")||/\/admin\/login(\.html)?$/.test(window.location.pathname)||(window.location.href=`/admin/login?next=${encodeURIComponent(window.location.pathname)}`),n}return d}let i=e=>n(e),s=(e,t)=>n(e,{method:"POST",body:t});function r(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}async function o(){return await i("/api/admin/session")}function l(e,t=""){let a=document.getElementById("admin-toast");if(!a)return;let n=document.createElement("div");n.className=`toast-item ${t}`,n.textContent=e,a.appendChild(n),setTimeout(()=>n.remove(),4200)}function d(e){let t=Number(e||0);return t>=1e6?`${(t/1e6).toFixed(1).replace(/\.0$/,"")}m`:t>=1e4?`${(t/1e3).toFixed(1).replace(/\.0$/,"")}k`:t.toLocaleString("en-US")}e.s(["api",0,n,"confirmAction",0,function(e,{confirmLabel:t="Confirm",danger:a=!0}={}){return new Promise(n=>{let i=document.createElement("dialog");i.className="modal",i.innerHTML=`
      <div class="panel-head"><h2>Please confirm</h2></div>
      <div class="panel-body"><p style="margin:0;line-height:1.7;font-size:13px">${r(e)}</p></div>
      <div class="modal-actions">
        <button class="btn ghost" type="button" data-cancel>Cancel</button>
        <button class="btn ${a?"danger":"primary"}" type="button" data-confirm>${r(t)}</button>
      </div>
    `,document.body.appendChild(i);let s=e=>{i.close(),i.remove(),n(e)};i.querySelector("[data-cancel]").addEventListener("click",()=>s(!1)),i.querySelector("[data-confirm]").addEventListener("click",()=>s(!0)),i.addEventListener("cancel",()=>s(!1)),i.addEventListener("click",e=>{e.target===i&&s(!1)}),i.showModal()})},"debounce",0,function(e,t=250){let a;return(...n)=>{clearTimeout(a),a=setTimeout(()=>e(...n),t)}},"del",0,(e,t)=>n(e,{method:"DELETE",body:t}),"editModal",0,function({title:e,fields:t,submitLabel:a="Save",onSubmit:n}){return new Promise(i=>{let s=document.createElement("dialog");s.className="modal";let o=t.map(e=>{let t,a=`field-${e.name}`,n=r(e.value??"");return t="textarea"===e.type?`<textarea id="${a}" name="${e.name}" rows="3" placeholder="${r(e.placeholder||"")}">${n}</textarea>`:"checkbox"===e.type?`<label class="checkbox-field"><input type="checkbox" id="${a}" name="${e.name}" ${e.value?"checked":""}> ${r(e.checkboxLabel||"Enabled")}</label>`:"select"===e.type?`<select id="${a}" name="${e.name}">${(e.options||[]).map(t=>`<option value="${r(t.value)}" ${t.value===e.value?"selected":""}>${r(t.label)}</option>`).join("")}</select>`:`<input type="${e.type||"text"}" id="${a}" name="${e.name}" value="${n}" placeholder="${r(e.placeholder||"")}" ${e.required?"required":""}>`,`
        <div class="field ${e.wide?"full":""}">
          <label for="${a}">${r(e.label)}${e.required?" *":""}</label>
          ${t}
          ${e.hint?`<span class="field-hint">${r(e.hint)}</span>`:""}
          <span class="field-error" data-error-for="${e.name}"></span>
        </div>`}).join("");s.innerHTML=`
      <form method="dialog" novalidate>
        <div class="panel-head"><h2>${r(e)}</h2></div>
        <div class="panel-body"><div class="form-grid">${o}</div></div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" data-cancel>Cancel</button>
          <button class="btn primary" type="submit">${r(a)}</button>
        </div>
      </form>
    `,document.body.appendChild(s);let d=e=>{s.close(),s.remove(),i(e)};s.querySelector("[data-cancel]").addEventListener("click",()=>d(null)),s.addEventListener("cancel",()=>d(null)),s.addEventListener("click",e=>{e.target===s&&d(null)}),s.querySelector("form").addEventListener("submit",async e=>{e.preventDefault(),s.querySelectorAll("[data-error-for]").forEach(e=>{e.textContent=""});let a={};for(let e of t){let t=s.querySelector(`[name="${e.name}"]`);t&&(a[e.name]="checkbox"===t.type?t.checked:t.value)}try{let e=await n(a);d(e)}catch(e){if(e.details)for(let[t,a]of Object.entries(e.details)){let e=s.querySelector(`[data-error-for="${t}"]`);e&&(e.textContent=a)}l(e.message,"error")}}),s.showModal(),s.querySelector("input, select, textarea")?.focus()})},"escapeHtml",0,r,"fillSelect",0,function(e,t,{placeholder:a="All",valueKey:n="slug",labelKey:i="name"}={}){let s=e.value;e.innerHTML=(a?`<option value="">${r(a)}</option>`:"")+t.map(e=>`<option value="${r(e[n])}">${r(e[i])}${void 0!==e.templateCount?` (${e.templateCount})`:""}</option>`).join(""),[...e.options].some(e=>e.value===s)&&(e.value=s)},"flagsBadges",0,function(e){let t=[];return e.featured&&t.push('<span class="badge featured">featured</span>'),e.verified&&t.push('<span class="badge verified">verified</span>'),t.join(" ")},"fmtDate",0,function(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})},"fmtDateTime",0,function(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":`${t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})} ${t.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}`},"fmtNumber",0,d,"get",0,i,"mountAdmin",0,function({active:e="",title:a="Dashboard",crumb:n="Admin",actions:i=""}={}){document.body.classList.add("admin-page");let o=function(){try{return JSON.parse(sessionStorage.getItem("admin:counts")||"{}")}catch{return{}}}(),l=t.map(t=>{if(t.group)return`<div class="nav-group">${r(t.group)}</div>`;let a=t.count?o[t.count]:null,n=a?`<span class="nav-count">${Number(a)}</span>`:"";return`<a href="${t.href}" class="${t.key===e?"active":""}">${r(t.label)}${n}</a>`}).join("");return document.body.innerHTML=`
    <a class="skip-link" href="#admin-content">Skip to content</a>
    <div class="admin-shell">
      <aside class="admin-sidebar" id="admin-sidebar">
        <a class="admin-brand" href="/">
          <img src="/assets/img/litho-wordmark.png?v=20261007-01" alt="" width="656" height="192">
          <span>Admin</span>
        </a>
        <nav class="admin-nav" aria-label="Admin navigation">${l}</nav>
        <div class="admin-sidebar-foot">
          <a class="btn ghost small" href="/" target="_blank" rel="noreferrer">View marketplace ↗</a>
          <button class="btn ghost small" type="button" data-action="theme">Toggle theme</button>
          <button class="btn ghost small" type="button" data-action="logout">Sign out</button>
        </div>
      </aside>
      <div class="admin-main">
        <header class="admin-topbar">
          <div style="display:flex;align-items:center;gap:12px;min-width:0">
            <button class="btn ghost small menu-toggle" type="button" data-action="menu" aria-expanded="false" aria-controls="admin-sidebar">Menu</button>
            <div style="min-width:0">
              <div class="crumbs">${r(n)}</div>
              <h1>${r(a)}</h1>
            </div>
          </div>
          <div class="admin-actions" id="admin-actions">${i}</div>
        </header>
        <main class="admin-body" id="admin-content" tabindex="-1"></main>
      </div>
    </div>
    <div class="admin-toast" id="admin-toast" role="status" aria-live="polite"></div>
  `,document.body.addEventListener("click",e=>{let t=e.target.closest("[data-action]")?.dataset.action;if("logout"===t&&(s("/api/admin/logout").catch(()=>{}),window.location.href="/admin/login"),"menu"===t){let t=document.getElementById("admin-sidebar").classList.toggle("open");e.target.closest("[data-action]").setAttribute("aria-expanded",String(t))}"theme"===t&&function(){let e=document.documentElement,t="light"===e.dataset.theme?"dark":"light";e.dataset.theme=t;try{localStorage.setItem("litho-theme",t)}catch{}}()}),{body:document.getElementById("admin-content"),actions:document.getElementById("admin-actions"),setActions(e){document.getElementById("admin-actions").innerHTML=e}}},"post",0,s,"put",0,(e,t)=>n(e,{method:"PUT",body:t}),"queryString",0,function(e={}){let t=new URLSearchParams;for(let[a,n]of Object.entries(e))""!==n&&null!=n&&t.set(a,String(n));let a=t.toString();return a?`?${a}`:""},"renderPagination",0,function(e,{page:t,pages:a,total:n,onPage:i}){e.innerHTML=`
    <div class="pagination">
      <span>${d(n)} result${1===n?"":"s"}</span>
      <div class="pages">
        <button class="btn ghost small" type="button" data-prev ${t<=1?"disabled":""}>← Prev</button>
        <span>Page ${t} / ${a}</span>
        <button class="btn ghost small" type="button" data-next ${t>=a?"disabled":""}>Next →</button>
      </div>
    </div>
  `,e.querySelector("[data-prev]")?.addEventListener("click",()=>i(t-1)),e.querySelector("[data-next]")?.addEventListener("click",()=>i(t+1))},"requireSession",0,o,"showFormErrors",0,function(e,t={}){for(let[a,n]of(e.querySelectorAll(".field-error").forEach(e=>{e.textContent=""}),e.querySelectorAll("[aria-invalid]").forEach(e=>e.removeAttribute("aria-invalid")),Object.entries(t))){let t=e.querySelector(`[data-error-for="${a}"]`);t&&(t.textContent=n);let i=e.querySelector(`[name="${a}"]`);i&&i.setAttribute("aria-invalid","true")}},"statusBadge",0,function(e){let t=String(e||"unknown");return`<span class="badge ${r(t)}">${r(t)}</span>`},"storeCounts",0,function(e){try{sessionStorage.setItem("admin:counts",JSON.stringify(e))}catch{}},"timeAgo",0,function(e){if(!e)return"—";let t=Math.round((Date.now()-new Date(e).getTime())/1e3);if(!Number.isFinite(t))return"—";for(let[e,a]of[[31536e3,"y"],[2592e3,"mo"],[604800,"w"],[86400,"d"],[3600,"h"],[60,"m"]])if(Math.abs(t)>=e)return`${Math.round(t/e)}${a} ago`;return"just now"},"toast",0,l])},93489,e=>{e.v(e=>Promise.resolve().then(()=>e(82926)))},80545,e=>e.a(async(t,a)=>{try{var n=e.i(82926);let t=new URLSearchParams(window.location.search).get("status")||"pending",s=(0,n.mountAdmin)({active:"submissions",title:"Submissions",crumb:"Admin / Marketplace / Review queue"});await (0,n.requireSession)();let r={status:t,page:1};s.body.innerHTML=`
  <div class="toolbar" style="border:1px solid var(--line);background:var(--panel);border-bottom:none;margin-bottom:16px">
    <div class="field">
      <label for="status-filter">Show</label>
      <select id="status-filter">
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="">All</option>
      </select>
    </div>
    <span class="field-hint" style="align-self:center">Visitors submit templates without an account; every submission lands here for review.</span>
  </div>
  <div id="submissions-list"></div>
  <div id="submissions-pagination"></div>
`,document.getElementById("status-filter").value=r.status,document.getElementById("status-filter").addEventListener("change",e=>{r.status=e.target.value,r.page=1,i()});let o=document.getElementById("submissions-list"),l=document.getElementById("submissions-pagination");async function i(){o.innerHTML='<div class="empty"><h3>Loading…</h3></div>';try{let e=await (0,n.get)(`/api/admin/submissions${(0,n.queryString)({status:r.status,page:r.page})}`);if(!e.items.length){o.innerHTML=`
        <div class="empty">
          <h3>Nothing here</h3>
          <p>${"pending"===r.status?"The review queue is empty.":"No submissions with this status."}</p>
        </div>`,l.innerHTML="";return}o.innerHTML=e.items.map(e=>`
      <article class="submission-card" data-id="${(0,n.escapeHtml)(e.id)}">
        <h3>${(0,n.escapeHtml)(e.name)}</h3>
        <div class="meta">
          ${(0,n.statusBadge)(e.status)}
          ${(0,n.escapeHtml)(e.categoryName||"no category")} \xb7
          ${(0,n.escapeHtml)(e.publisherName||e.submitter_name||"anonymous")} \xb7
          submitted ${(0,n.fmtDateTime)(e.created_at)}
          ${e.reviewed_at?` \xb7 reviewed ${(0,n.fmtDateTime)(e.reviewed_at)}`:""}
        </div>
        <p class="desc">${(0,n.escapeHtml)(e.description||"")}</p>
        <div>
          ${(e.tags||[]).map(e=>`<span class="tag-chip">${(0,n.escapeHtml)(e)}</span>`).join("")}
          <span class="tag-chip">v${(0,n.escapeHtml)(e.version||"1.0.0")}</span>
          ${e.license?`<span class="tag-chip">${(0,n.escapeHtml)(e.license)}</span>`:""}
        </div>
        ${e.long_description?`<details style="margin-top:10px"><summary class="field-hint" style="cursor:pointer">Full description</summary><p class="desc" style="margin-top:8px">${(0,n.escapeHtml)(e.long_description)}</p></details>`:""}
        ${e.reject_reason?`<div class="notice error" style="margin-top:12px">Rejected: ${(0,n.escapeHtml)(e.reject_reason)}</div>`:""}
        <div class="links" style="margin-top:10px;display:flex;gap:14px;flex-wrap:wrap">
          ${e.download_url?`<a class="field-hint" href="${(0,n.escapeHtml)(e.download_url)}" target="_blank" rel="noreferrer">download ↗</a>`:""}
          ${e.repository_url?`<a class="field-hint" href="${(0,n.escapeHtml)(e.repository_url)}" target="_blank" rel="noreferrer">repository ↗</a>`:""}
          ${e.documentation_url?`<a class="field-hint" href="${(0,n.escapeHtml)(e.documentation_url)}" target="_blank" rel="noreferrer">documentation ↗</a>`:""}
          ${e.preview_image?`<a class="field-hint" href="${(0,n.escapeHtml)(e.preview_image)}" target="_blank" rel="noreferrer">preview ↗</a>`:""}
          ${e.sample_file?`<a class="field-hint" href="${(0,n.escapeHtml)(e.sample_file)}" target="_blank" rel="noreferrer">sample file ↗</a>`:""}
        </div>
        <div class="actions">
          ${"approved"!==e.status?`
            <button class="btn primary" type="button" data-approve>Approve & publish</button>
            <button class="btn" type="button" data-approve-draft>Approve as draft</button>`:`
            <a class="btn primary" href="/admin/templates/new?id=${encodeURIComponent(e.template_id||"")}">Open template →</a>`}
          ${"rejected"!==e.status?'<button class="btn danger" type="button" data-reject>Reject</button>':""}
        </div>
      </article>`).join(""),(0,n.renderPagination)(l,{page:e.page,pages:e.pages,total:e.total,onPage:e=>{r.page=e,i()}})}catch(e){o.innerHTML=`<div class="notice error">${(0,n.escapeHtml)(e.message)}</div>`}}o.addEventListener("click",async e=>{let t=e.target.closest("[data-id]");if(!t)return;let a=t.dataset.id;if(e.target.closest("[data-approve]"))try{let e=await (0,n.post)(`/api/admin/submissions/${encodeURIComponent(a)}/approve`,{status:"published"});(0,n.toast)(`Published “${e.template.name}” — regenerate the registry to list it.`,"success"),i()}catch(e){(0,n.toast)(e.message,"error")}if(e.target.closest("[data-approve-draft]"))try{let e=await (0,n.post)(`/api/admin/submissions/${encodeURIComponent(a)}/approve`,{status:"draft"});(0,n.toast)(`Created draft “${e.template.name}”.`,"success"),i()}catch(e){(0,n.toast)(e.message,"error")}if(e.target.closest("[data-reject]")){let e=window.prompt("Rejection reason (optional):","");if(null===e)return;try{await (0,n.post)(`/api/admin/submissions/${encodeURIComponent(a)}/reject`,{reason:e.trim()}),(0,n.toast)("Submission rejected","success"),i()}catch(e){(0,n.toast)(e.message,"error")}}}),await i(),(0,n.get)("/api/admin/dashboard").then(t=>e.A(93489).then(({storeCounts:e})=>e({pendingSubmissions:t.counts.pending}))).catch(()=>{}),e.s([]),a()}catch(e){a(e)}},!0)]);