var fs = require('fs');

var gulp = require('gulp');
var gulpDocs = require('gulp-ngdocs');
var runSequence = require('run-sequence');
var watch = require('gulp-watch');
var clean = require('gulp-clean');
var connect = require('gulp-connect');
var templateCache = require('gulp-angular-templatecache');

var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');

var jshint = require('gulp-jshint');

var baseDir = __dirname
var appDir = baseDir + '/app';
var modulesDir = appDir + '/modules';
var files = {
    templates: appDir + '/modules/**/templates/**/*.html',
    scripts: modulesDir + '/**/*.js'
}

gulp.task('cleanTemplates', function () {
    return gulp.src('**/templates.js', {read: false}).pipe(clean());
});

gulp.task('cleanBuild', function () {
    return gulp.src('.tmp/build').pipe(clean());
});

gulp.task('cleanDocs', function () {
    return gulp.src('.tmp/docs').pipe(clean());
});

gulp.task('connectDev', function () {
    connect.server({
        root: ['app'],
        port: 8000
    });
});

gulp.task('connectDocs', function () {
    connect.server({
        root: ['.tmp/docs'],
        port: 8001
    });
});

gulp.task('jshint', function () {
    gulp.src(files.scripts)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('usemin', function () {
    return gulp.src(appDir + '/index.html')
    .pipe(usemin({
        css: [minifyCss(), 'concat', rev()],
        html: [minifyHtml({empty: true})],
        js: [uglify(), rev()]
    }))
    .pipe(gulp.dest('.tmp/build/'));
});

gulp.task('templates', function () {
    fs.readdir(modulesDir, function (err, dirs) {
        dirs.forEach(function (dir) {
            var path = modulesDir + '/' + dir;
            gulp.src(path + '/**/templates/**/*.html')
                .pipe(templateCache({
                    module: dir,
                    templateHeader: '(function (angular) {\n "use strict";\n angular.module("<%= module %>"<%= standalone %>).run(["$templateCache", function($templateCache) {',
                    templateFooter: '\n }]);\n }(window.angular));'
                }))
                .pipe(gulp.dest(path + '/scripts'));
        });
    });
});

gulp.task('copy', function () {
    gulp.src(appDir + '/images/**/*')
        .pipe(gulp.dest('.tmp/build/images'));

    gulp.src(appDir + '/bower_components/bootstrap/dist/fonts/*')
        .pipe(gulp.dest('.tmp/build/fonts'));
});

gulp.task('ngdocs', function () {
    var options = {
        html5Mode: false,
        title: 'Old Weather Documentation'
    };

    gulp.src(files.scripts)
        .pipe(gulpDocs.process(options))
        .pipe(gulp.dest('.tmp/docs'));
});

gulp.task('watch', function () {
    gulp.watch([files.templates], ['templates']);
    gulp.watch([files.scripts], ['ngdocs']);
});

gulp.task('default', function (cb) {
    runSequence(
        'cleanDocs',
        'cleanTemplates',
        'templates',
        'ngdocs',
        [
            'watch',
            'connectDev',
            'connectDocs'
        ],
        cb
    )
});

gulp.task('docs', function (cb) {
    runSequence(
        'cleanDocs',
        'ngdocs',
        cb
    )
});

gulp.task('build', function (cb) {
    runSequence(
        'cleanBuild',
        'copy',
        'usemin',
        cb
    );
});

gulp.task('test', function (cb) {
    runSequence(
        'jshint',
        cb
    )
});
