marked = require 'marked'
fs = require 'fs'

class Renderer extends marked.Renderer
  stack: []
  sections: {}

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
      html += "<div id='section-#{level}-#{id}' name='#{text}' class='section #{className}'>"

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
      renderer: renderer

    html += renderer.eof()

    html
