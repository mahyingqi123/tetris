import { fileURLToPath } from 'url';
import { basename, resolve } from 'pathe';
import sirv from 'sirv';
import { coverageConfigDefaults } from 'vitest/config';

var index = (ctx) => {
  return {
    name: "vitest:ui",
    apply: "serve",
    configureServer(server) {
      const uiOptions = ctx.config;
      const base = uiOptions.uiBase;
      const coverageFolder = resolveCoverageFolder(ctx);
      const coveragePath = coverageFolder ? `/${basename(coverageFolder)}/` : void 0;
      if (coveragePath && base === coveragePath)
        throw new Error(`The ui base path and the coverage path cannot be the same: ${base}, change coverage.reportsDirectory`);
      coverageFolder && server.middlewares.use(coveragePath, sirv(coverageFolder, {
        single: true,
        dev: true,
        setHeaders: (res) => {
          res.setHeader("Cache-Control", "public,max-age=0,must-revalidate");
        }
      }));
      const clientDist = resolve(fileURLToPath(import.meta.url), "../client");
      server.middlewares.use(base, sirv(clientDist, {
        single: true,
        dev: true
      }));
    }
  };
};
function resolveCoverageFolder(ctx) {
  var _a, _b, _c;
  const options = ctx.config;
  const enabled = ((_a = options.api) == null ? void 0 : _a.port) && ((_b = options.coverage) == null ? void 0 : _b.enabled) && options.coverage.reporter.some((reporter) => {
    if (typeof reporter === "string")
      return reporter === "html";
    return reporter.length && reporter.includes("html");
  });
  return enabled ? resolve(
    ((_c = ctx.config) == null ? void 0 : _c.root) || options.root || process.cwd(),
    options.coverage.reportsDirectory || coverageConfigDefaults.reportsDirectory
  ) : void 0;
}

export { index as default };
