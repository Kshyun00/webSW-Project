// Mobile menu toggle
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

menuToggle.addEventListener("click", () => {
  mobileMenu.classList.toggle("show");
});

// FAQ accordion toggle
const accordionItems = document.querySelectorAll(".accordion-item");

accordionItems.forEach((item) => {
  const title = item.querySelector(".accordion-title");
  const content = item.querySelector(".accordion-content");

  title.addEventListener("click", () => {
    const isActive = content.classList.contains("show");

    document
      .querySelectorAll(".accordion-content")
      .forEach((c) => c.classList.remove("show"));
    document
      .querySelectorAll(".accordion-title")
      .forEach((t) => t.classList.remove("active"));

    if (!isActive) {
      content.classList.add("show");
      title.classList.add("active");
    }
  });
});

// 모달 및 버튼 요소 가져오기
const authButton = document.getElementById("authButton");
const loginModal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");
const loginForm = document.getElementById("loginForm");

// 쿠키 가져오는 함수
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// 로그인 상태 확인 및 버튼 설정
document.addEventListener("DOMContentLoaded", () => {
  const email = getCookie("email");
  const master = getCookie("master");

  if (email && master) {
    // 로그인 상태
    authButton.textContent = "로그아웃";
    authButton.addEventListener("click", handleLogout);
  } else {
    // 비로그인 상태
    authButton.textContent = "로그인";
    authButton.addEventListener("click", () => {
      loginModal.style.display = "flex";
    });
  }
});

// 모달 닫기 이벤트
closeModal.addEventListener("click", () => {
  loginModal.style.display = "none";
});

// 폼 제출 이벤트 (로그인 처리)
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://43.202.209.138:4000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const result = await response.json();
    console.log("서버 응답:", result);

    if (response.ok && result.message === "로그인 성공!") {
      alert("로그인 성공!");

      // 쿠키 저장
      document.cookie = `email=${email}; path=/;`;
      if (email == 1234) document.cookie = `master=1; path=/;`;
      else document.cookie = `master=0; path=/;`;

      // 쿠키 확인 및 출력
      console.log("현재 저장된 쿠키:", document.cookie);

      loginModal.style.display = "none";
      location.reload();
    } else {
      alert(
        `로그인 실패: ${result.message || "이메일 또는 비밀번호 오류입니다."}`
      );
    }
  } catch (error) {
    console.error("네트워크 오류:", error);
    alert("서버와의 통신 중 오류가 발생했습니다.");
  }
});

// 로그아웃 처리
async function handleLogout() {
  try {
    const response = await fetch("http://43.202.209.138:4000/logout", {
      method: "GET",
      credentials: "include", // 쿠키를 함께 전송
    });

    const result = await response.json();

    if (response.ok) {
      alert("로그아웃 되었습니다.");

      // 클라이언트 쿠키 삭제 (명시적으로 설정)
      document.cookie =
        "email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie =
        "master=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; ";

      location.reload();
    } else {
      alert(
        `로그아웃 실패: ${result.message || "이메일 또는 비밀번호 오류입니다."}`
      );
    }
  } catch (error) {
    console.error("네트워크 오류:", error);
    alert("서버와의 통신 중 오류가 발생했습니다.");
  }
}
