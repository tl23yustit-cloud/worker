const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const fileinclude = require('gulp-file-include');
const fg = require("fast-glob");

// [초기화] Node.js 내장 fs 모듈로 dist 폴더 완전 삭제 
function clean(cb) {
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
    }
    cb();
}

// 퍼블리스트용 JSON 자동 생성 (static/cl/status/ 연동)
function generatePubList(done) {
    let statusMap = {};

    const statusJsPath = path.resolve('./static/cl/status/status.js');

    if (fs.existsSync(statusJsPath)) {
        Object.keys(require.cache).forEach(key => {
            if (key.includes(path.resolve('./static/cl/status'))) {
                delete require.cache[key];
            }
        });
        statusMap = require(statusJsPath);
    }

    const files = fg.sync([
        "static/html/pub/**/*.html",
        "!static/html/pub/**/layout/*.html"
    ]);

    const list = files.map(file => {
        const stat = fs.statSync(file);

        const fileName = path.basename(file);
        const fileId = path.basename(file, ".html");

        const statusKey = path
            .relative("static/html/pub", file)
            .replace(/\\/g, "/");

        const hasMapping = Object.prototype.hasOwnProperty.call(statusMap, statusKey);
        const statusInfo = statusMap[statusKey] || {};

        const defaultDepths = path
            .dirname(file)
            .replace(/^static[\\/]html[\\/]/, "")
            .split(/[\\/]/)
            .slice(1);

        const depths = (statusInfo.depths && statusInfo.depths.length > 0)
            ? statusInfo.depths
            : defaultDepths;

        const title = statusInfo.title || fileId;

        // 💡 누락 사유(Validation) 진단 로직 추가
        const issues = [];
        if (!hasMapping) {
            issues.push("status.js 미등록");
        } else {
            if (!statusInfo.depths || statusInfo.depths.length === 0) {
                issues.push("뎁스(depths) 누락");
            }
            if (!statusInfo.title) {
                issues.push("화면명(title) 누락");
            }
        }

        return {
            depths,
            title,
            fileId,
            file: fileName,
            status: statusInfo.status || "대기",
            worker: statusInfo.worker || "-",
            note: statusInfo.note || "-",
            link: statusKey,
            modified: stat.mtime.toLocaleString("ko-KR"),
            hasIssues: issues.length > 0,
            issueReasons: issues 
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
            this.emit('error', err);
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
            this.emit('error', err);
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

// 브라우저 실시간 동기화 서버
function watchFiles() {
    const browserSync = require('browser-sync').create();

    browserSync.init({
        server: {
            baseDir: './dist',
            index: 'static/html/pub/index.html'
        },
        port: 3000
    });

    gulp.watch(['static/html/**/*.html', 'static/cl/status/**/*.js'], gulp.series(generatePubList, html, (done) => { browserSync.reload(); done(); }));
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