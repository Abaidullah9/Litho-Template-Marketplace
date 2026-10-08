"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[126],{126:(e,t,a)=>{a.a(e,async(e,n)=>{try{a.r(t);var i=a(2546);let e=(0,i.mountAdmin)({active:"templates",title:"Templates",crumb:"Admin / Marketplace",actions:'<a class="btn primary" href="/admin/templates/new">+ New template</a>'});await (0,i.requireSession)();let o={q:new URLSearchParams(window.location.search).get("q")||"",status:new URLSearchParams(window.location.search).get("status")||"",category:"",publisher:"",verified:"",featured:"",sort:"newest",page:1,selected:new Set};e.body.innerHTML=`
  <section class="panel">
    <div class="toolbar">
      <div class="field grow">
        <label for="filter-q">Search</label>
        <input type="search" id="filter-q" placeholder="name, slug, description…" value="${(0,i.escapeHtml)(o.q)}">
      </div>
      <div class="field">
        <label for="filter-status">Status</label>
        <select id="filter-status">
          <option value="">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div class="field">
        <label for="filter-category">Category</label>
        <select id="filter-category"></select>
      </div>
      <div class="field">
        <label for="filter-publisher">Publisher</label>
        <select id="filter-publisher"></select>
      </div>
      <div class="field">
        <label for="filter-verified">Verified</label>
        <select id="filter-verified">
          <option value="">All</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
      </div>
      <div class="field">
        <label for="filter-featured">Featured</label>
        <select id="filter-featured">
          <option value="">All</option>
          <option value="true">Featured</option>
          <option value="false">Not featured</option>
        </select>
      </div>
      <div class="field">
        <label for="filter-sort">Sort</label>
        <select id="filter-sort">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="updated">Recently updated</option>
          <option value="name">A–Z</option>
          <option value="views">Most viewed</option>
          <option value="downloads">Most downloaded</option>
        </select>
      </div>
      <button class="btn ghost" type="button" id="filter-reset">Reset</button>
    </div>
    <div class="toolbar" id="bulk-bar" hidden>
      <div class="field">
        <label for="bulk-action">Bulk action</label>
        <select id="bulk-action">
          <option value="">Choose…</option>
          <option value="publish">Publish</option>
          <option value="unpublish">Unpublish</option>
          <option value="archive">Archive</option>
          <option value="verify">Verify</option>
          <option value="unverify">Unverify</option>
          <option value="feature">Feature</option>
          <option value="unfeature">Unfeature</option>
          <option value="delete">Delete</option>
        </select>
      </div>
      <button class="btn" type="button" id="bulk-apply">Apply</button>
      <span class="field-hint" id="bulk-count"></span>
    </div>
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th class="checkbox-cell"><input type="checkbox" id="select-all" aria-label="Select all templates on this page"></th>
            <th>Template</th>
            <th>Status</th>
            <th>Category</th>
            <th>Publisher</th>
            <th class="numeric">Views</th>
            <th class="numeric">Downloads</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="templates-body"></tbody>
      </table>
    </div>
    <div id="templates-empty" class="empty" hidden>
      <h3>No templates match</h3>
      <p>Adjust the filters, or add the first template.</p>
      <a class="btn primary" href="/admin/templates/new">+ New template</a>
    </div>
    <div id="templates-pagination"></div>
  </section>
`;let r=document.getElementById("templates-body"),d=document.getElementById("templates-empty"),c=document.getElementById("templates-pagination");document.getElementById("filter-status").value=o.status,document.getElementById("filter-sort").value=o.sort;let[u,m]=await Promise.all([(0,i.get)("/api/admin/categories").catch(()=>[]),(0,i.get)("/api/admin/publishers").catch(()=>[])]);(0,i.fillSelect)(document.getElementById("filter-category"),u),(0,i.fillSelect)(document.getElementById("filter-publisher"),m);let p=(0,i.debounce)(()=>{o.page=1,o.selected.clear(),s()},250);for(let[e,t]of(document.getElementById("filter-q").addEventListener("input",e=>{o.q=e.target.value,p()}),[["filter-status","status"],["filter-category","category"],["filter-publisher","publisher"],["filter-verified","verified"],["filter-featured","featured"],["filter-sort","sort"]]))document.getElementById(e).addEventListener("change",e=>{o[t]=e.target.value,o.page=1,o.selected.clear(),s()});function l(){document.getElementById("bulk-bar").hidden=0===o.selected.size,document.getElementById("bulk-count").textContent=`${o.selected.size} selected`}async function s(){r.innerHTML='<tr><td colspan="9" style="color:var(--muted);padding:24px">Loading templates…</td></tr>',d.hidden=!0;try{let e=await (0,i.get)(`/api/admin/templates${(0,i.queryString)({q:o.q,status:o.status,category:o.category,publisher:o.publisher,verified:o.verified,featured:o.featured,sort:o.sort,page:o.page})}`);if(!e.items.length){r.innerHTML="",d.hidden=!1,c.innerHTML="";return}r.innerHTML=e.items.map(e=>`
      <tr data-id="${(0,i.escapeHtml)(e.id)}">
        <td class="checkbox-cell"><input type="checkbox" data-select aria-label="Select ${(0,i.escapeHtml)(e.name)}" ${o.selected.has(e.id)?"checked":""}></td>
        <td>
          <a class="row-title" href="/admin/templates/new?id=${encodeURIComponent(e.id)}">${(0,i.escapeHtml)(e.name)}</a>
          <span class="row-sub">${(0,i.escapeHtml)(e.slug)} \xb7 v${(0,i.escapeHtml)(e.version||"1.0.0")}</span>
        </td>
        <td>${(0,i.statusBadge)(e.status)} ${(0,i.flagsBadges)(e)}</td>
        <td>${(0,i.escapeHtml)(e.categoryName||"—")}</td>
        <td>${(0,i.escapeHtml)(e.publisherName||"—")}</td>
        <td class="numeric">${(0,i.fmtNumber)(e.views)}</td>
        <td class="numeric">${(0,i.fmtNumber)(e.downloads)}</td>
        <td style="font-family:var(--mono);font-size:11px;color:var(--muted)">${new Date(e.updated_at).toLocaleDateString("en-GB")}</td>
        <td class="actions">
          <div class="btn-row" style="justify-content:flex-end">
            <button class="btn small" type="button" data-quick="${"published"===e.status?"unpublish":"publish"}">${"published"===e.status?"Unpublish":"Publish"}</button>
            <button class="btn ghost small" type="button" data-quick="${e.verified?"unverify":"verify"}">${e.verified?"Unverify":"Verify"}</button>
            <button class="btn ghost small" type="button" data-quick="${e.featured?"unfeature":"feature"}">${e.featured?"Unfeature":"Feature"}</button>
            <a class="btn ghost small" href="/admin/templates/new?id=${encodeURIComponent(e.id)}">Edit</a>
            <button class="btn danger small" type="button" data-delete>Delete</button>
          </div>
        </td>
      </tr>`).join(""),document.getElementById("select-all").dataset.ids=JSON.stringify(e.items.map(e=>e.id)),document.getElementById("select-all").checked=!1,l(),(0,i.renderPagination)(c,{page:e.page,pages:e.pages,total:e.total,onPage:e=>{o.page=e,s()}})}catch(e){r.innerHTML=`<tr><td colspan="9" style="color:#f18c75;padding:24px">${(0,i.escapeHtml)(e.message)}</td></tr>`}}document.getElementById("filter-reset").addEventListener("click",()=>{for(let[e,t]of(Object.assign(o,{q:"",status:"",category:"",publisher:"",verified:"",featured:"",sort:"newest",page:1}),document.getElementById("filter-q").value="",[["filter-status","status"],["filter-category","category"],["filter-publisher","publisher"],["filter-verified","verified"],["filter-featured","featured"],["filter-sort","sort"]]))document.getElementById(e).value=o[t];s()}),document.getElementById("select-all").addEventListener("change",e=>{for(let t of e.target.dataset.ids?JSON.parse(e.target.dataset.ids):[])e.target.checked?o.selected.add(t):o.selected.delete(t);l(),r.querySelectorAll("input[data-select]").forEach(t=>{t.checked=e.target.checked})}),document.getElementById("bulk-apply").addEventListener("click",async()=>{let e=document.getElementById("bulk-action").value;if(!e)return;let t=[...o.selected];if(t.length){if("delete"!==e&&"archive"!==e&&"unpublish"!==e||await (0,i.confirmAction)(`${e} ${t.length} template${1===t.length?"":"s"}? ${"delete"===e?"Deleted templates cannot be restored.":""}`,{confirmLabel:"delete"===e?"Delete":"Apply"}))try{var a;let n=await (0,i.post)("/api/admin/templates/bulk",{action:e,ids:t});a=`${n.count} template(s) affected by "${e}"`,(0,i.toast)(a,"success"),o.selected.clear(),s()}catch(e){(0,i.toast)(e.message,"error")}}}),r.addEventListener("change",e=>{let t=e.target.closest("input[data-select]");if(!t)return;let a=t.closest("tr").dataset.id;t.checked?o.selected.add(a):o.selected.delete(a),l()}),r.addEventListener("click",async e=>{let t=e.target.closest("tr[data-id]");if(!t)return;let a=t.dataset.id,n=e.target.closest("[data-quick]");if(n){try{await (0,i.post)(`/api/admin/templates/${encodeURIComponent(a)}/${n.dataset.quick}`,{}),(0,i.toast)(`Template ${n.dataset.quick}d`,"success"),s()}catch(e){(0,i.toast)(e.message,"error")}return}if(e.target.closest("[data-delete]")){if(!await (0,i.confirmAction)("Delete this template permanently? This cannot be undone.",{confirmLabel:"Delete"}))return;try{await (0,i.del)(`/api/admin/templates/${encodeURIComponent(a)}`),(0,i.toast)("Template deleted","success"),s()}catch(e){(0,i.toast)(e.message,"error")}}}),await s(),Promise.resolve().then(a.bind(a,2546)).then(({get:e,storeCounts:t})=>{e("/api/admin/dashboard").then(e=>t({pendingSubmissions:e.counts.pending})).catch(()=>{})}),n()}catch(e){n(e)}},1)},2546:(e,t,a)=>{a.r(t),a.d(t,{ApiError:()=>i,api:()=>l,confirmAction:()=>b,debounce:()=>q,del:()=>d,editModal:()=>g,escapeHtml:()=>c,fillSelect:()=>x,flagsBadges:()=>E,fmtDate:()=>y,fmtDateTime:()=>$,fmtNumber:()=>v,get:()=>s,mountAdmin:()=>m,post:()=>o,put:()=>r,queryString:()=>u,renderPagination:()=>S,requireSession:()=>f,showFormErrors:()=>L,statusBadge:()=>k,storeCounts:()=>p,timeAgo:()=>w,toast:()=>h});let n=[{group:"Overview"},{href:"/admin",key:"dashboard",label:"Dashboard"},{group:"Marketplace"},{href:"/admin/templates",key:"templates",label:"Templates"},{href:"/admin/templates/new",key:"template-new",label:"New template"},{href:"/admin/submissions",key:"submissions",label:"Submissions",count:"pendingSubmissions"},{group:"Taxonomy"},{href:"/admin/categories",key:"categories",label:"Categories"},{href:"/admin/tags",key:"tags",label:"Tags"},{href:"/admin/publishers",key:"publishers",label:"Publishers"},{group:"Insights"},{href:"/admin/analytics",key:"analytics",label:"Analytics"},{href:"/admin/registry",key:"registry",label:"Registry"},{group:"System"},{href:"/admin/activity",key:"activity",label:"Activity"},{href:"/admin/settings",key:"settings",label:"Settings"}];class i extends Error{constructor(e,{status:t=0,code:a="error",details:n}={}){super(e),this.status=t,this.code=a,this.details=n}}async function l(e,{method:t="GET",body:a,formData:n}={}){let s,o={method:t,credentials:"same-origin",headers:{}};n?o.body=n:void 0!==a&&(o.headers["Content-Type"]="application/json",o.body=JSON.stringify(a));try{s=await fetch(e,o)}catch{throw new i("Cannot reach the server. Is it still running?",{code:"network"})}let r=await s.text(),d=null;if(r)try{d=JSON.parse(r)}catch{d=null}if(!s.ok){let t=new i(d?.error?.message||`Request failed (${s.status})`,{status:s.status,code:d?.error?.code,details:d?.error?.details});throw 401!==s.status||e.endsWith("/login")||/\/admin\/login(\.html)?$/.test(window.location.pathname)||(window.location.href=`/admin/login?next=${encodeURIComponent(window.location.pathname)}`),t}return d}let s=e=>l(e),o=(e,t)=>l(e,{method:"POST",body:t}),r=(e,t)=>l(e,{method:"PUT",body:t}),d=(e,t)=>l(e,{method:"DELETE",body:t});function c(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function u(e={}){let t=new URLSearchParams;for(let[a,n]of Object.entries(e))""!==n&&null!=n&&t.set(a,String(n));let a=t.toString();return a?`?${a}`:""}function m({active:e="",title:t="Dashboard",crumb:a="Admin",actions:i=""}={}){document.body.classList.add("admin-page");let l=function(){try{return JSON.parse(sessionStorage.getItem("admin:counts")||"{}")}catch{return{}}}(),s=n.map(t=>{if(t.group)return`<div class="nav-group">${c(t.group)}</div>`;let a=t.count?l[t.count]:null,n=a?`<span class="nav-count">${Number(a)}</span>`:"";return`<a href="${t.href}" class="${t.key===e?"active":""}">${c(t.label)}${n}</a>`}).join("");return document.body.innerHTML=`
    <a class="skip-link" href="#admin-content">Skip to content</a>
    <div class="admin-shell">
      <aside class="admin-sidebar" id="admin-sidebar">
        <a class="admin-brand" href="/">
          <img src="/assets/img/litho-wordmark.png?v=20261007-01" alt="" width="656" height="192">
          <span>Admin</span>
        </a>
        <nav class="admin-nav" aria-label="Admin navigation">${s}</nav>
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
              <div class="crumbs">${c(a)}</div>
              <h1>${c(t)}</h1>
            </div>
          </div>
          <div class="admin-actions" id="admin-actions">${i}</div>
        </header>
        <main class="admin-body" id="admin-content" tabindex="-1"></main>
      </div>
    </div>
    <div class="admin-toast" id="admin-toast" role="status" aria-live="polite"></div>
  `,document.body.addEventListener("click",e=>{let t=e.target.closest("[data-action]")?.dataset.action;if("logout"===t&&(o("/api/admin/logout").catch(()=>{}),window.location.href="/admin/login"),"menu"===t){let t=document.getElementById("admin-sidebar").classList.toggle("open");e.target.closest("[data-action]").setAttribute("aria-expanded",String(t))}"theme"===t&&function(){let e=document.documentElement,t="light"===e.dataset.theme?"dark":"light";e.dataset.theme=t;try{localStorage.setItem("litho-theme",t)}catch{}}()}),{body:document.getElementById("admin-content"),actions:document.getElementById("admin-actions"),setActions(e){document.getElementById("admin-actions").innerHTML=e}}}function p(e){try{sessionStorage.setItem("admin:counts",JSON.stringify(e))}catch{}}async function f(){await s("/api/admin/session")}function h(e,t=""){let a=document.getElementById("admin-toast");if(!a)return;let n=document.createElement("div");n.className=`toast-item ${t}`,n.textContent=e,a.appendChild(n),setTimeout(()=>n.remove(),4200)}function b(e,{confirmLabel:t="Confirm",danger:a=!0}={}){return new Promise(n=>{let i=document.createElement("dialog");i.className="modal",i.innerHTML=`
      <div class="panel-head"><h2>Please confirm</h2></div>
      <div class="panel-body"><p style="margin:0;line-height:1.7;font-size:13px">${c(e)}</p></div>
      <div class="modal-actions">
        <button class="btn ghost" type="button" data-cancel>Cancel</button>
        <button class="btn ${a?"danger":"primary"}" type="button" data-confirm>${c(t)}</button>
      </div>
    `,document.body.appendChild(i);let l=e=>{i.close(),i.remove(),n(e)};i.querySelector("[data-cancel]").addEventListener("click",()=>l(!1)),i.querySelector("[data-confirm]").addEventListener("click",()=>l(!0)),i.addEventListener("cancel",()=>l(!1)),i.addEventListener("click",e=>{e.target===i&&l(!1)}),i.showModal()})}function g({title:e,fields:t,submitLabel:a="Save",onSubmit:n}){return new Promise(i=>{let l=document.createElement("dialog");l.className="modal";let s=t.map(e=>{let t,a=`field-${e.name}`,n=c(e.value??"");return t="textarea"===e.type?`<textarea id="${a}" name="${e.name}" rows="3" placeholder="${c(e.placeholder||"")}">${n}</textarea>`:"checkbox"===e.type?`<label class="checkbox-field"><input type="checkbox" id="${a}" name="${e.name}" ${e.value?"checked":""}> ${c(e.checkboxLabel||"Enabled")}</label>`:"select"===e.type?`<select id="${a}" name="${e.name}">${(e.options||[]).map(t=>`<option value="${c(t.value)}" ${t.value===e.value?"selected":""}>${c(t.label)}</option>`).join("")}</select>`:`<input type="${e.type||"text"}" id="${a}" name="${e.name}" value="${n}" placeholder="${c(e.placeholder||"")}" ${e.required?"required":""}>`,`
        <div class="field ${e.wide?"full":""}">
          <label for="${a}">${c(e.label)}${e.required?" *":""}</label>
          ${t}
          ${e.hint?`<span class="field-hint">${c(e.hint)}</span>`:""}
          <span class="field-error" data-error-for="${e.name}"></span>
        </div>`}).join("");l.innerHTML=`
      <form method="dialog" novalidate>
        <div class="panel-head"><h2>${c(e)}</h2></div>
        <div class="panel-body"><div class="form-grid">${s}</div></div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" data-cancel>Cancel</button>
          <button class="btn primary" type="submit">${c(a)}</button>
        </div>
      </form>
    `,document.body.appendChild(l);let o=e=>{l.close(),l.remove(),i(e)};l.querySelector("[data-cancel]").addEventListener("click",()=>o(null)),l.addEventListener("cancel",()=>o(null)),l.addEventListener("click",e=>{e.target===l&&o(null)}),l.querySelector("form").addEventListener("submit",async e=>{e.preventDefault(),l.querySelectorAll("[data-error-for]").forEach(e=>{e.textContent=""});let a={};for(let e of t){let t=l.querySelector(`[name="${e.name}"]`);t&&(a[e.name]="checkbox"===t.type?t.checked:t.value)}try{let e=await n(a);o(e)}catch(e){if(e.details)for(let[t,a]of Object.entries(e.details)){let e=l.querySelector(`[data-error-for="${t}"]`);e&&(e.textContent=a)}h(e.message,"error")}}),l.showModal(),l.querySelector("input, select, textarea")?.focus()})}function v(e){let t=Number(e||0);return t>=1e6?`${(t/1e6).toFixed(1).replace(/\.0$/,"")}m`:t>=1e4?`${(t/1e3).toFixed(1).replace(/\.0$/,"")}k`:t.toLocaleString("en-US")}function y(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}function $(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":`${t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})} ${t.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}`}function w(e){if(!e)return"—";let t=Math.round((Date.now()-new Date(e).getTime())/1e3);if(!Number.isFinite(t))return"—";for(let[e,a]of[[31536e3,"y"],[2592e3,"mo"],[604800,"w"],[86400,"d"],[3600,"h"],[60,"m"]])if(Math.abs(t)>=e)return`${Math.round(t/e)}${a} ago`;return"just now"}function k(e){let t=String(e||"unknown");return`<span class="badge ${c(t)}">${c(t)}</span>`}function E(e){let t=[];return e.featured&&t.push('<span class="badge featured">featured</span>'),e.verified&&t.push('<span class="badge verified">verified</span>'),t.join(" ")}function S(e,{page:t,pages:a,total:n,onPage:i}){e.innerHTML=`
    <div class="pagination">
      <span>${v(n)} result${1===n?"":"s"}</span>
      <div class="pages">
        <button class="btn ghost small" type="button" data-prev ${t<=1?"disabled":""}>← Prev</button>
        <span>Page ${t} / ${a}</span>
        <button class="btn ghost small" type="button" data-next ${t>=a?"disabled":""}>Next →</button>
      </div>
    </div>
  `,e.querySelector("[data-prev]")?.addEventListener("click",()=>i(t-1)),e.querySelector("[data-next]")?.addEventListener("click",()=>i(t+1))}function L(e,t={}){for(let[a,n]of(e.querySelectorAll(".field-error").forEach(e=>{e.textContent=""}),e.querySelectorAll("[aria-invalid]").forEach(e=>e.removeAttribute("aria-invalid")),Object.entries(t))){let t=e.querySelector(`[data-error-for="${a}"]`);t&&(t.textContent=n);let i=e.querySelector(`[name="${a}"]`);i&&i.setAttribute("aria-invalid","true")}}function q(e,t=250){let a;return(...n)=>{clearTimeout(a),a=setTimeout(()=>e(...n),t)}}function x(e,t,{placeholder:a="All",valueKey:n="slug",labelKey:i="name"}={}){let l=e.value;e.innerHTML=(a?`<option value="">${c(a)}</option>`:"")+t.map(e=>`<option value="${c(e[n])}">${c(e[i])}${void 0!==e.templateCount?` (${e.templateCount})`:""}</option>`).join(""),[...e.options].some(e=>e.value===l)&&(e.value=l)}}}]);