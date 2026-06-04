// 공통 HTML 조각을 불러와 특정 ID 영역에 넣어주는 함수
async function includeHTML(targetId, url) {
  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const htmlText = await response.text();
        targetElement.innerHTML = htmlText;
      } else {
        console.error(`HTML을 불러오지 못했습니다: ${url}`);
      }
    } catch (error) {
      console.error('에러 발생:', error);
    }
  }
}

// 화면 로드가 완료되면 헤더와 푸터를 각각 호출
window.addEventListener('DOMContentLoaded', () => {
  includeHTML('header-include', '/html/cib/layout/header.html');
  includeHTML('footer-include', '/html/cib/layout/footer.html');
});