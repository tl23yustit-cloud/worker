const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const fileinclude = require('gulp-file-include');
const fg = require("fast-glob");

// [초기화]
function clean(cb) {
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
    }
    cb();
}

// 💡 [개선] 폴더 구조 탐색 시 .md가 없는 폴더를 추적하여 함께 반환
function getDepthsFromMD(htmlFilePath) {
    const baseDir = "static/html/pub";
    const relativeDir = path.dirname(path.relative(baseDir, htmlFilePath)); 
    
    if (relativeDir === "." || relativeDir === "") return { depths: [], missing: [] };

    const parts = relativeDir.split(path.sep);
    let depths = [];
    let missing = []; // 누락된 폴더명 추적 배열
    let currentPath = baseDir;

    for (const part of parts) {
        currentPath = path.join(currentPath, part);
        
        const mdPath1 = path.join(currentPath, '.md');
        const mdPath2 = path.join(currentPath, '_name.md');
        
        let depthName = part; 
        
        if (fs.existsSync(mdPath1)) {
            depthName = fs.readFileSync(mdPath1, 'utf8').trim();
        } else if (fs.existsSync(mdPath2)) {
            depthName = fs.readFileSync(mdPath2, 'utf8').trim();
        } else {
            // 💡 .md 파일이 둘 다 없으면 missing 배열에 폴더명 추가
            missing.push(part);
        }
        
        depths.push(depthName);
    }
    
    return { depths, missing }; // 뎁스 배열과 누락 폴더 배열을 같이 리턴
}

// 퍼블리스트용 JSON 자동 생성
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
        const statusKey = path.relative("static/html/pub", file).replace(/\\/g, "/");
        
        const statusInfo = statusMap[statusKey] || {};

        let issues = [];
        let depths;
        let isMdGenerated = false;
        let missingMdDirs = [];

        // 1. 뎁스는 항상 폴더의 .md를 기준으로 생성하고, 없으면 폴더명을 사용
        const mdResult = getDepthsFromMD(file);
        depths = mdResult.depths;
        missingMdDirs = mdResult.missing;
        isMdGenerated = true;

        // 2. 이슈 검출 (?dev 모드에서 보여줄 데이터)
        if (!statusMap[statusKey]) {
            issues.push("status.js 미등록");
        } 
        
        // 💡 .md 기반으로 뎁스를 생성했을 때의 피드백 처리
        if (isMdGenerated) {
            if (missingMdDirs.length > 0) {
                // 누락된 폴더가 있으면 해당 폴더 이름을 뱃지로 띄워줌
                issues.push(`.md 누락: ${missingMdDirs.join('/')}`);
            } else {
                // 모두 잘 작성되어 있다면 정상 적용되었다는 뱃지
                issues.push("MD 뎁스 완벽적용");
            }
        }

        return {
            depths: depths,
            title: statusInfo.title || fileId,
            fileId: fileId,
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
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    fs.writeFileSync(path.join(outputDir, "list.json"), JSON.stringify(list, null, 2));
    done();
}

function html() {
    return gulp.src(['static/html/pub/**/*.html', 'index.html', '!static/html/pub/**/layout/*.html'], { base: '.', allowEmpty: true })
        .pipe(fileinclude({ prefix: '@@', basepath: '@root', indent: true }))
        .on('error', function (err) { console.error('❌ [HTML ERROR]:', err.toString()); this.emit('error', err); })
        .pipe(gulp.dest('dist'));
}

function styles() {
    return gulp.src(['static/css/**/*.scss', 'static/cl/**/*.scss'], { base: '.', allowEmpty: true })
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' }))
        .on('error', function (err) { console.error('❌ Sass 에러:\n', err.messageFormatted); this.emit('end'); })
        .pipe(postcss([autoprefixer()]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
}

function stylesBuild() {
    return gulp.src(['static/css/**/*.scss', 'static/cl/**/*.scss'], { base: '.', allowEmpty: true })
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(postcss([autoprefixer()]))
        .pipe(gulp.dest('dist'));
}

function copyAssets() {
    return gulp.src(['static/js/**/*', 'static/images/**/*', 'static/css/**/font/**/*', 'static/cl/**/*', '!static/cl/**/*.scss'], { base: '.', allowEmpty: true, encoding: false })
        .pipe(gulp.dest('dist'));
}

function watchFiles() {
    const browserSync = require('browser-sync').create();
    browserSync.init({ server: { baseDir: './dist', index: 'static/html/pub/index.html' }, port: 3000 });

    gulp.watch(['static/html/**/*.html', 'static/cl/status/**/*.js', 'static/html/**/*.md'], gulp.series(generatePubList, html, (done) => { browserSync.reload(); done(); }));
    gulp.watch(['static/css/**/*.scss', 'static/cl/**/*.scss'], gulp.series(styles, (done) => { browserSync.reload(); done(); }));
    gulp.watch(['static/js/**/*', 'static/images/**/*', 'static/css/**/font/**/*', 'static/cl/**/*', '!static/cl/**/*.scss'], gulp.series(copyAssets, (done) => { browserSync.reload(); done(); }));
}

const dev = gulp.series(clean, generatePubList, gulp.parallel(html, styles, copyAssets), watchFiles);
const build = gulp.series(clean, generatePubList, html, stylesBuild, copyAssets);

exports.default = dev;
exports.build = build;