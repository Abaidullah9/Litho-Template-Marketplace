"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8585],{2546:(e,t,a)=>{a.r(t),a.d(t,{ApiError:()=>s,api:()=>i,confirmAction:()=>v,debounce:()=>E,del:()=>d,editModal:()=>g,escapeHtml:()=>c,fillSelect:()=>N,flagsBadges:()=>k,fmtDate:()=>y,fmtDateTime:()=>$,fmtNumber:()=>f,get:()=>l,mountAdmin:()=>u,post:()=>o,put:()=>r,queryString:()=>m,renderPagination:()=>T,requireSession:()=>h,showFormErrors:()=>x,statusBadge:()=>S,storeCounts:()=>p,timeAgo:()=>w,toast:()=>b});let n=[{group:"Overview"},{href:"/admin",key:"dashboard",label:"Dashboard"},{group:"Marketplace"},{href:"/admin/templates",key:"templates",label:"Templates"},{href:"/admin/templates/new",key:"template-new",label:"New template"},{href:"/admin/submissions",key:"submissions",label:"Submissions",count:"pendingSubmissions"},{group:"Taxonomy"},{href:"/admin/categories",key:"categories",label:"Categories"},{href:"/admin/tags",key:"tags",label:"Tags"},{href:"/admin/publishers",key:"publishers",label:"Publishers"},{group:"Insights"},{href:"/admin/analytics",key:"analytics",label:"Analytics"},{href:"/admin/registry",key:"registry",label:"Registry"},{group:"System"},{href:"/admin/admins",key:"admins",label:"Admins"},{href:"/admin/activity",key:"activity",label:"Activity"},{href:"/admin/settings",key:"settings",label:"Settings"}];class s extends Error{constructor(e,{status:t=0,code:a="error",details:n}={}){super(e),this.status=t,this.code=a,this.details=n}}async function i(e,{method:t="GET",body:a,formData:n}={}){let l,o={method:t,credentials:"same-origin",headers:{}};n?o.body=n:void 0!==a&&(o.headers["Content-Type"]="application/json",o.body=JSON.stringify(a));try{l=await fetch(e,o)}catch{throw new s("Cannot reach the server. Is it still running?",{code:"network"})}let r=await l.text(),d=null;if(r)try{d=JSON.parse(r)}catch{d=null}if(!l.ok){let t=new s(d?.error?.message||`Request failed (${l.status})`,{status:l.status,code:d?.error?.code,details:d?.error?.details});throw 401!==l.status||e.endsWith("/login")||/\/admin\/login(\.html)?$/.test(window.location.pathname)||(window.location.href=`/admin/login?next=${encodeURIComponent(window.location.pathname)}`),t}return d}let l=e=>i(e),o=(e,t)=>i(e,{method:"POST",body:t}),r=(e,t)=>i(e,{method:"PUT",body:t}),d=(e,t)=>i(e,{method:"DELETE",body:t});function c(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function m(e={}){let t=new URLSearchParams;for(let[a,n]of Object.entries(e))""!==n&&null!=n&&t.set(a,String(n));let a=t.toString();return a?`?${a}`:""}function u({active:e="",title:t="Dashboard",crumb:a="Admin",actions:s=""}={}){document.body.classList.add("admin-page");let i=function(){try{return JSON.parse(sessionStorage.getItem("admin:counts")||"{}")}catch{return{}}}(),l=n.map(t=>{if(t.group)return`<div class="nav-group">${c(t.group)}</div>`;let a=t.count?i[t.count]:null,n=a?`<span class="nav-count">${Number(a)}</span>`:"";return`<a href="${t.href}" class="${t.key===e?"active":""}">${c(t.label)}${n}</a>`}).join("");return document.body.innerHTML=`
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
              <div class="crumbs">${c(a)}</div>
              <h1>${c(t)}</h1>
            </div>
          </div>
          <div class="admin-actions" id="admin-actions">${s}</div>
        </header>
        <main class="admin-body" id="admin-content" tabindex="-1"></main>
      </div>
    </div>
    <div class="admin-toast" id="admin-toast" role="status" aria-live="polite"></div>
  `,document.body.addEventListener("click",e=>{let t=e.target.closest("[data-action]")?.dataset.action;if("logout"===t&&(o("/api/admin/logout").catch(()=>{}),window.location.href="/admin/login"),"menu"===t){let t=document.getElementById("admin-sidebar").classList.toggle("open");e.target.closest("[data-action]").setAttribute("aria-expanded",String(t))}"theme"===t&&function(){let e=document.documentElement,t="light"===e.dataset.theme?"dark":"light";e.dataset.theme=t;try{localStorage.setItem("litho-theme",t)}catch{}}()}),{body:document.getElementById("admin-content"),actions:document.getElementById("admin-actions"),setActions(e){document.getElementById("admin-actions").innerHTML=e}}}function p(e){try{sessionStorage.setItem("admin:counts",JSON.stringify(e))}catch{}}async function h(){return await l("/api/admin/session")}function b(e,t=""){let a=document.getElementById("admin-toast");if(!a)return;let n=document.createElement("div");n.className=`toast-item ${t}`,n.textContent=e,a.appendChild(n),setTimeout(()=>n.remove(),4200)}function v(e,{confirmLabel:t="Confirm",danger:a=!0}={}){return new Promise(n=>{let s=document.createElement("dialog");s.className="modal",s.innerHTML=`
      <div class="panel-head"><h2>Please confirm</h2></div>
      <div class="panel-body"><p style="margin:0;line-height:1.7;font-size:13px">${c(e)}</p></div>
      <div class="modal-actions">
        <button class="btn ghost" type="button" data-cancel>Cancel</button>
        <button class="btn ${a?"danger":"primary"}" type="button" data-confirm>${c(t)}</button>
      </div>
    `,document.body.appendChild(s);let i=e=>{s.close(),s.remove(),n(e)};s.querySelector("[data-cancel]").addEventListener("click",()=>i(!1)),s.querySelector("[data-confirm]").addEventListener("click",()=>i(!0)),s.addEventListener("cancel",()=>i(!1)),s.addEventListener("click",e=>{e.target===s&&i(!1)}),s.showModal()})}function g({title:e,fields:t,submitLabel:a="Save",onSubmit:n}){return new Promise(s=>{let i=document.createElement("dialog");i.className="modal";let l=t.map(e=>{let t,a=`field-${e.name}`,n=c(e.value??"");return t="textarea"===e.type?`<textarea id="${a}" name="${e.name}" rows="3" placeholder="${c(e.placeholder||"")}">${n}</textarea>`:"checkbox"===e.type?`<label class="checkbox-field"><input type="checkbox" id="${a}" name="${e.name}" ${e.value?"checked":""}> ${c(e.checkboxLabel||"Enabled")}</label>`:"select"===e.type?`<select id="${a}" name="${e.name}">${(e.options||[]).map(t=>`<option value="${c(t.value)}" ${t.value===e.value?"selected":""}>${c(t.label)}</option>`).join("")}</select>`:`<input type="${e.type||"text"}" id="${a}" name="${e.name}" value="${n}" placeholder="${c(e.placeholder||"")}" ${e.required?"required":""}>`,`
        <div class="field ${e.wide?"full":""}">
          <label for="${a}">${c(e.label)}${e.required?" *":""}</label>
          ${t}
          ${e.hint?`<span class="field-hint">${c(e.hint)}</span>`:""}
          <span class="field-error" data-error-for="${e.name}"></span>
        </div>`}).join("");i.innerHTML=`
      <form method="dialog" novalidate>
        <div class="panel-head"><h2>${c(e)}</h2></div>
        <div class="panel-body"><div class="form-grid">${l}</div></div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" data-cancel>Cancel</button>
          <button class="btn primary" type="submit">${c(a)}</button>
        </div>
      </form>
    `,document.body.appendChild(i);let o=e=>{i.close(),i.remove(),s(e)};i.querySelector("[data-cancel]").addEventListener("click",()=>o(null)),i.addEventListener("cancel",()=>o(null)),i.addEventListener("click",e=>{e.target===i&&o(null)}),i.querySelector("form").addEventListener("submit",async e=>{e.preventDefault(),i.querySelectorAll("[data-error-for]").forEach(e=>{e.textContent=""});let a={};for(let e of t){let t=i.querySelector(`[name="${e.name}"]`);t&&(a[e.name]="checkbox"===t.type?t.checked:t.value)}try{let e=await n(a);o(e)}catch(e){if(e.details)for(let[t,a]of Object.entries(e.details)){let e=i.querySelector(`[data-error-for="${t}"]`);e&&(e.textContent=a)}b(e.message,"error")}}),i.showModal(),i.querySelector("input, select, textarea")?.focus()})}function f(e){let t=Number(e||0);return t>=1e6?`${(t/1e6).toFixed(1).replace(/\.0$/,"")}m`:t>=1e4?`${(t/1e3).toFixed(1).replace(/\.0$/,"")}k`:t.toLocaleString("en-US")}function y(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}function $(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":`${t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})} ${t.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}`}function w(e){if(!e)return"—";let t=Math.round((Date.now()-new Date(e).getTime())/1e3);if(!Number.isFinite(t))return"—";for(let[e,a]of[[31536e3,"y"],[2592e3,"mo"],[604800,"w"],[86400,"d"],[3600,"h"],[60,"m"]])if(Math.abs(t)>=e)return`${Math.round(t/e)}${a} ago`;return"just now"}function S(e){let t=String(e||"unknown");return`<span class="badge ${c(t)}">${c(t)}</span>`}function k(e){let t=[];return e.featured&&t.push('<span class="badge featured">featured</span>'),e.verified&&t.push('<span class="badge verified">verified</span>'),t.join(" ")}function T(e,{page:t,pages:a,total:n,onPage:s}){e.innerHTML=`
    <div class="pagination">
      <span>${f(n)} result${1===n?"":"s"}</span>
      <div class="pages">
        <button class="btn ghost small" type="button" data-prev ${t<=1?"disabled":""}>← Prev</button>
        <span>Page ${t} / ${a}</span>
        <button class="btn ghost small" type="button" data-next ${t>=a?"disabled":""}>Next →</button>
      </div>
    </div>
  `,e.querySelector("[data-prev]")?.addEventListener("click",()=>s(t-1)),e.querySelector("[data-next]")?.addEventListener("click",()=>s(t+1))}function x(e,t={}){for(let[a,n]of(e.querySelectorAll(".field-error").forEach(e=>{e.textContent=""}),e.querySelectorAll("[aria-invalid]").forEach(e=>e.removeAttribute("aria-invalid")),Object.entries(t))){let t=e.querySelector(`[data-error-for="${a}"]`);t&&(t.textContent=n);let s=e.querySelector(`[name="${a}"]`);s&&s.setAttribute("aria-invalid","true")}}function E(e,t=250){let a;return(...n)=>{clearTimeout(a),a=setTimeout(()=>e(...n),t)}}function N(e,t,{placeholder:a="All",valueKey:n="slug",labelKey:s="name"}={}){let i=e.value;e.innerHTML=(a?`<option value="">${c(a)}</option>`:"")+t.map(e=>`<option value="${c(e[n])}">${c(e[s])}${void 0!==e.templateCount?` (${e.templateCount})`:""}</option>`).join(""),[...e.options].some(e=>e.value===i)&&(e.value=i)}},8585:(e,t,a)=>{a.a(e,async(e,n)=>{try{a.r(t);var s,i=a(2546);let e=(0,i.mountAdmin)({active:"dashboard",title:"Dashboard",crumb:"Admin / Overview",actions:'<a class="btn primary" href="/admin/registry">Generate registry</a>'});await (0,i.requireSession)(),e.body.innerHTML='<div class="empty"><h3>Loading marketplace stats…</h3></div>';try{let t,a,n=await (0,i.get)("/api/admin/dashboard");(0,i.storeCounts)({pendingSubmissions:n.counts.pending}),t=(s=n).counts,a=[["Total templates",t.templates,"all statuses"],["Published",t.published,"live in the marketplace"],["Pending submissions",t.pending,"waiting for review",t.pending>0],["Drafts",t.draft,"not public"],["Featured",t.featured,"homepage slots"],["Verified",t.verified,"manual verification"],["Total views",t.views,"template detail views"],["Total downloads",t.downloads,"download events"],["Categories",t.categories,"template categories"],["Tags",t.tags,"reusable tags"],["Publishers",t.publishers,"template authors"],["Archived",t.archived,"removed from the market"]],e.body.innerHTML=`
    <div class="stat-grid">
      ${a.map(([e,t,a,n])=>`
        <div class="stat-card ${n?"accent":""}">
          <span class="stat-label">${(0,i.escapeHtml)(e)}</span>
          <span class="stat-value">${(0,i.fmtNumber)(t)}</span>
          <span class="stat-note">${(0,i.escapeHtml)(a)}</span>
        </div>`).join("")}
    </div>

    <div class="grid-2">
      <section class="panel">
        <div class="panel-head">
          <h2>Recent submissions</h2>
          <a class="btn ghost small" href="/admin/submissions">Review all →</a>
        </div>
        <div class="list-rows">
          ${s.recentSubmissions.length?s.recentSubmissions.map(e=>`
              <div class="list-row">
                <div class="primary">
                  <a href="/admin/submissions?id=${encodeURIComponent(e.id)}">${(0,i.escapeHtml)(e.name)}</a>
                  <div class="meta">${(0,i.escapeHtml)(e.submitter_name||"anonymous")} \xb7 ${(0,i.timeAgo)(e.created_at)}</div>
                </div>
                <div class="side">${(0,i.statusBadge)(e.status)}</div>
              </div>`).join(""):'<div class="empty"><h3>No pending submissions</h3><p>The review queue is clear.</p></div>'}
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2>Recent templates</h2>
          <a class="btn ghost small" href="/admin/templates">All templates →</a>
        </div>
        <div class="list-rows">
          ${s.recentTemplates.length?s.recentTemplates.map(e=>`
              <div class="list-row">
                <div class="primary">
                  <a href="/admin/templates/new?id=${encodeURIComponent(e.id)}">${(0,i.escapeHtml)(e.name)}</a>
                  <div class="meta">${(0,i.timeAgo)(e.created_at)} \xb7 ${(0,i.fmtNumber)(e.views)} views \xb7 ${(0,i.fmtNumber)(e.downloads)} downloads</div>
                </div>
                <div class="side">${(0,i.statusBadge)(e.status)}</div>
              </div>`).join(""):'<div class="empty"><h3>No templates yet</h3><p>Seed the database or migrate the registry.</p></div>'}
        </div>
      </section>
    </div>

    <div class="grid-2">
      <section class="panel">
        <div class="panel-head">
          <h2>Most viewed</h2>
          <a class="btn ghost small" href="/admin/analytics">Analytics →</a>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Template</th><th class="numeric">Views</th><th class="numeric">Downloads</th></tr></thead>
            <tbody>
              ${s.topViewed.length?s.topViewed.map(e=>`
                <tr>
                  <td><a class="row-title" href="/admin/templates/new?id=${encodeURIComponent(e.id)}">${(0,i.escapeHtml)(e.name)}</a>
                    <span class="row-sub">${(0,i.escapeHtml)(e.slug)}</span></td>
                  <td class="numeric">${(0,i.fmtNumber)(e.views)}</td>
                  <td class="numeric">${(0,i.fmtNumber)(e.downloads)}</td>
                </tr>`).join(""):'<tr><td colspan="3" style="color:var(--muted)">No published templates yet.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <h2>Most downloaded</h2>
          <span class="field-hint">all time</span>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Template</th><th class="numeric">Downloads</th><th class="numeric">Published</th></tr></thead>
            <tbody>
              ${s.topDownloaded.length?s.topDownloaded.map(e=>`
                <tr>
                  <td><a class="row-title" href="/admin/templates/new?id=${encodeURIComponent(e.id)}">${(0,i.escapeHtml)(e.name)}</a>
                    <span class="row-sub">${(0,i.escapeHtml)(e.slug)}</span></td>
                  <td class="numeric">${(0,i.fmtNumber)(e.downloads)}</td>
                  <td class="numeric">${(0,i.fmtDate)(e.published_at)}</td>
                </tr>`).join(""):'<tr><td colspan="3" style="color:var(--muted)">No downloads recorded yet.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `}catch(t){e.body.innerHTML=`
    <div class="notice error">
      <strong>Could not load the dashboard.</strong><br>${(0,i.escapeHtml)(t.message)}
    </div>`}n()}catch(e){n(e)}},1)}}]);