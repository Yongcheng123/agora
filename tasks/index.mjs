// tasks/index.mjs — the benchmark registry. PROTECTED.
import * as binpack from './binpack.mjs';
import * as tsp from './tsp.mjs';
import * as coloring from './coloring.mjs';
import * as knapsack from './knapsack.mjs';

export const TASKS = { binpack, tsp, coloring, knapsack };
