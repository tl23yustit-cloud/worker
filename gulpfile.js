const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const fileinclude = require('gulp-file-include');
const fg = require("fast-glob");

// 💡 [초기화] Node.js 내장 fs 모듈로 dist 폴더 완전 삭제 (del 라이브러리 충돌 방지) 
function clean(cb) {
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
    }
    cb();
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
        "static/html/pub/**/*.html",
        "!static/html/pub/**/layout/*.html"
    ]);

    const list = files.map(file => {
        const stat = fs.statSync(file);

        const fileName = path.basename(file);
        const title = path.basename(file, ".html");

        const depths = path
            .dirname(file)
            .replace(/^static[\\/]html[\\/]/, "")
            .split(/[\\/]/)
            .slice(1);



        const statusKey = depths.concat(fileName).join("/");

        const statusInfo = statusMap[statusKey] || {};

        return {
            depths,
            title,
            file: fileName,

            status: statusInfo.status || "대기",
            worker: statusInfo.worker || "-",
            note: statusInfo.note || "-",

            link: file.replace(/\\/g, "/"),
            modified: stat.mtime.toLocaleString("ko-KR")
        };
    });


    const outputDir = "dist/static/html/pub";

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(outputDir, "list.json"),
        JSON.stringify(list, null, 2)
    );
    done();
}

// 1. HTML 조립
function html() {
    return gulp.src(['static/html/pub/**/*.html', 'index.html', '!static/html/pub/**/layout/*.html'], {
        base: '.',
        allowEmpty: true
    })
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@root',
            indent: true
        }))
        .on('error', function (err) {
            console.error('❌ [HTML INCLUDE ERROR]:', err.toString());
            process.exitCode = 1;
            this.emit('end');
        })
        .pipe(gulp.dest('dist'));
}

// 2. SCSS 컴파일 (개발용)
function styles() {
    return gulp.src(['static/css/**/*.scss', 'static/cl/**/*.scss'], { base: '.', allowEmpty: true })
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' }))
        .on('error', function (err) {
            console.error('❌ Sass 컴파일 에러 발생:\n', err.messageFormatted || err.message);
            this.emit('end');
        })
        .pipe(postcss([autoprefixer()]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
}

// 2-1. SCSS 컴파일 (배포용)
function stylesBuild() {
    return gulp.src(['static/css/**/*.scss', 'static/cl/**/*.scss'], { base: '.', allowEmpty: true })
        .pipe(sass({ outputStyle: 'compressed' }))
        .on('error', function (err) {
            console.error('❌ [SASS BUILD ERROR]:\n', err.messageFormatted || err.message);
            process.exitCode = 1;
            this.emit('end');
        })
        .pipe(postcss([autoprefixer()]))
        .pipe(gulp.dest('dist'));
}

// 3. 자산 파일 복사
function copyAssets() {
    return gulp.src([
        'static/js/**/*',
        'static/images/**/*',
        'static/css/**/font/**/*',
        'static/cl/**/*',
        '!static/cl/**/*.scss'
    ], {
        base: '.',
        allowEmpty: true,
        encoding: false,
        sourcemaps: false
    })
        .pipe(gulp.dest('dist'));
}

// 브라우저 실시간 동기화 서버 (Browsersync는 dev 명령어 실행 시에만 동적 로드)
function watchFiles() {
    const browserSync = require('browser-sync').create();

    browserSync.init({
        server: {
            baseDir: './dist',
            index: 'static/html/pub/index.html'
        },
        port: 3000
    });

    gulp.watch(['static/html/**/*.html', 'status.json'], gulp.series(generatePubList, html, (done) => { browserSync.reload(); done(); }));
    gulp.watch(['static/css/**/*.scss', 'static/cl/**/*.scss'], gulp.series(styles, (done) => { browserSync.reload(); done(); }));
    gulp.watch(['static/js/**/*', 'static/images/**/*', 'static/css/**/font/**/*', 'static/cl/**/*', '!static/cl/**/*.scss'], gulp.series(copyAssets, (done) => { browserSync.reload(); done(); }));
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