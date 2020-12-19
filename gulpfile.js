const { src, dest, series, parallel } = require('gulp');


// HTML tasks
function htmlTask() {
    return src('src/*.html')
        .pipe(dest('dist'));
}

// scripts tasks 
function scriptsTask() {
    return src('src/scripts/*.js')
        .pipe(dest('dist/scripts'));
}

// styles tasks 
function stylesTask() {
    return src('src/styles/*.css')
        .pipe(dest('dist/styles'));
}



// to make tasks available in gulp command 
exports.html = htmlTask;
exports.scripts = scriptsTask;
exports.styles = stylesTask;

exports.default = series(parallel(htmlTask, stylesTask, scriptsTask));