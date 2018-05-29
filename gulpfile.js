var gulp = require("gulp");
var gulp_util = require("gulp-util");
var uglify = require("gulp-uglify");
var cleanCSS = require("gulp-clean-css");
var rename = require("gulp-rename");

var DIR = {
  SRC : "src",
  DEST : "public"
};

var SRC = {
  JS : DIR.SRC + "/js/*.js",
  CSS : DIR.SRC + "/css/*.css"
};

var DEST = {
  JS : DIR.DEST + "/js",
  CSS : DIR.DEST + "/css"
};

function minJS() {
  return gulp.src(SRC.JS)
    .pipe(uglify())
    .pipe(rename({extname : ".min.js"}))
    .pipe(gulp.dest(DEST.JS));
}

function minCSS() {
  return gulp.src(SRC.CSS)
    .pipe(cleanCSS({compatibility : "ie8"}))
    .pipe(rename({extname : ".min.css"}))
    .pipe(gulp.dest(DEST.CSS));
}

exports.minJS = minJS;
exports.minCSS = minCSS;

gulp.task("default", gulp.series(minJS, minCSS, (done) => {
  gulp_util.log("Gulp Default -- Other tasks are complete");
  done();
}));

/*
gulp.task("watch", function(){
  gulp.watch(SRC.JS, ["js"]);
  gulp.watch(SRC.CSS, ["css"]);
});*/
