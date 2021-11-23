"use strict";

const {src, dest} = require("gulp");
const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const cssbeautify = require("gulp-cssbeautify");
const removeComments = require('gulp-strip-css-comments');
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const cssnano = require("gulp-cssnano");
const pxtorem = require('gulp-pxtorem');
const plumber = require("gulp-plumber");
const imagemin = require("gulp-imagemin");
const del = require("del");
const notify = require("gulp-notify");
const webpackStream = require('webpack-stream');
const browserSync = require("browser-sync").create();
const pug = require('gulp-pug');
const frontMatter  = require('gulp-front-matter');

const svgSprite = require('gulp-svg-sprites');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');


/* Paths */
const srcPath = 'src/';
const distPath = 'dist/';

const path = {
    build: {
        html:   distPath,
        js:     distPath + "assets/js/",
        css:    distPath + "assets/css/",
        img:    distPath + "assets/images/",
        svg:    distPath + "assets/sprites/",
        fonts:  distPath + "assets/fonts/"
    },
    src: {
        html:   srcPath + "index.pug",
        js:     srcPath + "assets/js/*.js",
        css:    srcPath + "assets/scss/*.{sass,scss}",
        img:    srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        svg:    srcPath + "assets/icons/*.svg",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    watch: {
        html:   srcPath + "**/*.pug",
        js:     srcPath + "assets/js/**/*.js",
        css:    srcPath + "assets/scss/**/*.{sass,scss}",
        img:    srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        svg:    srcPath + "assets/icons/*.svg",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    clean: "./" + distPath
}



/* Tasks */

function serve() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        }
    });
}

function html(cb) {
    return src(path.src.html, {base: srcPath})
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(frontMatter({ property: 'data' }))
        .pipe(pug({
                pretty: true
            })
        )
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function css(cb) {
    return src(path.src.css, {base: srcPath + "assets/scss/"})
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "SCSS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass({
            includePaths: './node_modules/'
        }))
        .pipe(autoprefixer({
            cascade: true
        }))
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(pxtorem({
			rootValue: 10,
			unitPrecision: 5,
		    propList: ['top', 'left', 'right', 'bottom', 'font', 'font-size', 'line-height', 'letter-spacing', 'margin', 'margin-top', 'padding', 'height', 'min-height', 'max-height', 'width', 'max-width', 'flex'],
		    selectorBlackList: ['.fancybox-button'],
		    replace: true,
		    mediaQuery: false,
		    minPixelValue: 18
		}))
        .pipe(removeComments())
        .pipe(rename({
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function cssWatch(cb) {
    return src(path.src.css, {base: srcPath + "assets/scss/"})
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "SCSS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass({
            includePaths: './node_modules/'
        }))
        .pipe(pxtorem({
			rootValue: 10,
			unitPrecision: 5,
		    propList: ['top', 'left', 'right', 'bottom', 'font', 'font-size', 'line-height', 'letter-spacing', 'margin', 'margin-top', 'padding', 'height', 'min-height', 'max-height', 'width', 'max-width', 'flex'],
		    selectorBlackList: ['.fancybox-button'],
		    replace: true,
		    mediaQuery: false,
		    minPixelValue: 18
		}))
        .pipe(rename({
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function js(cb) {
    return src(path.src.js, {base: srcPath + 'assets/js/'})
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "JS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(webpackStream({
          mode: "production",
          output: {
            filename: 'app.js',
          },
          module: {
            rules: [
              {
                test: /\.(js)$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                  presets: ['@babel/preset-env']
                }
              }
            ]
          }
        }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function jsWatch(cb) {
    return src(path.src.js, {base: srcPath + 'assets/js/'})
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "JS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(webpackStream({
          mode: "development",
          output: {
            filename: 'app.js',
          }
        }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function img(cb) {
    return src(path.src.img)
        .pipe(dest(path.build.img))
        .pipe(browserSync.reload({stream: true}));

    cb();
}


function fonts(cb) {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function clean(cb) {
    return del(path.clean);

    cb();
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], cssWatch);
    gulp.watch([path.watch.js], jsWatch);
    gulp.watch([path.watch.img], img);
    gulp.watch([path.watch.fonts], fonts);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, img, fonts));
const watch = gulp.parallel(build, watchFiles, serve);



/* Exports Tasks */
exports.html = html;
exports.css = css;
exports.js = js;
exports.img = img;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
