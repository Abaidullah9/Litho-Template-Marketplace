"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9039],{2546:(e,t,a)=>{a.r(t),a.d(t,{ApiError:()=>i,api:()=>s,confirmAction:()=>y,debounce:()=>L,del:()=>d,editModal:()=>g,escapeHtml:()=>c,fillSelect:()=>A,flagsBadges:()=>S,fmtDate:()=>v,fmtDateTime:()=>$,fmtNumber:()=>f,get:()=>r,mountAdmin:()=>u,post:()=>o,put:()=>l,queryString:()=>m,renderPagination:()=>x,requireSession:()=>h,showFormErrors:()=>E,statusBadge:()=>k,storeCounts:()=>p,timeAgo:()=>w,toast:()=>b});let n=[{group:"Overview"},{href:"/admin",key:"dashboard",label:"Dashboard"},{group:"Marketplace"},{href:"/admin/templates",key:"templates",label:"Templates"},{href:"/admin/templates/new",key:"template-new",label:"New template"},{href:"/admin/submissions",key:"submissions",label:"Submissions",count:"pendingSubmissions"},{group:"Taxonomy"},{href:"/admin/categories",key:"categories",label:"Categories"},{href:"/admin/tags",key:"tags",label:"Tags"},{href:"/admin/publishers",key:"publishers",label:"Publishers"},{group:"Insights"},{href:"/admin/analytics",key:"analytics",label:"Analytics"},{href:"/admin/registry",key:"registry",label:"Registry"},{group:"System"},{href:"/admin/admins",key:"admins",label:"Admins"},{href:"/admin/activity",key:"activity",label:"Activity"},{href:"/admin/settings",key:"settings",label:"Settings"}];class i extends Error{constructor(e,{status:t=0,code:a="error",details:n}={}){super(e),this.status=t,this.code=a,this.details=n}}async function s(e,{method:t="GET",body:a,formData:n}={}){let r,o={method:t,credentials:"same-origin",headers:{}};n?o.body=n:void 0!==a&&(o.headers["Content-Type"]="application/json",o.body=JSON.stringify(a));try{r=await fetch(e,o)}catch{throw new i("Cannot reach the server. Is it still running?",{code:"network"})}let l=await r.text(),d=null;if(l)try{d=JSON.parse(l)}catch{d=null}if(!r.ok){let t=new i(d?.error?.message||`Request failed (${r.status})`,{status:r.status,code:d?.error?.code,details:d?.error?.details});throw 401!==r.status||e.endsWith("/login")||/\/admin\/login(\.html)?$/.test(window.location.pathname)||(window.location.href=`/admin/login?next=${encodeURIComponent(window.location.pathname)}`),t}return d}let r=e=>s(e),o=(e,t)=>s(e,{method:"POST",body:t}),l=(e,t)=>s(e,{method:"PUT",body:t}),d=(e,t)=>s(e,{method:"DELETE",body:t});function c(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function m(e={}){let t=new URLSearchParams;for(let[a,n]of Object.entries(e))""!==n&&null!=n&&t.set(a,String(n));let a=t.toString();return a?`?${a}`:""}function u({active:e="",title:t="Dashboard",crumb:a="Admin",actions:i=""}={}){document.body.classList.add("admin-page");let s=function(){try{return JSON.parse(sessionStorage.getItem("admin:counts")||"{}")}catch{return{}}}(),r=n.map(t=>{if(t.group)return`<div class="nav-group">${c(t.group)}</div>`;let a=t.count?s[t.count]:null,n=a?`<span class="nav-count">${Number(a)}</span>`:"";return`<a href="${t.href}" class="${t.key===e?"active":""}">${c(t.label)}${n}</a>`}).join("");return document.body.innerHTML=`
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
  `,document.body.addEventListener("click",e=>{let t=e.target.closest("[data-action]")?.dataset.action;if("logout"===t&&(o("/api/admin/logout").catch(()=>{}),window.location.href="/admin/login"),"menu"===t){let t=document.getElementById("admin-sidebar").classList.toggle("open");e.target.closest("[data-action]").setAttribute("aria-expanded",String(t))}"theme"===t&&function(){let e=document.documentElement,t="light"===e.dataset.theme?"dark":"light";e.dataset.theme=t;try{localStorage.setItem("litho-theme",t)}catch{}}()}),{body:document.getElementById("admin-content"),actions:document.getElementById("admin-actions"),setActions(e){document.getElementById("admin-actions").innerHTML=e}}}function p(e){try{sessionStorage.setItem("admin:counts",JSON.stringify(e))}catch{}}async function h(){return await r("/api/admin/session")}function b(e,t=""){let a=document.getElementById("admin-toast");if(!a)return;let n=document.createElement("div");n.className=`toast-item ${t}`,n.textContent=e,a.appendChild(n),setTimeout(()=>n.remove(),4200)}function y(e,{confirmLabel:t="Confirm",danger:a=!0}={}){return new Promise(n=>{let i=document.createElement("dialog");i.className="modal",i.innerHTML=`
      <div class="panel-head"><h2>Please confirm</h2></div>
      <div class="panel-body"><p style="margin:0;line-height:1.7;font-size:13px">${c(e)}</p></div>
      <div class="modal-actions">
        <button class="btn ghost" type="button" data-cancel>Cancel</button>
        <button class="btn ${a?"danger":"primary"}" type="button" data-confirm>${c(t)}</button>
      </div>
    `,document.body.appendChild(i);let s=e=>{i.close(),i.remove(),n(e)};i.querySelector("[data-cancel]").addEventListener("click",()=>s(!1)),i.querySelector("[data-confirm]").addEventListener("click",()=>s(!0)),i.addEventListener("cancel",()=>s(!1)),i.addEventListener("click",e=>{e.target===i&&s(!1)}),i.showModal()})}function g({title:e,fields:t,submitLabel:a="Save",onSubmit:n}){return new Promise(i=>{let s=document.createElement("dialog");s.className="modal";let r=t.map(e=>{let t,a=`field-${e.name}`,n=c(e.value??"");return t="textarea"===e.type?`<textarea id="${a}" name="${e.name}" rows="3" placeholder="${c(e.placeholder||"")}">${n}</textarea>`:"checkbox"===e.type?`<label class="checkbox-field"><input type="checkbox" id="${a}" name="${e.name}" ${e.value?"checked":""}> ${c(e.checkboxLabel||"Enabled")}</label>`:"select"===e.type?`<select id="${a}" name="${e.name}">${(e.options||[]).map(t=>`<option value="${c(t.value)}" ${t.value===e.value?"selected":""}>${c(t.label)}</option>`).join("")}</select>`:`<input type="${e.type||"text"}" id="${a}" name="${e.name}" value="${n}" placeholder="${c(e.placeholder||"")}" ${e.required?"required":""}>`,`
        <div class="field ${e.wide?"full":""}">
          <label for="${a}">${c(e.label)}${e.required?" *":""}</label>
          ${t}
          ${e.hint?`<span class="field-hint">${c(e.hint)}</span>`:""}
          <span class="field-error" data-error-for="${e.name}"></span>
        </div>`}).join("");s.innerHTML=`
      <form method="dialog" novalidate>
        <div class="panel-head"><h2>${c(e)}</h2></div>
        <div class="panel-body"><div class="form-grid">${r}</div></div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" data-cancel>Cancel</button>
          <button class="btn primary" type="submit">${c(a)}</button>
        </div>
      </form>
    `,document.body.appendChild(s);let o=e=>{s.close(),s.remove(),i(e)};s.querySelector("[data-cancel]").addEventListener("click",()=>o(null)),s.addEventListener("cancel",()=>o(null)),s.addEventListener("click",e=>{e.target===s&&o(null)}),s.querySelector("form").addEventListener("submit",async e=>{e.preventDefault(),s.querySelectorAll("[data-error-for]").forEach(e=>{e.textContent=""});let a={};for(let e of t){let t=s.querySelector(`[name="${e.name}"]`);t&&(a[e.name]="checkbox"===t.type?t.checked:t.value)}try{let e=await n(a);o(e)}catch(e){if(e.details)for(let[t,a]of Object.entries(e.details)){let e=s.querySelector(`[data-error-for="${t}"]`);e&&(e.textContent=a)}b(e.message,"error")}}),s.showModal(),s.querySelector("input, select, textarea")?.focus()})}function f(e){let t=Number(e||0);return t>=1e6?`${(t/1e6).toFixed(1).replace(/\.0$/,"")}m`:t>=1e4?`${(t/1e3).toFixed(1).replace(/\.0$/,"")}k`:t.toLocaleString("en-US")}function v(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}function $(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":`${t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})} ${t.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}`}function w(e){if(!e)return"—";let t=Math.round((Date.now()-new Date(e).getTime())/1e3);if(!Number.isFinite(t))return"—";for(let[e,a]of[[31536e3,"y"],[2592e3,"mo"],[604800,"w"],[86400,"d"],[3600,"h"],[60,"m"]])if(Math.abs(t)>=e)return`${Math.round(t/e)}${a} ago`;return"just now"}function k(e){let t=String(e||"unknown");return`<span class="badge ${c(t)}">${c(t)}</span>`}function S(e){let t=[];return e.featured&&t.push('<span class="badge featured">featured</span>'),e.verified&&t.push('<span class="badge verified">verified</span>'),t.join(" ")}function x(e,{page:t,pages:a,total:n,onPage:i}){e.innerHTML=`
    <div class="pagination">
      <span>${f(n)} result${1===n?"":"s"}</span>
      <div class="pages">
        <button class="btn ghost small" type="button" data-prev ${t<=1?"disabled":""}>← Prev</button>
        <span>Page ${t} / ${a}</span>
        <button class="btn ghost small" type="button" data-next ${t>=a?"disabled":""}>Next →</button>
      </div>
    </div>
  `,e.querySelector("[data-prev]")?.addEventListener("click",()=>i(t-1)),e.querySelector("[data-next]")?.addEventListener("click",()=>i(t+1))}function E(e,t={}){for(let[a,n]of(e.querySelectorAll(".field-error").forEach(e=>{e.textContent=""}),e.querySelectorAll("[aria-invalid]").forEach(e=>e.removeAttribute("aria-invalid")),Object.entries(t))){let t=e.querySelector(`[data-error-for="${a}"]`);t&&(t.textContent=n);let i=e.querySelector(`[name="${a}"]`);i&&i.setAttribute("aria-invalid","true")}}function L(e,t=250){let a;return(...n)=>{clearTimeout(a),a=setTimeout(()=>e(...n),t)}}function A(e,t,{placeholder:a="All",valueKey:n="slug",labelKey:i="name"}={}){let s=e.value;e.innerHTML=(a?`<option value="">${c(a)}</option>`:"")+t.map(e=>`<option value="${c(e[n])}">${c(e[i])}${void 0!==e.templateCount?` (${e.templateCount})`:""}</option>`).join(""),[...e.options].some(e=>e.value===s)&&(e.value=s)}},9039:(e,t,a)=>{a.a(e,async(e,n)=>{try{a.r(t);var i=a(2546);let e=(0,i.mountAdmin)({active:"admins",title:"Admin users",crumb:"Admin / System / Admins"}),r=await (0,i.requireSession)(),o=(r?.username||"admin").toLowerCase();e.body.innerHTML=`
  <div class="notice">
    Manage administrators with access to the marketplace console.
  </div>
  <section class="panel">
    <div class="panel-head">
      <div>
        <h2>Team administrators</h2>
        <span class="field-hint">Users with access to templates, submissions, and taxonomy</span>
      </div>
      <button class="btn primary" type="button" id="add-admin">+ New admin</button>
    </div>
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:200px">Username</th>
            <th style="width:120px">Role</th>
            <th style="width:180px">Created</th>
            <th style="width:180px">Last updated</th>
            <th style="text-align:right">Actions</th>
          </tr>
        </thead>
        <tbody id="admins-body">
          <tr><td colspan="5" style="color:var(--muted);padding:24px">Loading admins…</td></tr>
        </tbody>
      </table>
    </div>
    <div class="empty" id="admins-empty" hidden>
      <h3>No administrators found</h3>
      <p>Click "+ New admin" to create an administrator account.</p>
    </div>
  </section>
`;let l=document.getElementById("admins-body"),d=document.getElementById("admins-empty");async function s(){try{let e=await (0,i.get)("/api/admin/admins");if(!Array.isArray(e)||!e.length){l.innerHTML="",d.hidden=!1;return}d.hidden=!0,l.innerHTML=e.map(e=>{let t=e.username.toLowerCase()===o;return`
        <tr data-id="${(0,i.escapeHtml)(e.id)}" data-username="${(0,i.escapeHtml)(e.username)}">
          <td style="font-family:var(--mono);font-size:13px;font-weight:600">
            ${(0,i.escapeHtml)(e.username)}${t?' <span class="badge" style="font-size:10px;text-transform:uppercase">You</span>':""}
          </td>
          <td><span class="badge ${"admin"===e.role?"featured":""}">${(0,i.escapeHtml)(e.role||"admin")}</span></td>
          <td style="font-size:12px;color:var(--muted)">${(0,i.fmtDateTime)(e.created_at)}</td>
          <td style="font-size:12px;color:var(--muted)">${(0,i.fmtDateTime)(e.updated_at)}</td>
          <td class="actions">
            <div class="btn-row" style="justify-content:flex-end">
              ${t?'<span style="font-size:11px;color:var(--muted)">Active session</span>':'<button class="btn danger small" type="button" data-delete>Delete</button>'}
            </div>
          </td>
        </tr>`}).join("")}catch(e){l.innerHTML=`<tr><td colspan="5" style="color:#f18c75;padding:24px">${(0,i.escapeHtml)(e.message)}</td></tr>`}}l.addEventListener("click",async e=>{let t=e.target.closest("tr[data-id]");if(!t)return;let a=t.dataset.id,n=t.dataset.username;if(e.target.closest("[data-delete]")){if(!await (0,i.confirmAction)(`Are you sure you want to revoke admin access for "${n}"? This cannot be undone.`,{confirmLabel:"Delete admin"}))return;try{await (0,i.del)(`/api/admin/admins/${encodeURIComponent(a)}`),(0,i.toast)(`Deleted admin user "${n}"`,"success"),await s()}catch(e){(0,i.toast)(e.message,"error")}}}),document.getElementById("add-admin").addEventListener("click",async()=>{let e=await (0,i.editModal)({title:"Create new administrator",fields:[{name:"username",label:"Username",required:!0,placeholder:"e.g. sarah_admin",hint:"3 to 32 characters (letters, numbers, underscores, dots, or dashes)."},{name:"password",label:"Password",type:"password",required:!0,placeholder:"••••••••••••",hint:"At least 8 characters."},{name:"role",label:"Role",type:"select",value:"admin",options:[{value:"admin",label:"Admin (Full access)"},{value:"editor",label:"Editor (Content management)"},{value:"viewer",label:"Viewer (Read-only access)"}]}],submitLabel:"Create admin",onSubmit:async e=>(0,i.post)("/api/admin/admins",{username:e.username.trim(),password:e.password,role:e.role})});e&&((0,i.toast)(`Admin "${e.username}" created successfully`,"success"),await s())}),await s(),n()}catch(e){n(e)}},1)}}]);