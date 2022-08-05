const { series, parallel, src, dest } = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins')();

const htmlmin = gulpLoadPlugins.htmlmin;
const uglify = gulpLoadPlugins.uglify;
const cleanCss = gulpLoadPlugins.cleanCss;
const babel = gulpLoadPlugins.babel;
const concat = gulpLoadPlugins.concat;
const rename = gulpLoadPlugins.rename;

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
      `!${enterFileName}/js/common/*.js`,
      `!${enterFileName}/js/*.min.js`
    ])
    .pipe(babel())
    .pipe(uglify({
      compress: true,
      mangle: true
    }))
    // .pipe(stripDebug())
    .pipe(dest(`${exportFileName}`))
}

// 对原始js文件进行bundle打包
const bundleNormal = (cb) => {
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
    bundle(option)
  })
  cb && cb()
}

const bundleConcat = (cb) => {
  const concatJs = require('./concat.map.json').js

  var rebuildJs = concatJs.map(item => {
    item.entry = `${item.originOutput}/${item.rename}`
    return item
  })

  rebuildJs.forEach(option => {
    bundle(option)
  })
  cb && cb()
}

// 基础bundle方法
const bundle = (option) => {
  return browserify({
    entries: option.entry
  })
    .transform(babelify)
    .bundle()
    .pipe(source(option.rename))
    .pipe(buffer())
    .pipe(uglify({
      compress: true,
      mangle: true
    }))
    // .pipe(stripDebug())
    .pipe(dest(option.output))
}

exports.bundle = bundle

const miniCss = () => {
  return src(`${enterFileName}/**/*.css`)
    // .pipe(sourcemaps.init())
    .pipe(postcss([
      autoprefixer({
        overrideBrowserslist: ['> 1%', 'last 2 versions', 'Firefox ESR'],
        cascade: true //  是否美化属性值
      })
    ]))
    // .pipe(sourcemaps.write('.'))
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

const concatJs = (cb) => {
  const options = require('./concat.map.json').js
  options.forEach(item => {
    return src(item.entry)
      .pipe(rename(item.rename))
      .pipe(dest(item.originOutput)) // 在原始文件下也保存一份
      .pipe(dest(item.output))
  })
  cb && cb()
}

const concatCss = (cb) => {
  const options = require('./concat.map.json').css
  options.forEach(item => {
    return src(item.entry)
      // .pipe(sourcemaps.init())
      .pipe(postcss([
        autoprefixer({
          overrideBrowserslist: ['> 1%', 'last 2 versions', 'Firefox ESR'],
          cascade: true //  是否美化属性值
        })
      ]))
      // .pipe(sourcemaps.write('.'))
      .pipe(cleanCss({
        format: false, // 属性值：false|keep-breaks|beautify 默认false(压缩)
        inline: ['none'], // 当 css文件中有 @import 'xxx.css'语法时, 属性值为none则不将 xxx.css全部解析到当前的css文件
      }))
      .pipe(dest(item.originOutput)) // 在原始文件下也保存一份
      .pipe(dest(item.output))
  })
  cb && cb()
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
  bundleNormal,
  parallel(
    concatJs,
    concatCss
  ),
  bundleConcat,
)