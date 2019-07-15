const gulp = require("gulp");
const gulpUtil = require("gulp-util");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");

const SRC = {
    JS: "src/js/*.js",
    CSS: "src/css/*.css",
};

const DEST = {
    JS: "public/js",
    CSS: "public/css",
};

function customMinJS() {
    return gulp.src(SRC.JS)
        .pipe(uglify())
        .pipe(rename({
            extname: ".min.js",
        }))
        .pipe(gulp.dest(DEST.JS));
}

function concatJS() {
    return gulp.src([
        "node_modules/jquery/dist/jquery.min.js",
        "node_modules/bootstrap/dist/js/bootstrap.min.js",
        "node_modules/fastclick/lib/fastclick.js",
        "node_modules/nprogress/nprogress.js",
    ])
        .pipe(concat("libraries.js"))
        .pipe(uglify())
        .pipe(rename({
            extname: ".min.js",
        }))
        .pipe(gulp.dest(DEST.JS));
}

function customMinCSS() {
    return gulp.src(SRC.CSS)
        .pipe(cleanCSS())
        .pipe(rename({
            extname: ".min.css",
        }))
        .pipe(gulp.dest(DEST.CSS));
}

exports.minJS = customMinJS;
exports.minCSS = customMinCSS;
exports.concatJS = concatJS;

gulp.task("default", gulp.series(customMinJS, customMinCSS, concatJS, done => {
    gulpUtil.log("Gulp Default -- Other tasks are complete");
    done();
}));

/*
gulp.task("watch", function(){
  gulp.watch(SRC.JS, ["js"]);
  gulp.watch(SRC.CSS, ["css"]);
});*/
