(()=>{"use strict";(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,82926,e=>{let t=[{group:"Overview"},{href:"/admin",key:"dashboard",label:"Dashboard"},{group:"Marketplace"},{href:"/admin/templates",key:"templates",label:"Templates"},{href:"/admin/templates/new",key:"template-new",label:"New template"},{href:"/admin/submissions",key:"submissions",label:"Submissions",count:"pendingSubmissions"},{group:"Taxonomy"},{href:"/admin/categories",key:"categories",label:"Categories"},{href:"/admin/tags",key:"tags",label:"Tags"},{href:"/admin/publishers",key:"publishers",label:"Publishers"},{group:"Insights"},{href:"/admin/analytics",key:"analytics",label:"Analytics"},{href:"/admin/registry",key:"registry",label:"Registry"},{group:"System"},{href:"/admin/admins",key:"admins",label:"Admins"},{href:"/admin/activity",key:"activity",label:"Activity"},{href:"/admin/settings",key:"settings",label:"Settings"}];class a extends Error{constructor(e,{status:t=0,code:a="error",details:n}={}){super(e),this.status=t,this.code=a,this.details=n}}async function n(e,{method:t="GET",body:i,formData:s}={}){let o,r={method:t,credentials:"same-origin",headers:{}};s?r.body=s:void 0!==i&&(r.headers["Content-Type"]="application/json",r.body=JSON.stringify(i));try{o=await fetch(e,r)}catch{throw new a("Cannot reach the server. Is it still running?",{code:"network"})}let d=await o.text(),l=null;if(d)try{l=JSON.parse(d)}catch{l=null}if(!o.ok){let t=l?.error?.message;t||(t=405===o.status||window.location.hostname.endsWith("github.io")?"GitHub Pages is static. Admin sign-in requires the Node.js server (run 'node scripts/start.js' locally at http://localhost:8787/admin).":`Request failed (${o.status})`);let n=new a(t,{status:o.status,code:l?.error?.code,details:l?.error?.details});throw 401!==o.status||e.endsWith("/login")||/\/admin\/login(\.html)?$/.test(window.location.pathname)||(window.location.href=`/admin/login?next=${encodeURIComponent(window.location.pathname)}`),n}return l}let i=e=>n(e),s=(e,t)=>n(e,{method:"POST",body:t});function o(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function r(e){let t=window.location.pathname.startsWith("/Litho-Template-Marketplace")?"/Litho-Template-Marketplace":"";return`${t}${e}`}async function d(){return await i("/api/admin/session")}function l(e,t=""){let a=document.getElementById("admin-toast");if(!a)return;let n=document.createElement("div");n.className=`toast-item ${t}`,n.textContent=e,a.appendChild(n),setTimeout(()=>n.remove(),4200)}function c(e){let t=Number(e||0);return t>=1e6?`${(t/1e6).toFixed(1).replace(/\.0$/,"")}m`:t>=1e4?`${(t/1e3).toFixed(1).replace(/\.0$/,"")}k`:t.toLocaleString("en-US")}e.s(["api",0,n,"confirmAction",0,function(e,{confirmLabel:t="Confirm",danger:a=!0}={}){return new Promise(n=>{let i=document.createElement("dialog");i.className="modal",i.innerHTML=`
      <div class="panel-head"><h2>Please confirm</h2></div>
      <div class="panel-body"><p style="margin:0;line-height:1.7;font-size:13px">${o(e)}</p></div>
      <div class="modal-actions">
        <button class="btn ghost" type="button" data-cancel>Cancel</button>
        <button class="btn ${a?"danger":"primary"}" type="button" data-confirm>${o(t)}</button>
      </div>
    `,document.body.appendChild(i);let s=e=>{i.close(),i.remove(),n(e)};i.querySelector("[data-cancel]").addEventListener("click",()=>s(!1)),i.querySelector("[data-confirm]").addEventListener("click",()=>s(!0)),i.addEventListener("cancel",()=>s(!1)),i.addEventListener("click",e=>{e.target===i&&s(!1)}),i.showModal()})},"debounce",0,function(e,t=250){let a;return(...n)=>{clearTimeout(a),a=setTimeout(()=>e(...n),t)}},"del",0,(e,t)=>n(e,{method:"DELETE",body:t}),"editModal",0,function({title:e,fields:t,submitLabel:a="Save",onSubmit:n}){return new Promise(i=>{let s=document.createElement("dialog");s.className="modal";let r=t.map(e=>{let t,a=`field-${e.name}`,n=o(e.value??"");return t="textarea"===e.type?`<textarea id="${a}" name="${e.name}" rows="3" placeholder="${o(e.placeholder||"")}">${n}</textarea>`:"checkbox"===e.type?`<label class="checkbox-field"><input type="checkbox" id="${a}" name="${e.name}" ${e.value?"checked":""}> ${o(e.checkboxLabel||"Enabled")}</label>`:"select"===e.type?`<select id="${a}" name="${e.name}">${(e.options||[]).map(t=>`<option value="${o(t.value)}" ${t.value===e.value?"selected":""}>${o(t.label)}</option>`).join("")}</select>`:`<input type="${e.type||"text"}" id="${a}" name="${e.name}" value="${n}" placeholder="${o(e.placeholder||"")}" ${e.required?"required":""}>`,`
        <div class="field ${e.wide?"full":""}">
          <label for="${a}">${o(e.label)}${e.required?" *":""}</label>
          ${t}
          ${e.hint?`<span class="field-hint">${o(e.hint)}</span>`:""}
          <span class="field-error" data-error-for="${e.name}"></span>
        </div>`}).join("");s.innerHTML=`
      <form method="dialog" novalidate>
        <div class="panel-head"><h2>${o(e)}</h2></div>
        <div class="panel-body"><div class="form-grid">${r}</div></div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" data-cancel>Cancel</button>
          <button class="btn primary" type="submit">${o(a)}</button>
        </div>
      </form>
    `,document.body.appendChild(s);let d=e=>{s.close(),s.remove(),i(e)};s.querySelector("[data-cancel]").addEventListener("click",()=>d(null)),s.addEventListener("cancel",()=>d(null)),s.addEventListener("click",e=>{e.target===s&&d(null)}),s.querySelector("form").addEventListener("submit",async e=>{e.preventDefault(),s.querySelectorAll("[data-error-for]").forEach(e=>{e.textContent=""});let a={};for(let e of t){let t=s.querySelector(`[name="${e.name}"]`);t&&(a[e.name]="checkbox"===t.type?t.checked:t.value)}try{let e=await n(a);d(e)}catch(e){if(e.details)for(let[t,a]of Object.entries(e.details)){let e=s.querySelector(`[data-error-for="${t}"]`);e&&(e.textContent=a)}l(e.message,"error")}}),s.showModal(),s.querySelector("input, select, textarea")?.focus()})},"escapeHtml",0,o,"fillSelect",0,function(e,t,{placeholder:a="All",valueKey:n="slug",labelKey:i="name"}={}){let s=e.value;e.innerHTML=(a?`<option value="">${o(a)}</option>`:"")+t.map(e=>`<option value="${o(e[n])}">${o(e[i])}${void 0!==e.templateCount?` (${e.templateCount})`:""}</option>`).join(""),[...e.options].some(e=>e.value===s)&&(e.value=s)},"flagsBadges",0,function(e){let t=[];return e.featured&&t.push('<span class="badge featured">featured</span>'),e.verified&&t.push('<span class="badge verified">verified</span>'),t.join(" ")},"fmtDate",0,function(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})},"fmtDateTime",0,function(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":`${t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})} ${t.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}`},"fmtNumber",0,c,"get",0,i,"mountAdmin",0,function({active:e="",title:a="Dashboard",crumb:n="Admin",actions:i=""}={}){document.body.classList.add("admin-page");let d=function(){try{return JSON.parse(sessionStorage.getItem("admin:counts")||"{}")}catch{return{}}}(),l=t.map(t=>{if(t.group)return`<div class="nav-group">${o(t.group)}</div>`;let a=t.count?d[t.count]:null,n=a?`<span class="nav-count">${Number(a)}</span>`:"";return`<a href="${r(t.href)}" class="${t.key===e?"active":""}">${o(t.label)}${n}</a>`}).join("");function c(){let e=document.getElementById("admin-sidebar"),t=document.getElementById("admin-backdrop"),a=document.querySelector("[data-action='menu']");e&&e.classList.remove("open"),t&&t.classList.remove("open"),a&&a.setAttribute("aria-expanded","false")}return document.body.innerHTML=`
    <a class="skip-link" href="#admin-content">Skip to content</a>
    <div class="admin-shell">
      <aside class="admin-sidebar" id="admin-sidebar" aria-label="Admin sidebar">
        <div class="admin-sidebar-header">
          <a class="admin-brand" href="${r("/admin")}">
            <img src="${r("/assets/img/litho-wordmark.png?v=20261007-01")}" alt="" width="656" height="192">
            <span>Admin</span>
          </a>
          <button class="admin-sidebar-close" type="button" data-action="menu-close" aria-label="Close menu">✕</button>
        </div>
        <nav class="admin-nav" aria-label="Admin navigation">${l}</nav>
        <div class="admin-sidebar-foot">
          <a class="btn ghost small" href="${r("/")}" target="_blank" rel="noreferrer">View marketplace ↗</a>
          <button class="btn ghost small" type="button" data-action="theme">Toggle theme</button>
          <button class="btn ghost small" type="button" data-action="logout">Sign out</button>
        </div>
      </aside>
      <div class="admin-backdrop" id="admin-backdrop" data-action="menu-close" aria-hidden="true"></div>
      <div class="admin-main">
        <header class="admin-topbar">
          <div style="display:flex;align-items:center;gap:12px;min-width:0">
            <button class="btn ghost small menu-toggle" type="button" data-action="menu" aria-expanded="false" aria-controls="admin-sidebar">Menu</button>
            <div style="min-width:0">
              <div class="crumbs">${o(n)}</div>
              <h1>${o(a)}</h1>
            </div>
          </div>
          <div class="admin-actions" id="admin-actions">${i}</div>
        </header>
        <main class="admin-body" id="admin-content" tabindex="-1"></main>
      </div>
    </div>
    <div class="admin-toast" id="admin-toast" role="status" aria-live="polite"></div>
  `,document.body.addEventListener("click",e=>{let t=e.target.closest("[data-action]")?.dataset.action;"logout"===t&&(s("/api/admin/logout").catch(()=>{}),window.location.href=r("/admin/login")),"menu"===t&&function(){let e=document.getElementById("admin-sidebar"),t=document.getElementById("admin-backdrop"),a=document.querySelector("[data-action='menu']");if(!e)return;let n=e.classList.toggle("open");t&&t.classList.toggle("open",n),a&&a.setAttribute("aria-expanded",String(n))}(),"menu-close"===t&&c(),"theme"===t&&function(){let e=document.documentElement,t="light"===e.dataset.theme?"dark":"light";e.dataset.theme=t;try{localStorage.setItem("litho-theme",t)}catch{}}(),e.target.closest(".admin-nav a, .admin-brand, .admin-sidebar-foot a")&&c()}),document.addEventListener("keydown",e=>{"Escape"===e.key&&c()}),{body:document.getElementById("admin-content"),actions:document.getElementById("admin-actions"),setActions(e){document.getElementById("admin-actions").innerHTML=e}}},"post",0,s,"put",0,(e,t)=>n(e,{method:"PUT",body:t}),"queryString",0,function(e={}){let t=new URLSearchParams;for(let[a,n]of Object.entries(e))""!==n&&null!=n&&t.set(a,String(n));let a=t.toString();return a?`?${a}`:""},"renderPagination",0,function(e,{page:t,pages:a,total:n,onPage:i}){e.innerHTML=`
    <div class="pagination">
      <span>${c(n)} result${1===n?"":"s"}</span>
      <div class="pages">
        <button class="btn ghost small" type="button" data-prev ${t<=1?"disabled":""}>← Prev</button>
        <span>Page ${t} / ${a}</span>
        <button class="btn ghost small" type="button" data-next ${t>=a?"disabled":""}>Next →</button>
      </div>
    </div>
  `,e.querySelector("[data-prev]")?.addEventListener("click",()=>i(t-1)),e.querySelector("[data-next]")?.addEventListener("click",()=>i(t+1))},"requireSession",0,d,"showFormErrors",0,function(e,t={}){for(let[a,n]of(e.querySelectorAll(".field-error").forEach(e=>{e.textContent=""}),e.querySelectorAll("[aria-invalid]").forEach(e=>e.removeAttribute("aria-invalid")),Object.entries(t))){let t=e.querySelector(`[data-error-for="${a}"]`);t&&(t.textContent=n);let i=e.querySelector(`[name="${a}"]`);i&&i.setAttribute("aria-invalid","true")}},"statusBadge",0,function(e){let t=String(e||"unknown");return`<span class="badge ${o(t)}">${o(t)}</span>`},"storeCounts",0,function(e){try{sessionStorage.setItem("admin:counts",JSON.stringify(e))}catch{}},"timeAgo",0,function(e){if(!e)return"—";let t=Math.round((Date.now()-new Date(e).getTime())/1e3);if(!Number.isFinite(t))return"—";for(let[e,a]of[[31536e3,"y"],[2592e3,"mo"],[604800,"w"],[86400,"d"],[3600,"h"],[60,"m"]])if(Math.abs(t)>=e)return`${Math.round(t/e)}${a} ago`;return"just now"},"toast",0,l])},95133,e=>e.a(async(t,a)=>{try{var n=e.i(82926);let t=(0,n.mountAdmin)({active:"admins",title:"Admin users",crumb:"Admin / System / Admins"}),s=await (0,n.requireSession)(),o=(s?.username||"admin").toLowerCase();t.body.innerHTML=`
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
`;let r=document.getElementById("admins-body"),d=document.getElementById("admins-empty");async function i(){try{let e=await (0,n.get)("/api/admin/admins");if(!Array.isArray(e)||!e.length){r.innerHTML="",d.hidden=!1;return}d.hidden=!0,r.innerHTML=e.map(e=>{let t=e.username.toLowerCase()===o;return`
        <tr data-id="${(0,n.escapeHtml)(e.id)}" data-username="${(0,n.escapeHtml)(e.username)}">
          <td style="font-family:var(--mono);font-size:13px;font-weight:600">
            ${(0,n.escapeHtml)(e.username)}${t?' <span class="badge" style="font-size:10px;text-transform:uppercase">You</span>':""}
          </td>
          <td><span class="badge ${"admin"===e.role?"featured":""}">${(0,n.escapeHtml)(e.role||"admin")}</span></td>
          <td style="font-size:12px;color:var(--muted)">${(0,n.fmtDateTime)(e.created_at)}</td>
          <td style="font-size:12px;color:var(--muted)">${(0,n.fmtDateTime)(e.updated_at)}</td>
          <td class="actions">
            <div class="btn-row" style="justify-content:flex-end">
              ${t?'<span style="font-size:11px;color:var(--muted)">Active session</span>':'<button class="btn danger small" type="button" data-delete>Delete</button>'}
            </div>
          </td>
        </tr>`}).join("")}catch(e){r.innerHTML=`<tr><td colspan="5" style="color:#f18c75;padding:24px">${(0,n.escapeHtml)(e.message)}</td></tr>`}}r.addEventListener("click",async e=>{let t=e.target.closest("tr[data-id]");if(!t)return;let a=t.dataset.id,s=t.dataset.username;if(e.target.closest("[data-delete]")){if(!await (0,n.confirmAction)(`Are you sure you want to revoke admin access for "${s}"? This cannot be undone.`,{confirmLabel:"Delete admin"}))return;try{await (0,n.del)(`/api/admin/admins/${encodeURIComponent(a)}`),(0,n.toast)(`Deleted admin user "${s}"`,"success"),await i()}catch(e){(0,n.toast)(e.message,"error")}}}),document.getElementById("add-admin").addEventListener("click",async()=>{let e=await (0,n.editModal)({title:"Create new administrator",fields:[{name:"username",label:"Username",required:!0,placeholder:"e.g. sarah_admin",hint:"3 to 32 characters (letters, numbers, underscores, dots, or dashes)."},{name:"password",label:"Password",type:"password",required:!0,placeholder:"••••••••••••",hint:"At least 8 characters."},{name:"role",label:"Role",type:"select",value:"admin",options:[{value:"admin",label:"Admin (Full access)"},{value:"editor",label:"Editor (Content management)"},{value:"viewer",label:"Viewer (Read-only access)"}]}],submitLabel:"Create admin",onSubmit:async e=>(0,n.post)("/api/admin/admins",{username:e.username.trim(),password:e.password,role:e.role})});e&&((0,n.toast)(`Admin "${e.username}" created successfully`,"success"),await i())}),await i(),e.s([]),a()}catch(e){a(e)}},!0)])})();