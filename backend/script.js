// Firebase 연결
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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

// -------------------- 게임 로직 --------------------
let score = 0;
const scoreEl = document.getElementById("score");
const catImg = document.getElementById("catImg");
const rankingBtn = document.getElementById("rankingBtn");

// 유저 이름 (랜덤)
const username = "user_" + Math.floor(Math.random() * 100000);

// 클릭 시 점수 + 이미지 전환
catImg.addEventListener("mousedown", () => {
  catImg.src = "https://raw.githubusercontent.com/alexanderbast/popcat/main/popcat_open.png";
  score++;
  scoreEl.textContent = score;

  // 점수 Firebase에 저장 (유저별 최신 점수)
  update(ref(db, "scores/" + username), { score });
});

catImg.addEventListener("mouseup", () => {
  catImg.src = "https://raw.githubusercontent.com/alexanderbast/popcat/main/popcat_closed.png";
});

// -------------------- 전세계 랭킹 보기 --------------------
rankingBtn.addEventListener("click", async () => {
  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, "scores"));
    if (snapshot.exists()) {
      const data = snapshot.val();

      // 점수 높은 순으로 정렬
      const sorted = Object.entries(data)
        .map(([name, info]) => ({ name, score: info.score || 0 }))
        .sort((a, b) => b.score - a.score);

      // 상위 10명 표시
      let rankText = "🌎 전세계 POPCAT TOP 10 🌎\n\n";
      sorted.slice(0, 10).forEach((p, i) => {
        rankText += `${i + 1}. ${p.name} - ${p.score}점\n`;
      });

      alert(rankText);
    } else {
      alert("아직 아무도 POP을 하지 않았어요 😹");
    }
  } catch (error) {
    console.error(error);
    alert("랭킹을 불러오는 중 오류가 발생했습니다.");
  }
});
