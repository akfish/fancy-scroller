path        = require 'path'
gulp        = require 'gulp'
gutil       = require 'gulp-util'
less        = require 'gulp-less'
ejs         = require 'gulp-ejs'
minify      = require 'gulp-minify-css'
rename      = require 'gulp-rename'
uglify      = require 'gulp-uglify'
minimist    = require 'minimist'
_           = require 'underscore'
ReadMe      = require './util/readme-renderer'

publish_dir = '.site'
dist_dir    = 'dist'

asset_files     = './asset/**/*.*'
main_files      = './src/**/*.*'
less_files      = './less/**/*.*'
demo_files      = './demo/**/*.*'
dist_files      = './dist/**/*.*'
main_less_file  = './less/style.less'
main_js_file    = './src/fancy-scroller.js'
demo_less_file  = './demo/**/*.less'
demo_ejs_file   = './demo/**/*.ejs'


cli_parser_opts =
  default:
    debug: false
  # '--': true

opts = minimist process.argv, cli_parser_opts

if opts.debug
  console.log "Build in debug mode"


copy_assets = (src, dst) ->
  gulp.src src
    .pipe gulp.dest(dst)

compile_less = (src, dst) ->
  gulp.src src
    .pipe less()
    # .pipe rename("#{name}.css")
    .pipe gulp.dest(dst)
    .pipe minify()
    .pipe rename({suffix: '.min'})
    .pipe gulp.dest(dst)

compile_js = (src, dst) ->
  gulp.src src
    # .pipe rename("#{name}.js")
    .pipe gulp.dest(dst)
    .pipe uglify()
    .pipe rename({suffix: '.min'})
    .pipe gulp.dest(dst)

DEFAULT_EJS_CONTENT =
  url_for: (name, ext) ->
    return "#{name}#{if not opts.debug then ".min" else ""}.#{ext}"

  css: (path) ->
    src = this.url_for path, 'css'
    return "<link rel='stylesheet' href='#{src}'>"

  js: (path) ->
    src = this.url_for path, 'js'
    return "<script src='#{src}'></script>"

compile_ejs = (src, dst, context) ->
  gulp.src src
    .pipe ejs(_.defaults(DEFAULT_EJS_CONTENT, context))
    .pipe gulp.dest(dst)

gulp.task 'build', ->
  compile_less  main_less_file, dist_dir
  compile_js    main_js_file, dist_dir

gulp.task 'demo', ['build'], ->
  copy_assets asset_files, publish_dir
  copy_assets dist_dir + '/**/*.*', publish_dir
  compile_less  demo_less_file, publish_dir

  r = new ReadMe('./README.md').render()
  context =
    content: r.html
    hashes: r.hashes
    debug: opts.debug

  compile_ejs   demo_ejs_file, publish_dir, context

gulp.task 'watch', ->
  gulp.watch main_files, ['build']
  gulp.watch less_files, ['build']
  gulp.watch asset_files, ['demo']
  gulp.watch demo_files, ['demo']
  gulp.watch dist_files, ['demo']

gulp.task 'default', ['build', 'demo']
