// SPDX-License-Identifier: Apache-2.0
'use strict';

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'test',
        'refactor',
        'perf',
        'build',
        'ci',
        'chore',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      ['core', 'data', 'engine', 'ui', 'desktop', 'platform', 'infra', 'docs'],
    ],
    'header-max-length': [2, 'always', 110],
  },
};
