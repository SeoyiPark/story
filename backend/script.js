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

// 동아리 선택값
const clubInputs = document.querySelectorAll("input[name='club']");
let selectedClub = null;

if (clubInputs.length > 0) {
  const checked = Array.from(clubInputs).find((i) => i.checked);
  selectedClub = checked ? checked.value : null;

  clubInputs.forEach((inp) => {
    inp.addEventListener("change", (e) => {
      selectedClub = e.target.value;
      console.log("선택된 동아리:", selectedClub);
    });
  });
}

// -------------------- 유저 및 점수 상태 --------------------
let score = 0;
let pendingScore = 0;
let updateTimer = null;

const username = "user_" + Math.floor(Math.random() * 1000000);

if (scoreEl) scoreEl.textContent = score;

// -------------------- 점수 DB 반영 함수 --------------------
async function syncScoreToFirebase() {
  if (pendingScore === 0) return;

  const buffer = pendingScore;
  pendingScore = 0;

  try {
    // 개인 점수 업데이트
    await update(ref(db, `users/${username}`), {
      score: score,
      club: selectedClub || null,
    });

    // 동아리 점수 누적
    if (selectedClub) {
      const clubRef = ref(db, `scores/${selectedClub}/totalScore`);
      await runTransaction(clubRef, (currentTotal) => {
        if (currentTotal === null) return buffer; // 새로 생길 때 초기값
        return currentTotal + buffer;
      });
    }
  } catch (err) {
    console.error("Firebase 점수 업데이트 실패:", err);
  }
}

// -------------------- 클릭 / 터치 이벤트 --------------------
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
      }, 1000);
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
            score: info?.totalScore || 0,
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
