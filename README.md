**🚀 AI House Layout Generator**


<img width="1536" height="1024" alt="505bd4a5-3f3b-4408-bcc7-d0737e9fef01" src="https://github.com/user-attachments/assets/6194f91b-73ea-4269-a20c-a5b3f2c6beca" />




An AI-powered 2D house layout generator that creates smart, structured, optimized floor plans with multiple variants, scoring, zooming, and export features.
Built using React + Vite and rendered using clean SVG.

🌟 Project Progress Timeline (Day 1 → Day 5)
✅ Day 1 — Project Setup + First Working Layout

Completed

React + Vite setup completed

Base project structure created

Core components added:

InputPanel

SvgCanvas

Basic layout engine implemented (Living, Bedrooms, Kitchen, Bath)

First SVG floor-plan rendering displayed

Download SVG button working

Outcome: Project runs successfully and renders a working layout.

✅ Day 2 — Multi-Variant Generator + Scoring Engine

Completed

generateVariants() produces multiple layout options

Scoring engine ranks layouts by simple heuristics (placement, overlap, compactness)

VariantsPanel shows thumbnails of variants

Clicking a thumbnail updates the main layout

Auto-selects the highest-scoring variant

Data flow: App → InputPanel → LayoutEngine → VariantsPanel

Outcome: Users can generate multiple floor-plan options and choose the best one.

✅ Day 3 — Zoom System + Responsive SVG + PNG Export

Completed

SVG scales-to-fit inside a responsive container

Zoom In / Zoom Out / Reset controls added

preserveAspectRatio="xMidYMid meet" used for clean scaling

Download PNG (SVG → Canvas → PNG) implemented

Improved UI responsiveness and scroll behavior

Files updated: SvgCanvas.jsx, styles.css

Outcome: Viewing layouts is smooth and exportable to PNG.

✅ Day 4 — Advanced Variants Panel (Scores + Tooltip + Highlight)

Completed

Score badges on each variant thumbnail

Hover tooltips explaining scoring reasons (e.g., kitchen location, overlap penalty)

Selected variant highlight (glow + bold border + badge)

Clean 2-column grid layout for thumbnails

File updated: VariantsPanel.jsx

Outcome: Variants panel feels premium and helps users compare options quickly.

✅ Day 5 — Small-room label fix & legend (UI polish)

Completed

If a room is too small to contain inline text, label is shown in a side legend or on hover

Improved label contrast and font-weight for readability

Small-room legend area added below the SVG (shows short labels and dimensions)

Minor layout tweaks to ensure labels never overlap borders and remain accessible on zoom

Files updated: SvgCanvas.jsx (label handling), styles.css (legend styles)

Outcome: All room labels are readable even on small rooms; UX improved for clarity and accessibility.

🧩 Tech Stack

Frontend: React + Vite

Rendering: SVG (clean vector output)

Logic: Custom JS layout engine (src/utils/layoutEngine.js)

Styling: Lightweight CSS (src/styles.css)

Version Control: Git & GitHub

🔧 Run Locally
# install dependencies
npm install

# start dev server
npm run dev


Open the app at:
http://localhost:5173

⚙️ Main Features (so far)

Generate multi-variant floorplans from simple inputs (width, height, bedrooms, bathrooms, orientation)

Layout scoring and automatic best-variant selection

Thumbnail gallery of variants with score badges and tooltips

Responsive SVG with scale-to-fit + zoom controls

Export to SVG and PNG

Small-room labeling fixes: inline labels, hover labels, and side legend

Save / Load project (planned / partially implemented in dev branch)

📁 Repo & Branches

main — stable snapshot (first day)

dev — active development branch (daily commits, features in progress)

Repo: https://github.com/Dibya0912/ai-house-layout-generator (your repository)

🔭 Planned Roadmap (short)

Day 6: Save / Load project (localStorage) — restore spec + selected variant

Day 7: AI-enhanced layout suggestions (ML-backed heuristics)

Day 8: Auto furniture placement (lightweight presets)

Day 9: High-quality PDF export (SVG → PDF pipeline)

Polish: keyboard navigation, thumbnails scores on UI, improved tests + README screenshots/GIFs

⭐ Final Thoughts

This daily-progress-based project is designed to show consistent development, clean features, and strong front-end engineering.
Perfect for portfolio, internship interviews, and resume visibility.
