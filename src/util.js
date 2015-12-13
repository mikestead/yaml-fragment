const fs = require('fs')
const DEFAULT_AUTO_GEN_COMMENT = '# Auto Generated'
const DEFAULT_INDENT = '  '

exports.applyDefaultOptions = applyDefaultOptions
exports.writeFile = writeFile

/**
 * Ensure any undefined options are assigned defaults.
 *
 * @param {Object} options
 *  - indent: Indentation string to use in yaml. Defaults to two spaces.
 *  - autoGenComment: A comment to place at the top of any generated file. Defaults to '# Auto Generated'.
 *  - formatMapKey: Function to format a file to a yaml map key. Defaults to return raw filename.
 *  - quoteMapKeyRegex: Regex to test map keys. If it fails the key will be wrapped in quotes. Defaults to null.
 *  - relativePaths: True if using relative paths in generated collection files. Defaults to true.
 *
 * @returns {Object} The resolved options with defaults applied
 */
function applyDefaultOptions(options) {
	return Object.assign({
		indent: DEFAULT_INDENT,
		autoGenComment: DEFAULT_AUTO_GEN_COMMENT,
		formatMapKey: file => file.name,
		quoteMapKeyRegex: /^[0-9]/,
		relativePaths: true
	}, options)
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
		fs.writeFile(path, contents, err => err ? reject(err) : resolve())
	})
}
