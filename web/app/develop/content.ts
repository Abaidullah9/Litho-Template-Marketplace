/**
 * Clipboard payloads for the guidelines page, transcribed from the `data-copy` attributes the
 * hand-written page carried so the copy buttons copy exactly the same bytes.
 */
export const renderCommand = "pdflatex -interaction=nonstopmode main.tex";

export const metadataDraft = [
  "name: IEEE Conference Paper",
  "description: A conference paper template with figure, table and citation helpers.",
  "category: Academic",
  "tags: LaTeX, Research, University",
  "license: MIT",
  "downloadUrl: https://example.org/ieee-paper.zip",
].join("\n");

export const entryDocument = [
  "\\documentclass[conference]{IEEEtran}",
  "",
  "\\usepackage{graphicx}",
  "\\usepackage{cite}",
  "",
  "\\title{A Reusable Conference Paper Template}",
  "\\author{Your Name \\and Co-Author}",
  "",
  "\\begin{document}",
  "\\maketitle",
  "",
  "\\begin{abstract}",
  "Summarise the contribution in three or four sentences.",
  "\\end{abstract}",
  "",
  "\\section{Introduction}",
  "State the problem, the approach, and the result.",
  "",
  "\\bibliographystyle{IEEEtran}",
  "\\bibliography{references}",
  "\\end{document}",
].join("\n");

export const readmeDocument = [
  "# IEEE Conference Paper",
  "",
  "A conference paper template with figure, table and citation helpers.",
  "",
  "## Compile",
  "",
  "```sh",
  "pdflatex main.tex",
  "bibtex main",
  "pdflatex main.tex",
  "```",
  "",
  "## Contents",
  "",
  "- main.tex — entry document",
  "- references.bib — sample bibliography",
  "- preview.png — rendered first page",
  "",
  "## Licence",
  "",
  "MIT; see LICENSE.",
].join("\n");

export const validationCommands = [
  'TEMPLATE_DIR="$HOME/Documents/ieee-conference-paper"',
  'cd "$TEMPLATE_DIR"',
  "pdflatex -interaction=nonstopmode main.tex",
  'test -f README.md && test -f LICENSE && echo "package complete"',
].join("\n");

export const previewCommands = ["pdftoppm -png -f 1 -l 1 -r 150 main.pdf preview", "mv preview-1.png preview.png"].join("\n");

export const licenseText = [
  "MIT License",
  "",
  "Copyright (c) 2026 Your name",
  "",
  "Permission is hereby granted, free of charge, to any person obtaining a copy",
  "of this software and associated documentation files (the \"Software\"), to deal",
  "in the Software without restriction, including without limitation the rights",
  "to use, copy, modify, merge, publish, distribute, sublicense, and/or sell",
  "copies of the Software, and to permit persons to whom the Software is",
  "furnished to do so, subject to the following conditions:",
  "",
  "The above copyright notice and this permission notice shall be included in all",
  "copies or substantial portions of the Software.",
  "",
  "THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR",
  "IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,",
  "FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE",
  "AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER",
  "LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,",
  "OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE",
  "SOFTWARE.",
].join("\n");

/** Full text of the package listing shown in the "prepare the package" step. */
export const packageTree = [
  "ieee-conference-paper/",
  "├── main.tex",
  "├── references.bib",
  "├── README.md",
  "├── LICENSE",
  "└── preview.png",
].join("\n");

export const packageSizeCommand = "du -sh ieee-conference-paper/";
