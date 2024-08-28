const jsonDiff = require('json-diff');

/**
 * diff.controller.js
 *
 * @description :: Server-side logic for determining the difference between two objects.
 */
module.exports = {

  createDiffObject: (original, updated) => {
    original = JSON.parse(JSON.stringify(original, (key, value) => ((value === '') ? ' ' : value)));
    updated = JSON.parse(JSON.stringify(updated, (key, value) => ((value === '') ? ' ' : value)));
    const diff = JSON.stringify(jsonDiff.diff(original, updated));
    return diff;
  },
};
