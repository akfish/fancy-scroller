marked = require 'marked'
fs = require 'fs'
hash = (str) ->
  return str.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\./g, '-')
    .replace(/-{2,}/g, '-')

class Renderer extends marked.Renderer
  stack: []
  sections: {}
  hashes: []

  heading: (text, level) =>
    # console.log(tex t)
    html = ""

    if level <= 2
      if @stack.length > 0
        html += "</div>"

      if not @sections[level]?
        @sections[level] = 0

      @sections[level] += 1

      id = @sections[level]
      @stack.push([level, id])
      className = if level == 1 then 'intro' else 'l2'
      h = hash(text)
      html += "<div id='section-#{level}-#{id}' name='#{h}' class='section #{className}'>"
      this.hashes.push {hash: h, title: text}

    html += "<h#{level}>#{text}</h#{level}>"

    html

  eof: ->
    html = ""
    while (@stack.length > 0)
      @stack.pop()
      html += "</div>"

    html


module.exports =
class ReadMe
  constructor: (@file) ->
    @src = fs.readFileSync(@file, 'utf-8')

  render: ->
    renderer = new Renderer()

    html = marked @src,
      highlight: (code) ->
        require('highlight.js').highlightAuto(code).value
      renderer: renderer

    html += renderer.eof()

    r =
      html: html
      hashes: renderer.hashes

    r
