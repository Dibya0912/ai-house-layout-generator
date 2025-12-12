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

✅ Day 8 — Auto Furniture Placement (Auto-Layout Furnishing)

✔ Completed

What I added

Auto furniture placement engine that places simple, scalable furniture inside rooms based on room geometry (no ML — deterministic rules).

Furniture types (per room):

Living: sofa, coffee table, TV unit

Bedroom: bed, pillow, wardrobe (if space)

Kitchen: counter + sink

Bathroom: toilet + basin

Furniture rendered as SVG elements inside the same plan (included in SVG/PNG exports).

Show / Hide Furniture toggle in SvgCanvas for quick UI control.

Safe fallback: furniture rendering is wrapped in try/catch so it never breaks the plan rendering.

Files added / modified

Added: src/utils/furnitureEngine.js — placement logic + SVG generator

Modified: src/components/SvgCanvas.jsx — integrates furniture engine, adds toggle, keeps zoom & export features

Modified: src/styles.css — furniture visual styles


🏆 Day 9 — PDF Export (Vector + PNG Fallback)

✔ Completed

This is a major professional feature — perfect for architects, clients, and portfolio usage.

🔥 What we built today

Added Download PDF button inside SvgCanvas

Vector-quality export using jsPDF + svg2pdf.js

Rooms

Text

Furniture

Strokes
All preserved as vector paths (super clean at any zoom).

If vector export fails → automatic PNG fallback

Renders SVG → Canvas → PNG → embeds in PDF

Ensures PDF download always works, even on Windows / Chrome quirks

🧪 Additional features

Auto inline computed styles for better PDF fidelity

PDF page size automatically matches layout size

Clean filename generation based on width × height

📄 Updated Files

SvgCanvas.jsx (major update)

PDF export logic added

Cleaned imports to avoid bundler errors

⭐ Outcome

Users can now export high-quality PDFs of their generated layouts — ideal for sharing, printing, or professional submissions.



✅ Day 10 — Final UI Polish, Theme & Wall Controls
- Light / Dark theme toggle (topbar)
- Wall thickness slider (1px–8px)
- Room color presets (soft pastels per room type)
- UI spacing, buttons, and polish improvements
- Persisted theme & wallThickness in save/load
Outcome: App feels polished and production-ready — ready for portfolio screenshots.



✅ Day 11 — Interactive Room Editing (Move + Rename)

✔ Completed

Feature	Description
Room Selection	Click any room inside the SVG → it becomes highlighted
Move Room	Arrow-style controls allow nudging room position (pixel precise placement)
Rename Room	Change room label dynamically using rename prompt
Visual Feedback	Selected room is highlighted with bold pink stroke
Non-destructive Updates	All changes stored in internal layout state for future saving

🧠 Debug Helpers
Live layout changes can be inspected using:

window.__currentLayout


⭐ Outcome
The floor plan is now editable like a real drawing tool — users interact with individual rooms, reposition them, and rename them instantly.
Huge UX improvement toward an interactive planning experience.


🌟 Project Progress Timeline (Day 1 → Day 12)
🛠️ Day 12 — Interactive Room Editing + Resize Controls

✔ Completed

Feature	Status	Notes
Select individual room inside SVG	✅	Click to highlight a room
Move room using arrows (Up/Down/Left/Right)	✅	Snaps to a small grid for alignment
Rename any room	✅	Inline rename panel
Resize rooms (Wider/Narrower / Taller/Shorter)	🚀	Live resizing with boundary protection
Auto-clamp inside house walls	✔	Prevents visual break layout
Strong visual highlight for selected room	✔	Enhanced UX

🔍 Update summary

Editing is now meaningful — UI updates instantly

Rooms remain inside boundaries after each transform

UX panel appears only when a room is selected

This feature is a major leap toward custom architecture tools

📌 Files updated:

src/App.jsx
src/components/SvgCanvas.jsx
src/styles.css


⭐ Outcome
Users can now pick any room, move it, resize it, and rename it directly on the SVG —
a real architectural editor experience 🎯


✅ Day 13 — Auto Doors & Windows + Toggles + Legend

✔ Completed

Feature	Description
Automatic Door Placement	Main entrance based on orientation (North/East/South/West)
Automatic Window Placement	Smart positioning on outer walls, scaled by room size
Toggle Visibility	Show/Hide Doors, Show/Hide Windows (separate controls)
Interactive Editing	Still supports move / resize / rename rooms
Color-coded Legend	Door = Brown, Window = Blue

📌 Files Updated

src/components/SvgCanvas.jsx

src/utils/layoutEngine.js

src/styles.css (legend styling + utility colors)

🧠 Logic Highlights

Doors respect selected house orientation

Windows appear only on exterior walls

Large rooms receive multiple windows for realism

No overlap issues — openings stay on wall boundaries

Works together with furniture + room editor

🎯 Outcome
Users now see practical architectural elements — the plan looks like a real house blueprint, not just rectangles.


✅ Day 14 — Smart, Door-Aware Furniture Placement (Polished Layout Logic)
✔ Completed

- Upgraded `furnitureEngine` to use **doors + windows info** from `generateOpenings()`
- Furniture is now placed **more realistically**, instead of random blocks:
  - **Bedroom**
    - Bed headboard prefers solid walls (avoids door/window walls where possible)
    - Wardrobe tries to go on the opposite wall of the bed or a free wall
  - **Living Room**
    - Sofa is placed opposite the entry wall (from door), with a clear facing direction
    - Coffee table auto-aligns in front of the sofa (based on sofa facing)
    - TV unit tries to align opposite the sofa, centered on its wall
  - **Kitchen**
    - Counter runs along a window wall when available (more natural light)
    - Sink tries to sit under / near the window for a realistic layout
  - **Bathroom**
    - Toilet and basin placed in stable corners, keeping clear walking area

- Added small internal helpers:
  - `groupByRoom()` → groups door/window openings by room
  - `oppositeWall()` → helps align sofa vs TV vs entry
  - Used door/window walls to build a **blockedWalls** set → avoids placing big furniture on those walls

- Furniture SVG now has:
  - Better colors and subtle strokes (bed, sofa, wardrobe, TV, counter, sink, toilet, basin)
  - Sofa includes a **direction arrow** showing which way it faces

- Updated `SvgCanvas.jsx`:
  - Now calls `placeFurniture(layout, openings, spec)` instead of plain `placeFurniture(layout)`
  - Openings (doors & windows) are shared with the furniture engine, so furniture respects them

⭐ Outcome

Furniture layout now feels **intentional and realistic**, not random:
beds don’t block doors, sofas face into the room, TVs are on the correct wall,
kitchen sinks sit under windows — the whole floor plan looks like a real architect quickly drafted it.




🚀 Day 15 — Measurement Tool + Visual Distance Indicators

Objective:
Give users geometric understanding — measure distances between any points on the floor plan.

✨ New Features Added
Feature	Description
📏 Measurement Tool	Users can click two points on the layout to measure distance
🔵 Point Markers	Each selected point is visually marked
📐 Dynamic Distance Line	A line appears between points with a live distance label
🧮 Real-World Unit Conversion	Uses px→meters conversion for accurate measurement
❌ Reset Logic	Auto clears markers after measurement completes
🛠️ Implementation Notes

UI integrated inside SvgCanvas.jsx

Uses layoutEngine.pxPerMeter to convert pixels → meters

Supports zoom without losing accuracy

Future UI panel planned: Measurement history + unit toggle (ft/m)

📌 Day 16 — Auto Area Display (m²) + Improved Measurement UX

✔ Completed

Feature	Description
Automatic Area Labels	Each room now shows floor area in square meters inside the plan
Smart Visibility Rules	Area label only shows when room size is large enough (no clutter!)
Measurement Reset Logic	Switching variants resets measurement points cleanly
UX Enhancements	Clear button + easy toggle UX for measurement
Scales perfectly	Correct px → meter conversion applied
🔍 How It Works

Uses r.w × r.h and our global pxPerMeter = 50

Area text appears below room name

Automatically recalculated after:

Moving a room

Resizing a room

Switching variants

Loading a saved project

🖼️ UI Output Example
Living
14.3 m²

✅ Day 17 — Smart Construction Grid (UX Upgrade)

Today’s focus: Real architectural accuracy.

🔥 What’s new?

🧱 Grid Background Rendering inside SVG canvas

🎯 Enhanced Grid Snapping

Room movement snaps to 5px = 0.1m increments

Room resizing also respects construction grid

📐 Developer-ready improvements for dimension alignment

🎯 Why this matters?
Before	After
Rooms move freely → messy alignment	Architects-style perfect alignment
Hard to reproduce precise sizes	Repeatable, measurable accurate shapes
Visually floating rooms	Grounded on logical grid foundation

This update pushes the tool toward REAL construction planning — not just a toy layout generator.

💡 Tech Changes

Updated SvgCanvas.jsx

Grid drawn before rooms using <pattern> SVG

Movement / resize remains quantized to 5px grid

🧪 How to Use
Action	Result
Move room by ⬅⬆➡⬇ buttons	Room snaps to nearest construction grid
Resize through controls	Dimensions remain aligned
Zoom controls	Grid scales perfectly with view




🚀 Day 18 — Snap-to-Grid + Auto Area Labels + Polished Measurement Tool

Today’s update makes the UI feel much more professional, smooth, and precise.
We added a full blueprint-style grid, snap-to-grid movement, auto area calculation, and improved the measurement workflow.

✅ What’s New Today
1. Snap-to-Grid Movement (20px grid)

All room movements now snap exactly to the grid.

Feels more like a real CAD tool.

Prevents messy or uneven coordinates.

2. Grid Overlay (Light + Dark Lines)

Added SVG grid with:

Small grid: 20px

Big grid: 100px (highlighted)

User can toggle the grid ON/OFF.

3. Automatic Area Labels (m²)

Rooms now automatically display their area in square meters.

Smart visibility:

Only shows if room is large enough (for clean visuals).

Fully respects scaling + spec width/height → accurate real measurements.

4. Measurement Tool Polished

Click two points → auto distance in meters.

Reset when changing layout.

Shows measurement line + two markers.

Cleaner UX + accurate meter conversion.



📅 Day 19 — Theme System + UI Polish + Measurement Fixes

Today the app received a full UI upgrade, including:

✅ 1. Dark / Light Theme Toggle

Global color system added using CSS variables.

Body now switches classes:

theme-dark

theme-light

All components automatically adapt.

✅ 2. Modern UI Styling

New polished layout

Cleaner buttons

Better spacing, rounded panels

Improved canvas background & shadows

Updated legends, room editor styling

✅ 3. Measurement Bug Fixes

Cross-browser stable click detection

Works even when zoomed

Uses consistent px → meter conversion

Distance text now uses theme colors

✅ 4. Grid System Polished

Big + small grid patterns

Toggle button added

Grid aligns with room snapping (20px)

✅ 5. Code Clean-up & Safety Improvements

Safer inline SVG event handling

Unified measurement fallback

Removed noisy console logs

Clearer variable naming


📘 Day 20 — Final Polish, Bug Fixes & Project Completion (MVP Done)

Today is the last day of the 20-day build, and the goal was simple:

Stabilize the app, remove breaking imports, unify UI styles, finalize UX polish, and close all remaining errors.

This completes the AI-House-Layout-Generator MVP


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

Day 9	High-quality PDF export
Bonus	Keyboard navigation, improved color themes, animated transitions
⭐ Final Thoughts

This daily-progress-based project is designed to show consistent development, clean features, and strong front-end engineering.
Perfect for portfolio, internship interviews, and resume visibility.
