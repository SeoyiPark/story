// backend/script.js  — index.html (id: logo, score, rankingBtn)에 맞춘 완성판

// Firebase SDK (module) 불러오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  child,
  runTransaction
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// --- Firebase 설정 (네 프로젝트 값 그대로) ---
const firebaseConfig = {
  apiKey: "AIzaSyDGBOvCQy9Mbpgn8gEdfr7ixcsc9ZgiE-k",
  authDomain: "story-ed977.firebaseapp.com",
  projectId: "story-ed977",
  storageBucket: "story-ed977.firebasestorage.app",
  messagingSenderId: "1044389300825",
  appId: "1:1044389300825:web:fc6ee2aa48ea61be9c7f48",
  databaseURL: "https://story-ed977-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// -------------------- DOM 요소 (index.html에 맞춤) --------------------
const logo = document.getElementById("logo");           // 네가 명시한 id: logo
const scoreEl = document.getElementById("score");       // <span id="score">0</span>
const rankingBtn = document.getElementById("rankingBtn"); // 버튼 id

// 동아리 선택(있으면 사용, 없으면 null 유지)
// 페이지에 <input name="club" value="..."> 요소가 있으면 그것을 사용함.
// (사용자 요청대로 '체크박스 형태'여도 radio든 checkbox든 지원되도록 작성)
const clubInputs = document.querySelectorAll("input[name='club']");
let selectedClub = null;
if (clubInputs && clubInputs.length > 0) {
  // 첫 번째 체크된 값 있으면 기본 선택
  const checked = Array.from(clubInputs).find(i => i.checked);
  selectedClub = checked ? checked.value : null;

  clubInputs.forEach((inp) => {
    inp.addEventListener("change", (e) => {
      // 라디오면 checked 하나, 체크박스 여러개일 경우 마지막으로 바뀐 값 사용
      selectedClub = e.target.value;
      // (원하면 다중 선택으로 바꿔서 복수 동아리 합산도 가능)
      console.log("선택된 동아리:", selectedClub);
    });
  });
}

// -------------------- 게임 상태 --------------------
let score = 0;
scoreEl.textContent = score;

// 식별자: 유저 고유 id (랜덤). 실제 서비스면 로그인으로 대체 권장.
const username = "user_" + Math.floor(Math.random() * 1000000);

// 안전성: DOM 요소가 없으면 에러 방지
if (!logo) {
  console.error("요소 #logo 가 DOM에 없습니다. index.html을 확인하세요.");
}
if (!scoreEl) {
  console.error("요소 #score 가 DOM에 없습니다. index.html을 확인하세요.");
}
if (!rankingBtn) {
  console.error("요소 #rankingBtn 가 DOM에 없습니다. index.html을 확인하세요.");
}

// -------------------- 클릭 핸들러: 로고 클릭하면 개인 + 동아리 집계 (수정) --------------------
if (logo) {
  // mousedown / mouseup으로 시각효과 비슷하게 처리
  logo.addEventListener("mousedown", async () => {
    // 클릭 시 시각효과
    logo.style.transform = "scale(0.95)";
    logo.style.transition = "transform 0.08s";

    // 점수 증가 (로컬)
    score++;
    if (scoreEl) scoreEl.textContent = score;

    try {
      // 1) [수정] 개인 점수 저장 -> 'users' 경로로 분리 (랭킹과 충돌 방지)
      //    'scores' 경로는 동아리 랭킹 전용으로 사용합니다.
      await update(ref(db, `users/${username}`), { 
          score: score, // 이 사용자의 개인 누적 클릭 수
          club: selectedClub || null 
      });

      // 2) [수정] 선택된 동아리가 있다면 동아리 총점 원자적 증가
      if (selectedClub) {
        // [수정] 경로를 'scores/동아리이름/totalScore'로 변경 (랭킹 코드와 일치)
        const clubRef = ref(db, `scores/${selectedClub}/totalScore`); 
        
        // runTransaction으로 동시성 안전하게 +1 (누적)
        await runTransaction(clubRef, (currentTotal) => {
          // currentTotal은 현재 DB의 totalScore 값
          return (currentTotal || 0) + 1; // 1씩 누적
        });
      }
    } catch (err) {
      console.error("Firebase 업데이트 실패:", err);
    }
  });

  logo.addEventListener("mouseup", () => {
    logo.style.transform = "scale(1)";
  });

  // 터치 환경에서도 동일하게 경로 수정
  logo.addEventListener("touchstart", (e) => {
    e.preventDefault();
    logo.style.transform = "scale(0.95)";
    score++;
    if (scoreEl) scoreEl.textContent = score;

    // 비동기 DB 업데이트
    (async () => {
      try {
        // 1) [수정] 개인 점수 저장 -> 'users' 경로로 분리
        await update(ref(db, `users/${username}`), { 
            score: score, 
            club: selectedClub || null 
        });

        // 2) [수정] 동아리 점수 누적 -> 'scores/동아리이름/totalScore'
        if (selectedClub) {
          const clubRef = ref(db, `scores/${selectedClub}/totalScore`);
          await runTransaction(clubRef, (currentTotal) => (currentTotal || 0) + 1);
        }
      } catch (err) {
        console.error("Firebase touch 업데이트 실패:", err);
      }
    })();
  });

  logo.addEventListener("touchend", (e) => {
    e.preventDefault();
    logo.style.transform = "scale(1)";
  });
}
// -------------------- 랭킹 버튼: 동아리 랭킹 보기 (수정) --------------------
if (rankingBtn) {
  rankingBtn.addEventListener("click", async () => {
    try {
      // [수정] "clubs" -> "scores" 경로에서 데이터를 불러옵니다.
      const scoresSnap = await get(child(ref(db), "scores"));
      let msg = "";

      if (scoresSnap.exists()) {
        const scoresData = scoresSnap.val(); 

        const sorted = Object.entries(scoresData)
          .map(([clubName, info]) => ({
            name: clubName,
            // [수정] info.score -> info.totalScore 
            score: (info && info.totalScore) ? info.totalScore : 0
          }))
          .sort((a, b) => b.score - a.score);

        msg = "🏆 동아리 합산 랭킹 🏆\n\n";
        sorted.forEach((c, i) => {
          msg += `${i + 1}. ${c.name} — ${c.score}점\n`;
        });
      } else {
        msg = "아직 랭킹에 등록된 동아리 점수가 없습니다.";
      }

      alert(msg);
    } catch (err) {
      console.error("랭킹 불러오기 실패:", err);
      alert("랭킹을 불러오는 중 오류가 발생했습니다.");
    }
  });
}