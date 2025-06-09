

// Firebase 데이터베이스 참조
const database = firebase.database();

// DOM 요소 참조
const userInfoContainer = document.querySelector('.user-info-container h2');
const userInfoCard = document.querySelector('.user-info-card');
const sensorInfoCard = document.querySelector('.sensor-info-card');

// 모든 Firebase 데이터를 표시하는 함수
function displayAllFirebaseData() {
  // 루트에서 모든 데이터 가져오기
  const rootRef = database.ref('/');
  
  rootRef.once('value')
    .then((snapshot) => {
      const allData = snapshot.val();
      
      if (allData) {
        userInfoContainer.textContent = 'Firebase 데이터베이스 정보';
        displayData(allData);
      } else {
        showError('데이터베이스가 비어있거나 접근할 수 없습니다.');
      }
    })
    .catch((error) => {
      console.error('데이터 로드 오류:', error);
      showError('데이터를 불러오는 중 오류가 발생했습니다: ' + error.message);
    });
}

// 데이터를 재귀적으로 표시하는 함수
function displayData(data, path = '') {
  let html = '';
  
  if (typeof data === 'object' && data !== null) {
    Object.keys(data).forEach(key => {
      const value = data[key];
      const currentPath = path ? `${path} > ${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        html += `
          <div class="data-section">
            <h3 class="data-path">${currentPath}</h3>
            <div class="data-content">
              ${formatObjectData(value)}
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="data-item">
            <span class="data-key">${currentPath}:</span>
            <span class="data-value">${value}</span>
          </div>
        `;
      }
    });
  }
  
  if (html) {
    userInfoCard.innerHTML = html;
  } else {
    userInfoCard.innerHTML = '<div class="no-data">표시할 데이터가 없습니다.</div>';
  }
}

// 객체 데이터를 포맷하는 함수
function formatObjectData(obj) {
  let html = '<div class="object-data">';
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    
    if (typeof value === 'object' && value !== null) {
      html += `
        <div class="nested-object">
          <strong>${key}:</strong>
          <div class="nested-content">
            ${formatObjectData(value)}
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="object-item">
          <span class="object-key">${key}:</span>
          <span class="object-value">${value}</span>
        </div>
      `;
    }
  });
  
  html += '</div>';
  return html;
}

// 실시간 데이터 업데이트 설정
function setupRealtimeUpdates() {
  const rootRef = database.ref('/');
  
  rootRef.on('value', (snapshot) => {
    const allData = snapshot.val();
    
    if (allData) {
      displayData(allData);
      sensorInfoCard.innerHTML = `
        <div class="update-info">
          <h3>실시간 업데이트 활성화됨</h3>
          <p>마지막 업데이트: ${new Date().toLocaleString()}</p>
          <p>총 데이터 키 개수: ${Object.keys(allData).length}</p>
        </div>
      `;
    }
  }, (error) => {
    console.error('실시간 업데이트 오류:', error);
    sensorInfoCard.innerHTML = `<div class="error">실시간 업데이트 오류: ${error.message}</div>`;
  });
}

// 오류 표시 함수
function showError(message) {
  userInfoContainer.textContent = '오류 발생';
  userInfoCard.innerHTML = `<div class="error">${message}</div>`;
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
  console.log('페이지 로드 완료');
  
  // Firebase 초기화 확인
  if (typeof firebase === 'undefined') {
    showError('Firebase가 로드되지 않았습니다.');
    return;
  }
  
  // 모든 데이터 로드 및 실시간 업데이트 설정
  displayAllFirebaseData();
  setupRealtimeUpdates();
});

// 수동 새로고침 함수
function refreshData() {
  displayAllFirebaseData();
}

// 데이터 탐색을 위한 추가 함수들
function searchInData(searchTerm) {
  const rootRef = database.ref('/');
  
  rootRef.once('value').then((snapshot) => {
    const allData = snapshot.val();
    const results = findInObject(allData, searchTerm.toLowerCase());
    
    if (results.length > 0) {
      displaySearchResults(results);
    } else {
      userInfoCard.innerHTML = `<div class="no-results">검색 결과가 없습니다: "${searchTerm}"</div>`;
    }
  });
}

function findInObject(obj, searchTerm, path = '') {
  let results = [];
  
  if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const currentPath = path ? `${path}.${key}` : key;
      
      if (key.toLowerCase().includes(searchTerm) || 
          (typeof value === 'string' && value.toLowerCase().includes(searchTerm))) {
        results.push({ path: currentPath, key, value });
      }
      
      if (typeof value === 'object' && value !== null) {
        results = results.concat(findInObject(value, searchTerm, currentPath));
      }
    });
  }
  
  return results;
}

function displaySearchResults(results) {
  let html = `<h3>검색 결과 (${results.length}개)</h3>`;
  
  results.forEach(result => {
    html += `
      <div class="search-result">
        <div class="result-path">${result.path}</div>
        <div class="result-value">${result.value}</div>
      </div>
    `;
  });
  
  userInfoCard.innerHTML = html;
}
