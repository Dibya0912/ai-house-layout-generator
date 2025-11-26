**🚀 AI House Layout Generator**


<img width="1536" height="1024" alt="505bd4a5-3f3b-4408-bcc7-d0737e9fef01" src="https://github.com/user-attachments/assets/6194f91b-73ea-4269-a20c-a5b3f2c6beca" />




An AI-powered 2D house layout generator that creates smart, structured, optimized floor plans with multiple variants, scoring, zooming, and export features.
Built using React + Vite and rendered using clean SVG.

✅ Day 1 — Project Setup + First Working Layout
✔ Completed

React + Vite setup completed

Base folder structure created

Added core components:

InputPanel

SvgCanvas

Implemented basic layout engine:

Living Room

Bedrooms

Kitchen

Bathroom

First SVG floor plan rendered

Working Download SVG button

⭐ Outcome

Project runs successfully and generates a functional first layout.

✅ Day 2 — Multi-Variant Generator + Scoring Engine
✔ Completed

Added generateVariants() → produces multiple layout options

Added scoring engine (heuristics: kitchen placement, bedroom position, overlap penalties, compactness)

Built VariantsPanel → shows layout thumbnails

Clicking a thumbnail updates the main layout

Highest-score variant auto-selected

Connected full data flow:
App → InputPanel → LayoutEngine → VariantsPanel

⭐ Outcome

Users can generate multiple layout options and choose the best one visually.

✅ Day 3 — Zoom System + Responsive SVG + PNG Export
✔ Completed

SVG now scales-to-fit inside a responsive container

Added Zoom In / Zoom Out / Reset buttons

Added preserveAspectRatio="xMidYMid meet"

Added Download PNG feature (SVG → Canvas conversion)

Improved scrolling + container behavior

Updated:

SvgCanvas.jsx

styles.css

⭐ Outcome

Floor plans feel smooth, professional, and export-ready.

✅ Day 4 — Advanced Variants Panel (Scores, Tooltip, Highlight)
✔ Completed

Added score badges to each thumbnail

Added hover tooltips showing scoring reasons

Added glowing border highlight for selected variant

Improved two-column grid layout

Updated VariantsPanel.jsx with new logic

⭐ Outcome

Variants panel now looks polished and lets users compare layouts intelligently.

✅ Day 5 — Small-Room Label Fix & Legend (UI Polish)
✔ Completed

If a room is too small for inline text, label moves to a side legend

Improved readability:

Better contrast

Slightly bolder labels

Added a legend section under the SVG

Prevented label overlap & boundary clipping

Updated:

SvgCanvas.jsx

styles.css

⭐ Outcome

Even tiny rooms display clear labels — UX feels cleaner, more reliable.

✅ Day 6 — Save & Load Project (LocalStorage System)
✔ Completed

Added Save Project button → persists:

Inputs (width, height, beds, baths, orientation)

All variants

Selected variant

Selected layout

Zoom level

Added Load Project → restores entire UI state automatically

Added console shortcuts:

__aihl_saveProject()
__aihl_loadProject()
__aihl_getState()


Added storage versioning:
aihl_project_v1

⭐ Outcome

Users can save their entire layout session and reload it anytime — a major real-world feature.

✅ Day 7 — AI Advisor (Pro Analysis + Recommendations + AI Pick UI)

✔ Completed

Added aiAdvisor.js (AI Advisor Engine)
Provides:

Grade rating (A+, A, B, C…)

Good points

Issues

Suggestions

Overall summary

Added AI Pick Best button (recommends best variant using advisor logic)

Added AISuggestionsPanel.jsx:

Full professional analysis

Apply AI’s best layout directly

Added "Re-run AI Analysis" button

Added scrollable analysis panel with color-coded sections

Integrated with current variants list

⭐ Outcome
The app now behaves like a professional AI layout assistant — giving expert-level recommendations, issues, and best-pick suggestions.

🛠️ Tech Stack
Area	Technology
Frontend	React + Vite
Rendering	SVG (vector-based)
Layout Logic	Custom JavaScript engine
Styling	Lightweight CSS
Version Control	Git & GitHub
🔧 Run Locally
# Install dependencies
npm install

# Start dev server
npm run dev


App runs at:

http://localhost:5173

⚙️ Current Features

Generate multiple smart layout variants

Variant scoring (placement, compactness, penalties)

Thumbnail gallery with badges & tooltips

Responsive SVG with zooming & fit-to-width

Export as SVG & PNG

Small-room label fix + legend support

Save / Load project from localStorage

Console debug helpers

📁 Branches
Branch	Description
main	Stable initial snapshot
dev	Active development (daily updates)

Repo:
👉 https://github.com/Dibya0912/ai-house-layout-generator

🔭 Planned Roadmap
Day	Feature
Day 8	Auto furniture placement (basic presets)
Day 9	High-quality PDF export
Bonus	Keyboard navigation, improved color themes, animated transitions
⭐ Final Thoughts

This daily-progress-based project is designed to show consistent development, clean features, and strong front-end engineering.
Perfect for portfolio, internship interviews, and resume visibility.
