// 組合套裝計算器 - 潛水 + 民宿費用加總
// 簡單邏輯：直接複用潛水模式和民宿模式的計算結果

let comboState = {
  // 使用潛水的state
  useDiving: true,
  // 使用民宿的state
  useResidence: false,
  // 自訂折扣
  globalDiscount: 0
};

// ============ 初始化 ============

function initCombo() {
  loadComboFromStorage();
  renderComboCalculator();
}

// ============ 模式切換 ============

function comboToggleDiving(enable) {
  comboState.useDiving = enable;
  renderComboCalculator();
}

function comboToggleResidence(enable) {
  comboState.useResidence = enable;
  if (!enable) {
    // 如果禁用民宿，清空民宿數據
    residenceState.checkInDate = null;
    residenceState.checkOutDate = null;
    residenceState.occupancy = 2;
    residenceState.selectedRoom = null;
    residenceState.selectedPackage = null;
    residenceState.customItems = [];
  }
  renderComboCalculator();
}

// ============ 費用計算 ============

function comboCalculateTotal() {
  let total = 0;

  // 潛水費用
  if (comboState.useDiving && state.divers.length > 0) {
    const divingItems = generateLineItems();
    const divingSubtotal = divingItems.reduce((sum, item) => {
      return sum + (item.overridePrice !== null ? item.overridePrice : item.price);
    }, 0) - (state.globalDiscount || 0);
    total += Math.max(0, divingSubtotal);
  }

  // 民宿費用
  if (comboState.useResidence && residenceState.checkInDate && residenceState.checkOutDate) {
    const residenceItems = generateResidenceLineItems();
    const residenceSubtotal = residenceItems.reduce((sum, item) => {
      return sum + item.price;
    }, 0) - (residenceState.globalDiscount || 0);
    total += Math.max(0, residenceSubtotal);
  }

  // 組合折扣
  total -= comboState.globalDiscount;

  return Math.max(0, total);
}

function comboGenerateLineItems() {
  const items = [];

  // 潛水費用
  if (comboState.useDiving && state.divers.length > 0) {
    const divingItems = generateLineItems();
    items.push({
      category: '潛水遊',
      items: divingItems,
      subtotal: divingItems.reduce((sum, item) =>
        sum + (item.overridePrice !== null ? item.overridePrice : item.price), 0)
    });
  }

  // 民宿費用
  if (comboState.useResidence && residenceState.checkInDate && residenceState.checkOutDate) {
    const residenceItems = generateResidenceLineItems();
    items.push({
      category: '民宿住宿',
      items: residenceItems,
      subtotal: residenceItems.reduce((sum, item) => sum + item.price, 0)
    });
  }

  return items;
}

// ============ 渲染函式 ============

function renderComboCalculator() {
  renderComboDivingToggle();
  if (comboState.useDiving) {
    renderComboDivingContent();
  }

  renderComboResidenceToggle();
  if (comboState.useResidence) {
    renderComboResidenceContent();
  }

  renderComboLineItems();
  renderComboSummary();
  saveComboToStorage();
}

function renderComboDivingToggle() {
  const container = document.getElementById('comboDivingToggle');
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 1rem; background: var(--sand); border-radius: 0.375rem; border-left: 3px solid var(--ocean); margin-bottom: 1.5rem;">
      <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600;">
        <input type="checkbox" ${comboState.useDiving ? 'checked' : ''}
          onchange="comboToggleDiving(this.checked)">
        <span>🤿 潛水遊</span>
      </label>
    </div>
  `;
}

function renderComboDivingContent() {
  const container = document.getElementById('comboDivingContent');
  if (!container) return;

  // 直接嵌入潛水模式的主要UI
  let html = `
    <div style="background: rgba(0, 102, 204, 0.05); padding: 1.5rem; border-radius: 0.375rem; margin-bottom: 1.5rem;">
      <h3 style="margin-bottom: 1rem;">潛水設置</h3>

      <!-- 人員選擇 -->
      <div style="margin-bottom: 1rem;">
        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">選擇人數</label>
        <div id="comboDiverSelector" class="diver-selector">
          <div class="diver-buttons">
  `;

  for (let i = 1; i <= 12; i++) {
    html += `<button class="diver-btn ${state.diverCount === i ? 'active' : ''}"
      onclick="createDiverByCount(${i})">${i}人</button>`;
  }

  html += `
          </div>
        </div>
        <div id="comboDiverList"></div>
      </div>

      <!-- 行程規劃 -->
      <div style="margin-bottom: 1rem;">
        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">行程規劃</label>
        <div class="input-group">
          <input type="text" id="comboDayInput" placeholder="例：9/25">
          <button onclick="addDay()">新增一天</button>
        </div>
        <div id="comboDaysList"></div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  renderComboDiverList();
  renderComboDaysList();
}

function renderComboDiverList() {
  const container = document.getElementById('comboDiverList');
  if (!container || state.diverCount === 0) return;

  const codes = state.divers.map(d => d.name).join(', ');
  container.innerHTML = `
    <div style="margin-top: 0.5rem; padding: 0.75rem; background: white; border-radius: 0.25rem;">
      <span style="font-size: 0.9rem;">✓ 潛水員: ${codes}</span>
    </div>
  `;
}

function renderComboDaysList() {
  const container = document.getElementById('comboDaysList');
  if (!container) return;

  if (state.days.length === 0) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  state.days.forEach(day => {
    html += `
      <div style="margin-top: 0.75rem; padding: 0.75rem; background: white; border-radius: 0.25rem; border-left: 3px solid var(--ocean);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong>${day.date}</strong>
          <button class="danger" onclick="removeDay(${day.id})" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">刪除</button>
        </div>
        <div style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
          ${day.activities.length} 個活動
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderComboResidenceToggle() {
  const container = document.getElementById('comboResidenceToggle');
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 1rem; background: var(--sand); border-radius: 0.375rem; border-left: 3px solid var(--seafoam); margin-bottom: 1.5rem;">
      <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600;">
        <input type="checkbox" ${comboState.useResidence ? 'checked' : ''}
          onchange="comboToggleResidence(this.checked)">
        <span>🏠 民宿住宿</span>
      </label>
    </div>
  `;
}

function renderComboResidenceContent() {
  const container = document.getElementById('comboResidenceContent');
  if (!container) return;

  // 直接嵌入民宿模式的主要UI
  let html = `
    <div style="background: rgba(0, 170, 136, 0.05); padding: 1.5rem; border-radius: 0.375rem; margin-bottom: 1.5rem;">
      <h3 style="margin-bottom: 1rem;">民宿設置</h3>

      <!-- 日期選擇 -->
      <div style="margin-bottom: 1rem;">
        <div class="input-group">
          <div>
            <label style="display: block; font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 600;">入住</label>
            <input type="date" value="${residenceState.checkInDate || ''}"
              onchange="setCheckInDate(this.value)" style="width: 100%;">
          </div>
          <div>
            <label style="display: block; font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 600;">退房</label>
            <input type="date" value="${residenceState.checkOutDate || ''}"
              onchange="setCheckOutDate(this.value)" style="width: 100%;">
          </div>
        </div>
      </div>

      <!-- 人數選擇 -->
      <div style="margin-bottom: 1rem;">
        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">入住人數</label>
        <div class="diver-selector">
          <div class="diver-buttons">
  `;

  for (let i = 2; i <= 6; i++) {
    html += `<button class="diver-btn ${residenceState.occupancy === i ? 'active' : ''}"
      onclick="setOccupancy(${i})">${i}人</button>`;
  }

  html += `
          </div>
        </div>
      </div>

      <!-- 房型和加購簡略顯示 -->
      <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-secondary);">
        ${residenceState.selectedRoom ? `✓ 房型: ${ACCOMMODATION.rooms[residenceState.selectedRoom]?.name || '未知'}` : ''}
        ${residenceState.selectedRoom && residenceState.selectedPackage ? '<br>' : ''}
        ${residenceState.selectedPackage ? `✓ 行程: ${ACCOMMODATION.packages[residenceState.selectedPackage]?.name || '未知'}` : ''}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function renderComboLineItems() {
  const container = document.getElementById('comboLineItems');
  if (!container) return;

  const items = comboGenerateLineItems();

  let html = '';
  items.forEach(section => {
    html += `
      <div style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-light);">
        <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--slate);">${section.category}</h3>
    `;

    section.items.forEach(item => {
      html += `
        <div style="display: flex; justify-content: space-between; padding: 0.5rem; margin-bottom: 0.25rem;">
          <div style="flex: 1;">
            <div style="font-weight: 500;">${item.label}</div>
            ${item.calc ? `<div style="font-size: 0.85rem; color: var(--text-secondary);">${item.calc}</div>` : ''}
          </div>
          <div style="text-align: right; min-width: 80px;">$${item.price}</div>
        </div>
      `;
    });

    html += `
        <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(0, 0, 0, 0.05); border-radius: 0.25rem; margin-top: 0.5rem;">
          <span style="font-weight: 600;">小計</span>
          <span style="font-weight: 600;">$${section.subtotal}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html || '<p style="color: var(--text-secondary);">未選擇任何項目</p>';
}

function renderComboSummary() {
  const container = document.getElementById('comboSummary');
  if (!container) return;

  const items = comboGenerateLineItems();
  const subtotal = items.reduce((sum, section) => sum + section.subtotal, 0);
  const total = comboCalculateTotal();
  const participantCount = state.diverCount || residenceState.occupancy || 1;
  const perPerson = participantCount > 0 ? (total / participantCount).toFixed(0) : 0;

  container.innerHTML = `
    <div class="summary-row">
      <span class="summary-label">小計</span>
      <span class="summary-value">$${subtotal}</span>
    </div>
    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
      <label style="display: block; font-size: 0.9rem; margin-bottom: 0.5rem;">組合折扣:</label>
      <input type="number" value="${comboState.globalDiscount}"
        onchange="comboState.globalDiscount = parseFloat(this.value) || 0; renderComboSummary();"
        placeholder="0" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-light); border-radius: 0.25rem;">
    </div>
    <div class="total-box">
      <div class="total-label">總金額</div>
      <div class="total-amount">$${total.toFixed(0)}</div>
      <div class="per-person">平均每人: $${perPerson}</div>
    </div>
    <div class="button-group" style="margin-top: 1.5rem;">
      <button class="copy-btn" onclick="copyComboQuote()">複製報價文本</button>
    </div>
  `;
}

// ============ 報價複製 ============

function copyComboQuote() {
  const items = comboGenerateLineItems();
  const total = comboCalculateTotal();
  const participantCount = state.diverCount || residenceState.occupancy || 1;
  const perPerson = (total / participantCount).toFixed(0);

  let text = '===== 組合套裝報價 =====\n\n';

  // 潛水信息
  if (comboState.useDiving && state.divers.length > 0) {
    text += '潛水人員:\n';
    state.divers.forEach(d => {
      text += `  ${d.name}\n`;
    });
    text += '\n潛水行程:\n';
    state.days.forEach(day => {
      day.activities.forEach(act => {
        const parts = Array.from(act.participants)
          .map(pid => state.divers.find(d => d.id === pid)?.name || '')
          .join(', ');
        text += `  ${day.date} - ${act.type} (${parts})\n`;
      });
    });
    text += '\n';
  }

  // 民宿信息
  if (comboState.useResidence && residenceState.checkInDate && residenceState.checkOutDate) {
    const nights = calculateNightsBetween(residenceState.checkInDate, residenceState.checkOutDate);
    text += '民宿資訊:\n';
    text += `  入住: ${residenceState.checkInDate} ~ ${residenceState.checkOutDate} (${nights}晚)\n`;
    text += `  人數: ${residenceState.occupancy}人\n\n`;
  }

  // 費用明細
  text += '費用明細:\n';
  items.forEach(section => {
    text += `${section.category}:\n`;
    section.items.forEach(item => {
      text += `  ${item.label}: $${item.price}\n`;
    });
  });

  text += `\n合計: $${total.toFixed(0)}\n`;
  text += `平均每人: $${perPerson}\n`;
  text += `總人數: ${participantCount}\n`;

  navigator.clipboard.writeText(text).then(() => {
    showToast('已複製到剪貼簿!');
  });
}

// ============ 儲存/載入 ============

function saveComboToStorage() {
  localStorage.setItem('comboState', JSON.stringify(comboState));
}

function loadComboFromStorage() {
  const saved = localStorage.getItem('comboState');
  if (saved) {
    comboState = JSON.parse(saved);
  }
}

// 確保showToast函數可用
function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  } else {
    alert(message);
  }
}
