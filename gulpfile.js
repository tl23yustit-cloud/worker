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

    // static/html 경로 반영
    const files = fg.sync([
        "static/html/pub/**/*.html",
        "!static/html/pub/**/layout/*.html"
    ]);

    const list = files.map(file => {
        const stat = fs.statSync(file);

        // static/html 경로를 제거하여 깊이 계산
        const folders = path
            .dirname(file)
            .replace(/^static[\\/]html[\\/]/, "")
            .split(/[\\/]/);

        const fileName = path.basename(file);
        const title = path.basename(file, ".html");
        
        const depths = path
            .dirname(file)
            .replace(/^static[\\/]html[\\/]/, "")
            .split(/[\\/]/)
            .slice(1);
            
        const statusKey = depths.concat(fileName).join("/");

        return {
            depths,
            title,
            file: fileName,
            status: statusMap[statusKey] || "대기",
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
    return gulp.src(['static/html/pub/**/*.html', 'index.html', '!static/html/pub/**/layout/*.html'], { base: '.' })
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@root'
        }))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
}

// 2. SCSS 컴파일 (static/css 및 static/cl 경로 수정)
function styles() {
    return gulp.src(['static/css/**/*.scss', 'static/cl/**/*.scss'], { base: '.' })
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

// 2-1. SCSS 컴파일 (배포용)
function stylesBuild() {
    return gulp.src(['static/css/**/*.scss', 'static/cl/**/*.scss'], { base: '.' })
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(gulp.dest('dist'));
}

// 3. 자산 파일 복사 (static 폴더 내 js, images, font, cl 등 반영)
function copyAssets() {
    return gulp.src([
        'static/js/**/*',
        'static/images/**/*',
        'static/css/**/font/**/*',
        'static/cl/**/*',
        '!static/cl/**/*.scss'
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
    gulp.watch(['static/html/**/*.html', 'index.html', 'status.json'], gulp.series(generatePubList, html));
    gulp.watch(['static/css/**/*.scss', 'static/cl/**/*.scss'], styles);
    gulp.watch(['static/js/**/*', 'static/images/**/*', 'static/css/**/font/**/*', 'static/cl/**/*', '!static/cl/**/*.scss'], copyAssets);
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