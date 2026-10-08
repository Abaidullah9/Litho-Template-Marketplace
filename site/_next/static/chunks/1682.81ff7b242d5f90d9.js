"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1682],{1682:(e,t,a)=>{a.a(e,async(e,i)=>{try{a.r(t);var n=a(2546);let e=new URLSearchParams(window.location.search).get("id")||"",d=!e,c=(0,n.mountAdmin)({active:d?"template-new":"templates",title:d?"New template":"Edit template",crumb:"Admin / Marketplace / Editor",actions:`
    <a class="btn ghost" href="/admin/templates">← Back</a>
    ${d?"":'<button class="btn danger" type="button" data-action="delete">Delete</button>'}
  `});await (0,n.requireSession)(),c.body.innerHTML=`
  <div id="form-notice"></div>
  <form id="template-form" novalidate>
    <section class="panel">
      <div class="panel-head"><h2>Identity</h2><span id="record-meta" class="field-hint"></span></div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="field">
            <label for="name">Template name *</label>
            <input type="text" id="name" name="name" maxlength="160" required placeholder="IEEE Conference Paper">
            <span class="field-error" data-error-for="name"></span>
          </div>
          <div class="field">
            <label for="slug">Slug *</label>
            <input type="text" id="slug" name="slug" maxlength="80" placeholder="ieee-conference-paper">
            <span class="field-hint">Leave empty to derive it from the name.</span>
            <span class="field-error" data-error-for="slug"></span>
          </div>
          <div class="field full">
            <label for="description">Short description *</label>
            <textarea id="description" name="description" rows="3" maxlength="600" placeholder="One or two sentences shown on cards and in search results."></textarea>
            <span class="field-error" data-error-for="description"></span>
          </div>
          <div class="field full">
            <label for="longDescription">Full description</label>
            <textarea id="longDescription" name="longDescription" class="tall" rows="12" placeholder="Everything a visitor should know: structure, contents, requirements, licence notes."></textarea>
            <span class="field-error" data-error-for="longDescription"></span>
          </div>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head"><h2>Taxonomy</h2></div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="field">
            <label for="categoryId">Category</label>
            <select id="categoryId" name="categoryId"><option value="">Uncategorised</option></select>
            <span class="field-error" data-error-for="categoryId"></span>
          </div>
          <div class="field">
            <label for="publisherId">Publisher</label>
            <select id="publisherId" name="publisherId"><option value="">No publisher</option></select>
            <span class="field-error" data-error-for="publisherId"></span>
          </div>
          <div class="field full">
            <label for="tags">Tags</label>
            <input type="text" id="tags" name="tags" placeholder="LaTeX, Research, University">
            <span class="field-hint">Comma separated. New tags are created automatically.</span>
            <span class="field-error" data-error-for="tags"></span>
          </div>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head"><h2>Links and files</h2></div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="field">
            <label for="version">Version</label>
            <input type="text" id="version" name="version" placeholder="1.0.0">
            <span class="field-error" data-error-for="version"></span>
          </div>
          <div class="field">
            <label for="license">Licence</label>
            <input type="text" id="license" name="license" placeholder="MIT">
            <span class="field-error" data-error-for="license"></span>
          </div>
          <div class="field">
            <label for="downloadUrl">Download URL</label>
            <input type="url" id="downloadUrl" name="downloadUrl" placeholder="/assets/templates/ieee.tex or https://…">
            <span class="field-error" data-error-for="downloadUrl"></span>
          </div>
          <div class="field">
            <label for="repositoryUrl">Repository URL</label>
            <input type="url" id="repositoryUrl" name="repositoryUrl" placeholder="https://github.com/…">
            <span class="field-error" data-error-for="repositoryUrl"></span>
          </div>
          <div class="field">
            <label for="documentationUrl">Documentation URL</label>
            <input type="url" id="documentationUrl" name="documentationUrl" placeholder="https://…">
            <span class="field-error" data-error-for="documentationUrl"></span>
          </div>
          <div class="field">
            <label for="previewImageUrl">Preview image URL</label>
            <input type="url" id="previewImageUrl" name="previewImage" placeholder="/assets/img/templates/…">
            <span class="field-error" data-error-for="previewImage"></span>
          </div>
          <div class="field">
            <label for="previewImage">Upload preview image</label>
            <input type="file" id="previewImage" name="previewImageFile" accept="image/*">
            <span class="field-hint">PNG, JPG, WebP or AVIF \xb7 max 15 MB. Replaces the URL.</span>
          </div>
          <div class="field">
            <label for="previewImages">Additional images</label>
            <input type="text" id="previewImages" name="previewImages" placeholder="/assets/img/…, /assets/img/…">
            <span class="field-error" data-error-for="previewImages"></span>
          </div>
          <div class="field">
            <label for="sampleFileUrl">Sample file URL</label>
            <input type="url" id="sampleFileUrl" name="sampleFile" placeholder="/assets/templates/…">
            <span class="field-error" data-error-for="sampleFile"></span>
          </div>
          <div class="field">
            <label for="sampleFile">Upload sample file</label>
            <input type="file" id="sampleFile" name="sampleFileFile" accept=".pdf,.zip,.txt,.tex,.md,application/pdf,application/zip">
            <span class="field-hint">PDF, ZIP or TXT \xb7 max 15 MB.</span>
          </div>
          <div class="field full">
            <div id="preview-thumb" style="margin-top:4px"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head"><h2>Publishing</h2></div>
      <div class="panel-body">
        <div class="form-grid">
          <div class="field">
            <label for="status">Status *</label>
            <select id="status" name="status">
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
            <span class="field-hint">Only published templates appear in the marketplace and registry.</span>
            <span class="field-error" data-error-for="status"></span>
          </div>
          <div class="field">
            <label>Placement</label>
            <label class="checkbox-field" style="min-height:34px"><input type="checkbox" id="featured" name="featured"> Featured on the homepage</label>
            <span class="field-error" data-error-for="featured"></span>
          </div>
          <div class="field">
            <label>Verification</label>
            <div id="verification-state" class="field-hint">—</div>
            <div class="btn-row" style="margin-top:8px">
              <button class="btn small" type="button" data-action="verify">Verify</button>
              <button class="btn ghost small" type="button" data-action="unverify">Remove verification</button>
            </div>
          </div>
        </div>
        <div class="form-actions" style="margin-top:16px">
          <button class="btn primary" type="submit">${d?"Create template":"Save changes"}</button>
          ${d?"":'<button class="btn" type="button" data-action="publish">Save & publish</button>'}
          <a class="btn ghost" href="/admin/templates">Cancel</a>
        </div>
      </div>
    </section>
  </form>
`;let p=document.getElementById("template-form"),m=null,u=!1,[v,f]=await Promise.all([(0,n.get)("/api/admin/categories").catch(()=>[]),(0,n.get)("/api/admin/publishers").catch(()=>[])]);if(document.getElementById("categoryId").insertAdjacentHTML("beforeend",v.map(e=>`<option value="${(0,n.escapeHtml)(e.id)}">${(0,n.escapeHtml)(e.name)}${void 0!==e.templateCount?` (${e.templateCount})`:""}</option>`).join("")),document.getElementById("publisherId").insertAdjacentHTML("beforeend",f.map(e=>`<option value="${(0,n.escapeHtml)(e.id)}">${(0,n.escapeHtml)(e.name)}</option>`).join("")),!d)try{m=await (0,n.get)(`/api/admin/templates/${encodeURIComponent(e)}`)}catch(e){document.getElementById("form-notice").innerHTML=`<div class="notice error">${(0,n.escapeHtml)(e.message)}</div>`}function l(){let e=document.getElementById("verification-state");if(!m){e.textContent="Available after the template is created.";return}e.innerHTML=`
    <span class="badge ${m.verified?"verified":""}">${m.verified?"verified":"unverified"}</span>
    <div style="margin-top:6px">method: ${(0,n.escapeHtml)(m.verification_method||"manual")}<br>
    ${(0,n.escapeHtml)(m.verification_reason||"no reason recorded")}</div>
  `}function r(){let e=p.previewImage.value;document.getElementById("preview-thumb").innerHTML=e?`<img src="${(0,n.escapeHtml)(e)}" alt="Preview" style="width:min(420px,100%);border:1px solid var(--line);display:block">`:""}function s(){return{name:p.name.value.trim(),slug:p.slug.value.trim(),description:p.description.value.trim(),longDescription:p.longDescription.value.trim(),categoryId:p.categoryId.value||null,publisherId:p.publisherId.value||null,tags:p.tags.value,version:p.version.value.trim(),license:p.license.value.trim(),downloadUrl:p.downloadUrl.value.trim(),repositoryUrl:p.repositoryUrl.value.trim(),documentationUrl:p.documentationUrl.value.trim(),previewImage:p.previewImage.value.trim(),previewImages:p.previewImages.value,sampleFile:p.sampleFile.value.trim(),status:p.status.value,featured:p.featured.checked}}async function o({publish:t=!1}={}){(0,n.showFormErrors)(p);let a=s();t&&(a.status="published");let{formData:i}=function(){let e=s(),t=p.previewImageFile.files[0],a=p.sampleFileFile.files[0];if(!t&&!a)return{body:e};let i=new FormData;for(let[t,a]of Object.entries(e))i.set(t,null==a?"":String(a));return t&&i.set("previewImage",t),a&&i.set("sampleFile",a),{formData:i}}();try{let t=d?await (0,n.api)("/api/admin/templates",{method:"POST",body:a,...i?{formData:i}:{}}):await (0,n.api)(`/api/admin/templates/${encodeURIComponent(e)}`,{method:"PUT",body:a,...i?{formData:i}:{}});(0,n.toast)(d?"Template created":"Template saved","success"),window.location.href=`/admin/templates/new?id=${encodeURIComponent(t.id||e)}`}catch(e){(0,n.showFormErrors)(p,e.details||{}),(0,n.toast)(e.message,"error")}}m?(p.name.value=m.name||"",p.slug.value=m.slug||"",p.description.value=m.description||"",p.longDescription.value=m.long_description||"",p.categoryId.value=m.category_id||"",p.publisherId.value=m.publisher_id||"",p.version.value=m.version||"1.0.0",p.license.value=m.license||"",p.downloadUrl.value=m.download_url||"",p.repositoryUrl.value=m.repository_url||"",p.documentationUrl.value=m.documentation_url||"",p.previewImage.value=m.preview_image||"",p.previewImages.value=(m.preview_images||[]).join(", "),p.sampleFile.value=m.sample_file||"",p.status.value=m.status||"draft",p.featured.checked=!!m.featured,u=!0,document.getElementById("record-meta").textContent=`created ${(0,n.fmtDateTime)(m.created_at)} \xb7 updated ${(0,n.fmtDateTime)(m.updated_at)} \xb7 ${m.views} views / ${m.downloads} downloads`,l(),r()):(document.getElementById("record-meta").textContent="new record",l()),p.previewImage.addEventListener("change",r),p.name.addEventListener("input",()=>{!u&&d&&(p.slug.value=p.name.value.toLowerCase().replace(/[^a-z0-9.]+/g,"-").replace(/^[.-]+|[.-]+$/g,"").slice(0,80))}),p.slug.addEventListener("input",()=>{u=!0}),p.addEventListener("submit",e=>{e.preventDefault(),o()}),c.actions.addEventListener("click",async e=>{let t=e.target.closest("[data-action]")?.dataset.action;if(t){if("publish"===t&&await o({publish:!0}),"verify"===t||"unverify"===t){if(!m)return(0,n.toast)("Save the template first.","error");try{m=await (0,n.post)(`/api/admin/templates/${encodeURIComponent(m.id)}/${t}`,{}),l(),(0,n.toast)("verify"===t?"Template verified":"Verification removed","success")}catch(e){(0,n.toast)(e.message,"error")}}if("delete"===t){if(!m||!await (0,n.confirmAction)("Delete this template permanently? This cannot be undone.",{confirmLabel:"Delete"}))return;try{await (0,n.del)(`/api/admin/templates/${encodeURIComponent(m.id)}`),(0,n.toast)("Template deleted","success"),window.location.href="/admin/templates"}catch(e){(0,n.toast)(e.message,"error")}}}}),i()}catch(e){i(e)}},1)},2546:(e,t,a)=>{a.r(t),a.d(t,{ApiError:()=>n,api:()=>l,confirmAction:()=>h,debounce:()=>S,del:()=>d,editModal:()=>g,escapeHtml:()=>c,fillSelect:()=>L,flagsBadges:()=>x,fmtDate:()=>y,fmtDateTime:()=>w,fmtNumber:()=>b,get:()=>r,mountAdmin:()=>m,post:()=>s,put:()=>o,queryString:()=>p,renderPagination:()=>k,requireSession:()=>v,showFormErrors:()=>E,statusBadge:()=>I,storeCounts:()=>u,timeAgo:()=>$,toast:()=>f});let i=[{group:"Overview"},{href:"/admin",key:"dashboard",label:"Dashboard"},{group:"Marketplace"},{href:"/admin/templates",key:"templates",label:"Templates"},{href:"/admin/templates/new",key:"template-new",label:"New template"},{href:"/admin/submissions",key:"submissions",label:"Submissions",count:"pendingSubmissions"},{group:"Taxonomy"},{href:"/admin/categories",key:"categories",label:"Categories"},{href:"/admin/tags",key:"tags",label:"Tags"},{href:"/admin/publishers",key:"publishers",label:"Publishers"},{group:"Insights"},{href:"/admin/analytics",key:"analytics",label:"Analytics"},{href:"/admin/registry",key:"registry",label:"Registry"},{group:"System"},{href:"/admin/admins",key:"admins",label:"Admins"},{href:"/admin/activity",key:"activity",label:"Activity"},{href:"/admin/settings",key:"settings",label:"Settings"}];class n extends Error{constructor(e,{status:t=0,code:a="error",details:i}={}){super(e),this.status=t,this.code=a,this.details=i}}async function l(e,{method:t="GET",body:a,formData:i}={}){let r,s={method:t,credentials:"same-origin",headers:{}};i?s.body=i:void 0!==a&&(s.headers["Content-Type"]="application/json",s.body=JSON.stringify(a));try{r=await fetch(e,s)}catch{throw new n("Cannot reach the server. Is it still running?",{code:"network"})}let o=await r.text(),d=null;if(o)try{d=JSON.parse(o)}catch{d=null}if(!r.ok){let t=new n(d?.error?.message||`Request failed (${r.status})`,{status:r.status,code:d?.error?.code,details:d?.error?.details});throw 401!==r.status||e.endsWith("/login")||/\/admin\/login(\.html)?$/.test(window.location.pathname)||(window.location.href=`/admin/login?next=${encodeURIComponent(window.location.pathname)}`),t}return d}let r=e=>l(e),s=(e,t)=>l(e,{method:"POST",body:t}),o=(e,t)=>l(e,{method:"PUT",body:t}),d=(e,t)=>l(e,{method:"DELETE",body:t});function c(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function p(e={}){let t=new URLSearchParams;for(let[a,i]of Object.entries(e))""!==i&&null!=i&&t.set(a,String(i));let a=t.toString();return a?`?${a}`:""}function m({active:e="",title:t="Dashboard",crumb:a="Admin",actions:n=""}={}){document.body.classList.add("admin-page");let l=function(){try{return JSON.parse(sessionStorage.getItem("admin:counts")||"{}")}catch{return{}}}(),r=i.map(t=>{if(t.group)return`<div class="nav-group">${c(t.group)}</div>`;let a=t.count?l[t.count]:null,i=a?`<span class="nav-count">${Number(a)}</span>`:"";return`<a href="${t.href}" class="${t.key===e?"active":""}">${c(t.label)}${i}</a>`}).join("");return document.body.innerHTML=`
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
          <div class="admin-actions" id="admin-actions">${n}</div>
        </header>
        <main class="admin-body" id="admin-content" tabindex="-1"></main>
      </div>
    </div>
    <div class="admin-toast" id="admin-toast" role="status" aria-live="polite"></div>
  `,document.body.addEventListener("click",e=>{let t=e.target.closest("[data-action]")?.dataset.action;if("logout"===t&&(s("/api/admin/logout").catch(()=>{}),window.location.href="/admin/login"),"menu"===t){let t=document.getElementById("admin-sidebar").classList.toggle("open");e.target.closest("[data-action]").setAttribute("aria-expanded",String(t))}"theme"===t&&function(){let e=document.documentElement,t="light"===e.dataset.theme?"dark":"light";e.dataset.theme=t;try{localStorage.setItem("litho-theme",t)}catch{}}()}),{body:document.getElementById("admin-content"),actions:document.getElementById("admin-actions"),setActions(e){document.getElementById("admin-actions").innerHTML=e}}}function u(e){try{sessionStorage.setItem("admin:counts",JSON.stringify(e))}catch{}}async function v(){return await r("/api/admin/session")}function f(e,t=""){let a=document.getElementById("admin-toast");if(!a)return;let i=document.createElement("div");i.className=`toast-item ${t}`,i.textContent=e,a.appendChild(i),setTimeout(()=>i.remove(),4200)}function h(e,{confirmLabel:t="Confirm",danger:a=!0}={}){return new Promise(i=>{let n=document.createElement("dialog");n.className="modal",n.innerHTML=`
      <div class="panel-head"><h2>Please confirm</h2></div>
      <div class="panel-body"><p style="margin:0;line-height:1.7;font-size:13px">${c(e)}</p></div>
      <div class="modal-actions">
        <button class="btn ghost" type="button" data-cancel>Cancel</button>
        <button class="btn ${a?"danger":"primary"}" type="button" data-confirm>${c(t)}</button>
      </div>
    `,document.body.appendChild(n);let l=e=>{n.close(),n.remove(),i(e)};n.querySelector("[data-cancel]").addEventListener("click",()=>l(!1)),n.querySelector("[data-confirm]").addEventListener("click",()=>l(!0)),n.addEventListener("cancel",()=>l(!1)),n.addEventListener("click",e=>{e.target===n&&l(!1)}),n.showModal()})}function g({title:e,fields:t,submitLabel:a="Save",onSubmit:i}){return new Promise(n=>{let l=document.createElement("dialog");l.className="modal";let r=t.map(e=>{let t,a=`field-${e.name}`,i=c(e.value??"");return t="textarea"===e.type?`<textarea id="${a}" name="${e.name}" rows="3" placeholder="${c(e.placeholder||"")}">${i}</textarea>`:"checkbox"===e.type?`<label class="checkbox-field"><input type="checkbox" id="${a}" name="${e.name}" ${e.value?"checked":""}> ${c(e.checkboxLabel||"Enabled")}</label>`:"select"===e.type?`<select id="${a}" name="${e.name}">${(e.options||[]).map(t=>`<option value="${c(t.value)}" ${t.value===e.value?"selected":""}>${c(t.label)}</option>`).join("")}</select>`:`<input type="${e.type||"text"}" id="${a}" name="${e.name}" value="${i}" placeholder="${c(e.placeholder||"")}" ${e.required?"required":""}>`,`
        <div class="field ${e.wide?"full":""}">
          <label for="${a}">${c(e.label)}${e.required?" *":""}</label>
          ${t}
          ${e.hint?`<span class="field-hint">${c(e.hint)}</span>`:""}
          <span class="field-error" data-error-for="${e.name}"></span>
        </div>`}).join("");l.innerHTML=`
      <form method="dialog" novalidate>
        <div class="panel-head"><h2>${c(e)}</h2></div>
        <div class="panel-body"><div class="form-grid">${r}</div></div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" data-cancel>Cancel</button>
          <button class="btn primary" type="submit">${c(a)}</button>
        </div>
      </form>
    `,document.body.appendChild(l);let s=e=>{l.close(),l.remove(),n(e)};l.querySelector("[data-cancel]").addEventListener("click",()=>s(null)),l.addEventListener("cancel",()=>s(null)),l.addEventListener("click",e=>{e.target===l&&s(null)}),l.querySelector("form").addEventListener("submit",async e=>{e.preventDefault(),l.querySelectorAll("[data-error-for]").forEach(e=>{e.textContent=""});let a={};for(let e of t){let t=l.querySelector(`[name="${e.name}"]`);t&&(a[e.name]="checkbox"===t.type?t.checked:t.value)}try{let e=await i(a);s(e)}catch(e){if(e.details)for(let[t,a]of Object.entries(e.details)){let e=l.querySelector(`[data-error-for="${t}"]`);e&&(e.textContent=a)}f(e.message,"error")}}),l.showModal(),l.querySelector("input, select, textarea")?.focus()})}function b(e){let t=Number(e||0);return t>=1e6?`${(t/1e6).toFixed(1).replace(/\.0$/,"")}m`:t>=1e4?`${(t/1e3).toFixed(1).replace(/\.0$/,"")}k`:t.toLocaleString("en-US")}function y(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}function w(e){if(!e)return"—";let t=new Date(e);return Number.isNaN(t.getTime())?"—":`${t.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})} ${t.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}`}function $(e){if(!e)return"—";let t=Math.round((Date.now()-new Date(e).getTime())/1e3);if(!Number.isFinite(t))return"—";for(let[e,a]of[[31536e3,"y"],[2592e3,"mo"],[604800,"w"],[86400,"d"],[3600,"h"],[60,"m"]])if(Math.abs(t)>=e)return`${Math.round(t/e)}${a} ago`;return"just now"}function I(e){let t=String(e||"unknown");return`<span class="badge ${c(t)}">${c(t)}</span>`}function x(e){let t=[];return e.featured&&t.push('<span class="badge featured">featured</span>'),e.verified&&t.push('<span class="badge verified">verified</span>'),t.join(" ")}function k(e,{page:t,pages:a,total:i,onPage:n}){e.innerHTML=`
    <div class="pagination">
      <span>${b(i)} result${1===i?"":"s"}</span>
      <div class="pages">
        <button class="btn ghost small" type="button" data-prev ${t<=1?"disabled":""}>← Prev</button>
        <span>Page ${t} / ${a}</span>
        <button class="btn ghost small" type="button" data-next ${t>=a?"disabled":""}>Next →</button>
      </div>
    </div>
  `,e.querySelector("[data-prev]")?.addEventListener("click",()=>n(t-1)),e.querySelector("[data-next]")?.addEventListener("click",()=>n(t+1))}function E(e,t={}){for(let[a,i]of(e.querySelectorAll(".field-error").forEach(e=>{e.textContent=""}),e.querySelectorAll("[aria-invalid]").forEach(e=>e.removeAttribute("aria-invalid")),Object.entries(t))){let t=e.querySelector(`[data-error-for="${a}"]`);t&&(t.textContent=i);let n=e.querySelector(`[name="${a}"]`);n&&n.setAttribute("aria-invalid","true")}}function S(e,t=250){let a;return(...i)=>{clearTimeout(a),a=setTimeout(()=>e(...i),t)}}function L(e,t,{placeholder:a="All",valueKey:i="slug",labelKey:n="name"}={}){let l=e.value;e.innerHTML=(a?`<option value="">${c(a)}</option>`:"")+t.map(e=>`<option value="${c(e[i])}">${c(e[n])}${void 0!==e.templateCount?` (${e.templateCount})`:""}</option>`).join(""),[...e.options].some(e=>e.value===l)&&(e.value=l)}}}]);