const fs = require('fs')
const path = require('path')
const assert = require('assert')
const DEFAULT_INDENT = '  '

exports.validateOptions = validateOptions
exports.applyDefaultOptions = applyDefaultOptions

/**
 * @typedef Options
 * @type {Object}
 * @property {string} rootDir root directory of your fragments
 * @property {string} indexFile index document which references fragment. Default to ./index.yml
 * @property {string} outFile output file of the grouped fragments
 * @property {boolean} openapi enable openapi fragment processing
 * @property {string} indent indentation to use in yaml. Defaults to two spaces
 * @property {mapKeyFormatter} formatMapKey function which returns a function, given a directory path, to format a parsed path object to a yaml map key. Defaults to return raw filename
 * @property {collectionSorter} sortCollection function which returns a function, given a directory path, which sorts keys of a collection. Defaults to use localeCompare
 * @property {string} quoteMapKeyRegex regex to test map keys. If it fails the key will be wrapped in quotes. Defaults to wrap anything starting with a number
 * @property {boolean} relativePaths true if using relative paths in generated collection files. Defaults to true
 */
/**
 * @name mapKeyFormatter
 * @function
 * @param {string} dirPath the directory where filenames are read for map keys
 * @returns {formatMapKey} function to format map keys
 */
/**
 * @name formatMapKey
 * @function
 * @param {string} file the file name to convert to a key
 * @returns {string} map key
 */
/**
 * @name collectionSorter
 * @function
 * @param {string} dirPath the directory where filenames were read to be sorted
 * @returns {sortCollection} function to sort collection keys
 */
/**
 * @name sortCollection
 * @function
 * @param {string} entry1 a collection name to sort
 * @param {string} entry2 a collection name to sort
 * @returns {number} positive if entry1 is before entry2, negative if entry2 is before entry1, 0 if equivalent
 */

/**
 * Validate that required options are defined correctly.
 *
 * @param {Options} options
 */
function validateOptions({ rootDir, indexFile, outFile, indent }) {
  assert.ok(rootDir, 'Root fragment directory not specified')
  assert.ok(fs.existsSync(rootDir), `Root fragment directory not found ${rootDir}`)
  assert.ok(indexFile, 'Yaml index file not specified')
  assert.ok(fs.existsSync(indexFile), `Yaml index file not found ${indexFile}`)
  assert.ok(outFile, 'Yaml output file not specified')
  assert.ok(indent, 'Yaml indentation not specified')
}

/**
 * Ensure any undefined options are assigned defaults.
 *
 * @param {Options} opt
 * @returns {Options} The resolved options with defaults applied
 */
function applyDefaultOptions(opt) {
  opt.indexFile = resolveIndexFile(opt)
  return Object.assign(
    {
      indent: DEFAULT_INDENT,
      sortCollection: collectionSorter(opt),
      formatMapKey: keyFormatter(opt),
      quoteMapKeyRegex: /^[0-9]/,
      relativePaths: true
    },
    opt
  )
}

function collectionSorter(opt) {
  return function sortCollection(dirPath) {
    const sortPaths = opt.openapi && path.basename(dirPath) === 'paths'
    return (a, b) => {
      if (sortPaths) {
        // ensure token paths are defined after fixed paths so they don't override them
        if (a.name.endsWith('}') || b.name.endsWith('}')) {
          const pa = a.name.substr(0, a.name.lastIndexOf('_'))
          const pb = b.name.substr(0, b.name.lastIndexOf('_'))
          if (pa === pb) return a.name.endsWith('}') ? 1 : -1
        }
      }
      return a.name.localeCompare(b.name)
    }
  }
}

function keyFormatter(opt) {
  return function formatMapKey(dirPath) {
    if (opt.openapi && path.basename(dirPath) === 'paths') {
      return file => {
        // convert pets_{id} => /pets/{id}
        const key = file.name.split('_').join('/')
        return key[0] === '/' ? key : `/${key}`
      }
    }
    return file => file.name
  }
}

/**
 * Resolve the absolute path to the root index yaml file.
 *
 * @param {Options} opt
 * @returns {String} The absolute path to the index yaml file to base document generation off
 */
function resolveIndexFile({ rootDir, indexFile }) {
  rootDir = rootDir || ''
  indexFile = indexFile || './index.yml'
  if (path.isAbsolute(indexFile)) {
    return indexFile
  }
  if (fs.existsSync(indexFile)) return path.resolve(indexFile)

  return path.join(rootDir, indexFile)
}
