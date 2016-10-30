/// <binding AfterBuild='Tree:build' Clean='clean' />
"use strict";

var gulp = require("gulp"),
	rimraf = require("rimraf"),
	concat = require("gulp-concat"),
	cssmin = require("gulp-cssmin"),
	uglify = require("gulp-uglify"),
	ts = require("gulp-typescript");

var onError = function (err) {
	console.log(err);
};

var config = {
	sources: ["./src/**/*.js"],
	outputDir: "./dist/",
	outputFile: "tree.js"
};

gulp.task("build",
	function () {
		return gulp.src(config.sources)
			.pipe(concat(config.outputFile))
			.pipe(gulp.dest(config.outputDir));
	});
