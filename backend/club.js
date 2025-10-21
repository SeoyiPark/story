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

const startGameBtn = document.getElementById('startBtn');
// name이 'club'인 모든 라디오 버튼을 가져옵니다.
const clubRadioButtons = document.querySelectorAll('input[name="club"]');

// --- 앱 상태 변수 ---
let selectedClub = null;

/**
 * '시작하기' 버튼 클릭 이벤트를 처리합니다.
 * 선택된 동아리 정보를 localStorage에 저장하고 게임 페이지(index.html)로 이동합니다.
 */
function handleGameStart() {
    if (selectedClub) {
        console.log(`선택된 동아리: ${selectedClub}`);
        // 선택 정보를 localStorage에 저장합니다.
        localStorage.setItem('selectedClub', selectedClub);
        // 메인 게임 페이지로 이동합니다. (파일 이름이 다르면 'index.html'을 수정하세요)
        window.location.href = 'index.html';
    } else {
        // 동아리를 선택하지 않았을 경우 알림을 띄웁니다.
        alert('동아리를 먼저 선택해주세요!');
    }
}

/**
 * 페이지가 로드될 때 실행될 초기화 함수입니다.
 */
function initialize() {
    // 페이지가 처음 로드될 때 버튼을 비활성화합니다.
    startGameBtn.disabled = true;

    // 각 라디오 버튼에 이벤트 리스너를 추가합니다.
    clubRadioButtons.forEach(radio => {
        radio.addEventListener('change', (event) => {
            // 선택된 동아리 값을 변수에 저장합니다.
            selectedClub = event.target.value;
            // 동아리가 선택되면 버튼을 활성화합니다.
            startGameBtn.disabled = false;
        });
    });

    // 시작 버튼에 클릭 이벤트 리스너를 추가합니다.
    startGameBtn.addEventListener('click', handleGameStart);
}

// 페이지의 모든 콘텐츠가 로드된 후 초기화 함수를 실행합니다.
document.addEventListener('DOMContentLoaded', initialize);