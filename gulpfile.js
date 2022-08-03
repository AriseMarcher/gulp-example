const { series, parallel, src, dest } = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins')();

const htmlmin = gulpLoadPlugins.htmlmin;
const uglify = gulpLoadPlugins.uglify;
const cleanCss = gulpLoadPlugins.cleanCss;
// const babel = gulpLoadPlugins.babel;
// var browserify = require('browserify');
// const babelify = require('babelify')

const autoprefixer = require('autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const postcss = require('gulp-postcss')

const stripDebug = gulpLoadPlugins.stripDebug
// const source = require('vinyl-source-stream')
// const buffer     = require('vinyl-buffer')
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
  return src(`${enterFileName}/**/*.js`)
    .pipe(uglify({
      compress: true,
      mangle: true
    }))
    .pipe(stripDebug())
    .pipe(dest(`${exportFileName}`))

    // return browserify(`./code-origin/js/index.js`)
    //   .transform(babelify, {
    //     presets: ['@babel/preset-env'],
    //     plugins: [
    //       "@babel/plugin-transform-runtime",
    //       {
    //         "helpers": true,
    //         "corejs": false,
    //         "regenerator": true,
    //         "useESModules": false,
    //         "absoluteRuntime": false,
    //       }
    //     ]
    //   })
    //   .bundle()
    //   .pipe(source(`index.js`))

      // .pipe(buffer())
    // browserify(`${enterFileName}/**/*.js`)
    // .transform(babelify, {
    //   presets: ['@babel/preset-env'],
    //   // plugins: ['@babel/transform-runtime']
    // });
    // .pipe(uglify({
    //   compress: true,  // 是否完全压缩
    //   mangle: true,    // 是否修改变量名
    // }))
    // .pipe(stripDebug()) // 去除 console.log 和 debugger
    // .pipe(dest(`code-mini/js/`))
}

const miniCss = () => {
  return src(`${enterFileName}/**/*.css`)
    .pipe(sourcemaps.init())
    .pipe(postcss([
      autoprefixer({
        overrideBrowserslist: ['> 1%', 'last 2 versions', 'Firefox ESR'], // 重要配置 详见下面
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

exports.miniHtml = miniHtml
exports.miniJs = miniJs
exports.miniCss = miniCss
exports.clean = clean

// function defaultTask(cb) {
//   cb()
// }

// exports.default = defaultTask

exports.default = series(
  clean,
  parallel(
    miniHtml,
    miniJs,
    miniCss,
  )
)