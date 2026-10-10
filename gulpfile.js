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
// 💡 [최적화 설정 플래그]
// true  : 개발 중 (git/svn 명령어 안 씀 -> 속도 초고속 🚀)
// false : 빌드/배포 전용 (git/svn 로그 수집 켜기)
// ==========================================
const IS_SVN_MODE = false; 
const IS_FAST_DEV_MODE = true; 

function clean(cb) {
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
    }
    cb();
}

const mdCache = new Map();
const timeCache = new Map();

function clearCaches(cb) {
    mdCache.clear();
    timeCache.clear();
    cb();
}

function getDepthsFromMD(htmlFilePath) {
    const baseDir = "static/html/pub";
    const relativeDir = path.dirname(path.relative(baseDir, htmlFilePath)); 
    
    if (relativeDir === "." || relativeDir === "") return { depths: [], missing: [] };

    const parts = relativeDir.split(path.sep);
    const skipNullWrapper = parts[0] === "null" && parts[1] === "cst";
    let depths = [];
    let missing = []; 
    let currentPath = baseDir;

    for (let index = 0; index < parts.length; index += 1) {
        const part = parts[index];
        currentPath = path.join(currentPath, part);
        if (skipNullWrapper && index === 0) continue;
        
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

function getFileModifiedTime(filePath, stat) {
    if (timeCache.has(filePath)) {
        return timeCache.get(filePath);
    }

    let modifiedTime = null;

    if (!IS_FAST_DEV_MODE) {
        try {
            const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
            if (IS_SVN_MODE) {
                const svnOutput = execSync(`svn info "${relativePath}"`, { encoding: 'utf8' });
                const match = svnOutput.match(/Last Changed Date:\s+([^\n]+)/);
                if (match && match[1]) {
                    const dateObj = new Date(match[1].trim());
                    if (!isNaN(dateObj.getTime())) modifiedTime = dateObj.toLocaleString("ko-KR");
                }
            } else {
                const gitTimeStr = execSync(`git log -1 --format="%cd" --date=iso-strict "${relativePath}"`, { encoding: 'utf8' }).trim();
                if (gitTimeStr) {
                    const dateObj = new Date(gitTimeStr);
                    if (!isNaN(dateObj.getTime())) modifiedTime = dateObj.toLocaleString("ko-KR");
                }
            }
        } catch (e) {
            // 에러 시 폴백
        }
    }

    if (!modifiedTime) {
        modifiedTime = stat.mtime.toLocaleString("ko-KR");
    }

    timeCache.set(filePath, modifiedTime);
    return modifiedTime;
}

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
    if (done) done();
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

    gulp.watch('index.html', gulp.series(html, (done) => { browserSync.reload(); done(); }));
    
    // 💡 저장 시 목록(generatePubList) 재생성을 제외하여 속도를 극대화합니다.
    gulp.watch(['static/html/**/*.html', '!static/html/**/*.md'], gulp.series(html, (done) => { browserSync.reload(); done(); }));
    gulp.watch('static/html/**/*.md', gulp.series(clearCaches, html, (done) => { browserSync.reload(); done(); }));
    gulp.watch('static/cl/status/**/*.js', (done) => { browserSync.reload(); done(); });

    gulp.watch(['static/css/**/*.scss', 'static/cl/**/*.scss'], gulp.series(styles, (done) => { browserSync.reload(); done(); }));
    gulp.watch(['static/js/**/*', 'static/images/**/*', 'static/css/**/font/**/*', 'static/cl/**/*', '!static/cl/**/*.scss'], gulp.series(copyAssets, (done) => { browserSync.reload(); done(); }));
}

// 💡 수동 갱신 태스크
const updateList = gulp.series(clearCaches, generatePubList);

// 개발 서버 시작할 때만 리스트를 1회 생성합니다.
const dev = gulp.series(clean, clearCaches, generatePubList, gulp.parallel(html, styles, copyAssets), watchFiles);
const build = gulp.series(clean, clearCaches, generatePubList, html, stylesBuild, copyAssets);

exports.default = dev;
exports.build = build;
exports.updateList = updateList;

// 💡 브라우저(UI 버튼)에서 백엔드 없이도 직접 리스트를 갱신할 수 있도록 API 엔드포인트 연동
const http = require('http');
http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.url === '/api/update-list') {
        generatePubList(() => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: '리스트가 갱신되었습니다.' }));
        });
    } else {
        res.writeHead(404);
        res.end();
    }
}).listen(3001); // 3001번 포트로 갱신 요청 수신 서버 오픈