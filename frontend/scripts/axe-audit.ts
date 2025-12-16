const { register } = require('esbuild-register/dist/node');
register({ extensions: ['.ts', '.tsx', '.js'] });
/* eslint-disable prefer-rest-params */
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { JSDOM } = require('jsdom');
const axeCore = require('axe-core');
const path = require('path');
const fs = require('fs');

// Monkey-patch module loading to stub API hooks (avoid needing QueryClientProvider)
const Module = require('module');
const _load = Module._load;
Module._load = function (request, parent, isMain) {
  try {
    if (typeof request === 'string' && request.includes('store') && request.includes('api2')) {
      return {
        useGetTagsQuery: function () {
          return {
            data: [{ name: 'testing' }, { name: 'vitest' }],
            isLoading: false,
            isError: false,
            error: null,
          };
        },
      };
    }
  } catch (e) {
    // ignore
  }
  return _load.apply(this, arguments);
};

const stories = require(path.join(
  __dirname,
  '..',
  'components',
  'TagMultiSelect',
  'TagMultiSelect.stories.tsx',
));

// Prefer an audit-safe variant if present
const STORY_NAMES = [
  'Default',
  'Compound',
  'RenderPropCustomization',
  'LargeListVirtualizedAudit',
  'LargeListVirtualized',
];

async function run() {
  const reports = [];
  for (const name of STORY_NAMES) {
    const story = stories[name];
    if (!story) {
      console.warn(`Story ${name} not found, skipping.`);
      continue;
    }

    console.log(`\nRunning axe audit for story: ${name}`);

    let element;
    try {
      element = story();
    } catch (err) {
      console.error(`Failed to render story ${name}:`, err);
      continue;
    }

    const html = ReactDOMServer.renderToString(element);
    const dom = new JSDOM(`<!doctype html><html><head></head><body>${html}</body></html>`);

    // Ensure document has title and lang to avoid generic axe violations
    try {
      dom.window.document.documentElement.lang = 'en';
      dom.window.document.title = `TagMultiSelect — ${name}`;
    } catch (e) {
      // ignore
    }

    // Expose globals for axe
    global.window = dom.window;
    global.document = dom.window.document;
    global.Node = dom.window.Node;
    global.HTMLElement = dom.window.HTMLElement;
    global.navigator = dom.window.navigator;

    // Inject axe into the JSDOM window and run
    try {
      dom.window.eval(axeCore.source);
      const results = await dom.window.axe.run(dom.window.document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      });

      // Record results for this story
      const summary = {
        story: name,
        violations: (results.violations || []).map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          helpUrl: v.helpUrl,
          nodes: v.nodes.map((n) => ({ target: n.target, html: n.html })),
        })),
        passes: (results.passes || []).length,
        incomplete: (results.incomplete || []).length,
        timestamp: new Date().toISOString(),
      };

      reports.push(summary);

      if (summary.violations.length > 0) {
        console.log(`Found ${summary.violations.length} accessibility violation(s) in ${name}:`);
        for (const v of summary.violations) {
          console.log(`- [${v.id}] ${v.impact} : ${v.help}`);
          console.log(`  Help: ${v.helpUrl}`);
          v.nodes.forEach((n, idx) => {
            console.log(`    Node ${idx + 1} selector: ${n.target.join(', ')}`);
          });
        }
      } else {
        console.log(`No accessibility violations found for ${name}.`);
      }
    } catch (err) {
      console.error(`axe run failed for ${name}:`, err);
      reports.push({ story: name, error: String(err), timestamp: new Date().toISOString() });
    }

    // Cleanup globals
    delete global.window;
    delete global.document;
    delete global.Node;
    delete global.HTMLElement;
    delete global.navigator;
  }
  // Ensure reports directory exists
  try {
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    const outPath = path.join(reportsDir, 'axe-report.json');
    fs.writeFileSync(outPath, JSON.stringify(reports, null, 2), 'utf-8');
    console.log(`\nSaved axe report to ${outPath}`);
  } catch (e) {
    console.error('Failed to write axe report:', e);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
