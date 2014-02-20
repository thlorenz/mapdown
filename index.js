'use strict';

var md         = require('markdown').markdown
  , objectify  = require('./lib/objectify')
  , offsetify  = require('./lib/offsetify')
  , mapify     = require('./lib/mapify')
  , whitespace = require('./lib/whitespace')
  , indexesOf  = require('indexes-of')
  ;

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

module.exports = Mapper;

/**
 * Maps locations of markdown text to the raw text with markdown tags removed and vice versa
 * 
 * @name Mapper
 * @function
 * @param {String} markdownText 
 */
function Mapper (markdown) {
  this._update(markdown);
}

Mapper.prototype._update = function (markdown) {
  this._markdown = markdown;

  var markedWhitespace = whitespace.mark(markdown);
  var tree = md.parse(markedWhitespace);
  var otree  = objectify(tree);

  this._offsets = offsetify(otree.content);

  var maps = mapify(this._offsets);
  this._mapToMd = maps.mapToMd;
  this._mapToRaw = maps.mapToRaw;

  // not a mistake - the amount of raw chars equals to the length of mappings from raw to md and vice versa
  this.eofRaw = this._mapToMd.length;
  this.eofMd = this._mapToRaw.length;

  this._nodes = maps.nodes;
  this._rawParts = this._nodes.map(function (x) { return whitespace.unmark(x.content) });
  this._raw = this._rawParts.join('');
}

Mapper.prototype.renderMarkdown = function () {
  return this._markdown;
}

Mapper.prototype.renderRaw = function () {
  return this._raw;
}

Mapper.prototype.rawToMd = function (pos) {
  return this._mapToMd[pos];
}

Mapper.prototype.mdToRaw = function (pos) {
  return this._mapToRaw[pos];
}

Mapper.prototype.insertMarkdown = function (pos, s) {
  this._update(this._markdown.slice(0, pos) + s + this._markdown.slice(pos));
  return this;
}

Mapper.prototype.multiInsertMarkdown = function (inserts) {
  var offset = 0;
  var markdown = inserts
    .reduce(function (acc, x) {
      var pos = offset + x[0]
        , s = x[1];

      offset += s.length;
      return acc.slice(0, pos) + s + acc.slice(pos);
    }, this._markdown);

  this._update(markdown);
  return this;
}

// we always update markdown and derive anything else from it even when user inserted into raw text
Mapper.prototype.insertRaw = function (pos, s) {
  var mdpos = this.rawToMd(pos);
  this._update(this._markdown.slice(0, mdpos) + s + this._markdown.slice(mdpos));
  return this;
}

// Example: surround with '**' when 'bold' command was executed
Mapper.prototype.surroundRaw = function (from, to, s) {
  var mdFrom = this.rawToMd(from) 
    , mdTo = this.rawToMd(to);

  this.multiInsertMarkdown([ [ mdFrom, s], [ mdTo, s ] ]); 
  return this;
}


/*var fs = require('fs');

var readme = fs.readFileSync(__dirname + '/../README.md', 'utf8');
var mapper = new Mapper(readme);*/

var mdText = [
    '# MyTitle'
  , ''
  , 'My 3rd line'
  , ''
  , '## My SubTitle'
].join('\n')

var mapper = new Mapper(mdText);
inspect(mapper.renderMarkdown())
inspect(mapper.renderRaw())
