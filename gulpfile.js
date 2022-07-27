const { series, parallel, src, dest } = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins')();

const htmlmin = gulpLoadPlugins.htmlmin;
const uglify  = gulpLoadPlugins.uglify;

const stripDebug = gulpLoadPlugins.stripDebug

const enterFileName   = 'code-origin'
const exportFileName  = 'code-mini'

const miniHtml = () => {
  return src(`${enterFileName}/**/*.html`)
    .pipe(htmlmin({
      collapseWhitespace: true,            // 压缩HTML
      collapseBooleanAttributes: true,     // 省略布尔属性值
      removeTagWhitespace: true,           // 清除制表符的空白
      removeEmptyAttributes: true,         // 清除 空的属性值
      removeComments: true,                // 清除 HTML 中的注释
      removeScriptTypeAttributes: true,    // 删除<script>的type="text/javascript"
      removeStyleLinkTypeAttributes: true, // 删除<style>和<link>的type="text/css"
      minifyJS: true,                      // 压缩 html文件中的 script
      minifyCSS: true,                     // 压缩 html文件中的 style

      minifyURLs: true,
    }))
    .pipe(dest(`${exportFileName}`))
}


const miniJs = () => {
  return src(`${enterFileName}/**/*.js`)
    .pipe(uglify({
      compress: true,  // 是否完全压缩
      mangle: true, // 是否修改变量名
    }))
    .pipe(stripDebug()) // 去除 console.log 和 debugger
    .pipe(dest(`${exportFileName}`))
}

exports.miniHtml = miniHtml
exports.miniJs = miniJs

exports.default = parallel(miniHtml, miniJs)
