// backend/game.js

// Firebase SDK 불러오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  child,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// -------------------- Firebase 설정 --------------------
const firebaseConfig = {
  apiKey: "AIzaSyDGBOvCQy9Mbpgn8gEdfr7ixcsc9ZgiE-k",
  authDomain: "story-ed977.firebaseapp.com",
  projectId: "story-ed977",
  storageBucket: "story-ed977.firebasestorage.app",
  messagingSenderId: "1044389300825",
  appId: "1:1044389300825:web:fc6ee2aa48ea61be9c7f48",
  databaseURL: "https://story-ed977-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// -------------------- DOM 요소 --------------------
const logo = document.getElementById("logo");
const scoreEl = document.getElementById("score");
const rankingBtn = document.getElementById("rankingBtn");

// --- [수정된 부분] ---
// 'club.html'에서 저장했던 동아리 이름을 localStorage에서 가져옵니다.
const selectedClub = localStorage.getItem('selectedClub');

// (선택 사항) 제대로 가져왔는지 콘솔에서 확인
if (selectedClub) {
  console.log(`LocalStorage에서 불러온 동아리: ${selectedClub}`);
} else {
  console.warn('선택된 동아리 정보가 없습니다! (localStorage 확인 필요)');
}
// --- [여기까지 수정] ---

// -------------------- 유저 및 점수 상태 --------------------
let score = 0; // (초기값 0으로 설정됨 - 중요)
let pendingScore = 0;
let updateTimer = null;

// 고유 사용자 이름 생성
const username = "user_" + Math.floor(Math.random() * 1000000);

if (scoreEl) scoreEl.textContent = score;

// -------------------- 점수 DB 반영 함수 --------------------
// (이 함수는 이제 selectedClub 변수를 올바르게 참조하므로 수정할 필요 없음)
async function syncScoreToFirebase() {
  if (pendingScore === 0) return;

  const buffer = pendingScore;
  pendingScore = 0;

  try {
    // 개인 점수 업데이트 ('users' 경로)
    await update(ref(db, `users/${username}`), {
      score: score,
      club: selectedClub || null, // 이제 '어뮤즈' 같은 동아리 이름이 저장됨
    });

    // 동아리 점수 누적 ('scores' 경로)
    if (selectedClub) { // 이 조건이 이제 true가 됨
      const clubRef = ref(db, `scores/${selectedClub}/totalScore`);
      await runTransaction(clubRef, (currentTotal) => {
        // (currentTotal || 0) + buffer; 도 동일하게 작동합니다.
        if (currentTotal === null) return buffer; 
        return currentTotal + buffer;
      });
    }
  } catch (err) {
    console.error("Firebase 점수 업데이트 실패:", err);
  }
}

// -------------------- 클릭 / 터치 이벤트 --------------------
// (이 부분은 수정할 필요 없음)
if (logo) {
  // 클릭 시
  logo.addEventListener("mousedown", () => {
    logo.style.transform = "scale(0.95)";
    logo.style.transition = "transform 0.08s";

    score++;
    pendingScore++;
    scoreEl.textContent = score;

    if (!updateTimer) {
      updateTimer = setTimeout(() => {
        syncScoreToFirebase();
        updateTimer = null;
      }, 1000); // 1초(1000ms)마다 DB에 한 번씩 반영
    }
  });

  logo.addEventListener("mouseup", () => {
    logo.style.transform = "scale(1)";
  });

  // 터치 시
  logo.addEventListener("touchstart", (e) => {
    e.preventDefault();
    logo.style.transform = "scale(0.95)";
    score++;
    pendingScore++;
    scoreEl.textContent = score;

    if (!updateTimer) {
      updateTimer = setTimeout(() => {
        syncScoreToFirebase();
        updateTimer = null;
      }, 1000);
    }
  });

  logo.addEventListener("touchend", (e) => {
    e.preventDefault();
    logo.style.transform = "scale(1)";
  });
}

// -------------------- 랭킹 버튼 --------------------
// (이 부분은 이미 'scores'와 'totalScore'를 잘 읽고 있으므로 수정할 필요 없음)
if (rankingBtn) {
  rankingBtn.addEventListener("click", async () => {
    try {
      const scoresSnap = await get(child(ref(db), "scores"));
      let msg = "";

      if (scoresSnap.exists()) {
        const scoresData = scoresSnap.val();

        const sorted = Object.entries(scoresData)
          .map(([clubName, info]) => ({
            name: clubName,
            score: info?.totalScore || 0, // info.totalScore를 잘 읽고 있음
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