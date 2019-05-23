var gulp = require("gulp");
var gulp_util = require("gulp-util");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var cleanCSS = require("gulp-clean-css");
var rename = require("gulp-rename");

var SRC = {
    JS: "src/js/*.js",
    CSS: "src/css/*.css"
};

var DEST = {
    JS: "public/js",
    CSS: "public/css"
};

function customMinJS() {
    return gulp.src(SRC.JS)
        .pipe(uglify())
        .pipe(rename({
            extname: ".min.js"
        }))
        .pipe(gulp.dest(DEST.JS));
}

function concatJS() {
    return gulp.src([
        "node_modules/jquery/dist/jquery.min.js",
        "node_modules/bootstrap/dist/js/bootstrap.min.js",
        "node_modules/fastclick/lib/fastclick.js",
        "node_modules/nprogress/nprogress.js"
    ])
        .pipe(concat("libraries.js"))
        .pipe(uglify())
        .pipe(rename({
            extname: ".min.js"
        }))
        .pipe(gulp.dest(DEST.JS));
}

function customMinCSS() {
    return gulp.src(SRC.CSS)
        .pipe(cleanCSS())
        .pipe(rename({
            extname: ".min.css"
        }))
        .pipe(gulp.dest(DEST.CSS));
}

exports.minJS = customMinJS;
exports.minCSS = customMinCSS;
exports.concatJS = concatJS;

gulp.task("default", gulp.series(customMinJS, customMinCSS, concatJS, (done) => {
    gulp_util.log("Gulp Default -- Other tasks are complete");
    done();
}));

/*
gulp.task("watch", function(){
  gulp.watch(SRC.JS, ["js"]);
  gulp.watch(SRC.CSS, ["css"]);
});*/
