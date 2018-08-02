const { genIndex } = require('./indexGenerator')
const { applyDefaultOptions, validateOptions } = require('./options')

/**
 * Generate a yaml document from an index yaml file which references
 * other local yaml fragments.
 *
 * Any `.map.yml` or `.list.yml` collection files will be generated in memory if found.
 *
 * @param {Options} opt document generation options
 */
exports.genDocument = function(opt) {
  opt = applyDefaultOptions(opt)
  validateOptions(opt)
  genIndex(opt)
}
