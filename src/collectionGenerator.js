const path = require('path')
const glob = require('glob')

exports.isCollectionFile = isCollectionFile
exports.renderCollectionFile = renderCollectionFile

/**
 * Check to see if a path targets a collection yaml document which we should generate.
 *
 * @param {String} filePath path to yaml file
 * @returns {Boolean} True if a collection file, false if not
 */
function isCollectionFile(filePath) {
  const filename = path.basename(filePath)
  return /^\.(map|list)\.ya?ml$/.test(filename)
}

/**
 * Render the contents of a `.map.yml` or `.list.yml` file.
 *
 * This contains references to all yaml files in the directory it resides
 * in a list or map yaml format.
 *
 * @param {String} filePath Path to the collection file
 * @param {Options} opt document generation options
 * @returns {String} The contents of the collection file
 */
function renderCollectionFile(filePath, opt) {
  const dirPath = path.dirname(filePath)
  const fileName = path.basename(filePath)
  const isMap = fileName.startsWith('.map')

  const sortCollection = opt.sortCollection(dirPath)
  const formatMapKey = opt.formatMapKey(dirPath)
  const files = glob.sync(`${dirPath}/+(*.yml|*.yaml)`)
  const contents = files
    .map(filePath => Object.assign({ filePath }, path.parse(filePath)))
    .sort(sortCollection)
    .reduce((s, file) => {
      const refPath = opt.relativePaths ? file.base : path.relative(opt.rootDir, file.filePath)
      if (isMap) {
        let key = formatMapKey(file)
        if (opt.quoteMapKeyRegex && key.match(opt.quoteMapKeyRegex)) {
          key = `'${key}'`
        }
        s += `${key}:\n${opt.indent}`
      } else {
        s += '- '
      }
      return `${s}$ref: ./${refPath}\n`
    }, '')
  return contents
}
