# drifter post-G16

## G16 commit
- SA with stronger parameters vs G15: iters 8000→20000 (2.5×), T0 0.001·initL→0.020·initL (20×↑), linear→exponential cooling
- Same pure 2-opt neighborhood
- Post-SA: if improved, adopt + 2-opt 3 passes only (no or-opt, to save budget)

## Hypothesis under test
- G15 0% was due to T0 too low + linear cooling wasting hot-phase iters
- T0=0.020·initL gives real escape: worsening 1e5 d² accepted at exp(-0.5)≈60% at start
- Exponential cooling gives smoother profile than linear (no "long hot phase then sudden cold")

## If G16 also 0%
- SA axis closed: regardless of parameters, 2-opt SA cannot escape this basin
- Next move (G17): 4-opt triple-bridge kick (5 cut points) or LK-style sequential move chain
- Or-opt axis also closed (L=8→12 was 0% in G13 single-var context)
- FPS axis saturated (FPS-3→4 was -0.19%, likely FPS-5+ will be ~0%)
- Only remaining unexplored axis: bigger random kicks

## Budget observation
- SA inner ~600ns/iter × 20000 = ~12ms; post-SA refine ~7ms worst case
- Total G16 ~600ms (under 1000ms hard cap, over 250ms soft cap)
- If G16 works, G18 might add LK-style sequential moves (~80ms); fits under cap

## Sandbox behavior unchanged
- 3 FPS starts (0, far, fps3) + 8 rounds double-bridge ILS + final or-opt L=8
- Pure 2-opt SA inner (no or-opt mix — keeps it simple for ablation)
- Math.random is seeded, one trajectory is fixed