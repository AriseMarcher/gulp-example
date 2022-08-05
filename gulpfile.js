const { series, parallel, src, dest } = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins')();

const htmlmin = gulpLoadPlugins.htmlmin;
const uglify = gulpLoadPlugins.uglify;
const cleanCss = gulpLoadPlugins.cleanCss;
const babel = gulpLoadPlugins.babel;
const browserify = require('browserify');
const babelify = require('babelify')

const autoprefixer = require('autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const postcss = require('gulp-postcss')

const stripDebug = gulpLoadPlugins.stripDebug
const source = require('vinyl-source-stream')
const buffer     = require('vinyl-buffer')
const del = require('del')

const enterFileName = 'code-origin'
const exportFileName = 'code-mini'

const miniHtml = () => {
  return src(`${enterFileName}/**/*.html`)
    .pipe(htmlmin({
      collapseWhitespace: true, // 压缩HTML
      collapseBooleanAttributes: true, // 省略布尔属性值
      removeTagWhitespace: true, // 清除制表符的空白
      removeEmptyAttributes: true, // 清除 空的属性值
      removeComments: true, // 清除 HTML 中的注释
      removeScriptTypeAttributes: true, // 删除<script>的type="text/javascript"
      removeStyleLinkTypeAttributes: true, // 删除<style>和<link>的type="text/css"
      minifyJS: true, // 压缩 html文件中的 script
      minifyCSS: true, // 压缩 html文件中的 style
      minifyURLs: true,
    }))
    .pipe(dest(`${exportFileName}`))
}

const miniJs = () => {
  return src(
    [
      `${enterFileName}/**/*.js`,
      `!${enterFileName}/js/common/*.js`
    ])
    .pipe(babel())
    .pipe(uglify({
      compress: true,
      mangle: true
    }))
    .pipe(stripDebug())
    .pipe(dest(`${exportFileName}`))
}

const bundle = (cb) => {
  const options = [
    {
      entry: "code-origin/js/index.js",
      rename: "index.js",
      output: "code-mini/js"
    },
    {
      entry: "code-origin/js/common.js",
      rename: "common.js",
      output: "code-mini/js"
    },
  ]

  options.forEach(option => {
    return browserify({
      entries: option.entry
    })
      .transform(babelify, {
        presets: ["@babel/preset-env"],
        plugins: [
          ["@babel/plugin-transform-runtime", {
          "absoluteRuntime": false,
          "corejs": 3,
          "helpers": true,
          "regenerator": true,
          "version": "7.18.10"
        }]
        ]
      })
      .bundle()
      .pipe(source(option.rename))
      .pipe(buffer())
      .pipe(uglify({
        compress: true,
        mangle: true
      }))
      // .pipe(stripDebug())
      .pipe(dest(option.output))
  })
  cb && cb()
}

exports.bundle = bundle

const miniCss = () => {
  return src(`${enterFileName}/**/*.css`)
    .pipe(sourcemaps.init())
    .pipe(postcss([
      autoprefixer({
        overrideBrowserslist: ['> 1%', 'last 2 versions', 'Firefox ESR'],
        cascade: true //  是否美化属性值
      })
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(cleanCss({
      format: false, // 属性值：false|keep-breaks|beautify 默认false(压缩)
      inline: ['none'], // 当 css文件中有 @import 'xxx.css'语法时, 属性值为none则不将 xxx.css全部解析到当前的css文件
    }))
    .pipe(dest(`${exportFileName}`))
}

const clean = () => {
  return del(exportFileName)
}

const copy = (enter, output) => {
  return function () {
    return src(enter)
      .pipe(dest(output))
  }
}

const copyAll = copy(`${enterFileName}/**`, `${exportFileName}`)

exports.miniHtml = miniHtml
exports.miniJs = miniJs
exports.miniCss = miniCss
exports.clean = clean

exports.default = series(
  clean,
  copyAll,
  parallel(
    miniHtml,
    miniJs,
    miniCss,
  ),
  bundle,
)