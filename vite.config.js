import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';
import { resolve, extname, relative, dirname } from 'path'
import { glob } from 'glob';

// 1. html 폴더 내부의 모든 html 파일을 자동으로 검색하는 함수
const getHtmlInputs = () => {
  const inputs = {};
  const files = glob.sync('html/**/*.html');
  
  files.forEach(file => {
    // dist 안에서도 html/main/main.html 구조를 유지하기 위해 경로를 키값으로 사용합니다.
    const name = relative('.', file).replace(extname(file), '').replace(/\\/g, '/');
    inputs[name] = resolve(__dirname, file);
  });
  
  return inputs;
};

export default defineConfig({
  css: {
    // 3. CSS에 자동으로 프리픽스(prefix) 추가 설정
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  build: {
    // 빌드 결과물이 저장될 폴더명
    outDir: 'dist',
    // 이 옵션을 false로 해야 루트 폴더 구조(css, html 등)가 dist 바로 아래에 꼬이지 않고 생성됩니다.
    emptyOutDir: true, 
  },
});