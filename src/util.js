const fs = require('fs')
const path = require('path')
const assert = require('assert')
const DEFAULT_AUTO_GEN_COMMENT = '# Auto Generated'
const DEFAULT_INDENT = '  '

exports.validateOptions = validateOptions
exports.applyDefaultOptions = applyDefaultOptions
exports.resolveIndexFile = resolveIndexFile
exports.writeFile = writeFile

function validateOptions(baseDir, indexFile, outputFile, opt) {
  try {
    assert.ok(baseDir, 'Root fragment directory not specified')
    assert.ok(fs.existsSync(baseDir), `Root fragment directory not found ${baseDir}`)
    assert.ok(indexFile, 'Yaml index file not specified')
    assert.ok(fs.existsSync(indexFile), `Yaml index file not found ${indexFile}`)
    assert.ok(outputFile, 'Yaml output file not specified')
    assert.ok(opt.indent, 'Yaml indentation not specified')
    return Promise.resolve()
  } catch (e) {
    return Promise.reject(e)
  }
}

/**
 * Ensure any undefined options are assigned defaults.
 *
 * @param {Object} options
 *  - indent: Indentation string to use in yaml. Defaults to two spaces.
 *  - autoGenComment: A comment to place at the top of any generated file. Defaults to '# Auto Generated'.
 *  - formatMapKey: Function to format a file to a yaml map key. Defaults to return raw filename.
 *  - sortCollection: Function to sort the entries of a collection. Default is asc alphabetical.
 *  - quoteMapKeyRegex: Regex to test map keys. If it fails the key will be wrapped in quotes. Defaults to null.
 *  - relativePaths: True if using relative paths in generated collection files. Defaults to true.
 *  - openapi: True if generating an OpenAPI specification. Defaults to undefined.
 * @returns {Object} The resolved options with defaults applied
 */
function applyDefaultOptions(options) {
  return Object.assign(
    {
      indent: DEFAULT_INDENT,
      autoGenComment: DEFAULT_AUTO_GEN_COMMENT,
      formatMapKey: file => file.name,
      sortCollection: (a, b) => a.name.localeCompare(b.name),
      quoteMapKeyRegex: /^[0-9]/,
      relativePaths: true
    },
    options.openapi && openapiOptions(),
    options
  )
}

/**
 * @returns {Object} OpenAPI specific options
 */
function openapiOptions() {
  return {
    formatMapKey: function formatPathKey(file) {
      return file.name.split('_').join('/') // _stores_{id}.yml => /store/{id}
    },
    sortCollection: function sortPaths(a, b) {
      // ensure token paths are defined after fixed paths so they don't override them
      if (a.name.endsWith('}') || b.name.endsWith('}')) {
        const pa = a.name.substr(0, a.name.lastIndexOf('_'))
        const pb = b.name.substr(0, b.name.lastIndexOf('_'))
        if (pa === pb) return a.name.endsWith('}') ? 1 : -1
      }
      return a.name.localeCompare(b.name)
    }
  }
}

/**
 * Resolve the absolute path to the root index yaml file.
 *
 * @param {String} baseDir The root directory to search for collection files to generate
 * @param {String} indexFile The index yaml file to base document generation off
 */
function resolveIndexFile(baseDir, indexFile) {
  if (path.isAbsolute(indexFile)) {
    return indexFile
  }
  if (fs.existsSync(indexFile)) return path.resolve(indexFile)

  return path.join(baseDir, indexFile)
}

/**
 * Write a file to disk.
 *
 * @param {String} path The path to write the file to
 * @param {String} contents The contents of the file
 * @returns {Promise} A Promise which resolves once the file has been written to disk
 */
function writeFile(path, contents) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, contents, err => (err ? reject(err) : resolve()))
  })
}
