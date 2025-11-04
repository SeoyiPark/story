// backend/club.js

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

const startGameBtn = document.getElementById('startBtn');
const clubRadioButtons = document.querySelectorAll('input[name="club"]');

// ✅ 학번·이름 입력란 가져오기
const studentIdInput = document.getElementById('studentId');
const nameInput = document.getElementById('studentName');

// --- 앱 상태 변수 ---
let selectedClub = null;

/**
 * '시작하기' 버튼 클릭 이벤트를 처리합니다.
 */
function handleGameStart(event) {
  event.preventDefault(); // 🚫 기본 이동 막기

  const studentId = studentIdInput?.value.trim();
  const name = nameInput?.value.trim();

  // 입력값 검증
  if (!studentId || !name) {
    alert('학번과 이름을 모두 입력해주세요!');
    return; // 🚫 바로 종료 — 이동 안함
  }

  if (!selectedClub) {
    alert('동아리를 먼저 선택해주세요!');
    return; // 🚫 바로 종료 — 이동 안함
  }

  // 저장
  localStorage.setItem('selectedClub', selectedClub);
  localStorage.setItem('studentId', studentId);
  localStorage.setItem('name', name);

  console.log(`동아리: ${selectedClub}, 학번: ${studentId}, 이름: ${name}`);

  // ✅ 모든 조건 충족 시 이동
  window.location.href = 'game.html';
}

/**
 * 초기화 함수
 */
function initialize() {
  startGameBtn.disabled = true;

  const allLabels = document.querySelectorAll('.club-list label');

  clubRadioButtons.forEach(radio => {
    radio.addEventListener('change', (event) => {
      selectedClub = event.target.value;
      startGameBtn.disabled = false;

      allLabels.forEach(label => label.classList.remove('selected'));
      if (event.target.parentElement) {
        event.target.parentElement.classList.add('selected');
      }
    });
  });

  startGameBtn.addEventListener('click', handleGameStart);
}

document.addEventListener('DOMContentLoaded', initialize);
