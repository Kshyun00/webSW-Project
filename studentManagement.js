let studentsData = [];

document.addEventListener("DOMContentLoaded", () => {
  // Tab Functionality
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab");

      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(`${tabId}-tab`).classList.add("active");
    });
  });

  // Grade Filter
  const gradeFilter = document.getElementById("grade-filter");
  const studentsTableBody = document.getElementById("students-body");
  // 학년 데이터를 사람이 읽을 수 있는 형식으로 변환
  function formatGradeA(grade) {
    const gradeMap = {
      "01": "중1",
      "02": "중2",
      "03": "중3",
      11: "고1",
      12: "고2",
      13: "고3",
    };
    return gradeMap[grade] || grade; // 매핑되지 않은 값은 그대로 반환
  }

  studentsTableBody.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-student")) {
      const studentEmail = event.target.getAttribute("data-email"); // 이메일 가져오기

      if (!studentEmail) {
        alert("이메일 정보가 존재하지 않습니다.");
        return;
      }

      try {
        const response = await fetch(
          "http://43.202.209.138:4000/student/delete",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: studentEmail }), // 이메일 전송
          }
        );

        let result;
        const contentType = response.headers.get("Content-Type");

        if (contentType && contentType.includes("application/json")) {
          result = await response.json(); // JSON 형식일 경우
        } else {
          result = await response.text(); // 일반 텍스트일 경우
        }

        if (response.ok) {
          alert(
            result.message || result || "학생이 성공적으로 삭제되었습니다."
          );
          fetchStudents(); // 학생 목록 새로고침
        } else {
          alert(`오류: ${result.message || result || "삭제에 실패했습니다."}`);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("서버와의 통신 중 오류가 발생했습니다.");
      }
    }
  });

  function renderStudents(students) {
    studentsTableBody.innerHTML = "";
    students.forEach((student) => {
      const row = `
              <tr>
                  <td>${student.name}</td>
                  <td>${formatGradeA(student.classes)}</td>
                  <td>${student.email}</td>
                  <td>${student.phone}</td>
                  <td>
                      <button class="delete-student" data-email="${
                        student.email
                      }">삭제</button>
                  </td>
              </tr>
          `;
      studentsTableBody.innerHTML += row;
    });
  }

  // 학생 리스트 조회 함수
  async function fetchStudents() {
    const allStudents = [];
    let currentPage = 1;

    try {
      while (true) {
        // API 요청
        const response = await fetch(
          "http://43.202.209.138:4000/student/list",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page: currentPage }), // 현재 페이지 전송
          }
        );

        const result = await response.json();

        // 응답이 비정상적이거나 더 이상 데이터가 없으면 종료
        if (!response.ok || result.students.length === 0) {
          break;
        }

        // 학생 데이터 추가
        allStudents.push(...result.students);

        // 현재 페이지와 전체 페이지 비교
        if (currentPage >= result.totalPages) {
          break; // 마지막 페이지면 루프 종료
        }

        currentPage++; // 다음 페이지로 이동
      }

      // 렌더링 함수 호출
      renderStudents(allStudents);
      // studentsData 전역 변수 업데이트
      studentsData = allStudents;

      console.log("학생 데이터 전체:", allStudents);
    } catch (error) {
      console.error("학생 데이터를 불러오는 중 오류 발생:", error);
      alert("학생 목록 조회 중 오류가 발생했습니다.");
    }
  }

  // 페이지 로드 시 초기 데이터 불러오기
  fetchStudents();

  // 필터링 이벤트
  gradeFilter.addEventListener("change", () => {
    const selectedGrade = gradeFilter.value;
    const filteredStudents =
      selectedGrade === "all"
        ? studentsData // 이 부분이 문제였음
        : studentsData.filter(
            (student) => formatGradeA(student.classes) === selectedGrade
          );
    renderStudents(filteredStudents);
  });

  // Render Fee Data
  const monthFilter = document.getElementById("month-filter");
  const totalRow = document.createElement("tr");
  const feesTableBody = document.getElementById("fees-body");

  feesTableBody.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-fee")) {
      const feeId = event.target.getAttribute("data-id");

      try {
        const response = await fetch(
          `http://43.202.209.138:4000/fee/${feeId}`,
          {
            method: "DELETE",
          }
        );

        const result = await response.json();

        if (response.ok) {
          alert("등록금이 성공적으로 삭제되었습니다.");
          fetchFees(); // 등록금 목록 새로고침
        } else {
          alert(`오류: ${result.message || "등록금 삭제에 실패했습니다."}`);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("서버와의 통신 중 오류가 발생했습니다.");
      }
    }
  });

  // 등록금 목록 조회 함수
  async function fetchFees(selectedMonth = "") {
    let allFees = [];
    let currentPage = 1;

    try {
      while (true) {
        const response = await fetch("http://43.202.209.138:4000/fee/page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: 2, page: currentPage }), // 페이지 번호 추가
        });

        const result = await response.json();

        if (!response.ok || result.data.length === 0) {
          break; // 더 이상 데이터가 없으면 루프 종료
        }
        allFees = allFees.concat(result.data);
        currentPage++; // 다음 페이지 요청
      }

      renderFees(allFees, selectedMonth);
    } catch (error) {
      console.error("Error:", error);
      alert("등록금 목록 조회 중 오류가 발생했습니다.");
    }
  }

  // 학년 숫자를 문자로 변환하는 함수
  function formatGrade(grade) {
    const gradeMap = {
      1: "중1",
      2: "중2",
      3: "중3",
      11: "고1",
      12: "고2",
      13: "고3",
    };
    return gradeMap[grade] || grade; // 매핑되지 않은 값은 그대로 반환
  }

  // 등록금 렌더링 함수
  function renderFees(fees, selectedMonth) {
    feesTableBody.innerHTML = ""; // 기존 테이블 비우기
    let filteredFees = fees;
    let totalAmount = 0; // 전체 총 등록금
    let monthlyTotal = 0; // 월별 총 등록금

    // 월별 필터링
    if (selectedMonth) {
      filteredFees = fees.filter(
        (fee) => fee.period.slice(-2) === selectedMonth
      );
    }

    // 데이터 추가
    filteredFees.forEach((fee) => {
      totalAmount += fee.amount; // 전체 등록금 합계
      if (selectedMonth) monthlyTotal += fee.amount; // 월별 합계 계산

      const formattedGrade = formatGrade(fee.student_grade); // 학년 변환

      const row = `
      <tr>
        <td>${fee.name}</td>
        <td>${formattedGrade}</td>
        <td>${fee.period}</td>
        <td>${fee.amount.toLocaleString()}원</td>
        <td>
          <button class="delete-fee" data-id="${fee.id}">삭제</button>
        </td>
      </tr>
    `;
      feesTableBody.insertAdjacentHTML("beforeend", row);
    });

    // 총 등록금 행 추가
    totalRow.innerHTML = `
    <td colspan="3" style="font-weight: bold; text-align: right;">
      ${selectedMonth ? selectedMonth + "월 총 등록금" : "전체 총 등록금"}
    </td>
    <td style="font-weight: bold;">
      ${(selectedMonth ? monthlyTotal : totalAmount).toLocaleString()}원
    </td>
    <td></td>
  `;
    feesTableBody.appendChild(totalRow);
  }

  // 초기 데이터 조회
  fetchFees();

  // 월별 필터링 이벤트
  monthFilter.addEventListener("change", () => {
    const selectedMonth = monthFilter.value;
    fetchFees(selectedMonth);
  });

  // Add Student Modal
  const addStudentBtn = document.getElementById("add-student-btn");
  const addStudentModal = document.getElementById("add-student-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const addStudentForm = document.getElementById("add-student-form");

  addStudentBtn.addEventListener("click", () => {
    addStudentModal.style.display = "block";
  });

  closeModalBtn.addEventListener("click", () => {
    addStudentModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === addStudentModal) {
      addStudentModal.style.display = "none";
    }
  });

  addStudentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // 폼 데이터 가져오기
    const grade = event.target.grade.value; // 학년 값 (중1, 고1 등)
    let high = 0; // 기본값 (중학생)
    let classes = ""; // classes 값 초기화

    // 학년과 classes 값 매핑
    switch (grade) {
      case "중1":
        classes = "01";
        break;
      case "중2":
        classes = "02";
        break;
      case "중3":
        classes = "03";
        break;
      case "고1": // 고1
        high = 1;
        classes = "11";
        break;
      case "고2": // 고2
        high = 1;
        classes = "12";
        break;
      case "고3": // 고3
        high = 1;
        classes = "13";
        break;
      default:
        alert("학년이 올바르지 않습니다.");
        return;
    }

    const formData = {
      email: event.target.email.value,
      password: event.target.password.value,
      name: event.target.name.value,
      high: high, // 학년
      phone: event.target.phone.value,
      classes: classes,
    };

    try {
      const response = await fetch("http://43.202.209.138:4000/student/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("학생이 성공적으로 추가되었습니다.");
        addStudentModal.style.display = "none";
        addStudentForm.reset();
        fetchStudents(); // 학생 목록 새로고침
      } else {
        alert(`오류: ${result.message || "학생 추가에 실패했습니다."}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버와의 통신 중 오류가 발생했습니다.");
    }
  });

  const addFeeForm = document.getElementById("add-fee-form");
  const addFeeModal = document.getElementById("add-fee-modal");
  const openAddFeeModalBtn = document.getElementById("open-add-fee-modal-btn");
  const closeFeeModalBtn = document.querySelector(
    "#add-fee-modal .modal-content button"
  );

  // 등록금 수납 폼 제출 이벤트
  addFeeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // 폼 데이터 가져오기
    const student_grade = event.target.student_grade.value; // 학년 값 (중1, 고1 등)
    let classes = ""; // classes 값 초기화

    // 학년과 classes 값 매핑
    switch (student_grade) {
      case "중1":
        classes = "01";
        break;
      case "중2":
        classes = "02";
        break;
      case "중3":
        classes = "03";
        break;
      case "고1": // 고1
        classes = "11";
        break;
      case "고2": // 고2
        classes = "12";
        break;
      case "고3": // 고3
        classes = "13";
        break;
      default:
        alert("학년이 올바르지 않습니다.");
        return;
    }

    const formData = {
      name: event.target.name.value,
      amount: parseInt(event.target.amount.value),
      student_grade: classes,
      period: event.target.period.value,
    };

    try {
      const response = await fetch("http://43.202.209.138:4000/fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("등록금이 성공적으로 수납되었습니다.");
        addFeeModal.style.display = "none";
        addFeeForm.reset();
        fetchFees(); // 등록금 목록 새로고침
      } else {
        alert(`오류: ${result.message || "수납에 실패했습니다."}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버와의 통신 중 오류가 발생했습니다.");
    }
  });

  // 등록금 수납 모달 열기
  openAddFeeModalBtn.addEventListener("click", () => {
    addFeeModal.style.display = "block";
  });

  // 등록금 수납 모달 닫기
  closeFeeModalBtn.addEventListener("click", () => {
    addFeeModal.style.display = "none";
  });

  // 바깥 영역 클릭 시 모달 닫기
  window.addEventListener("click", (event) => {
    if (event.target === addFeeModal) {
      addFeeModal.style.display = "none";
    }
  });
});
