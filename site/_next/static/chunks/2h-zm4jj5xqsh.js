(()=>{"use strict";(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,82926,e=>{let t=[{group:"Overview"},{href:"/admin",key:"dashboard",label:"Dashboard"},{group:"Marketplace"},{href:"/admin/templates",key:"templates",label:"Templates"},{href:"/admin/templates/new",key:"template-new",label:"New template"},{href:"/admin/submissions",key:"submissions",label:"Submissions",count:"pendingSubmissions"},{group:"Taxonomy"},{href:"/admin/categories",key:"categories",label:"Categories"},{href:"/admin/tags",key:"tags",label:"Tags"},{href:"/admin/publishers",key:"publishers",label:"Publishers"},{group:"Insights"},{href:"/admin/analytics",key:"analytics",label:"Analytics"},{href:"/admin/registry",key:"registry",label:"Registry"},{group:"System"},{href:"/admin/admins",key:"admins",label:"Admins"},{href:"/admin/activity",key:"activity",label:"Activity"},{href:"/admin/settings",key:"settings",label:"Settings"}];class a extends Error{constructor(e,{status:t=0,code:a="error",details:n}={}){super(e),this.status=t,this.code=a,this.details=n}}async function n(e,{method:t="GET",body:i,formData:l}={}){let s,r={method:t,credentials:"same-origin",headers:{}};l?r.body=l:void 0!==i&&(r.headers["Content-Type"]="application/json",r.body=JSON.stringify(i));try{s=await fetch(e,r)}catch{throw new a("Cannot reach the server. Is it still running?",{code:"network"})}let o=await s.text(),d=null;if(o)try{d=JSON.parse(o)}catch{d=null}if(!s.ok){let t=d?.error?.message;t||(t=405===s.status||window.location.hostname.endsWith("github.io")?"GitHub Pages is static. Admin sign-in requires the Node.js server (run 'node scripts/start.js' locally at http://localhost:8787/admin).":`Request failed (${s.status})`);let n=new a(t,{status:s.status,code:d?.error?.code,details:d?.error?.details});throw 401!==s.status||e.endsWith("/login")||/\/admin\/login(\.html)?$/.test(window.location.pathname)||(window.location.href=`/admin/login?next=${encodeURIComponent(window.location.pathname)}`),n}return d}let i=e=>n(e),l=(e,t)=>n(e,{method:"POST",body:t});function s(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}async function r(){return await i("/api/admin/session")}function o(e,t=""){let a=document.getElementById("admin-toast");if(!a)return;let n=document.createElement("div");n.className=`toast-item ${t}`,n.textContent=e,a.appendChild(n),setTimeout(()=>n.remove(),4200)}function d(e){let t=Number(e||0);return t>=1e6?`${(t/1e6).toFixed(1).replace(/\.0$/,"")}m`:t>=1e4?`${(t/1e3).toFixed(1).replace(/\.0$/,"")}k`:t.toLocaleString("en-US")}e.s(["api",0,n,"confirmAction",0,function(e,{confirmLabel:t="Confirm",danger:a=!0}={}){return new Promise(n=>{let i=document.createElement("dialog");i.className="modal",i.innerHTML=`
      <div class="panel-head"><h2>Please confirm</h2></div>
      <div class="panel-body"><p style="margin:0;line-height:1.7;font-size:13px">${s(e)}</p></div>
      <div class="modal-actions">
        <button class="btn ghost" type="button" data-cancel>Cancel</button>
        <button class="btn ${a?"danger":"primary"}" type="button" data-confirm>${s(t)}</button>
      </div>
    `,document.body.appendChild(i);let l=e=>{i.close(),i.remove(),n(e)};i.querySelector("[data-cancel]").addEventListener("click",()=>l(!1)),i.querySelector("[data-confirm]").addEventListener("click",()=>l(!0)),i.addEventListener("cancel",()=>l(!1)),i.addEventListener("click",e=>{e.target===i&&l(!1)}),i.showModal()})},"debounce",0,function(e,t=250){let a;return(...n)=>{clearTimeout(a),a=setTimeout(()=>e(...n),t)}},"del",0,(e,t)=>n(e,{method:"DELETE",body:t}),"editModal",0,function({title:e,fields:t,submitLabel:a="Save",onSubmit:n}){return new Promise(i=>{let l=document.createElement("dialog");l.className="modal";let r=t.map(e=>{let t,a=`field-${e.name}`,n=s(e.value??"");return t="textarea"===e.type?`<textarea id="${a}" name="${e.name}" rows="3" placeholder="${s(e.placeholder||"")}">${n}</textarea>`:"checkbox"===e.type?`<label class="checkbox-field"><input type="checkbox" id="${a}" name="${e.name}" ${e.value?"checked":""}> ${s(e.checkboxLabel||"Enabled")}</label>`:"select"===e.type?`<select id="${a}" name="${e.name}">${(e.options||[]).map(t=>`<option value="${s(t.value)}" ${t.value===e.value?"selected":""}>${s(t.label)}</option>`).join("")}</select>`:`<input type="${e.type||"text"}" id="${a}" name="${e.name}" value="${n}" placeholder="${s(e.placeholder||"")}" ${e.required?"required":""}>`,`
        <div class="field ${e.wide?"full":""}">
          <label for="${a}">${s(e.label)}${e.required?" *":""}</label>
          ${t}
          ${e.hint?`<span class="field-hint">${s(e.hint)}</span>`:""}
          <span class="field-error" data-error-for="${e.name}"></span>
        </div>`}).join("");l.innerHTML=`
      <form method="dialog" novalidate>
        <div class="panel-head"><h2>${s(e)}</h2></div>
        <div class="panel-body"><div class="form-grid">${r}</div></div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" data-cancel>Cancel</button>
          <button class="btn primary" type="submit">${s(a)}</button>
        </div>
      </form>
    `,document.body.appendChild(l);let d=e=>{l.close(),l.remove(),i(e)};l.querySelector("[data-cancel]").addEventListener("click",()=>d(null)),l.addEventListener("cancel",()=>d(null)),l.addEventListener("click",e=>{e.target===l&&d(null)}),l.querySelector("form").addEventListener("submit",async e=>{e.preventDefault(),l.querySelectorAll("[data-error-for]").forEach(e=>{e.textContent=""});let a={};for(let e of t){let t=l.querySelector(`[name="${e.name}"]`);t&&(a[e.name]="checkbox"===t.type?t.checked:t.value)}try{let e=await n(a);d(e)}catch(e){if(e.details)for(let[t,a]of Object.entries(e.details)){let e=l.querySelector(`[data-error-for="${t}"]`);e&&(e.textContent=a)}o(e.message,"error")}}),l.showModal(),l.querySelector("input, select, textarea")?.focus()})},"escapeHtml",0,s,"fillSelect",0,function(e,t,{placeholder:a="All",valueKey:n="slug",labelKey:i="name"}={}){let l=e.value;e.innerHTML=(a?`<option value="">${s(a)}</option>`:"")+t.map(e=>`<option value="${s(e[n])}">${s(e[i])}${void 0!==e.templateCount?` (${e.templateCount})`:""}</option>`).join(""),[...e.options].some(e=>e.value===l)&&(e.value=l)},"flagsBadges",0,function(e){let t=[];return e.featured&&t.push('<span class="badge featured">featured</span>'),e.verified&&t.push('<span class="badge verified">verified</span>'),t.join(" ")},"fmtDate",0,function(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})},"fmtDateTime",0,function(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":`${t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})} ${t.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}`},"fmtNumber",0,d,"get",0,i,"mountAdmin",0,function({active:e="",title:a="Dashboard",crumb:n="Admin",actions:i=""}={}){document.body.classList.add("admin-page");let r=function(){try{return JSON.parse(sessionStorage.getItem("admin:counts")||"{}")}catch{return{}}}(),o=t.map(t=>{if(t.group)return`<div class="nav-group">${s(t.group)}</div>`;let a=t.count?r[t.count]:null,n=a?`<span class="nav-count">${Number(a)}</span>`:"";return`<a href="${t.href}" class="${t.key===e?"active":""}">${s(t.label)}${n}</a>`}).join("");return document.body.innerHTML=`
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
  `,document.body.addEventListener("click",e=>{let t=e.target.closest("[data-action]")?.dataset.action;if("logout"===t&&(l("/api/admin/logout").catch(()=>{}),window.location.href="/admin/login"),"menu"===t){let t=document.getElementById("admin-sidebar").classList.toggle("open");e.target.closest("[data-action]").setAttribute("aria-expanded",String(t))}"theme"===t&&function(){let e=document.documentElement,t="light"===e.dataset.theme?"dark":"light";e.dataset.theme=t;try{localStorage.setItem("litho-theme",t)}catch{}}()}),{body:document.getElementById("admin-content"),actions:document.getElementById("admin-actions"),setActions(e){document.getElementById("admin-actions").innerHTML=e}}},"post",0,l,"put",0,(e,t)=>n(e,{method:"PUT",body:t}),"queryString",0,function(e={}){let t=new URLSearchParams;for(let[a,n]of Object.entries(e))""!==n&&null!=n&&t.set(a,String(n));let a=t.toString();return a?`?${a}`:""},"renderPagination",0,function(e,{page:t,pages:a,total:n,onPage:i}){e.innerHTML=`
    <div class="pagination">
      <span>${d(n)} result${1===n?"":"s"}</span>
      <div class="pages">
        <button class="btn ghost small" type="button" data-prev ${t<=1?"disabled":""}>← Prev</button>
        <span>Page ${t} / ${a}</span>
        <button class="btn ghost small" type="button" data-next ${t>=a?"disabled":""}>Next →</button>
      </div>
    </div>
  `,e.querySelector("[data-prev]")?.addEventListener("click",()=>i(t-1)),e.querySelector("[data-next]")?.addEventListener("click",()=>i(t+1))},"requireSession",0,r,"showFormErrors",0,function(e,t={}){for(let[a,n]of(e.querySelectorAll(".field-error").forEach(e=>{e.textContent=""}),e.querySelectorAll("[aria-invalid]").forEach(e=>e.removeAttribute("aria-invalid")),Object.entries(t))){let t=e.querySelector(`[data-error-for="${a}"]`);t&&(t.textContent=n);let i=e.querySelector(`[name="${a}"]`);i&&i.setAttribute("aria-invalid","true")}},"statusBadge",0,function(e){let t=String(e||"unknown");return`<span class="badge ${s(t)}">${s(t)}</span>`},"storeCounts",0,function(e){try{sessionStorage.setItem("admin:counts",JSON.stringify(e))}catch{}},"timeAgo",0,function(e){if(!e)return"—";let t=Math.round((Date.now()-new Date(e).getTime())/1e3);if(!Number.isFinite(t))return"—";for(let[e,a]of[[31536e3,"y"],[2592e3,"mo"],[604800,"w"],[86400,"d"],[3600,"h"],[60,"m"]])if(Math.abs(t)>=e)return`${Math.round(t/e)}${a} ago`;return"just now"},"toast",0,o])},25040,e=>e.a(async(t,a)=>{try{var n=e.i(82926);let t={categories:{title:"Categories",crumb:"Admin / Taxonomy / Categories",singular:"category",endpoint:"/api/admin/categories",intro:"Categories drive the marketplace filter bar. Disable a category to hide it without deleting its templates.",fields:(e={})=>[{name:"name",label:"Name",required:!0,value:e.name||"",placeholder:"Thesis"},{name:"slug",label:"Slug",value:e.slug||"",hint:"Leave empty to derive it from the name."},{name:"description",label:"Description",type:"textarea",value:e.description||"",wide:!0,placeholder:"What belongs in this category"},{name:"sortOrder",label:"Sort order",type:"number",value:e.sort_order??0},{name:"enabled",label:"Availability",type:"checkbox",value:e.enabled??!0,checkboxLabel:"Visible in the marketplace"}],columns:["Name","Slug","Templates","State",""],cells:e=>`
      <td><span class="row-title">${(0,n.escapeHtml)(e.name)}</span><span class="row-sub">${(0,n.escapeHtml)(e.description||"")}</span></td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--muted)">${(0,n.escapeHtml)(e.slug)}</td>
      <td class="numeric">${(0,n.fmtNumber)(e.templateCount)}</td>
      <td>${e.enabled?'<span class="badge published">enabled</span>':'<span class="badge archived">disabled</span>'}</td>`,payload:e=>({name:e.name,slug:e.slug,description:e.description,sortOrder:Number(e.sortOrder)||0,enabled:!!e.enabled})},tags:{title:"Tags",crumb:"Admin / Taxonomy / Tags",singular:"tag",endpoint:"/api/admin/tags",intro:"Tags are reusable labels shared across templates and surfaced as chips on cards and detail pages.",fields:(e={})=>[{name:"name",label:"Name",required:!0,value:e.name||"",placeholder:"LaTeX"},{name:"slug",label:"Slug",value:e.slug||"",hint:"Leave empty to derive it from the name."}],columns:["Tag","Slug","Templates",""],cells:e=>`
      <td><span class="row-title">${(0,n.escapeHtml)(e.name)}</span></td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--muted)">${(0,n.escapeHtml)(e.slug)}</td>
      <td class="numeric">${(0,n.fmtNumber)(e.templateCount)}</td>`,payload:e=>({name:e.name,slug:e.slug})},publishers:{title:"Publishers",crumb:"Admin / Taxonomy / Publishers",singular:"publisher",endpoint:"/api/admin/publishers",intro:"A publisher is the reusable author profile shown on template cards and detail pages.",fields:(e={})=>[{name:"name",label:"Name",required:!0,value:e.name||"",placeholder:"Template Studio"},{name:"slug",label:"Slug",value:e.slug||"",hint:"Leave empty to derive it from the name."},{name:"websiteUrl",label:"Website",type:"url",value:e.website_url||"",placeholder:"https://…"},{name:"avatarUrl",label:"Avatar URL",type:"url",value:e.avatar_url||"",placeholder:"https://…"},{name:"description",label:"About",type:"textarea",value:e.description||"",wide:!0},{name:"enabled",label:"Availability",type:"checkbox",value:e.enabled??!0,checkboxLabel:"Visible in the marketplace"}],columns:["Publisher","Website","Templates","State",""],cells:e=>`
      <td><span class="row-title">${(0,n.escapeHtml)(e.name)}</span><span class="row-sub">${(0,n.escapeHtml)(e.slug)}</span></td>
      <td>${e.website_url?`<a class="field-hint" href="${(0,n.escapeHtml)(e.website_url)}" target="_blank" rel="noreferrer">${(0,n.escapeHtml)(e.website_url)}</a>`:'<span class="field-hint">—</span>'}</td>
      <td class="numeric">${(0,n.fmtNumber)(e.templateCount)}</td>
      <td>${e.enabled?'<span class="badge published">enabled</span>':'<span class="badge archived">disabled</span>'}</td>`,payload:e=>({name:e.name,slug:e.slug,websiteUrl:e.websiteUrl,avatarUrl:e.avatarUrl,description:e.description,enabled:!!e.enabled})}},l=location.pathname.replace(/\/$/,"").split("/").pop(),s=t[l]||t.categories,r=(0,n.mountAdmin)({active:l,title:s.title,crumb:s.crumb,actions:`<button class="btn primary" type="button" id="create-new">+ New ${s.singular}</button>`});await (0,n.requireSession)(),r.body.innerHTML=`
  <div class="notice">${(0,n.escapeHtml)(s.intro)}</div>
  <section class="panel">
    <div class="panel-head"><h2>All ${s.title.toLowerCase()}</h2><span class="field-hint" id="row-count"></span></div>
    <div class="table-scroll">
      <table class="data-table">
        <thead><tr>${s.columns.map(e=>`<th>${(0,n.escapeHtml)(e)}</th>`).join("")}</tr></thead>
        <tbody id="taxonomy-body"></tbody>
      </table>
    </div>
    <div class="empty" id="taxonomy-empty" hidden>
      <h3>No ${s.title.toLowerCase()} yet</h3>
      <p>Create the first ${s.singular} to get started.</p>
    </div>
  </section>
`;let o=document.getElementById("taxonomy-body"),d=document.getElementById("taxonomy-empty");async function i(){try{let e=await (0,n.get)(s.endpoint);if(document.getElementById("row-count").textContent=`${e.length} total`,!e.length){o.innerHTML="",d.hidden=!1;return}o.innerHTML=e.map(e=>`
      <tr data-id="${(0,n.escapeHtml)(e.id)}">
        ${s.cells(e)}
        <td class="actions">
          <div class="btn-row" style="justify-content:flex-end">
            <button class="btn small" type="button" data-edit>Edit</button>
            <button class="btn danger small" type="button" data-delete>Delete</button>
          </div>
        </td>
      </tr>`).join("")}catch(e){o.innerHTML=`<tr><td colspan="${s.columns.length+1}" style="color:#f18c75;padding:24px">${(0,n.escapeHtml)(e.message)}</td></tr>`}}document.getElementById("create-new").addEventListener("click",async()=>{await (0,n.editModal)({title:`New ${s.singular}`,fields:s.fields({}),submitLabel:"Create",onSubmit:e=>(0,n.post)(s.endpoint,s.payload(e))})&&((0,n.toast)(`${s.singular} created`,"success"),i())}),o.addEventListener("click",async e=>{let t=e.target.closest("tr[data-id]");if(!t)return;let a=t.dataset.id;if(e.target.closest("[data-edit]")){let e=await (0,n.get)(`${s.endpoint}`).then(e=>e.find(e=>e.id===a));if(!e)return(0,n.toast)("Row not found","error");await (0,n.editModal)({title:`Edit ${s.singular}`,fields:s.fields(e),submitLabel:"Save",onSubmit:e=>(0,n.put)(`${s.endpoint}/${encodeURIComponent(a)}`,s.payload(e))})&&((0,n.toast)(`${s.singular} updated`,"success"),i())}if(e.target.closest("[data-delete]")){if(!await (0,n.confirmAction)(`Delete this ${s.singular}? Templates keep existing; their ${s.singular} link is removed.`,{confirmLabel:"Delete"}))return;try{await (0,n.del)(`${s.endpoint}/${encodeURIComponent(a)}`),(0,n.toast)(`${s.singular} deleted`,"success"),i()}catch(e){(0,n.toast)(e.message,"error")}}}),await i(),e.s([]),a()}catch(e){a(e)}},!0)])})();