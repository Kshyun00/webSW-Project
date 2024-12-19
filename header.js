document.addEventListener("DOMContentLoaded", () => {
  // 수강생 관리 버튼
  const manageButton = document.querySelectorAll('a[href="/dashboard.html"]');

  // 쿠키 가져오기
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  // 버튼 클릭 시 권한 확인
  manageButton.forEach((button) => {
    button.addEventListener("click", (e) => {
      const master = getCookie("master"); // master 쿠키 값 확인

      if (master !== "1") {
        e.preventDefault(); // 링크 이동 방지
        alert("관리자 계정만 접근할 수 있는 권한입니다.");
      }
    });
  });
});
