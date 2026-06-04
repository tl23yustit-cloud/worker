const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const fileinclude = require('gulp-file-include');
const browserSync = require('browser-sync').create();
const { deleteAsync } = require('del');

// 기존 dist 폴더를 완전히 삭제하는 태스크
function clean() {
    return deleteAsync(['dist']);
}

// 1. HTML 조립
function html() {
    return gulp.src(['html/**/*.html', 'index.html', '!html/**/layout/*.html'], { base: '.' })
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
}

// 2. SCSS 컴파일
function styles() {
    return gulp.src(['css/**/*.scss', 'cl/**/*.scss'], { base: '.' })
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        // 중요: write() 내부를 비워두면 .css.map 파일을 따로 만들지 않고, 
        // 생성되는 .css 파일 가장 아랫줄에 소스맵 코드를 글자 형태로 심어버립니다(Inlined).
        .pipe(sourcemaps.write()) 
        // 절대 루트의 css 폴더에 .css를 뽑지 않고, 곧바로 dist 폴더로만 결과물을 보냅니다.
        .pipe(gulp.dest('dist')) 
        .pipe(browserSync.stream());
}

// 2-1. SCSS 컴파일 (배포용: 압축 및 소스맵 완전히 제거)
function stylesBuild() {
    return gulp.src(['css/**/*.scss', 'cl/**/*.scss'], { base: '.' })
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(gulp.dest('dist'));
}

// 3. 자산 파일 복사 (js, images, font, cl 내부의 일반 파일까지 포함)
function copyAssets() {
    return gulp.src([
        'js/**/*', 
        'images/**/*', 
        'css/**/font/**/*', 
        'cl/**/*', 
        '!cl/**/*.scss'
    ], { base: '.' })
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
}

// 브라우저 실시간 동기화 서버 (Browsersync)
function watchFiles() {
    browserSync.init({
        server: {
            baseDir: './dist',
            index: 'index.html'
        },
        port: 3000
    });

    // 파일 변경 감지 및 실시간 반영
    gulp.watch(['html/**/*.html', 'index.html'], html);
    gulp.watch(['css/**/*.scss', 'cl/**/*.scss'], styles);
    gulp.watch(['js/**/*', 'images/**/*', 'css/**/font/**/*', 'cl/**/*', '!cl/**/*.scss'], copyAssets);
}

// 실행 순서 정의
const dev = gulp.series(clean, gulp.parallel(html, styles, copyAssets), watchFiles);
const build = gulp.series(clean, html, stylesBuild, copyAssets);

exports.default = dev;
exports.build = build;