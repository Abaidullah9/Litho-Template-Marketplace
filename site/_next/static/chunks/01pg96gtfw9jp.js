(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,82926,e=>{"use strict";let t=[{group:"Overview"},{href:"/admin",key:"dashboard",label:"Dashboard"},{group:"Marketplace"},{href:"/admin/templates",key:"templates",label:"Templates"},{href:"/admin/templates/new",key:"template-new",label:"New template"},{href:"/admin/submissions",key:"submissions",label:"Submissions",count:"pendingSubmissions"},{group:"Taxonomy"},{href:"/admin/categories",key:"categories",label:"Categories"},{href:"/admin/tags",key:"tags",label:"Tags"},{href:"/admin/publishers",key:"publishers",label:"Publishers"},{group:"Insights"},{href:"/admin/analytics",key:"analytics",label:"Analytics"},{href:"/admin/registry",key:"registry",label:"Registry"},{group:"System"},{href:"/admin/admins",key:"admins",label:"Admins"},{href:"/admin/activity",key:"activity",label:"Activity"},{href:"/admin/settings",key:"settings",label:"Settings"}];class a extends Error{constructor(e,{status:t=0,code:a="error",details:n}={}){super(e),this.status=t,this.code=a,this.details=n}}async function n(e,{method:t="GET",body:s,formData:i}={}){let l,r={method:t,credentials:"same-origin",headers:{}};i?r.body=i:void 0!==s&&(r.headers["Content-Type"]="application/json",r.body=JSON.stringify(s));try{l=await fetch(e,r)}catch{throw new a("Cannot reach the server. Is it still running?",{code:"network"})}let o=await l.text(),d=null;if(o)try{d=JSON.parse(o)}catch{d=null}if(!l.ok){let t=d?.error?.message;t||(t=405===l.status||window.location.hostname.endsWith("github.io")?"GitHub Pages is static. Admin sign-in requires the Node.js server (run 'node scripts/start.js' locally at http://localhost:8787/admin).":`Request failed (${l.status})`);let n=new a(t,{status:l.status,code:d?.error?.code,details:d?.error?.details});throw 401!==l.status||e.endsWith("/login")||/\/admin\/login(\.html)?$/.test(window.location.pathname)||(window.location.href=`/admin/login?next=${encodeURIComponent(window.location.pathname)}`),n}return d}let s=e=>n(e),i=(e,t)=>n(e,{method:"POST",body:t});function l(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}async function r(){return await s("/api/admin/session")}function o(e,t=""){let a=document.getElementById("admin-toast");if(!a)return;let n=document.createElement("div");n.className=`toast-item ${t}`,n.textContent=e,a.appendChild(n),setTimeout(()=>n.remove(),4200)}function d(e){let t=Number(e||0);return t>=1e6?`${(t/1e6).toFixed(1).replace(/\.0$/,"")}m`:t>=1e4?`${(t/1e3).toFixed(1).replace(/\.0$/,"")}k`:t.toLocaleString("en-US")}e.s(["api",0,n,"confirmAction",0,function(e,{confirmLabel:t="Confirm",danger:a=!0}={}){return new Promise(n=>{let s=document.createElement("dialog");s.className="modal",s.innerHTML=`
      <div class="panel-head"><h2>Please confirm</h2></div>
      <div class="panel-body"><p style="margin:0;line-height:1.7;font-size:13px">${l(e)}</p></div>
      <div class="modal-actions">
        <button class="btn ghost" type="button" data-cancel>Cancel</button>
        <button class="btn ${a?"danger":"primary"}" type="button" data-confirm>${l(t)}</button>
      </div>
    `,document.body.appendChild(s);let i=e=>{s.close(),s.remove(),n(e)};s.querySelector("[data-cancel]").addEventListener("click",()=>i(!1)),s.querySelector("[data-confirm]").addEventListener("click",()=>i(!0)),s.addEventListener("cancel",()=>i(!1)),s.addEventListener("click",e=>{e.target===s&&i(!1)}),s.showModal()})},"debounce",0,function(e,t=250){let a;return(...n)=>{clearTimeout(a),a=setTimeout(()=>e(...n),t)}},"del",0,(e,t)=>n(e,{method:"DELETE",body:t}),"editModal",0,function({title:e,fields:t,submitLabel:a="Save",onSubmit:n}){return new Promise(s=>{let i=document.createElement("dialog");i.className="modal";let r=t.map(e=>{let t,a=`field-${e.name}`,n=l(e.value??"");return t="textarea"===e.type?`<textarea id="${a}" name="${e.name}" rows="3" placeholder="${l(e.placeholder||"")}">${n}</textarea>`:"checkbox"===e.type?`<label class="checkbox-field"><input type="checkbox" id="${a}" name="${e.name}" ${e.value?"checked":""}> ${l(e.checkboxLabel||"Enabled")}</label>`:"select"===e.type?`<select id="${a}" name="${e.name}">${(e.options||[]).map(t=>`<option value="${l(t.value)}" ${t.value===e.value?"selected":""}>${l(t.label)}</option>`).join("")}</select>`:`<input type="${e.type||"text"}" id="${a}" name="${e.name}" value="${n}" placeholder="${l(e.placeholder||"")}" ${e.required?"required":""}>`,`
        <div class="field ${e.wide?"full":""}">
          <label for="${a}">${l(e.label)}${e.required?" *":""}</label>
          ${t}
          ${e.hint?`<span class="field-hint">${l(e.hint)}</span>`:""}
          <span class="field-error" data-error-for="${e.name}"></span>
        </div>`}).join("");i.innerHTML=`
      <form method="dialog" novalidate>
        <div class="panel-head"><h2>${l(e)}</h2></div>
        <div class="panel-body"><div class="form-grid">${r}</div></div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" data-cancel>Cancel</button>
          <button class="btn primary" type="submit">${l(a)}</button>
        </div>
      </form>
    `,document.body.appendChild(i);let d=e=>{i.close(),i.remove(),s(e)};i.querySelector("[data-cancel]").addEventListener("click",()=>d(null)),i.addEventListener("cancel",()=>d(null)),i.addEventListener("click",e=>{e.target===i&&d(null)}),i.querySelector("form").addEventListener("submit",async e=>{e.preventDefault(),i.querySelectorAll("[data-error-for]").forEach(e=>{e.textContent=""});let a={};for(let e of t){let t=i.querySelector(`[name="${e.name}"]`);t&&(a[e.name]="checkbox"===t.type?t.checked:t.value)}try{let e=await n(a);d(e)}catch(e){if(e.details)for(let[t,a]of Object.entries(e.details)){let e=i.querySelector(`[data-error-for="${t}"]`);e&&(e.textContent=a)}o(e.message,"error")}}),i.showModal(),i.querySelector("input, select, textarea")?.focus()})},"escapeHtml",0,l,"fillSelect",0,function(e,t,{placeholder:a="All",valueKey:n="slug",labelKey:s="name"}={}){let i=e.value;e.innerHTML=(a?`<option value="">${l(a)}</option>`:"")+t.map(e=>`<option value="${l(e[n])}">${l(e[s])}${void 0!==e.templateCount?` (${e.templateCount})`:""}</option>`).join(""),[...e.options].some(e=>e.value===i)&&(e.value=i)},"flagsBadges",0,function(e){let t=[];return e.featured&&t.push('<span class="badge featured">featured</span>'),e.verified&&t.push('<span class="badge verified">verified</span>'),t.join(" ")},"fmtDate",0,function(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})},"fmtDateTime",0,function(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":`${t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})} ${t.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}`},"fmtNumber",0,d,"get",0,s,"mountAdmin",0,function({active:e="",title:a="Dashboard",crumb:n="Admin",actions:s=""}={}){document.body.classList.add("admin-page");let r=function(){try{return JSON.parse(sessionStorage.getItem("admin:counts")||"{}")}catch{return{}}}(),o=t.map(t=>{if(t.group)return`<div class="nav-group">${l(t.group)}</div>`;let a=t.count?r[t.count]:null,n=a?`<span class="nav-count">${Number(a)}</span>`:"";return`<a href="${t.href}" class="${t.key===e?"active":""}">${l(t.label)}${n}</a>`}).join("");return document.body.innerHTML=`
    <a class="skip-link" href="#admin-content">Skip to content</a>
    <div class="admin-shell">
      <aside class="admin-sidebar" id="admin-sidebar">
        <a class="admin-brand" href="/">
          <img src="/assets/img/litho-wordmark.png?v=20261007-01" alt="" width="656" height="192">
          <span>Admin</span>
        </a>
        <nav class="admin-nav" aria-label="Admin navigation">${o}</nav>
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
              <div class="crumbs">${l(n)}</div>
              <h1>${l(a)}</h1>
            </div>
          </div>
          <div class="admin-actions" id="admin-actions">${s}</div>
        </header>
        <main class="admin-body" id="admin-content" tabindex="-1"></main>
      </div>
    </div>
    <div class="admin-toast" id="admin-toast" role="status" aria-live="polite"></div>
  `,document.body.addEventListener("click",e=>{let t=e.target.closest("[data-action]")?.dataset.action;if("logout"===t&&(i("/api/admin/logout").catch(()=>{}),window.location.href="/admin/login"),"menu"===t){let t=document.getElementById("admin-sidebar").classList.toggle("open");e.target.closest("[data-action]").setAttribute("aria-expanded",String(t))}"theme"===t&&function(){let e=document.documentElement,t="light"===e.dataset.theme?"dark":"light";e.dataset.theme=t;try{localStorage.setItem("litho-theme",t)}catch{}}()}),{body:document.getElementById("admin-content"),actions:document.getElementById("admin-actions"),setActions(e){document.getElementById("admin-actions").innerHTML=e}}},"post",0,i,"put",0,(e,t)=>n(e,{method:"PUT",body:t}),"queryString",0,function(e={}){let t=new URLSearchParams;for(let[a,n]of Object.entries(e))""!==n&&null!=n&&t.set(a,String(n));let a=t.toString();return a?`?${a}`:""},"renderPagination",0,function(e,{page:t,pages:a,total:n,onPage:s}){e.innerHTML=`
    <div class="pagination">
      <span>${d(n)} result${1===n?"":"s"}</span>
      <div class="pages">
        <button class="btn ghost small" type="button" data-prev ${t<=1?"disabled":""}>← Prev</button>
        <span>Page ${t} / ${a}</span>
        <button class="btn ghost small" type="button" data-next ${t>=a?"disabled":""}>Next →</button>
      </div>
    </div>
  `,e.querySelector("[data-prev]")?.addEventListener("click",()=>s(t-1)),e.querySelector("[data-next]")?.addEventListener("click",()=>s(t+1))},"requireSession",0,r,"showFormErrors",0,function(e,t={}){for(let[a,n]of(e.querySelectorAll(".field-error").forEach(e=>{e.textContent=""}),e.querySelectorAll("[aria-invalid]").forEach(e=>e.removeAttribute("aria-invalid")),Object.entries(t))){let t=e.querySelector(`[data-error-for="${a}"]`);t&&(t.textContent=n);let s=e.querySelector(`[name="${a}"]`);s&&s.setAttribute("aria-invalid","true")}},"statusBadge",0,function(e){let t=String(e||"unknown");return`<span class="badge ${l(t)}">${l(t)}</span>`},"storeCounts",0,function(e){try{sessionStorage.setItem("admin:counts",JSON.stringify(e))}catch{}},"timeAgo",0,function(e){if(!e)return"—";let t=Math.round((Date.now()-new Date(e).getTime())/1e3);if(!Number.isFinite(t))return"—";for(let[e,a]of[[31536e3,"y"],[2592e3,"mo"],[604800,"w"],[86400,"d"],[3600,"h"],[60,"m"]])if(Math.abs(t)>=e)return`${Math.round(t/e)}${a} ago`;return"just now"},"toast",0,o])},93489,e=>{e.v(e=>Promise.resolve().then(()=>e(82926)))},70057,e=>e.a(async(t,a)=>{try{var n=e.i(82926);let t=(0,n.mountAdmin)({active:"settings",title:"Settings",crumb:"Admin / System / Settings"});await (0,n.requireSession)(),t.body.innerHTML=`
  <div class="notice">
    Configure marketplace settings and preferences. Application secrets are managed securely and never exposed.
  </div>
  <div id="service-status"></div>
  <section class="panel">
    <div class="panel-head">
      <h2>Stored settings</h2>
      <button class="btn primary" type="button" id="add-setting">+ Add setting</button>
    </div>
    <div class="table-scroll">
      <table class="data-table">
        <thead><tr><th style="width:220px">Key</th><th>Value (JSON or plain text)</th><th></th></tr></thead>
        <tbody id="settings-body"></tbody>
      </table>
    </div>
    <div class="empty" id="settings-empty" hidden>
      <h3>No settings stored</h3>
      <p>Add a key to start — for example <code>marketplace.tagline</code>.</p>
    </div>
  </section>
`;let l=document.getElementById("settings-body"),r=document.getElementById("settings-empty");async function s(){try{let e=await (0,n.get)("/api/admin/settings"),t=Object.entries(e);if(!t.length){l.innerHTML="",r.hidden=!1;return}l.innerHTML=t.map(([e,t])=>`
      <tr data-key="${(0,n.escapeHtml)(e)}">
        <td style="font-family:var(--mono);font-size:11px">${(0,n.escapeHtml)(e)}</td>
        <td><textarea rows="2" name="value">${(0,n.escapeHtml)(JSON.stringify(t,null,2))}</textarea></td>
        <td class="actions">
          <div class="btn-row" style="justify-content:flex-end">
            <button class="btn small" type="button" data-save>Save</button>
            <button class="btn ghost small" type="button" data-clear>Clear</button>
          </div>
        </td>
      </tr>`).join("")}catch(e){l.innerHTML=`<tr><td colspan="3" style="color:#f18c75;padding:24px">${(0,n.escapeHtml)(e.message)}</td></tr>`}}function i(e){try{return JSON.parse(e)}catch{return e}}(0,n.get)("/api/health").then(e=>{document.getElementById("service-status").innerHTML=`
    <div class="stat-grid">
      <div class="stat-card ${e.supabase?"accent":""}">
        <span class="stat-label">Supabase</span>
        <span class="stat-value" style="font-size:15px">${e.supabase?"connected":"not configured"}</span>
        <span class="stat-note">source of truth</span>
      </div>
      <div class="stat-card ${e.admin?"accent":""}">
        <span class="stat-label">Admin auth</span>
        <span class="stat-value" style="font-size:15px">${e.admin?"configured":"not configured"}</span>
        <span class="stat-note">ADMIN_PASSWORD</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Server time</span>
        <span class="stat-value" style="font-size:15px">${(0,n.fmtDateTime)(e.time)}</span>
        <span class="stat-note">${(0,n.escapeHtml)(e.status)}</span>
      </div>
    </div>`}).catch(()=>{}),l.addEventListener("click",async e=>{let t=e.target.closest("tr[data-key]");if(!t)return;let a=t.dataset.key;if(e.target.closest("[data-save]")){let e=i(t.querySelector("textarea").value);try{await (0,n.put)("/api/admin/settings",{[a]:e}),(0,n.toast)(`Saved ${a}`,"success"),s()}catch(e){(0,n.toast)(e.message,"error")}}if(e.target.closest("[data-clear]"))try{await (0,n.put)("/api/admin/settings",{[a]:null}),(0,n.toast)(`Cleared ${a}`,"success"),s()}catch(e){(0,n.toast)(e.message,"error")}}),document.getElementById("add-setting").addEventListener("click",async()=>{let{editModal:t}=await e.A(93489);await t({title:"New setting",fields:[{name:"key",label:"Key",required:!0,placeholder:"marketplace.tagline"},{name:"value",label:"Value",type:"textarea",placeholder:'{"text":"Discover templates"}'}],submitLabel:"Save setting",onSubmit:e=>(0,n.put)("/api/admin/settings",{[e.key.trim()]:i(e.value)})})&&((0,n.toast)("Setting saved","success"),s())}),await s(),e.s([]),a()}catch(e){a(e)}},!0)]);