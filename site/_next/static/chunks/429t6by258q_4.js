(()=>{"use strict";(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,25163,e=>e.a(async(t,a)=>{try{var n=e.i(82926);let t=(0,n.mountAdmin)({active:"activity",title:"Activity log",crumb:"Admin / System / Activity"});await (0,n.requireSession)();let o={page:1,entity:""};t.body.innerHTML=`
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
`;let s=document.getElementById("activity-body"),l=document.getElementById("activity-empty");async function i(){s.innerHTML='<tr><td colspan="6" style="color:var(--muted);padding:24px">Loading…</td></tr>';try{let e=await (0,n.get)(`/api/admin/activity${(0,n.queryString)({page:o.page,entity:o.entity})}`);if(!e.items.length){s.innerHTML="",l.hidden=!1;return}l.hidden=!0,s.innerHTML=e.items.map(e=>`
      <tr>
        <td style="font-family:var(--mono);font-size:11px;white-space:nowrap">${(0,n.fmtDateTime)(e.created_at)}</td>
        <td><span class="badge">${(0,n.escapeHtml)(e.action)}</span></td>
        <td style="font-family:var(--mono);font-size:11px">${(0,n.escapeHtml)(e.entity)}</td>
        <td style="font-family:var(--mono);font-size:11px;color:var(--muted)">${(0,n.escapeHtml)(function(e){if(!e)return"—";let t=String(e);return t.length>24?`${t.slice(0,21)}…`:t}(e.entity_id))}</td>
        <td style="font-family:var(--mono);font-size:11px">${(0,n.escapeHtml)(e.actor)}</td>
        <td style="font-family:var(--mono);font-size:10px;color:var(--muted);max-width:340px;overflow:hidden;text-overflow:ellipsis">${(0,n.escapeHtml)(JSON.stringify(e.metadata))}</td>
      </tr>`).join(""),(0,n.renderPagination)(document.getElementById("activity-pagination"),{page:e.page,pages:e.pages,total:e.total,onPage:e=>{o.page=e,i()}})}catch(e){s.innerHTML=`<tr><td colspan="6" style="color:#f18c75;padding:24px">${(0,n.escapeHtml)(e.message)}</td></tr>`}}document.getElementById("entity-filter").addEventListener("change",e=>{o.entity=e.target.value,o.page=1,i()}),await i(),e.s([]),a()}catch(e){a(e)}},!0),82926,e=>{let t=[{group:"Overview"},{href:"/admin",key:"dashboard",label:"Dashboard"},{group:"Marketplace"},{href:"/admin/templates",key:"templates",label:"Templates"},{href:"/admin/templates/new",key:"template-new",label:"New template"},{href:"/admin/submissions",key:"submissions",label:"Submissions",count:"pendingSubmissions"},{group:"Taxonomy"},{href:"/admin/categories",key:"categories",label:"Categories"},{href:"/admin/tags",key:"tags",label:"Tags"},{href:"/admin/publishers",key:"publishers",label:"Publishers"},{group:"Insights"},{href:"/admin/analytics",key:"analytics",label:"Analytics"},{href:"/admin/registry",key:"registry",label:"Registry"},{group:"System"},{href:"/admin/admins",key:"admins",label:"Admins"},{href:"/admin/activity",key:"activity",label:"Activity"},{href:"/admin/settings",key:"settings",label:"Settings"}];class a extends Error{constructor(e,{status:t=0,code:a="error",details:n}={}){super(e),this.status=t,this.code=a,this.details=n}}async function n(e,{method:t="GET",body:i,formData:o}={}){let s,l={method:t,credentials:"same-origin",headers:{}};o?l.body=o:void 0!==i&&(l.headers["Content-Type"]="application/json",l.body=JSON.stringify(i));try{s=await fetch(e,l)}catch{throw new a("Cannot reach the server. Is it still running?",{code:"network"})}let r=await s.text(),d=null;if(r)try{d=JSON.parse(r)}catch{d=null}if(!s.ok){let t=d?.error?.message;t||(t=405===s.status||window.location.hostname.endsWith("github.io")?"GitHub Pages is static. Admin sign-in requires the Node.js server (run 'node scripts/start.js' locally at http://localhost:8787/admin).":`Request failed (${s.status})`);let n=new a(t,{status:s.status,code:d?.error?.code,details:d?.error?.details});throw 401!==s.status||e.endsWith("/login")||/\/admin\/login(\.html)?$/.test(window.location.pathname)||(window.location.href=`/admin/login?next=${encodeURIComponent(window.location.pathname)}`),n}return d}let i=e=>n(e),o=(e,t)=>n(e,{method:"POST",body:t});function s(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function l(e){let t=window.location.pathname.startsWith("/Litho-Template-Marketplace")?"/Litho-Template-Marketplace":"";return`${t}${e}`}async function r(){return await i("/api/admin/session")}function d(e,t=""){let a=document.getElementById("admin-toast");if(!a)return;let n=document.createElement("div");n.className=`toast-item ${t}`,n.textContent=e,a.appendChild(n),setTimeout(()=>n.remove(),4200)}function c(e){let t=Number(e||0);return t>=1e6?`${(t/1e6).toFixed(1).replace(/\.0$/,"")}m`:t>=1e4?`${(t/1e3).toFixed(1).replace(/\.0$/,"")}k`:t.toLocaleString("en-US")}e.s(["api",0,n,"confirmAction",0,function(e,{confirmLabel:t="Confirm",danger:a=!0}={}){return new Promise(n=>{let i=document.createElement("dialog");i.className="modal",i.innerHTML=`
      <div class="panel-head"><h2>Please confirm</h2></div>
      <div class="panel-body"><p style="margin:0;line-height:1.7;font-size:13px">${s(e)}</p></div>
      <div class="modal-actions">
        <button class="btn ghost" type="button" data-cancel>Cancel</button>
        <button class="btn ${a?"danger":"primary"}" type="button" data-confirm>${s(t)}</button>
      </div>
    `,document.body.appendChild(i);let o=e=>{i.close(),i.remove(),n(e)};i.querySelector("[data-cancel]").addEventListener("click",()=>o(!1)),i.querySelector("[data-confirm]").addEventListener("click",()=>o(!0)),i.addEventListener("cancel",()=>o(!1)),i.addEventListener("click",e=>{e.target===i&&o(!1)}),i.showModal()})},"debounce",0,function(e,t=250){let a;return(...n)=>{clearTimeout(a),a=setTimeout(()=>e(...n),t)}},"del",0,(e,t)=>n(e,{method:"DELETE",body:t}),"editModal",0,function({title:e,fields:t,submitLabel:a="Save",onSubmit:n}){return new Promise(i=>{let o=document.createElement("dialog");o.className="modal";let l=t.map(e=>{let t,a=`field-${e.name}`,n=s(e.value??"");return t="textarea"===e.type?`<textarea id="${a}" name="${e.name}" rows="3" placeholder="${s(e.placeholder||"")}">${n}</textarea>`:"checkbox"===e.type?`<label class="checkbox-field"><input type="checkbox" id="${a}" name="${e.name}" ${e.value?"checked":""}> ${s(e.checkboxLabel||"Enabled")}</label>`:"select"===e.type?`<select id="${a}" name="${e.name}">${(e.options||[]).map(t=>`<option value="${s(t.value)}" ${t.value===e.value?"selected":""}>${s(t.label)}</option>`).join("")}</select>`:`<input type="${e.type||"text"}" id="${a}" name="${e.name}" value="${n}" placeholder="${s(e.placeholder||"")}" ${e.required?"required":""}>`,`
        <div class="field ${e.wide?"full":""}">
          <label for="${a}">${s(e.label)}${e.required?" *":""}</label>
          ${t}
          ${e.hint?`<span class="field-hint">${s(e.hint)}</span>`:""}
          <span class="field-error" data-error-for="${e.name}"></span>
        </div>`}).join("");o.innerHTML=`
      <form method="dialog" novalidate>
        <div class="panel-head"><h2>${s(e)}</h2></div>
        <div class="panel-body"><div class="form-grid">${l}</div></div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" data-cancel>Cancel</button>
          <button class="btn primary" type="submit">${s(a)}</button>
        </div>
      </form>
    `,document.body.appendChild(o);let r=e=>{o.close(),o.remove(),i(e)};o.querySelector("[data-cancel]").addEventListener("click",()=>r(null)),o.addEventListener("cancel",()=>r(null)),o.addEventListener("click",e=>{e.target===o&&r(null)}),o.querySelector("form").addEventListener("submit",async e=>{e.preventDefault(),o.querySelectorAll("[data-error-for]").forEach(e=>{e.textContent=""});let a={};for(let e of t){let t=o.querySelector(`[name="${e.name}"]`);t&&(a[e.name]="checkbox"===t.type?t.checked:t.value)}try{let e=await n(a);r(e)}catch(e){if(e.details)for(let[t,a]of Object.entries(e.details)){let e=o.querySelector(`[data-error-for="${t}"]`);e&&(e.textContent=a)}d(e.message,"error")}}),o.showModal(),o.querySelector("input, select, textarea")?.focus()})},"escapeHtml",0,s,"fillSelect",0,function(e,t,{placeholder:a="All",valueKey:n="slug",labelKey:i="name"}={}){let o=e.value;e.innerHTML=(a?`<option value="">${s(a)}</option>`:"")+t.map(e=>`<option value="${s(e[n])}">${s(e[i])}${void 0!==e.templateCount?` (${e.templateCount})`:""}</option>`).join(""),[...e.options].some(e=>e.value===o)&&(e.value=o)},"flagsBadges",0,function(e){let t=[];return e.featured&&t.push('<span class="badge featured">featured</span>'),e.verified&&t.push('<span class="badge verified">verified</span>'),t.join(" ")},"fmtDate",0,function(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})},"fmtDateTime",0,function(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":`${t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})} ${t.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}`},"fmtNumber",0,c,"get",0,i,"mountAdmin",0,function({active:e="",title:a="Dashboard",crumb:n="Admin",actions:i=""}={}){document.body.classList.add("admin-page");let r=function(){try{return JSON.parse(sessionStorage.getItem("admin:counts")||"{}")}catch{return{}}}(),d=t.map(t=>{if(t.group)return`<div class="nav-group">${s(t.group)}</div>`;let a=t.count?r[t.count]:null,n=a?`<span class="nav-count">${Number(a)}</span>`:"";return`<a href="${l(t.href)}" class="${t.key===e?"active":""}">${s(t.label)}${n}</a>`}).join("");function c(){let e=document.getElementById("admin-sidebar"),t=document.getElementById("admin-backdrop"),a=document.querySelector("[data-action='menu']");e&&e.classList.remove("open"),t&&t.classList.remove("open"),a&&a.setAttribute("aria-expanded","false")}return document.body.innerHTML=`
    <a class="skip-link" href="#admin-content">Skip to content</a>
    <div class="admin-shell">
      <aside class="admin-sidebar" id="admin-sidebar" aria-label="Admin sidebar">
        <div class="admin-sidebar-header">
          <a class="admin-brand" href="${l("/admin")}">
            <img src="${l("/assets/img/litho-wordmark.png?v=20261007-01")}" alt="" width="656" height="192">
            <span>Admin</span>
          </a>
          <button class="admin-sidebar-close" type="button" data-action="menu-close" aria-label="Close menu">✕</button>
        </div>
        <nav class="admin-nav" aria-label="Admin navigation">${d}</nav>
        <div class="admin-sidebar-foot">
          <a class="btn ghost small" href="${l("/")}" target="_blank" rel="noreferrer">View marketplace ↗</a>
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
              <div class="crumbs">${s(n)}</div>
              <h1>${s(a)}</h1>
            </div>
          </div>
          <div class="admin-actions" id="admin-actions">${i}</div>
        </header>
        <main class="admin-body" id="admin-content" tabindex="-1"></main>
      </div>
    </div>
    <div class="admin-toast" id="admin-toast" role="status" aria-live="polite"></div>
  `,document.body.addEventListener("click",e=>{let t=e.target.closest("[data-action]")?.dataset.action;"logout"===t&&(o("/api/admin/logout").catch(()=>{}),window.location.href=l("/admin/login")),"menu"===t&&function(){let e=document.getElementById("admin-sidebar"),t=document.getElementById("admin-backdrop"),a=document.querySelector("[data-action='menu']");if(!e)return;let n=e.classList.toggle("open");t&&t.classList.toggle("open",n),a&&a.setAttribute("aria-expanded",String(n))}(),"menu-close"===t&&c(),"theme"===t&&function(){let e=document.documentElement,t="light"===e.dataset.theme?"dark":"light";e.dataset.theme=t;try{localStorage.setItem("litho-theme",t)}catch{}}(),e.target.closest(".admin-nav a, .admin-brand, .admin-sidebar-foot a")&&c()}),document.addEventListener("keydown",e=>{"Escape"===e.key&&c()}),{body:document.getElementById("admin-content"),actions:document.getElementById("admin-actions"),setActions(e){document.getElementById("admin-actions").innerHTML=e}}},"post",0,o,"put",0,(e,t)=>n(e,{method:"PUT",body:t}),"queryString",0,function(e={}){let t=new URLSearchParams;for(let[a,n]of Object.entries(e))""!==n&&null!=n&&t.set(a,String(n));let a=t.toString();return a?`?${a}`:""},"renderPagination",0,function(e,{page:t,pages:a,total:n,onPage:i}){e.innerHTML=`
    <div class="pagination">
      <span>${c(n)} result${1===n?"":"s"}</span>
      <div class="pages">
        <button class="btn ghost small" type="button" data-prev ${t<=1?"disabled":""}>← Prev</button>
        <span>Page ${t} / ${a}</span>
        <button class="btn ghost small" type="button" data-next ${t>=a?"disabled":""}>Next →</button>
      </div>
    </div>
  `,e.querySelector("[data-prev]")?.addEventListener("click",()=>i(t-1)),e.querySelector("[data-next]")?.addEventListener("click",()=>i(t+1))},"requireSession",0,r,"showFormErrors",0,function(e,t={}){for(let[a,n]of(e.querySelectorAll(".field-error").forEach(e=>{e.textContent=""}),e.querySelectorAll("[aria-invalid]").forEach(e=>e.removeAttribute("aria-invalid")),Object.entries(t))){let t=e.querySelector(`[data-error-for="${a}"]`);t&&(t.textContent=n);let i=e.querySelector(`[name="${a}"]`);i&&i.setAttribute("aria-invalid","true")}},"statusBadge",0,function(e){let t=String(e||"unknown");return`<span class="badge ${s(t)}">${s(t)}</span>`},"storeCounts",0,function(e){try{sessionStorage.setItem("admin:counts",JSON.stringify(e))}catch{}},"timeAgo",0,function(e){if(!e)return"—";let t=Math.round((Date.now()-new Date(e).getTime())/1e3);if(!Number.isFinite(t))return"—";for(let[e,a]of[[31536e3,"y"],[2592e3,"mo"],[604800,"w"],[86400,"d"],[3600,"h"],[60,"m"]])if(Math.abs(t)>=e)return`${Math.round(t/e)}${a} ago`;return"just now"},"toast",0,d])}])})();