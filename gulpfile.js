const gulp = require('gulp'),
clean = require('gulp-clean'),
cleanCss = require('gulp-clean-css'),
htmlmin = require('gulp-htmlmin'),
uglify = require('gulp-uglify'),
rev = require('gulp-rev'),
revCollector = require('gulp-rev-collector'),
imagemin = require('gulp-imagemin'),
browserSync = require('browser-sync').create(),
babel = require('gulp-babel'),
gulpSequence = require('gulp-sequence'),
less = require('gulp-less'),
postcss = require("gulp-postcss");
autoprefixer = require("autoprefixer");
pxtoviewport = require('postcss-px-to-viewport')

const path = {
  srcPath: 'src/',
  distPath: 'dist/',
  revPath: 'rev/'
}

/*
* 清除dist目录
*/
gulp.task('clean:dist',()=>{
  return gulp.src(path.distPath)
  .pipe(clean())
})

/*
* 清除rev目录
*/
gulp.task('clean:rev',()=>{
  return gulp.src(path.revPath)
  .pipe(clean())
})

/*
* 处理less文件
*/
gulp.task('handleLess',()=>{
  const processors = pxtoviewport({
    viewportWidth: 750,
    viewportHeight: 1334,
    viewportUnit: 'vw'
  })
  return gulp.src(`${path.srcPath}css/*.less`)
  .pipe(less())
  .pipe(postcss([autoprefixer,processors]))
  .pipe(gulp.dest(`${path.distPath}css`))
})

/*
* 处理less文件并文件命名加md5
*/
gulp.task('handleLessRev',()=>{
  const processors = pxtoviewport({
    viewportWidth: 750,
    viewportHeight: 1334,
    viewportUnit: 'vw'
  })
  return gulp.src(`${path.srcPath}css/*.less`)
  .pipe(less())
  .pipe(postcss([autoprefixer,processors]))
  .pipe(rev())
  .pipe(cleanCss())
  .pipe(gulp.dest(`${path.distPath}css`))
  .pipe(rev.manifest())
  .pipe(gulp.dest(`${path.revPath}css`))
})

/*
* 处理js文件
*/
gulp.task('handleJs',()=>{
  return gulp.src(`${path.srcPath}js/*.js`)
  .pipe(babel())
  .pipe(uglify())
  .pipe(gulp.dest(`${path.distPath}js`))
})

/*
* 处理js文件并文件命名加md5
*/
gulp.task('handleJsRev',()=>{
  return gulp.src(`${path.srcPath}js/*.js`)
  .pipe(babel())
  .pipe(uglify())
  .pipe(rev())
  .pipe(gulp.dest(`${path.distPath}js`))
  .pipe(rev.manifest())
  .pipe(gulp.dest(`${path.revPath}js`))
})

/*
* 压缩图片
*/
gulp.task('images',()=>{
  return gulp.src(`${path.srcPath}images/*.{png,jpg,gif,ico}`)
  .pipe(imagemin())
  .pipe(gulp.dest(`${path.distPath}images`))
})

/*
* 压缩图片并文件命名加md5
*/
gulp.task('imagesRev',()=>{
  return gulp.src(`${path.srcPath}images/*.{png,jpg,gif,ico}`)
  .pipe(imagemin())
  .pipe(rev())
  .pipe(gulp.dest(`${path.distPath}images`))
  .pipe(rev.manifest())
  .pipe(gulp.dest(`${path.revPath}images`))
})

/*
* 压缩html
*/
gulp.task('htmlmin',()=>{
  return gulp.src(`${path.srcPath}*.html`)
  .pipe(revCollector())
  .pipe(htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      minifyJS: true,
      minifyCSS: true
  }))
  .pipe(gulp.dest(path.distPath))
})

/*
* 压缩html并替换Rev文件
*/
gulp.task('htmlminRev',()=>{
  return gulp.src([`${path.revPath}**/*.json`,`${path.srcPath}*.html`])
  .pipe(revCollector())
  .pipe(htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      minifyJS: true,
      minifyCSS: true
  }))
  .pipe(gulp.dest(path.distPath))
})

/*
* 开发时 入口文件src/index.html
* 如需修改可以去掉index注释
* 设置服务器
*/
gulp.task('server',()=>{
  browserSync.init({
      files: "**",
      server: {
        baseDir: path.distPath,
        // index: `./`
      }
      
  })
})

/*
* 监听文件
*/
gulp.task('auto',()=>{
  gulp.watch(`${path.srcPath}css/*.less`,['handleLess']);
  gulp.watch(`${path.srcPath}js/*.js`,['handleJs']);
  gulp.watch(`${path.revPath}**/*.json`,['htmlmin']);
  gulp.watch(`${path.srcPath}*.html`,['htmlmin']);
  gulp.watch(`${path.srcPath}images/*.{png,jpg,gif,ico}`, ['images']);
})


gulp.task('dev',(cb)=>{
  gulpSequence('clean:dist','clean:rev','handleLess','handleJs','images','htmlmin','server','auto')(cb)
});

gulp.task('build',(cb)=>{
  gulpSequence('clean:dist','clean:rev','handleLessRev','handleJsRev','images','htmlminRev')(cb)
});