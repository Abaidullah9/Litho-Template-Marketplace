#!/usr/bin/env node
/**
 * Seed the marketplace with the initial template taxonomy and a small set of
 * realistic academic templates (plus their preview images and sample files).
 *
 *   node scripts/seed-marketplace.mjs [--skip-samples]
 *
 * Safe to re-run: every record is matched on slug and skipped when present.
 * Seeded records are the demo content; the Litho migration is separate.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadConfig, projectRoot, requireSupabase } from "../server/config.js";
import { createSupabase } from "../server/supabase.js";
import { slugify } from "../server/validation.js";

const CATEGORIES = [
  ["Thesis", "Degree theses, dissertations and chapter structures"],
  ["Research Paper", "Manuscripts, preprints and paper layouts"],
  ["IEEE", "IEEE conference and journal formats"],
  ["Proposal", "Project and research proposals"],
  ["Technical Report", "Structured engineering and lab reports"],
  ["Technical Book", "Books, chapters and long-form technical documents"],
  ["Journal", "Journal submissions and camera-ready layouts"],
  ["Resume/CV", "Academic and industry curricula vitae"],
  ["University", "University coursework, lab sheets and reports"],
  ["Other", "Everything that does not fit the categories above"],
];

const TAGS = ["LaTeX", "Research", "University", "UET", "IEEE", "Thesis", "Computer Science", "Engineering", "Technical", "Academic"];

const PUBLISHERS = [
  { slug: "template-studio", name: "Template Studio", description: "Clean, maintained document templates for students and researchers." },
  { slug: "campus-labs", name: "Campus Labs", description: "University-oriented layouts and report formats." },
];

const SAMPLES = [
  {
    slug: "ieee-conference-paper",
    name: "IEEE Conference Paper",
    category: "IEEE",
    publisher: "template-studio",
    tags: ["IEEE", "LaTeX", "Research"],
    description: "Two-column IEEE conference paper skeleton with author block, abstract, figures and bibliography.",
    longDescription: "A ready-to-use IEEE conference paper layout.\n\nIncludes the two-column class setup, title and author block, abstract environment, figure and table examples, an equation sample and a BibTeX bibliography so you can start writing immediately.",
    download: "ieee-conference-paper.tex",
    preview: "ieee-conference-paper.svg",
    accent: "cyan",
  },
  {
    slug: "university-thesis-report",
    name: "University Thesis Report",
    category: "Thesis",
    publisher: "template-studio",
    tags: ["Thesis", "LaTeX", "University"],
    description: "Full thesis structure: chapters, abstract, acknowledgements, table of contents and appendices.",
    longDescription: "A complete thesis skeleton covering the front matter and every chapter a supervisor expects.\n\nAbstract, acknowledgements, table of contents, list of figures, introduction, literature review, methodology, results, conclusion, references and appendices are all wired up.",
    download: "university-thesis-report.tex",
    preview: "university-thesis-report.svg",
    accent: "lime",
  },
  {
    slug: "research-paper-preprint",
    name: "Research Paper Preprint",
    category: "Research Paper",
    publisher: "template-studio",
    tags: ["Research", "Academic", "LaTeX"],
    description: "Single-column preprint layout with modern typography, structured sections and ORCID-ready author metadata.",
    longDescription: "A readable single-column preprint layout for arXiv-style submissions.\n\nStructured sections, a compact author block, figure captions that survive review, and a clean reference list.",
    download: "research-paper-preprint.tex",
    preview: "research-paper-preprint.svg",
    accent: "violet",
  },
  {
    slug: "final-year-project-proposal",
    name: "Final Year Project Proposal",
    category: "Proposal",
    publisher: "campus-labs",
    tags: ["University", "Academic", "Technical"],
    description: "Problem statement, objectives, scope, milestones and budget for an approved final year project proposal.",
    longDescription: "A proposal layout that maps directly to how supervisors grade final year projects.\n\nProblem statement, objectives, scope and limitations, methodology, milestone schedule, budget table, risks and references.",
    download: "final-year-project-proposal.tex",
    preview: "final-year-project-proposal.svg",
    accent: "amber",
  },
  {
    slug: "technical-lab-report",
    name: "Technical Lab Report",
    category: "Technical Report",
    publisher: "campus-labs",
    tags: ["Engineering", "Technical", "University"],
    description: "Aim, apparatus, procedure, observations, analysis and conclusion for laboratory and experiment reports.",
    longDescription: "The classic lab report structure, formatted for engineering courses.\n\nAim, apparatus list, procedure steps, observation tables, worked analysis with units, error discussion and conclusion.",
    download: "technical-lab-report.tex",
    preview: "technical-lab-report.svg",
    accent: "coral",
  },
  {
    slug: "academic-resume-cv",
    name: "Academic Resume / CV",
    category: "Resume/CV",
    publisher: "template-studio",
    tags: ["Academic", "University", "Research"],
    description: "One-page academic CV with education, publications, projects and skills sections.",
    longDescription: "A compact academic CV that fits one page without shrinking the type.\n\nEducation, research interests, publications, projects, coursework, skills and awards — each section optional.",
    download: "academic-resume-cv.tex",
    preview: "academic-resume-cv.svg",
    accent: "blue",
  },
  {
    slug: "journal-article-layout",
    name: "Journal Article Layout",
    category: "Journal",
    publisher: "template-studio",
    tags: ["Journal", "Research", "Academic"],
    description: "Camera-ready journal article layout with highlights, declaration and supplementary material hooks.",
    longDescription: "A journal-oriented article layout with the extra front and back matter journals require.\n\nHighlights, declaration of interest, author contributions, supplementary material and a structured reference list.",
    download: "journal-article-layout.tex",
    preview: "journal-article-layout.svg",
    accent: "mint",
  },
  {
    slug: "uet-final-year-report",
    name: "UET Final Year Report",
    category: "University",
    publisher: "campus-labs",
    tags: ["UET", "University", "LaTeX"],
    description: "Departmental final year report format with certification page, abstract, chapters and sign-off sheets.",
    longDescription: "The departmental final year report format: certification, dedication, abstract, numbered chapters, figure lists and sign-off pages.\n\nBuilt so printing a bound copy needs no manual page tweaking.",
    download: "uet-final-year-report.tex",
    preview: "uet-final-year-report.svg",
    accent: "rose",
  },
];

const ACCENTS = {
  lime: ["#b7ef51", "#0d1206"],
  violet: ["#a78bfa", "#0f0b1a"],
  amber: ["#f4bd62", "#151005"],
  cyan: ["#68d6e8", "#04141a"],
  coral: ["#f18c75", "#180b07"],
  blue: ["#74a7f7", "#070e1c"],
  mint: ["#69d4a7", "#04150e"],
  rose: ["#e896ba", "#170a11"],
};

const TEX_SOURCES = {
  "ieee-conference-paper.tex": `\\documentclass[conference]{IEEEtran}
\\usepackage{graphicx}
\\usepackage{cite}

\\title{A Clean Starting Point for Your IEEE Conference Paper}
\\author{\\IEEEauthorblockN{Your Name}
\\IEEEauthorblockA{Your Department \\and your University \\and you@university.edu}}

\\begin{document}
\\maketitle

\\begin{abstract}
Replace this paragraph with a short summary of the problem, your method and
the main result.
\\end{abstract}

\\section{Introduction}
State the motivation and your contribution in one paragraph.

\\section{Method}
Describe what you did, precisely enough to be reproduced.

\\section{Results}
\\begin{figure}[t]
  \\centering
  % \\includegraphics[width=\\linewidth]{result.png}
  \\caption{Describe the result in one sentence.}
  \\label{fig:result}
\\end{figure}

\\section{Conclusion}
Summarise the contribution and the next step.

\\begin{thebibliography}{9}
\\bibitem{ref1}
A. Author, Title of the reference, in \emph{Proc. Conf.}, 2026.
\\end{thebibliography}
\\end{document}
`,
  "university-thesis-report.tex": `\\documentclass[12pt]{report}
\\usepackage[margin=1in]{geometry}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\title{Thesis Title}
\\author{Student Name}
\\date{Department of Computer Engineering \\par Your University \\par 2026}

\\begin{document}
\\maketitle
\\newpage

\\begin{abstract}
Summarise the research problem, method, results and contribution.
\\end{abstract}
\\chapter*{Acknowledgements}
Thank your supervisor, committee and funding source.

\\tableofcontents
\\listoffigures

\\chapter{Introduction}
\\chapter{Literature Review}
\\chapter{Methodology}
\\chapter{Results and Discussion}
\\chapter{Conclusion and Future Work}

\\bibliographystyle{plain}
\\bibliography{references}

\\appendix
\\chapter{Questionnaire}
\\chapter{Supplementary Data}
\\end{document}
`,
  "research-paper-preprint.tex": `\\documentclass[11pt]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{graphicx}
\\usepackage{booktabs}

\\title{Preprint Title}
\\author{First Author \\and Second Author}
\\date{October 2026}

\\begin{document}
\\maketitle

\\begin{abstract}
One paragraph: context, gap, approach, result.
\\end{abstract}

\\section{Introduction}
\\section{Related Work}
\\section{Approach}
\\section{Evaluation}
\\section{Discussion}
\\section{Conclusion}

\\end{document}
`,
  "final-year-project-proposal.tex": `\\documentclass[12pt]{report}
\\usepackage[margin=1in]{geometry}
\\usepackage{booktabs}

\\title{Final Year Project Proposal}
\\author{Student Name \\and Roll Number}
\\date{Submitted to the Department of Computer Engineering}

\\begin{document}
\\maketitle

\\chapter{Problem Statement}
Describe the real problem this project solves.

\\chapter{Objectives}
\\begin{itemize}
  \\item Primary objective
  \\item Secondary objective
\\end{itemize}

\\chapter{Scope and Limitations}

\\chapter{Methodology}
Tools, technologies and the development approach.

\\chapter{Milestone Schedule}
\\begin{tabular}{lll}
\\toprule
Phase & Duration & Deliverable \\\\
\\midrule
Requirements & 2 weeks & SRS document \\\\
Design & 2 weeks & Architecture and UI mockups \\\\
Implementation & 8 weeks & Working prototype \\\\
Evaluation \& report & 3 weeks & Final report \\\\
\\bottomrule
\\end{tabular}

\\chapter{Budget}

\\end{document}
`,
  "technical-lab-report.tex": `\\documentclass[11pt]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{booktabs}
\\usepackage{siunitx}

\\title{Experiment Title}
\\author{Lab Group 04 \\and Course Code}
\\date{Week 04}

\\begin{document}
\\maketitle

\\section{Aim}
One sentence describing what the experiment proves.

\\section{Apparatus}
List the equipment and instruments used.

\\section{Procedure}
Numbered steps, precise enough to repeat.

\\section{Observations}
\\begin{tabular}{ccc}
\\toprule
Reading & Voltage (V) & Current (mA) \\\\
\\midrule
1 & 1.0 & 4.2 \\\\
2 & 2.0 & 8.5 \\\\
\\bottomrule
\\end{tabular}

\\section{Analysis}
Show the calculation, units and error bounds.

\\section{Conclusion}
What the result demonstrates.

\\end{document}
`,
  "academic-resume-cv.tex": `\\documentclass[10pt]{article}
\\usepackage[margin=0.7in]{geometry}
\\usepackage{enumitem}

\\name{Your Name}
\\address{City, Country \\quad +00 000 0000000 \\quad you@example.com}
\\date{}

\\begin{document}
\\maketitle

\\section{Education}
\\textbf{B.Sc. Computer Engineering} \\hfill 2023 -- 2027 \\\\
Your University -- GPA: 3.7/4.0

\\section{Research Interests}
Distributed systems, applied machine learning, developer tooling.

\\section{Publications}
\\begin{itemize}[leftmargin=*,nosep]
  \item Your Name, Paper title, in \emph{Conf.}, 2026.
\\end{itemize}

\\section{Projects}
\\textbf{Project name} \\hfill 2026 \\\\
One line on what it does and the stack you used.

\\section{Skills}
Languages: Python, TypeScript, C++ \\quad Tools: Git, Docker, LaTeX

\\section{Awards}
Scholarship, competition placement, certification.

\\end{document}
`,
  "journal-article-layout.tex": `\\documentclass[12pt]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\title{Journal Article Title}
\\author{Author One \\and Author Two}
\\date{Received 1 September 2026 \\quad Accepted 28 September 2026}

\\begin{document}
\\maketitle

\\begin{abstract}
Structured summary: background, aims, methods, results and conclusions.
\\end{abstract}

\\textbf{Highlights}
\\begin{itemize}
  \\item First concrete finding
  \\item Second concrete finding
  \\item Practical implication
\\end{itemize}

\\section{Introduction}
\\section{Materials and Methods}
\\section{Results}
\\section{Discussion}
\\section{Conclusions}

\\textbf{Declaration of interest:} None.

\\end{document}
`,
  "uet-final-year-report.tex": `\\documentclass[12pt]{report}
\\usepackage[margin=1in]{geometry}
\\usepackage{graphicx}
\\usepackage{setspace}

\\title{Final Year Project Title}
\\author{Student One \\\\ Student Two \\\\ Student Three}
\\date{Department of Computer Engineering \\\\ University of Engineering and Technology \\\\ 2026}

\\begin{document}

\\begin{titlepage}
  \\centering
  {\\Huge Final Year Project Report\\par}
  \\vspace{2cm}
  {\\Large Project Title\\par}
  \\vspace{1.5cm}
  {\\large Submitted by:\\par}
  Student One \\quad Roll No. 0000\\par
  Student Two \\quad Roll No. 0000\\par
  \\vspace{1.5cm}
  {\\large Supervisor: \\textbf{Supervisor Name}\\par}
  \\vfill
  Department of Computer Engineering\\par
  University of Engineering and Technology\\par
  2026
\\end{titlepage}

\\chapter*{Certification}
Certify that this is an original project carried out under supervision.

\\chapter*{Abstract}
\\chapter*{Acknowledgements}

\\tableofcontents
\\listoffigures
\\listoftables

\\chapter{Introduction}
\\chapter{System Analysis}
\\chapter{System Design}
\\chapter{Implementation}
\\chapter{Testing}
\\chapter{Conclusion and Future Work}

\\bibliographystyle{plain}
\\bibliography{references}

\\end{document}
`,
};

function previewSvg({ name, category, accent }) {
  const [color, background] = ACCENTS[accent] || ACCENTS.lime;
  const title = escapeXml(name);
  const label = escapeXml(category);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="${title} preview">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${background}"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="1200" height="675" fill="url(#g)"/>
  <rect width="1200" height="675" fill="url(#grid)"/>
  <rect x="0" y="0" width="12" height="675" fill="${color}"/>
  <rect x="72" y="96" width="132" height="34" rx="2" fill="${color}" fill-opacity="0.15" stroke="${color}"/>
  <text x="138" y="119" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="16" fill="${color}" text-anchor="middle" letter-spacing="2">${label.toUpperCase()}</text>
  <text x="72" y="250" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="68" font-weight="700" fill="#ffffff">${title}</text>
  <text x="72" y="312" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="22" fill="#9ca3af">Document template · ready to download and edit</text>
  <g stroke="${color}" stroke-opacity="0.6" fill="none">
    <rect x="72" y="400" width="360" height="180" rx="4"/>
    <line x1="104" y1="440" x2="400" y2="440"/>
    <line x1="104" y1="476" x2="360" y2="476"/>
    <line x1="104" y1="512" x2="384" y2="512"/>
    <line x1="104" y1="548" x2="300" y2="548"/>
  </g>
  <g stroke="#ffffff" stroke-opacity="0.25" fill="none">
    <rect x="512" y="400" width="360" height="180" rx="4"/>
    <line x1="544" y1="440" x2="840" y2="440"/>
    <line x1="544" y1="476" x2="800" y2="476"/>
    <line x1="544" y1="512" x2="824" y2="512"/>
    <line x1="544" y1="548" x2="740" y2="548"/>
  </g>
  <text x="72" y="636" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="18" fill="${color}">template marketplace</text>
</svg>
`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function ensureRows(supabase, table, rows) {
  const { data: existing, error } = await supabase.from(table).select("id, slug");
  if (error) throw new Error(`Unable to read ${table}: ${error.message}`);
  const known = new Set(existing.map((row) => row.slug));
  const missing = rows.filter((row) => !known.has(row.slug));
  if (!missing.length) return { created: 0, rows: existing };
  const { data: created, error: insertError } = await supabase.from(table).insert(missing).select("id, slug");
  if (insertError) throw new Error(`Unable to insert into ${table}: ${insertError.message}`);
  return { created: (created || []).length, rows: [...existing, ...(created || [])] };
}

async function writeAssets() {
  const previewDir = path.join(projectRoot, "site", "assets", "img", "templates");
  const sampleDir = path.join(projectRoot, "site", "assets", "templates");
  await mkdir(previewDir, { recursive: true });
  await mkdir(sampleDir, { recursive: true });

  for (const [file, source] of Object.entries(TEX_SOURCES)) {
    await writeFile(path.join(sampleDir, file), source, "utf8");
  }
  for (const sample of SAMPLES) {
    await writeFile(
      path.join(previewDir, sample.preview),
      previewSvg({ name: sample.name, category: sample.category, accent: sample.accent }),
      "utf8",
    );
  }
  return { previews: SAMPLES.length, samples: Object.keys(TEX_SOURCES).length };
}

async function main() {
  const skipSamples = process.argv.includes("--skip-samples");
  const config = loadConfig();
  requireSupabase(config);
  const supabase = createSupabase(config);

  const assets = await writeAssets();
  console.log(`Assets:   ${assets.previews} previews, ${assets.samples} sample files (site/assets)`);

  const categories = await ensureRows(supabase, "categories", CATEGORIES.map(([name, description], index) => ({
    slug: slugify(name),
    name,
    description,
    enabled: true,
    sort_order: index,
  })));
  console.log(`Categories: ${categories.created} created`);

  const publishers = await ensureRows(supabase, "publishers", PUBLISHERS.map((publisher) => ({
    ...publisher,
    enabled: true,
  })));
  console.log(`Publishers: ${publishers.created} created`);

  const tags = await ensureRows(supabase, "tags", TAGS.map((name) => ({ slug: slugify(name), name })));
  console.log(`Tags:       ${tags.created} created`);

  if (skipSamples) return 0;

  const categoryBySlug = new Map(categories.rows.map((row) => [row.slug, row.id]));
  const publisherBySlug = new Map(publishers.rows.map((row) => [row.slug, row.id]));
  const tagBySlug = new Map(tags.rows.map((row) => [row.slug, row.id]));

  const { data: existingTemplates, error: readError } = await supabase.from("templates").select("id, slug");
  if (readError) throw new Error(`Unable to read templates: ${readError.message}`);
  const known = new Set(existingTemplates.map((row) => row.slug));

  const missing = SAMPLES.filter((sample) => !known.has(sample.slug));
  if (!missing.length) {
    console.log("Samples:  already seeded");
    return 0;
  }

  const now = new Date().toISOString();
  const rows = missing.map((sample) => ({
    slug: sample.slug,
    name: sample.name,
    description: sample.description,
    long_description: sample.longDescription,
    category_id: categoryBySlug.get(slugify(sample.category)) || null,
    publisher_id: publisherBySlug.get(sample.publisher) || null,
    version: "1.0.0",
    license: "MIT",
    repository_url: null,
    documentation_url: null,
    download_url: `/assets/templates/${sample.download}`,
    preview_image: `/assets/img/templates/${sample.preview}`,
    preview_images: [`/assets/img/templates/${sample.preview}`],
    sample_file: `/assets/templates/${sample.download}`,
    status: "published",
    verified: true,
    verification_status: "verified",
    verification_method: "manual",
    verification_reason: "Sample template shipped with the marketplace.",
    verified_at: now,
    featured: sample.slug === "ieee-conference-paper" || sample.slug === "university-thesis-report",
    source: "seed",
    created_at: now,
    published_at: now,
  }));

  const { data: created, error: insertError } = await supabase.from("templates").insert(rows).select("id, slug");
  if (insertError) throw new Error(`Unable to insert sample templates: ${insertError.message}`);
  console.log(`Samples:  ${(created || []).length} created`);

  const templateIdBySlug = new Map((created || []).map((row) => [row.slug, row.id]));
  const links = [];
  for (const sample of missing) {
    const templateId = templateIdBySlug.get(sample.slug);
    if (!templateId) continue;
    for (const tagName of sample.tags) {
      const tagId = tagBySlug.get(slugify(tagName));
      if (tagId) links.push({ template_id: templateId, tag_id: tagId });
    }
  }
  if (links.length) {
    const { error: linkError } = await supabase.from("template_tags").upsert(links, { onConflict: "template_id,tag_id" });
    if (linkError) throw new Error(`Unable to link sample tags: ${linkError.message}`);
    console.log(`Links:    ${links.length} tag links`);
  }

  console.log("Run `npm run registry:generate` to publish these to the marketplace catalog.");
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exit(1);
  });
