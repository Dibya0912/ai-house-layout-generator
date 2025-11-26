// src/utils/aiAdvisor.js
// Day-7: Pro AI Advisor (rule-based analysis + recommendations)

function area(r) {
  return (r.w || 0) * (r.h || 0);
}

function center(r) {
  return { x: (r.x || 0) + (r.w || 0) / 2, y: (r.y || 0) + (r.h || 0) / 2 };
}

function overlapAmount(a, b) {
  const interW = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const interH = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return interW * interH;
}

function prettyMeters(px, pxPerMeter = 50) {
  return `${(px / pxPerMeter).toFixed(2)} m`;
}

export function analyzeVariants(variants = [], spec = {}) {
  // returns { bestId, reports: [{id, score, grade, advantages, issues, suggestions}], summary }
  if (!variants || variants.length === 0) {
    return { bestId: null, reports: [], summary: 'No variants to analyze' };
  }

  const pxPerMeter = 50; // same scale as layout engine
  const reports = variants.map(v => {
    const { layout, score = 0, id } = v;
    const W = layout.W || 0;
    const H = layout.H || 0;
    const rooms = layout.rooms || [];

    const rep = {
      id,
      score,
      grade: 'C',
      advantages: [],
      issues: [],
      suggestions: [],
      metrics: {
        totalAreaPx: 0,
        livingCenterDist: 0,
        overlapPx: 0,
        compactness: 0
      }
    };

    // Metrics
    const totalArea = rooms.reduce((s, r) => s + area(r), 0);
    rep.metrics.totalAreaPx = totalArea;

    // living center & centrality
    const living = rooms.find(r => (r.label || '').toLowerCase().startsWith('living'));
    if (living) {
      const lc = center(living);
      const centerDist = Math.hypot(lc.x - W / 2, lc.y - H / 4); // prefer living top-center
      rep.metrics.livingCenterDist = centerDist;
      if (centerDist < Math.max(W, H) * 0.25) rep.advantages.push('Living room is well-centered toward upper area.');
      else rep.issues.push('Living room not well-centered (consider shifting horizontally).');
    } else {
      rep.issues.push('Missing living room.');
    }

    // kitchen placement (prefer bottom-right for north/east orientations)
    const kitchen = rooms.find(r => (r.label || '').toLowerCase().startsWith('kitchen'));
    if (kitchen) {
      const kc = center(kitchen);
      const inBottomRight = (kc.x > W * 0.6 && kc.y > H * 0.55);
      const inBottomLeft = (kc.x < W * 0.4 && kc.y > H * 0.55);
      if (spec.orientation === 'north' || spec.orientation === 'east') {
        if (inBottomRight) rep.advantages.push('Kitchen in preferred bottom-right quadrant for current orientation.');
        else rep.suggestions.push('Move kitchen closer to bottom-right for better Vastu/utility.');
      } else if (spec.orientation === 'south') {
        if (inBottomLeft) rep.advantages.push('Kitchen in preferred bottom-left area for south-facing site.');
        else rep.suggestions.push('Consider moving kitchen toward bottom-left for south-facing site.');
      }
    } else {
      rep.issues.push('Kitchen missing.');
    }

    // bedrooms: sizes, master location (bedroom 1)
    const beds = rooms.filter(r => (r.label || '').toLowerCase().startsWith('bedroom'));
    if (beds.length === 0) {
      rep.issues.push('No bedrooms found — add at least one.');
    } else {
      beds.forEach((b, i) => {
        const a = area(b);
        const aM2 = a / (pxPerMeter * pxPerMeter);
        if (aM2 < 8.5) rep.issues.push(`${b.label} is small (${aM2.toFixed(1)} m²). Consider enlarging.`);
        else rep.advantages.push(`${b.label} size is acceptable (${aM2.toFixed(1)} m²).`);
        // master bedroom preference
        if (i === 0) {
          const bc = center(b);
          if (bc.x < W * 0.45 && bc.y > H * 0.55) rep.advantages.push('Master bedroom (Bedroom 1) is in a stable bottom-left area.');
          else rep.suggestions.push('Consider placing master bedroom toward bottom-left for stability.');
        }
      });
    }

    // overlap checks
    let totalOverlap = 0;
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const ov = overlapAmount(rooms[i], rooms[j]);
        if (ov > 0) totalOverlap += ov;
      }
    }
    rep.metrics.overlapPx = totalOverlap;
    if (totalOverlap > 0) {
      rep.issues.push(`Rooms overlap detected (${Math.round(totalOverlap)} px²) — fix overlaps to ensure walls don't collide.`);
      rep.suggestions.push('Resolve overlaps by shrinking or shifting adjacent rooms.');
    } else {
      rep.advantages.push('No room overlaps detected.');
    }

    // compactness: smaller perimeter preferred
    const totalPerim = rooms.reduce((s, r) => s + 2 * (r.w + r.h), 0);
    const compactScore = Math.max(0, 100 - Math.round(totalPerim / 200));
    rep.metrics.compactness = compactScore;
    if (compactScore > 40) rep.advantages.push('Layout is compact (good for cost-saving).');
    else rep.suggestions.push('Layout is spread out; consider compacting to reduce circulation space.');

    // dead space detection (rough): area vs W*H
    const footprint = W * H;
    const usedRatio = totalArea / Math.max(1, footprint);
    if (usedRatio < 0.6) rep.suggestions.push('Large unused area detected — try reallocating space or shrinking footprint.');
    else rep.advantages.push('Good space utilization.');

    // derive grade (A/B/C) combining score and heuristic flags
    let gradeScore = v.score + compactScore - (totalOverlap / 500);
    if (rep.issues.length >= 3) gradeScore -= 15;
    if (rep.suggestions.length >= 2) gradeScore -= 5;

    rep.grade = gradeScore > 75 ? 'A' : (gradeScore > 55 ? 'B' : 'C');

    // final suggestions cleanup: unique and short
    rep.suggestions = Array.from(new Set(rep.suggestions)).slice(0, 6);
    rep.advantages = Array.from(new Set(rep.advantages)).slice(0, 6);
    rep.issues = Array.from(new Set(rep.issues)).slice(0, 8);

    return rep;
  });

  // pick the best variant: prefer highest 'grade' then score then compactness
  const gradeWeight = { 'A': 3, 'B': 2, 'C': 1 };
  let best = reports[0];
  for (let r of reports) {
    const curVal = (gradeWeight[r.grade] || 0) * 100 + (r.score || 0) + (r.metrics.compactness || 0);
    const bestVal = (gradeWeight[best.grade] || 0) * 100 + (best.score || 0) + (best.metrics.compactness || 0);
    if (curVal > bestVal) best = r;
  }

  const summary = `AI Advisor evaluated ${reports.length} variants. Recommended pick: ${best.id} (grade ${best.grade}).`;

  return { bestId: best.id, reports, summary };
}
