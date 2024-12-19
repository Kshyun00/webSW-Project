const boardData = document.getElementById("board-data");
const prevButton = document.querySelector(".page-btn.prev");
const nextButton = document.querySelector(".page-btn.next");
const postDetail = document.getElementById("post-detail");
const postContent = document.getElementById("post-content");
const backButton = document.getElementById("back-to-list");
let lastId = null; // 초기 cursor 값 (첫 페이지)

// 게시판 데이터 불러오기 함수
async function fetchBoardData(cursor = null) {
  try {
    const url = cursor
      ? `http://43.202.209.138:4000/boards?lastId=${cursor}`
      : `http://43.202.209.138:4000/boards`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("데이터를 불러오는데 실패했습니다.");

    const data = await response.json();

    // 테이블 데이터 렌더링
    renderBoardData(data.boards);

    // 다음 페이지 cursor 업데이트
    lastId = data.nextCursor;

    // 페이지네이션 버튼 활성화/비활성화
    prevButton.disabled = cursor === null;
    nextButton.disabled = !lastId;
  } catch (error) {
    console.error("Error:", error);
  }
}

// 게시판 데이터 렌더링
function renderBoardData(boards) {
  boardData.innerHTML = ""; // 기존 데이터 초기화
  if (boards.length === 0) {
    boardData.innerHTML = `<tr><td colspan="4">게시글이 없습니다.</td></tr>`;
    return;
  }
  boards.forEach((board) => {
    const formattedDate = new Date(board.created_at).toLocaleDateString(
      "ko-KR",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    );

    const row = document.createElement("tr");
    row.setAttribute("data-id", board.id); // 게시글 ID 저장
    row.innerHTML = `
      <td><input type="checkbox" class="delete-checkbox" data-id="${board.id}" /></td>
      <td>${board.id}</td>
      <td>${board.title}</td>
      <td>${board.writer}</td>
      <td>${formattedDate}</td>
    `;
    boardData.appendChild(row);
  });

  setupBoardClickEvents(); // 클릭 이벤트 설정
}

// 페이지네이션 이벤트 설정
nextButton.addEventListener("click", () => {
  if (lastId) fetchBoardData(lastId);
});

prevButton.addEventListener("click", () => {
  lastId = null; // 초기 cursor로 설정
  fetchBoardData();
});

// 페이지 로드 시 초기 데이터 불러오기
fetchBoardData();

// 쿠키 값 가져오기 함수
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// 관리자 권한 확인
function checkAdmin() {
  const isAdmin = getCookie("master") === "1";
  const deleteButton = document.getElementById("delete-btn");

  if (isAdmin) {
    deleteButton.style.display = "inline-block"; // 삭제 버튼 표시
  } else {
    deleteButton.style.display = "none"; // 삭제 버튼 숨김
  }
}

// 페이지 로드 시 관리자 체크
document.addEventListener("DOMContentLoaded", () => {
  checkAdmin();
});

// 삭제 버튼 클릭 이벤트
document.getElementById("delete-btn").addEventListener("click", async () => {
  const checkboxes = document.querySelectorAll(".delete-checkbox:checked");
  const selectedIds = Array.from(checkboxes).map((cb) =>
    cb.getAttribute("data-id")
  );

  if (selectedIds.length === 0) {
    alert("삭제할 게시글을 선택해주세요.");
    return;
  }

  // 쿠키에서 email과 master 값 가져오기
  const email = getCookie("email");
  const master = getCookie("master");

  if (master !== "1") {
    alert("관리자 계정만 게시글을 삭제할 수 있습니다.");
    return;
  }

  // 각 게시글 ID에 대해 삭제 요청 보내기
  try {
    for (const id of selectedIds) {
      const response = await fetch(`http://43.202.209.138:4000/boards/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 쿠키 전송
        body: JSON.stringify({ email, master: parseInt(master) }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`게시글 ${id} 삭제 실패: ${result.message || "오류 발생"}`);
      }
    }

    alert("선택한 게시글이 삭제되었습니다.");
    fetchBoardData(); // 게시글 목록 새로고침
  } catch (error) {
    console.error("Error:", error);
    alert("서버와의 통신 중 오류가 발생했습니다.");
  }
});

// 글쓰기 버튼과 폼 요소 가져오기
const writeButton = document.querySelector(".write-btn");
const writeForm = document.getElementById("write-form");
const cancelWrite = document.getElementById("cancelWrite");
const boardContainer = document.querySelector(".board-container");

// 글쓰기 버튼 클릭 시 폼 표시
writeButton.addEventListener("click", () => {
  writeForm.style.display = "block"; // 폼 보이기
  boardContainer.style.display = "none"; // 기존 게시판 숨기기
});

// 취소 버튼 클릭 시 폼 숨기기
cancelWrite.addEventListener("click", () => {
  writeForm.style.display = "none"; // 폼 숨기기
  boardContainer.style.display = "block"; // 기존 게시판 보이기
});

//게시글 작성 api
// 게시글 작성 폼과 버튼 요소 가져오기
const submitButton = writeForm.querySelector(".write-btn");

// 글쓰기 폼 요소 가져오기
const writeFormElement = document.querySelector("#write-form form");

if (!writeFormElement) {
  console.error("Form 요소를 찾을 수 없습니다. HTML 구조를 확인하세요.");
}

// 글쓰기 폼 제출 이벤트 처리
writeFormElement.addEventListener("submit", async (e) => {
  e.preventDefault(); // 기본 동작 방지

  const formData = new FormData(writeFormElement); // 폼 데이터 가져오기
  formData.append("email", getCookie("email")); // 쿠키 값 추가
  formData.append("master", getCookie("master")); // 쿠키 값 추가

  try {
    const response = await fetch("http://43.202.209.138:4000/boards", {
      method: "POST",
      body: formData,
      credentials: "include", // 쿠키를 함께 전송
    });

    const result = await response.json();

    if (response.ok) {
      alert("게시글이 성공적으로 등록되었습니다.");
      writeFormElement.reset();
      location.reload();
    } else {
      alert(`오류: ${result.message || "게시글 작성에 실패했습니다."}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("서버와의 통신 중 오류가 발생했습니다.");
  }
});

// 게시글 상세 정보 불러오기 함수
async function fetchPostDetail(postId) {
  try {
    const response = await fetch(`http://43.202.209.138:4000/boards/${postId}`);
    if (!response.ok) throw new Error("게시글 정보를 불러오는데 실패했습니다.");

    const data = await response.json();
    renderPostDetail(data); // 게시글 상세 정보 렌더링

    // 게시글 상세 영역에 postId 저장
    postDetail.setAttribute("data-id", postId);

    // 댓글 기능 실행 (postId가 설정된 후)
    loadComments(postId);
  } catch (error) {
    console.error("Error:", error);
    alert("게시글 정보를 불러오는 중 오류가 발생했습니다.");
  }
}

// 게시글 상세 정보 렌더링 함수
function renderPostDetail(post) {
  postContent.innerHTML = `
    <h3>제목: ${post.title}</h3>
    <p><strong>작성자:</strong> ${post.writer_name || post.writer}</p>
    <p><strong>내용:</strong></p>
    <p>${post.content}</p>
    ${
      post.file
        ? `<img src="data:image/jpeg;base64,${post.file}" alt="첨부 파일" />`
        : ""
    }
  `;

  // 화면 전환
  postDetail.style.display = "block";
  document.querySelector(".board-container").style.display = "none";
}

// 게시글 클릭 이벤트 설정
function setupBoardClickEvents() {
  const rows = document.querySelectorAll("#board-data tr");

  rows.forEach((row) => {
    row.addEventListener("click", (e) => {
      // 체크박스 클릭 시 상세 페이지 이동 방지
      if (e.target.classList.contains("delete-checkbox")) {
        e.stopPropagation(); // 이벤트 버블링 방지
        return;
      }

      const postId = row.getAttribute("data-id");
      if (postId) {
        fetchPostDetail(postId); // 게시글 상세 정보 불러오기
      }
    });
  });
}

// "목록으로 돌아가기" 버튼 클릭 이벤트
backButton.addEventListener("click", () => {
  postDetail.style.display = "none";
  document.querySelector(".board-container").style.display = "block";

  // 댓글 섹션 숨기기
  const commentSection = document.getElementById("comments-section");
  commentSection.style.display = "none";

  // 댓글 목록 및 입력창 초기화
  const commentsList = document.getElementById("comments-list");
  const commentInput = document.getElementById("comment-input");

  commentsList.innerHTML = ""; // 댓글 목록 초기화
  commentInput.value = ""; // 입력창 초기화
});
