const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const merge = require('merge-stream');
const ts = require("gulp-typescript");
const terser = require('gulp-terser');
const concat = require('gulp-concat');
const browserSync = require('browser-sync');
const fileinclude = require('gulp-file-include');

const tsProject = ts.createProject("./tsconfig.json");

sass.compiler = require('node-sass');

const fileInclude = () => {
  return gulp.src(['./src/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.stream());
};

const compileSass = () => {
  return gulp.src('./src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream());
}

const compileScripts = () => {
  return tsProject.src()
    .pipe(tsProject())
    .pipe(gulp.dest("./dist/js"))
    .pipe(browserSync.stream());
}

const copyImages = () => {
  return gulp.src(['./src/images/**/*'])
    .pipe(gulp.dest("./dist/images"))
    .pipe(browserSync.stream());
}

const copyFonts = () => {
  return gulp.src(['./src/fonts/**/*'])
    .pipe(gulp.dest("./dist/fonts"))
    .pipe(browserSync.stream());
}

gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    }
  });
});

exports.build = gulp.series([compileSass, compileScripts, fileInclude, copyImages, copyFonts])

exports.include = gulp.series([fileInclude])

exports.default = () => {
  browserSync.init({
    server: {
      baseDir: './dist/',
      index: 'index.html'
    },
    port: 3000,
    open: true
  })
  gulp.watch('./src/scss/**/*.scss', compileSass)
  gulp.watch('./src/ts/**/*.ts', compileScripts)
  gulp.watch('./src/**/*.html', fileInclude)
  gulp.watch('./src/images/**/*', copyImages)
  gulp.watch('./src/fonts/**/*', copyFonts)
}

