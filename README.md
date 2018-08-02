# Yaml Fragment 🗂️

[![Build Status](https://travis-ci.org/mikestead/yaml-fragment.svg?branch=master)](https://travis-ci.org/mikestead/yaml-fragment) [![npm version](https://img.shields.io/npm/v/yaml-fragment.svg?style=flat-square)](https://www.npmjs.com/package/yaml-fragment)

A tool to construct a yaml document from smaller yaml documents.

Aims to generate a single yaml document formatted exactly as you wrote your referenced fragments,
making it easy to share with humans or machine.

> Transforming to json and back to yaml can lose some original formatting, because of this no
> transformation is done, instead each fragment is inserted where it's referenced in a parent document.

[OpenAPI](https://www.openapis.org) [spec](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md)
generation is a primary use case, but it can be used anywhere you have an unwieldy yaml document
which would be easier to maintain in fragments.

## Installation

You can install globally

```
npm install yaml-fragment -g
```

Or locally

```
npm install yaml-fragment --save-dev
```

## Usage

### CLI

Here's an example to generate `api.yml` from fragments found in a `spec` directory, with `index.yml` being the root fragment. Also enables openapi processing defaults.

```bash
yaml-fragment -d ./spec -o api.yml --openapi
```

#### Options

```bash
  Usage: cli [options]

  Options:

    -V, --version                  output the version number
    -d, --rootDir <dir>            root directory of your fragments
    -i, --indexFile [fragment]     index document which references fragments (default: ./index.yml)
    -o, --outFile <file>           output file of the grouped fragments
    --openapi                      enable openapi fragment processing
    -h, --help                     output usage information
```

### Code

A similar example from the CLI one above.

```javascript
import { genDocument } from 'yaml-fragment'

genDocument({
  rootDir: './spec',  // base directory of fragments, with default of index.yml root document
  outFile: 'api.yml', // the file to generate
  openapi: true       // enable openapi processing defaults
}}
```

#### Options

- `rootDir: string` root directory of your fragments
- `indexFile: string` index document which references fragments (default: ./index.yml)
- `outFile: string` output file of the grouped fragments
- `openapi: bool` enable openapi fragment processing. See OpenAPI section below.
- `indent: string` indentation to use in yaml. Defaults to two spaces.
- `formatMapKey` function which returns a function, given a directory path, to format a [parsed path object](https://nodejs.org/api/path.html#path_path_parse_pathstring) to a yaml map key. Defaults to return raw filename.
- `sortCollection` function which returns a function, given a directory path, which sorts keys of a collection. Defaults to use [localeCompare](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare)
- `quoteMapKeyRegex` regex to test map keys. If it fails the key will be wrapped in quotes. Defaults to wrap anything starting with a number.
- `relativePaths` true if using relative paths in generated collection files. Defaults to true.

### Fragments

Start with a base document which includes `$ref`s to local fragments.

_Important: To be replaced, $ref paths must begin with`./`or`../`._

#### index.yml

```yaml
swagger: '2.0'
info:
  $ref: ./info.yml
host: petstore.swagger.io
basePath: /v1
schemes:
  - http
consumes:
  - application/json
produces:
  - application/json
paths:
  $ref: ./paths/.map.yml
definitions:
  $ref: ./definitions/.map.yml
```

#### Maps

To generate a yaml map based on each fragment file in a directory, simply target
that directory with a `.map.yml` file as seen above. _This file shouldn't exist on disk._

During document generation any `.map.yml` will be populated in memory with references
to each yaml fragment file in the same directory, e.g.

```yaml
Error:
  $ref: ./Error.yml
Pet:
  $ref: ./Pet.yml
Pets:
  $ref: ./Pets.yml
```

The key for each defaults to the filename it references, however you can process these names
via the option `formatMapKey`. For example if the key is an OpenAPI path we can use underscores
in the filename to represent forward slash and then replace these during generation.

    options.formatMapKey = (dirPath) => file => file.name.split('_').join('/')

This would convert the filename `_pets_{petId}` to the key `/pets/{petId}` and is
one of the defaults applied when the `openapi` options is present.

#### Lists

To generate a yaml list based on each fragment file in a directory, simply target
that directory with a `.list.yml` file (much the same a `.map.yml`). _This file shouldn't exist on disk._

During document generation any `.list.yml` will be populated in memory with references
to each yaml fragment file in the same directory, e.g.

```yaml
- $ref: ./Error.yml
- $ref: ./Pet.yml
- $ref: ./Pets.yml
```

#### OpenAPI

By enabling the `openapi` option you'll turn on some automatic defaults to process an OpenAPI document.

First, the `formatMapKey` option is set with a function to format OpenAPI path fragments which sit under a `paths` directory. This will turn file names like

    _pets_{petId}.yml

to map keys like

    /pets/{petId}

Second, `sortCollection` is applied to path keys to place paths with parameters below paths with none. For example

    GET /pets/popular
    GET /pets/{petId}

Although it's not at all great design to collide paths like this (really try and avoid it), it can
help on some platforms like V8 (Node) where object iteration is deterministic. For example when adding
Express routes which are priority ordered.

## Examples

[See here](https://github.com/mikestead/yaml-fragment/tree/master/test/_fixture) for a more complete
example of fragments.
