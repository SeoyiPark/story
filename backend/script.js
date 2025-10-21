// Firebase 연결
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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

// 점수 관련
let score = 0;
const scoreEl = document.getElementById("score");
const catImg = document.getElementById("catImg");
const rankingBtn = document.getElementById("rankingBtn");

// 클릭할 때 이미지 바뀌기
catImg.addEventListener("mousedown", () => {
  catImg.src = "https://raw.githubusercontent.com/alexanderbast/popcat/main/popcat_open.png";
  score++;
  scoreEl.textContent = score;
});

catImg.addEventListener("mouseup", () => {
  catImg.src = "https://raw.githubusercontent.com/alexanderbast/popcat/main/popcat_closed.png";
});

// 전세계 랭킹 클릭
rankingBtn.addEventListener("click", async () => {
  alert("🔥 전세계 랭킹은 곧 추가될 예정이에요!\n지금은 로컬 점수만 표시됩니다 :)");
});
