"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2778],{2546:(e,t,a)=>{a.r(t),a.d(t,{ApiError:()=>i,api:()=>o,confirmAction:()=>y,debounce:()=>L,del:()=>d,editModal:()=>v,escapeHtml:()=>c,fillSelect:()=>T,flagsBadges:()=>k,fmtDate:()=>f,fmtDateTime:()=>$,fmtNumber:()=>b,get:()=>r,mountAdmin:()=>u,post:()=>l,put:()=>s,queryString:()=>m,renderPagination:()=>x,requireSession:()=>g,showFormErrors:()=>E,statusBadge:()=>S,storeCounts:()=>p,timeAgo:()=>w,toast:()=>h});let n=[{group:"Overview"},{href:"/admin",key:"dashboard",label:"Dashboard"},{group:"Marketplace"},{href:"/admin/templates",key:"templates",label:"Templates"},{href:"/admin/templates/new",key:"template-new",label:"New template"},{href:"/admin/submissions",key:"submissions",label:"Submissions",count:"pendingSubmissions"},{group:"Taxonomy"},{href:"/admin/categories",key:"categories",label:"Categories"},{href:"/admin/tags",key:"tags",label:"Tags"},{href:"/admin/publishers",key:"publishers",label:"Publishers"},{group:"Insights"},{href:"/admin/analytics",key:"analytics",label:"Analytics"},{href:"/admin/registry",key:"registry",label:"Registry"},{group:"System"},{href:"/admin/admins",key:"admins",label:"Admins"},{href:"/admin/activity",key:"activity",label:"Activity"},{href:"/admin/settings",key:"settings",label:"Settings"}];class i extends Error{constructor(e,{status:t=0,code:a="error",details:n}={}){super(e),this.status=t,this.code=a,this.details=n}}async function o(e,{method:t="GET",body:a,formData:n}={}){let r,l={method:t,credentials:"same-origin",headers:{}};n?l.body=n:void 0!==a&&(l.headers["Content-Type"]="application/json",l.body=JSON.stringify(a));try{r=await fetch(e,l)}catch{throw new i("Cannot reach the server. Is it still running?",{code:"network"})}let s=await r.text(),d=null;if(s)try{d=JSON.parse(s)}catch{d=null}if(!r.ok){let t=new i(d?.error?.message||`Request failed (${r.status})`,{status:r.status,code:d?.error?.code,details:d?.error?.details});throw 401!==r.status||e.endsWith("/login")||/\/admin\/login(\.html)?$/.test(window.location.pathname)||(window.location.href=`/admin/login?next=${encodeURIComponent(window.location.pathname)}`),t}return d}let r=e=>o(e),l=(e,t)=>o(e,{method:"POST",body:t}),s=(e,t)=>o(e,{method:"PUT",body:t}),d=(e,t)=>o(e,{method:"DELETE",body:t});function c(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function m(e={}){let t=new URLSearchParams;for(let[a,n]of Object.entries(e))""!==n&&null!=n&&t.set(a,String(n));let a=t.toString();return a?`?${a}`:""}function u({active:e="",title:t="Dashboard",crumb:a="Admin",actions:i=""}={}){document.body.classList.add("admin-page");let o=function(){try{return JSON.parse(sessionStorage.getItem("admin:counts")||"{}")}catch{return{}}}(),r=n.map(t=>{if(t.group)return`<div class="nav-group">${c(t.group)}</div>`;let a=t.count?o[t.count]:null,n=a?`<span class="nav-count">${Number(a)}</span>`:"";return`<a href="${t.href}" class="${t.key===e?"active":""}">${c(t.label)}${n}</a>`}).join("");return document.body.innerHTML=`
    <a class="skip-link" href="#admin-content">Skip to content</a>
    <div class="admin-shell">
      <aside class="admin-sidebar" id="admin-sidebar">
        <a class="admin-brand" href="/">
          <img src="/assets/img/litho-wordmark.png?v=20261007-01" alt="" width="656" height="192">
          <span>Admin</span>
        </a>
        <nav class="admin-nav" aria-label="Admin navigation">${r}</nav>
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
  `,document.body.addEventListener("click",e=>{let t=e.target.closest("[data-action]")?.dataset.action;if("logout"===t&&(l("/api/admin/logout").catch(()=>{}),window.location.href="/admin/login"),"menu"===t){let t=document.getElementById("admin-sidebar").classList.toggle("open");e.target.closest("[data-action]").setAttribute("aria-expanded",String(t))}"theme"===t&&function(){let e=document.documentElement,t="light"===e.dataset.theme?"dark":"light";e.dataset.theme=t;try{localStorage.setItem("litho-theme",t)}catch{}}()}),{body:document.getElementById("admin-content"),actions:document.getElementById("admin-actions"),setActions(e){document.getElementById("admin-actions").innerHTML=e}}}function p(e){try{sessionStorage.setItem("admin:counts",JSON.stringify(e))}catch{}}async function g(){return await r("/api/admin/session")}function h(e,t=""){let a=document.getElementById("admin-toast");if(!a)return;let n=document.createElement("div");n.className=`toast-item ${t}`,n.textContent=e,a.appendChild(n),setTimeout(()=>n.remove(),4200)}function y(e,{confirmLabel:t="Confirm",danger:a=!0}={}){return new Promise(n=>{let i=document.createElement("dialog");i.className="modal",i.innerHTML=`
      <div class="panel-head"><h2>Please confirm</h2></div>
      <div class="panel-body"><p style="margin:0;line-height:1.7;font-size:13px">${c(e)}</p></div>
      <div class="modal-actions">
        <button class="btn ghost" type="button" data-cancel>Cancel</button>
        <button class="btn ${a?"danger":"primary"}" type="button" data-confirm>${c(t)}</button>
      </div>
    `,document.body.appendChild(i);let o=e=>{i.close(),i.remove(),n(e)};i.querySelector("[data-cancel]").addEventListener("click",()=>o(!1)),i.querySelector("[data-confirm]").addEventListener("click",()=>o(!0)),i.addEventListener("cancel",()=>o(!1)),i.addEventListener("click",e=>{e.target===i&&o(!1)}),i.showModal()})}function v({title:e,fields:t,submitLabel:a="Save",onSubmit:n}){return new Promise(i=>{let o=document.createElement("dialog");o.className="modal";let r=t.map(e=>{let t,a=`field-${e.name}`,n=c(e.value??"");return t="textarea"===e.type?`<textarea id="${a}" name="${e.name}" rows="3" placeholder="${c(e.placeholder||"")}">${n}</textarea>`:"checkbox"===e.type?`<label class="checkbox-field"><input type="checkbox" id="${a}" name="${e.name}" ${e.value?"checked":""}> ${c(e.checkboxLabel||"Enabled")}</label>`:"select"===e.type?`<select id="${a}" name="${e.name}">${(e.options||[]).map(t=>`<option value="${c(t.value)}" ${t.value===e.value?"selected":""}>${c(t.label)}</option>`).join("")}</select>`:`<input type="${e.type||"text"}" id="${a}" name="${e.name}" value="${n}" placeholder="${c(e.placeholder||"")}" ${e.required?"required":""}>`,`
        <div class="field ${e.wide?"full":""}">
          <label for="${a}">${c(e.label)}${e.required?" *":""}</label>
          ${t}
          ${e.hint?`<span class="field-hint">${c(e.hint)}</span>`:""}
          <span class="field-error" data-error-for="${e.name}"></span>
        </div>`}).join("");o.innerHTML=`
      <form method="dialog" novalidate>
        <div class="panel-head"><h2>${c(e)}</h2></div>
        <div class="panel-body"><div class="form-grid">${r}</div></div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" data-cancel>Cancel</button>
          <button class="btn primary" type="submit">${c(a)}</button>
        </div>
      </form>
    `,document.body.appendChild(o);let l=e=>{o.close(),o.remove(),i(e)};o.querySelector("[data-cancel]").addEventListener("click",()=>l(null)),o.addEventListener("cancel",()=>l(null)),o.addEventListener("click",e=>{e.target===o&&l(null)}),o.querySelector("form").addEventListener("submit",async e=>{e.preventDefault(),o.querySelectorAll("[data-error-for]").forEach(e=>{e.textContent=""});let a={};for(let e of t){let t=o.querySelector(`[name="${e.name}"]`);t&&(a[e.name]="checkbox"===t.type?t.checked:t.value)}try{let e=await n(a);l(e)}catch(e){if(e.details)for(let[t,a]of Object.entries(e.details)){let e=o.querySelector(`[data-error-for="${t}"]`);e&&(e.textContent=a)}h(e.message,"error")}}),o.showModal(),o.querySelector("input, select, textarea")?.focus()})}function b(e){let t=Number(e||0);return t>=1e6?`${(t/1e6).toFixed(1).replace(/\.0$/,"")}m`:t>=1e4?`${(t/1e3).toFixed(1).replace(/\.0$/,"")}k`:t.toLocaleString("en-US")}function f(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}function $(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":`${t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})} ${t.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}`}function w(e){if(!e)return"—";let t=Math.round((Date.now()-new Date(e).getTime())/1e3);if(!Number.isFinite(t))return"—";for(let[e,a]of[[31536e3,"y"],[2592e3,"mo"],[604800,"w"],[86400,"d"],[3600,"h"],[60,"m"]])if(Math.abs(t)>=e)return`${Math.round(t/e)}${a} ago`;return"just now"}function S(e){let t=String(e||"unknown");return`<span class="badge ${c(t)}">${c(t)}</span>`}function k(e){let t=[];return e.featured&&t.push('<span class="badge featured">featured</span>'),e.verified&&t.push('<span class="badge verified">verified</span>'),t.join(" ")}function x(e,{page:t,pages:a,total:n,onPage:i}){e.innerHTML=`
    <div class="pagination">
      <span>${b(n)} result${1===n?"":"s"}</span>
      <div class="pages">
        <button class="btn ghost small" type="button" data-prev ${t<=1?"disabled":""}>← Prev</button>
        <span>Page ${t} / ${a}</span>
        <button class="btn ghost small" type="button" data-next ${t>=a?"disabled":""}>Next →</button>
      </div>
    </div>
  `,e.querySelector("[data-prev]")?.addEventListener("click",()=>i(t-1)),e.querySelector("[data-next]")?.addEventListener("click",()=>i(t+1))}function E(e,t={}){for(let[a,n]of(e.querySelectorAll(".field-error").forEach(e=>{e.textContent=""}),e.querySelectorAll("[aria-invalid]").forEach(e=>e.removeAttribute("aria-invalid")),Object.entries(t))){let t=e.querySelector(`[data-error-for="${a}"]`);t&&(t.textContent=n);let i=e.querySelector(`[name="${a}"]`);i&&i.setAttribute("aria-invalid","true")}}function L(e,t=250){let a;return(...n)=>{clearTimeout(a),a=setTimeout(()=>e(...n),t)}}function T(e,t,{placeholder:a="All",valueKey:n="slug",labelKey:i="name"}={}){let o=e.value;e.innerHTML=(a?`<option value="">${c(a)}</option>`:"")+t.map(e=>`<option value="${c(e[n])}">${c(e[i])}${void 0!==e.templateCount?` (${e.templateCount})`:""}</option>`).join(""),[...e.options].some(e=>e.value===o)&&(e.value=o)}},2778:(e,t,a)=>{a.a(e,async(e,n)=>{try{a.r(t);var i=a(2546);let e=(0,i.mountAdmin)({active:"activity",title:"Activity log",crumb:"Admin / System / Activity"});await (0,i.requireSession)();let r={page:1,entity:""};e.body.innerHTML=`
  <div class="notice">
    System activity log recording administrative events, moderation changes, and updates.
  </div>
  <div class="toolbar" style="border:1px solid var(--line);background:var(--panel);border-bottom:none;margin-bottom:16px">
    <div class="field">
      <label for="entity-filter">Entity</label>
      <select id="entity-filter">
        <option value="">All</option>
        <option value="template">Templates</option>
        <option value="submission">Submissions</option>
        <option value="category">Categories</option>
        <option value="tag">Tags</option>
        <option value="publisher">Publishers</option>
        <option value="registry">Registry</option>
        <option value="settings">Settings</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  </div>
  <section class="panel">
    <div class="table-scroll">
      <table class="data-table">
        <thead><tr><th>When</th><th>Action</th><th>Entity</th><th>Record</th><th>Actor</th><th>Metadata</th></tr></thead>
        <tbody id="activity-body"></tbody>
      </table>
    </div>
    <div class="empty" id="activity-empty" hidden>
      <h3>No activity recorded</h3>
      <p>Actions appear here as soon as admins change things.</p>
    </div>
    <div id="activity-pagination"></div>
  </section>
`;let l=document.getElementById("activity-body"),s=document.getElementById("activity-empty");async function o(){l.innerHTML='<tr><td colspan="6" style="color:var(--muted);padding:24px">Loading…</td></tr>';try{let e=await (0,i.get)(`/api/admin/activity${(0,i.queryString)({page:r.page,entity:r.entity})}`);if(!e.items.length){l.innerHTML="",s.hidden=!1;return}s.hidden=!0,l.innerHTML=e.items.map(e=>`
      <tr>
        <td style="font-family:var(--mono);font-size:11px;white-space:nowrap">${(0,i.fmtDateTime)(e.created_at)}</td>
        <td><span class="badge">${(0,i.escapeHtml)(e.action)}</span></td>
        <td style="font-family:var(--mono);font-size:11px">${(0,i.escapeHtml)(e.entity)}</td>
        <td style="font-family:var(--mono);font-size:11px;color:var(--muted)">${(0,i.escapeHtml)(function(e){if(!e)return"—";let t=String(e);return t.length>24?`${t.slice(0,21)}…`:t}(e.entity_id))}</td>
        <td style="font-family:var(--mono);font-size:11px">${(0,i.escapeHtml)(e.actor)}</td>
        <td style="font-family:var(--mono);font-size:10px;color:var(--muted);max-width:340px;overflow:hidden;text-overflow:ellipsis">${(0,i.escapeHtml)(JSON.stringify(e.metadata))}</td>
      </tr>`).join(""),(0,i.renderPagination)(document.getElementById("activity-pagination"),{page:e.page,pages:e.pages,total:e.total,onPage:e=>{r.page=e,o()}})}catch(e){l.innerHTML=`<tr><td colspan="6" style="color:#f18c75;padding:24px">${(0,i.escapeHtml)(e.message)}</td></tr>`}}document.getElementById("entity-filter").addEventListener("change",e=>{r.entity=e.target.value,r.page=1,o()}),await o(),n()}catch(e){n(e)}},1)}}]);