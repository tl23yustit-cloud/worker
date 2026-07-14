const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const fileinclude = require('gulp-file-include');
const browserSync = require('browser-sync').create();
const { deleteAsync } = require('del');
const fg = require("fast-glob");
const fs = require("fs");
const path = require("path");
// 기존 dist 폴더를 완전히 삭제하는 태스크
function clean() {
    return deleteAsync(['dist']);
}
// 퍼블리스트용 JSON 생성
function generatePubList(done) {
    let statusMap = {};

    if (fs.existsSync("status.json")) {
        statusMap = JSON.parse(
            fs.readFileSync("status.json", "utf8")
        );
    }
    const files = fg.sync([
        "html/**/*.html",
        "!html/**/layout/*.html"
    ]);

    const list = files.map(file => {

        const stat = fs.statSync(file);

        const folders = path
            .dirname(file)
            .replace(/^html[\\/]/, "")
            .split(/[\\/]/);

        const lastFolder = folders[folders.length - 1] || "";


        const fileName = path.basename(file);
        
        const title = path.basename(file, ".html");
        const depths = path
            .dirname(file)
            .replace(/^html[\\/]/, "")
            .split(/[\\/]/)
            .slice(1);
        return {
            depths,
            title,
            file: fileName,
            status: statusMap[fileName] || "대기",
            link: file.replace(/\\/g, "/"),
            modified: stat.mtime.toLocaleString("ko-KR")
        };

    });

    // dist 폴더가 없으면 생성
    if (!fs.existsSync("dist")) {
        fs.mkdirSync("dist");
    }

    fs.writeFileSync(
        "dist/list.json",
        JSON.stringify(list, null, 2)
    );

    done();
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
        .pipe(sass({ outputStyle: 'expanded' }))
        .on('error', function (err) {
            console.error('❌ Sass 컴파일 에러 발생:\n', err.messageFormatted || err.message);
            this.emit('end');
        })
        .pipe(postcss([autoprefixer()]))
        .pipe(sourcemaps.write())
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
    ], {
        base: '.',
        encoding: false,
        sourcemaps: false
    })
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
    gulp.watch(['html/**/*.html', 'index.html','status.json'], gulp.series(generatePubList, html));
    gulp.watch(['css/**/*.scss', 'cl/**/*.scss'], styles);
    gulp.watch(['js/**/*', 'images/**/*', 'css/**/font/**/*', 'cl/**/*', '!cl/**/*.scss'], copyAssets);
}

// 실행 순서 정의
const dev = gulp.series(
    clean,
    generatePubList,
    gulp.parallel(html, styles, copyAssets),
    watchFiles
);

const build = gulp.series(
    clean,
    generatePubList,
    html,
    stylesBuild,
    copyAssets
);

exports.default = dev;
exports.build = build;