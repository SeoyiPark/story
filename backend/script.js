// Firebase SDK import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, get, update, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// 🔥 Firebase 설정 (네 프로젝트의 값으로 교체)
const firebaseConfig = {
  apiKey: "AIzaSyDGBOvCQy9Mbpgn8gEdfr7ixcsc9ZgiE-k",
  authDomain: "story-ed977.firebaseapp.com",
  projectId: "story-ed977",
  storageBucket: "story-ed977.firebasestorage.app",
  messagingSenderId: "1044389300825",
  appId: "1:1044389300825:web:fc6ee2aa48ea61be9c7f48",
  databaseURL: "https://story-ed977-default-rtdb.firebaseio.com"
};

// 초기화
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const popcat = document.getElementById('popcat');
const scoreDisplay = document.getElementById('score');
const leaderboard = document.getElementById('leaderboard');
const popSound = document.getElementById('popSound');

let score = Number(localStorage.getItem('popScore')) || 0;
let username = localStorage.getItem('popName');

if (!username) {
  username = prompt("닉네임을 입력하세요 🐱 (영문 또는 간단한 이름)");
  localStorage.setItem('popName', username);
}

scoreDisplay.textContent = score;

// 클릭 이벤트
popcat.addEventListener('mousedown', () => {
  popcat.classList.add('open');
  popSound.currentTime = 0;
  popSound.play();
  score++;
  scoreDisplay.textContent = score;
  localStorage.setItem('popScore', score);

  // Firebase에 업데이트
  update(ref(db, 'players/' + username), { score: score });
});

popcat.addEventListener('mouseup', () => {
  popcat.classList.remove('open');
});

// 실시간 랭킹 표시
onValue(ref(db, 'players'), (snapshot) => {
  const data = snapshot.val();
  const arr = Object.entries(data || {}).map(([name, obj]) => ({ name, score: obj.score }));
  arr.sort((a, b) => b.score - a.score);
  leaderboard.innerHTML = arr
    .slice(0, 10)
    .map((p, i) => `<li>${i + 1}. ${p.name} - ${p.score}</li>`)
    .join('');
});
