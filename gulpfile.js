const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const fileinclude = require('gulp-file-include');
const fg = require("fast-glob");

// ==========================================
// 💡 [환경 설정 플래그]
// true  : SVN 환경 (svn info 명령어 기준 수정일 계산)
// false : Git 환경 (git log 명령어 기준 수정일 계산)
// ==========================================
const IS_SVN_MODE = false; 

// [초기화]
function clean(cb) {
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
    }
    cb();
}

// 캐싱용 Map 객체들 (성능 최적화 핵심)
const mdCache = new Map();
const timeCache = new Map(); // 💡 파일별 날짜 결과 캐싱

function clearCaches(cb) {
    mdCache.clear();
    timeCache.clear(); // 빌드/와치 시 캐시 초기화
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

// 💡 [최적화된 수정일 가져오기 함수 (캐싱 적용)]
function getFileModifiedTime(filePath, stat) {
    // 이미 조회한 적이 있는 파일이라면 캐시된 값을 즉시 반환 (속도 극대화)
    if (timeCache.has(filePath)) {
        return timeCache.get(filePath);
    }

    let modifiedTime = null;

    try {
        const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

        if (IS_SVN_MODE) {
            const svnOutput = execSync(`svn info "${relativePath}"`, { encoding: 'utf8' });
            const match = svnOutput.match(/Last Changed Date:\s+([^\n]+)/);
            if (match && match[1]) {
                const dateObj = new Date(match[1].trim());
                if (!isNaN(dateObj.getTime())) {
                    modifiedTime = dateObj.toLocaleString("ko-KR");
                }
            }
        } else {
            const gitTimeStr = execSync(`git log -1 --format="%cd" --date=iso-strict "${relativePath}"`, { encoding: 'utf8' }).trim();
            if (gitTimeStr) {
                const dateObj = new Date(gitTimeStr);
                if (!isNaN(dateObj.getTime())) {
                    modifiedTime = dateObj.toLocaleString("ko-KR");
                }
            }
        }
    } catch (e) {
        // 에러 발생 시 mtime 폴백
    }

    // 만약 명령어 결과가 없다면 파일 시스템 mtime 사용
    if (!modifiedTime) {
        modifiedTime = stat.mtime.toLocaleString("ko-KR");
    }

    // 메모리에 결과 저장
    timeCache.set(filePath, modifiedTime);
    return modifiedTime;
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

    // 💡 개별 파일 수정 시 해당 파일만 캐시를 지우고 빠르게 반영하도록 최적화
    gulp.watch(['static/html/**/*.html', '!static/html/**/*.md'], gulp.series(generatePubList, html, (done) => { browserSync.reload(); done(); }));
    gulp.watch('static/html/**/*.md', gulp.series(clearCaches, generatePubList, (done) => { browserSync.reload(); done(); }));
    gulp.watch('static/cl/status/**/*.js', gulp.series(generatePubList, (done) => { browserSync.reload(); done(); }));

    gulp.watch(['static/css/**/*.scss', 'static/cl/**/*.scss'], gulp.series(styles, (done) => { browserSync.reload(); done(); }));
    gulp.watch(['static/js/**/*', 'static/images/**/*', 'static/css/**/font/**/*', 'static/cl/**/*', '!static/cl/**/*.scss'], gulp.series(copyAssets, (done) => { browserSync.reload(); done(); }));
}

const dev = gulp.series(clean, clearCaches, generatePubList, gulp.parallel(html, styles, copyAssets), watchFiles);
const build = gulp.series(clean, clearCaches, generatePubList, html, stylesBuild, copyAssets);

exports.default = dev;
exports.build = build;