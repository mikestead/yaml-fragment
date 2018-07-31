const path = require('path')
const fs = require('fs')
const util = require('./util')

exports.genIndex = genIndex
exports.renderIndex = renderIndex

/**
 * Generate the root index yaml file.
 *
 * - Generates any collection yaml files and writes them to disk
 * - Generates the index yaml file and writes it to chosen location
 *
 * @param {String} indexFile The path to the index yaml template file to render
 * @param {String} outputFile The path where the rendered file should be written to
 * @param {Object} options
 *  - indent: Indentation string to use in yaml. Defaults to two spaces.
 *  - autoGenComment: A comment to place at the top of any generated file. Defaults to '# Auto Generated'.
 * @returns {Promise.<T>} A Promise which resolves when the generated document has been written to disk
 */
function genIndex(indexFile, outputFile, options) {
  const contents = renderIndex(indexFile, options)
  return util.writeFile(outputFile, contents)
}

/**
 * Render the root index yaml file.
 *
 * Note this on does NOT generate the collection files before rendering.
 *
 * @param {String} indexFile The index file to base generate off
 * @param {Object} options
 *  - indent: Indentation string to use in yaml. Defaults to two spaces.
 *  - autoGenComment: A comment to place at the top of any generated file. Defaults to '# Auto Generated'.
 * @returns {String} The rendered document
 */
function renderIndex(indexFile, options) {
  return replaceFileRefs(indexFile, options)
}

/**
 * Starting from the root file specified, recursively replace all
 * $refs to local files with the corresponding yaml fragment and return the
 * resolved document.
 *
 * @param {String} filePath The root yaml document to search for refs to fragments.
 * @param {Object} options
 *  - indent: Indentation string to use in yaml. Defaults to two spaces.
 *  - autoGenComment: A comment to place at the top of any generated file. Defaults to '# Auto Generated'.
 * @returns {String} The resolved yaml document
 */
function replaceFileRefs(filePath, options) {
  const dirPath = path.dirname(filePath)
  const doc = fs.readFileSync(filePath, 'utf8')
  return processFragment(doc, dirPath, options)
}

/*
 * 1. find all refs in fragment
 * 2. for each ref
 *    - determine its white space indent
 *    - resolve its fragment
 *    - apply indent to all lines of fragment
 *    - recurse from 1 with this fragment
 *    - insert resolved fragment tree into original fragment
 * 3. return resolved fragment
 */
function processFragment(fragment, dirPath, options) {
  var results = fragment.match(/^[ ]*(- )?\$ref: \.\.?\/.+\.ya?ml$/gm)
  while (results && results.length > 0) {
    var ref = results.shift()
    var fragPath = path.join(dirPath, ref.substr(ref.indexOf('.')))
    var isList = ref.trim().indexOf('-') === 0
    var ws = ref.match(/^\s*/)[0]
    var nextFragment = fs.readFileSync(fragPath, 'utf8')
    var lines = removeAutoGenComment(nextFragment.split('\n'), options)
    var mark = ws
    if (isList) {
      mark += '- '
      ws += options.indent
    }
    nextFragment = mark + lines.join(`\n${ws}`).trim()
    nextFragment = processFragment(nextFragment, path.dirname(fragPath), options)
    fragment = fragment.split(ref).join(nextFragment)
  }
  return fragment
}

/*
 * Each `.map.yml` and `.list.yml` file contains a generated comment at start.
 *
 * When we generate the index we remove these from the output.
 */
function removeAutoGenComment(lines, options) {
  if (lines[0] && lines[0].trim() === options.autoGenComment) {
    lines.shift()
  }
  return lines
}
