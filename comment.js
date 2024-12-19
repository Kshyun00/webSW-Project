// 댓글 기능 실행
function loadComments(postId) {
  const commentSection = document.getElementById("comments-section");
  const commentsList = document.getElementById("comments-list");
  const commentInput = document.getElementById("comment-input");
  const submitCommentBtn = document.getElementById("submit-comment-btn");

  // 쿠키에서 email 가져오기
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  const email = getCookie("email");
  const master = getCookie("master");

  // 댓글 섹션 보이기
  if (master === "1") {
    commentSection.style.display = "block";
  }

  // 댓글 불러오기
  async function fetchComments() {
    try {
      const response = await fetch(
        `http://43.202.209.138:4000/boards/${postId}/comments`
      );
      const data = await response.json();

      if (!response.ok) throw new Error("댓글 데이터를 불러오지 못했습니다.");

      commentsList.innerHTML = "";
      data.comments.forEach((comment) => {
        const commentDiv = document.createElement("div");
        commentDiv.className = "comment";
        commentDiv.innerHTML = `
          <div>
            <strong>${comment.writer}</strong>
            <p>${comment.content}</p>
            <span>${new Date(comment.created_at).toLocaleString()}</span>
          </div>
        `;
        commentsList.appendChild(commentDiv);
      });
    } catch (error) {
      console.error("댓글 불러오기 오류:", error);
    }
  }

  // 댓글 작성
  async function postComment() {
    const content = commentInput.value.trim();
    if (!content) {
      alert("댓글 내용을 입력하세요.");
      return;
    }

    try {
      const response = await fetch(
        `http://43.202.209.138:4000/boards/${postId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, content }),
        }
      );

      if (response.ok) {
        alert("댓글이 작성되었습니다.");
        commentInput.value = "";
        fetchComments(); // 댓글 새로고침
      } else {
        const result = await response.json();
        alert(`오류: ${result.message || "댓글 작성에 실패했습니다."}`);
      }
    } catch (error) {
      console.error("댓글 작성 오류:", error);
    }
  }

  // 댓글 작성 버튼 이벤트
  submitCommentBtn.addEventListener("click", postComment);

  // 초기 댓글 불러오기
  fetchComments();
}
