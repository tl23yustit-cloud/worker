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

// 💡 [개선 1] .md 파일 내용 캐싱용 Map 객체 (디스크 I/O 최소화)
const mdCache = new Map();

// .md 캐시 초기화 함수 (Watch에서 활용)
function clearMdCache(cb) {
    mdCache.clear();
    cb();
}

function getDepthsFromMD(htmlFilePath) {
    const baseDir = "static/html/pub";
    const relativeDir = path.dirname(path.relative(baseDir, htmlFilePath)); 
    
    if (relativeDir === "." || relativeDir === "") return { depths: [], missing: [] };

    const parts = relativeDir.split(path.sep);
    let depths = [];
    let missing = []; 
    let currentPath = baseDir;

    for (const part of parts) {
        currentPath = path.join(currentPath, part);
        
        // 💡 캐시 확인: 이미 탐색한 폴더면 파일 시스템(fs) 접근 패스
        if (mdCache.has(currentPath)) {
            const cached = mdCache.get(currentPath);
            if (cached.missingPart) missing.push(cached.missingPart);
            depths.push(cached.depthName);
            continue; // 아래 로직 생략하고 다음 뎁스로 진행
        }

        const mdPath1 = path.join(currentPath, '.md');
        const mdPath2 = path.join(currentPath, '_name.md');
        
        let depthName = part; 
        let missingPart = null;
        
        if (fs.existsSync(mdPath1)) {
            depthName = fs.readFileSync(mdPath1, 'utf8').trim();
        } else if (fs.existsSync(mdPath2)) {
            depthName = fs.readFileSync(mdPath2, 'utf8').trim();
        } else {
            missingPart = part;
        }

        // 💡 탐색 결과 캐싱
        mdCache.set(currentPath, { depthName, missingPart });
        
        if (missingPart) missing.push(missingPart);
        depths.push(depthName);
    }
    
    return { depths, missing }; 
}

// 퍼블리스트용 JSON 자동 생성
function generatePubList(done) {
    let statusMap = {};
    const statusJsPath = path.resolve('./static/cl/status/status.js');
    const statusDir = path.resolve('./static/cl/status');

    if (fs.existsSync(statusJsPath)) {
        // 💡 [개선 2] require.cache 순회 최적화
        for (const key in require.cache) {
            if (key.startsWith(statusDir)) {
                delete require.cache[key];
            }
        }
        statusMap = require(statusJsPath);
    }

    // 💡 [개선 3] objectMode와 stats 옵션을 켜서 fs.statSync 개별 호출 제거
    const entries = fg.sync([
        "static/html/pub/**/*.html",
        "!static/html/pub/**/layout/*.html"
    ], { objectMode: true, stats: true });

    const list = entries.map(entry => {
        const filePath = entry.path;
        const stat = entry.stats; // fs.statSync 대용
        const fileName = entry.name;
        const fileId = path.basename(filePath, ".html");
        const statusKey = path.relative("static/html/pub", filePath).replace(/\\/g, "/");
        
        const statusInfo = statusMap[statusKey] || {};

        let issues = [];
        
        const mdResult = getDepthsFromMD(filePath);
        const depths = mdResult.depths;
        const missingMdDirs = mdResult.missing;

        if (!statusMap[statusKey]) {
            issues.push("status.js 미등록");
        } 
        
        if (missingMdDirs.length > 0) {
            issues.push(`.md 누락: ${missingMdDirs.join('/')}`);
        } else {
            issues.push("MD 뎁스 완벽적용");
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

    // 💡 [개선 4] Watch 영역 분리 (불필요한 HTML 빌드 방지)
    
    // 1. HTML이 바뀌면: JSON 갱신 + HTML 빌드
    gulp.watch(['static/html/**/*.html', '!static/html/**/*.md'], gulp.series(generatePubList, html, (done) => { browserSync.reload(); done(); }));
    
    // 2. MD 폴더명이 바뀌면: 캐시 삭제 + JSON만 갱신 (HTML 빌드 안 함)
    gulp.watch('static/html/**/*.md', gulp.series(clearMdCache, generatePubList, (done) => { browserSync.reload(); done(); }));
    
    // 3. Status 데이터가 바뀌면: JSON만 갱신 (HTML 빌드 안 함)
    gulp.watch('static/cl/status/**/*.js', gulp.series(generatePubList, (done) => { browserSync.reload(); done(); }));

    // CSS 및 Assets
    gulp.watch(['static/css/**/*.scss', 'static/cl/**/*.scss'], gulp.series(styles, (done) => { browserSync.reload(); done(); }));
    gulp.watch(['static/js/**/*', 'static/images/**/*', 'static/css/**/font/**/*', 'static/cl/**/*', '!static/cl/**/*.scss'], gulp.series(copyAssets, (done) => { browserSync.reload(); done(); }));
}

const dev = gulp.series(clean, generatePubList, gulp.parallel(html, styles, copyAssets), watchFiles);
const build = gulp.series(clean, generatePubList, html, stylesBuild, copyAssets);

exports.default = dev;
exports.build = build;