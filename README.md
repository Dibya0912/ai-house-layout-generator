**🚀 AI House Layout Generator**


<img width="1536" height="1024" alt="505bd4a5-3f3b-4408-bcc7-d0737e9fef01" src="https://github.com/user-attachments/assets/6194f91b-73ea-4269-a20c-a5b3f2c6beca" />




An AI-powered 2D house layout generator that creates smart, structured, optimized floor plans with multiple variants, scoring, zooming, and export features.
Built using React + Vite and rendered using clean SVG.

🌟 Project Progress Timeline (Day 1 → Day 4)
✅ Day 1 — Project Setup + First Working Layout
✔️ Completed Tasks

React + Vite setup complete

Base project structure created

Components added:

InputPanel

SvgCanvas

Basic layout engine:

Living Room

Bedrooms

Kitchen

Bathroom

First SVG floor-plan rendering done

Working Download SVG button

⭐ Outcome

The project runs successfully with a fully functional initial layout.

✅ Day 2 — Multi-Variant Generator + Scoring Engine
✔️ Completed Tasks

Implemented generateVariants() to produce multiple layout options

Added scoring system to rank layouts

Added VariantsPanel to display all variant thumbnails

Selecting a thumbnail updates the main layout instantly

Auto-selects highest scored layout

All wiring connected:
App → InputPanel → LayoutEngine → VariantsPanel

⭐ Outcome

Users can generate multiple floor-plan options and easily pick the best one.

✅ Day 3 — Zoom System + Responsive SVG + PNG Export
✔️ Completed Tasks

Added auto scale-to-fit SVG inside responsive container

Added Zoom In / Zoom Out / Reset buttons

Added preserveAspectRatio for perfect scaling

Added Download PNG (SVG → Canvas → PNG)

Enhanced UI responsiveness & scroll behavior

Updated:

SvgCanvas.jsx

styles.css

⭐ Outcome

Floor-plan viewing becomes smooth, professional, and ready for real-world use.

✅ Day 4 — Advanced Variants Panel (Scores + Tooltip + Highlight)
✔️ Completed Tasks

Added score badges on each variant thumbnail

Implemented hover tooltips showing scoring explanation

Improved selected variant highlight (glow + border + badge)

Better 2-column grid layout

Cleaner and more usable interface

Updated VariantsPanel.jsx with scoring + tooltip logic

⭐ Outcome

Variants panel now feels premium & interview-ready.
Users can visually compare layouts, understand scores, and pick the best one confidently.

🖥️ Tech Stack

React + Vite (Frontend)

SVG (Rendering)

JavaScript (Custom Smart Layout Logic)

CSS (Minimal custom styling)

Git & GitHub (Version control)

🔧 Run Locally
npm install
npm run dev


App runs at:
http://localhost:5173

🎯 Upcoming Days (Planned)

✔ Day 5 — Small-room legend + label fix

✔ Day 6 — Save/Load project (LocalStorage)

✔ Day 7 — AI-enhanced layout suggestions

✔ Day 8 — Auto furniture placement (lightweight)

✔ Day 9 — Export as High-Quality PDF

⭐ Final Thoughts

This daily-progress-based project is designed to show consistent development, clean features, and strong front-end engineering.
Perfect for portfolio, internship interviews, and resume visibility.
