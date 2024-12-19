document.addEventListener("DOMContentLoaded", () => {
  const chatbotBtn = document.getElementById("chatbot-btn");
  const chatbotModal = document.getElementById("chatbot-modal");
  const closeBtn = document.getElementById("close-btn");
  const messageInput = document.getElementById("message-input");
  const sendBtn = document.getElementById("send-btn");
  const messagesContainer = document.getElementById("chatbot-messages");

  // 챗봇 상태
  let messages = [
    {
      role: "assistant",
      content:
        "안녕하세요! AI 학습 도우미입니다. 궁금한 것 있으면 물어보세요.😊",
    },
  ];

  // OpenAI API 설정
  const openaiApiKey =
    "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";
  const modelId = "ft:gpt-4o-mini-2024-07-18:edward::Ag6R1CH3";
  const AI_role = "친절한 수학, 영어 선생님";

  // OpenAI API 호출 함수
  async function fetchBotResponse(userInput) {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: modelId,
            messages: [
              { role: "system", content: AI_role },
              ...messages.map((m) => ({ role: m.role, content: m.content })),
              { role: "user", content: userInput },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        return "죄송합니다, 응답을 처리하는 중 문제가 발생했습니다.";
      }

      const result = await response.json();
      return result.choices[0].message.content;
    } catch (error) {
      console.error("Error fetching bot response:", error);
      return "죄송합니다, 응답을 처리하는 중 문제가 발생했습니다.";
    }
  }

  // 메시지 렌더링 함수
  function renderMessages() {
    messagesContainer.innerHTML = "";
    messages.forEach((message) => {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message", message.role);
      messageDiv.innerHTML = `<span>${message.content}</span>`;
      messagesContainer.appendChild(messageDiv);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // 스크롤 맨 아래로 이동
  }

  // 메시지 전송 핸들러
  async function handleSendMessage() {
    const userInput = messageInput.value.trim();
    if (!userInput) return;

    // 사용자 메시지 추가
    messages.push({ role: "user", content: userInput });
    renderMessages();
    messageInput.value = ""; // 입력창 초기화

    // OpenAI API 호출 및 응답 추가
    const botResponseContent = await fetchBotResponse(userInput);
    messages.push({ role: "assistant", content: botResponseContent });
    renderMessages();
  }

  // 챗봇 모달 열기
  chatbotBtn.addEventListener("click", () => {
    chatbotModal.classList.remove("hidden");
    renderMessages(); // 학습 도우미 초기 메시지 렌더링
  });

  // 챗봇 모달 닫기
  closeBtn.addEventListener("click", () => {
    chatbotModal.classList.add("hidden");
  });

  // 엔터키 이벤트
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  });

  // 전송 버튼 클릭 이벤트
  sendBtn.addEventListener("click", handleSendMessage);
});
