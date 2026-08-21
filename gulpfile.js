const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process'); // Git 명령어 실행용
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const fileinclude = require('gulp-file-include');
const fg = require("fast-glob");

// ==========================================
// 💡 [환경 설정 플래그]
// true  : Git 환경 (마지막 커밋 날짜 기준 수정일 계산)
// false : SVN / 내부망 환경 (파일 시스템 mtime 기준 수정일 계산)
// ==========================================
const IS_GIT_MODE = true; 

// [초기화]
function clean(cb) {
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
    }
    cb();
}

// .md 파일 내용 캐싱용 Map 객체
const mdCache = new Map();

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
        
        if (mdCache.has(currentPath)) {
            const cached = mdCache.get(currentPath);
            if (cached.missingPart) missing.push(cached.missingPart);
            depths.push(cached.depthName);
            continue;
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

        mdCache.set(currentPath, { depthName, missingPart });
        
        if (missingPart) missing.push(missingPart);
        depths.push(depthName);
    }
    
    return { depths, missing }; 
}

// 💡 [모드별 수정일 가져오기 함수 (경로 정규화 적용)]
function getFileModifiedTime(filePath, stat) {
    if (IS_GIT_MODE) {
        try {
            // 프로젝트 루트 기준의 올바른 상대 경로로 변환 후 백슬래시(\)를 슬래시(/)로 변경
            const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

            // 해당 파일의 마지막 커밋 날짜 가져오기
            const gitTimeStr = execSync(`git log -1 --format="%ai" "${relativePath}"`, { encoding: 'utf8' }).trim();
            
            if (gitTimeStr) {
                return new Date(gitTimeStr).toLocaleString("ko-KR");
            }
        } catch (e) {
            // Git 히스토리가 없거나 에러 발생 시 아래 mtime으로 폴백
        }
    }
    
    // SVN 환경 또는 Git 커밋 내역이 없는(Untracked/Modified) 파일인 경우 파일 시스템 mtime 사용
    return stat.mtime.toLocaleString("ko-KR");
}

// 퍼블리스트용 JSON 자동 생성
function generatePubList(done) {
    let statusMap = {};
    const statusJsPath = path.resolve('./static/cl/status/status.js');
    const statusDir = path.resolve('./static/cl/status');

    if (fs.existsSync(statusJsPath)) {
        for (const key in require.cache) {
            if (key.startsWith(statusDir)) {
                delete require.cache[key];
            }
        }
        statusMap = require(statusJsPath);
    }

    const entries = fg.sync([
        "static/html/pub/**/*.html",
        "!static/html/pub/**/layout/*.html"
    ], { objectMode: true, stats: true });

    const list = entries.map(entry => {
        const filePath = entry.path;
        const stat = entry.stats;
        const fileName = entry.name;
        const fileId = path.basename(filePath, ".html");
        const statusKey = path.relative("static/html/pub", filePath).replace(/\\/g, "/");
        
        const statusInfo = statusMap[fileId] || statusMap[statusKey] || {};

        let issues = [];
        const mdResult = getDepthsFromMD(filePath);
        const depths = mdResult.depths;
        const missingMdDirs = mdResult.missing;

        if (!statusMap[fileId] && !statusMap[statusKey]) {
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
            modified: getFileModifiedTime(filePath, stat),
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

    gulp.watch(['static/html/**/*.html', '!static/html/**/*.md'], gulp.series(generatePubList, html, (done) => { browserSync.reload(); done(); }));
    gulp.watch('static/html/**/*.md', gulp.series(clearMdCache, generatePubList, (done) => { browserSync.reload(); done(); }));
    gulp.watch('static/cl/status/**/*.js', gulp.series(generatePubList, (done) => { browserSync.reload(); done(); }));

    gulp.watch(['static/css/**/*.scss', 'static/cl/**/*.scss'], gulp.series(styles, (done) => { browserSync.reload(); done(); }));
    gulp.watch(['static/js/**/*', 'static/images/**/*', 'static/css/**/font/**/*', 'static/cl/**/*', '!static/cl/**/*.scss'], gulp.series(copyAssets, (done) => { browserSync.reload(); done(); }));
}

const dev = gulp.series(clean, generatePubList, gulp.parallel(html, styles, copyAssets), watchFiles);
const build = gulp.series(clean, generatePubList, html, stylesBuild, copyAssets);

exports.default = dev;
exports.build = build;