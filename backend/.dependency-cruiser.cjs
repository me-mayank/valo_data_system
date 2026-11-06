/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-cross-module-internals',
      comment: 'Rule 1: A module may only import another module via its index.js public API',
      severity: 'error',
      from: {
        path: '^src/modules/([^/]+)/',
      },
      to: {
        path: '^src/modules/([^/]+)/',
        pathNot: [
          // Same module internals are allowed
          '^src/modules/$1/',
          // Cross-module imports MUST end with /index.js or /index
          '^src/modules/[^/]+/index(\\.js)?$',
        ],
      },
    },
    {
      name: 'shared-cannot-import-modules',
      comment: 'Rule 4: Shared kernel infrastructure must never import business modules',
      severity: 'error',
      from: {
        path: '^src/shared/',
      },
      to: {
        path: '^src/modules/',
      },
    },
    {
      name: 'scripts-use-module-index-only',
      comment: 'Rule 7: Scripts must import modules only through their index.js public API',
      severity: 'error',
      from: {
        path: '^scripts/',
      },
      to: {
        path: '^src/modules/([^/]+)/',
        pathNot: ['^src/modules/[^/]+/index(\\.js)?$'],
      },
    },
    {
      name: 'controller-cannot-import-model-or-repo',
      comment: 'Rule 3: Module controllers must not import repositories or models directly',
      severity: 'error',
      from: {
        path: '^src/modules/.*\\.controller\\.js$',
      },
      to: {
        path: '(\\.model\\.js$|\\.repository\\.js$)',
      },
    },
    {
      name: 'service-cannot-import-model',
      comment: 'Rule 3: Module services must not import models directly (use repository)',
      severity: 'error',
      from: {
        path: '^src/modules/.*\\.service\\.js$',
      },
      to: {
        path: '\\.model\\.js$',
      },
    },
    {
      name: 'no-circular-dependencies',
      comment: 'Circular dependencies are forbidden',
      severity: 'error',
      from: {},
      to: {
        circular: true,
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: false,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
