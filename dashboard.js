document.addEventListener("DOMContentLoaded", () => {
  // 요소 가져오기
  const monthlyFeeValue = document.querySelector("#monthly-fee-value");
  const cumulativeFeeValue = document.querySelector("#cumulative-fee-value");
  const totalStudentsValue = document.querySelector("#total-students-value");
  const newStudentsValue = document.querySelector("#new-students-value");
  const highSchoolCountValue = document.querySelector("#high-school-count");
  const middleSchoolCountValue = document.querySelector("#middle-school-count");

  const currentMonth = new Date()
    .toISOString()
    .slice(0, 7)
    .replace("-", "")
    .slice(2); // yymm 형식

  // 1. 모든 페이지의 등록금 데이터 가져오기
  async function fetchAllFeeData() {
    let allFees = [];
    let currentPage = 1;

    while (true) {
      try {
        const response = await fetch("http://43.202.209.138:4000/fee/page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: 2, page: currentPage }),
        });
        const result = await response.json();
        if (result.data.length === 0) break; // 더 이상 데이터 없으면 중단

        allFees.push(...result.data);
        currentPage++;
      } catch (error) {
        console.error("등록금 데이터를 불러오는 중 오류 발생:", error);
        break;
      }
    }

    // 월별 등록금 합계
    const monthlyTotal = allFees
      .filter((fee) => fee.period === currentMonth)
      .reduce((sum, fee) => sum + fee.amount, 0);

    // 누적 등록금
    const cumulativeTotal = allFees.reduce((sum, fee) => sum + fee.amount, 0);

    monthlyFeeValue.textContent = `${monthlyTotal.toLocaleString()}원`;
    cumulativeFeeValue.textContent = `누적 ${cumulativeTotal.toLocaleString()}원`;
  }

  // 2. 모든 페이지의 학생 데이터 가져오기
  async function fetchAllStudentData() {
    let allStudents = [];
    let currentPage = 1;

    while (true) {
      try {
        const response = await fetch(
          "http://43.202.209.138:4000/student/list",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page: currentPage }),
          }
        );
        const result = await response.json();
        if (result.students.length === 0) break;

        allStudents.push(...result.students);
        currentPage++;
      } catch (error) {
        console.error("학생 데이터를 불러오는 중 오류 발생:", error);
        break;
      }
    }

    // 총 학생 수
    totalStudentsValue.textContent = allStudents.length;

    // 고등학생, 중학생 수 계산
    const highSchoolCount = allStudents.filter(
      (student) => student.high === 1
    ).length;
    const middleSchoolCount = allStudents.filter(
      (student) => student.high === 0
    ).length;

    highSchoolCountValue.textContent = highSchoolCount;
    middleSchoolCountValue.textContent = middleSchoolCount;

    // 신규 학생 수 (created_at 필드가 현재 월과 일치하는 경우)
    const newStudents = allStudents.filter((student) => {
      const studentCreatedAt = new Date(student.created_at)
        .toISOString()
        .slice(0, 7)
        .replace("-", "")
        .slice(2); // yymm 형식
      return studentCreatedAt === currentMonth;
    });
    newStudentsValue.textContent = `신규 ${newStudents.length}`;
  }

  // 데이터 불러오기 실행
  fetchAllFeeData();
  fetchAllStudentData();
});
