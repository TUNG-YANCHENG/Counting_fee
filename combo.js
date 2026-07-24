// 組合套裝計算器 - 簡單加總潛水和民宿費用
// 邏輯: 組合費用 = 潛水費 + 民宿費 + 組合折扣

let comboState = {
  useDiving: true,
  useResidence: false,
  globalDiscount: 0
};

function initCombo() {
  loadComboFromStorage();
  renderCombo();
}

function comboToggleDiving(enable) {
  comboState.useDiving = enable;
  renderCombo();
}

function comboToggleResidence(enable) {
  comboState.useResidence = enable;
  renderCombo();
}

function comboGetDivingCost() {
  if (!comboState.useDiving || state.divers.length === 0) return 0;

  const items = generateLineItems();
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.override !== null ? item.override : item.price);
  }, 0);

  return Math.max(0, subtotal - (state.globalDiscount || 0));
}

function comboGetResidenceCost() {
  if (!comboState.useResidence || !residenceState.checkInDate || !residenceState.checkOutDate) {
    return 0;
  }

  const items = generateResidenceLineItems();
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  return Math.max(0, subtotal - (residenceState.globalDiscount || 0));
}

function comboGetTotal() {
  const divingCost = comboGetDivingCost();
  const residenceCost = comboGetResidenceCost();
  const total = divingCost + residenceCost - comboState.globalDiscount;

  return Math.max(0, total);
}

function renderCombo() {
  renderComboControls();
  renderComboSummary();
  renderComboCostBreakdown();
  saveComboToStorage();
}

function renderComboControls() {
  const container = document.getElementById('comboControls');
  if (!container) return;

  let html = `
    <div style="display: flex; gap: 2rem; margin-bottom: 2rem; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 200px;">
        <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; font-weight: 600; padding: 1rem; background: rgba(0, 102, 204, 0.1); border-radius: 0.375rem;">
          <input type="checkbox" ${comboState.useDiving ? 'checked' : ''}
            onchange="comboToggleDiving(this.checked)">
          <span>🤿 包含潛水遊</span>
        </label>
      </div>

      <div style="flex: 1; min-width: 200px;">
        <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; font-weight: 600; padding: 1rem; background: rgba(0, 170, 136, 0.1); border-radius: 0.375rem;">
          <input type="checkbox" ${comboState.useResidence ? 'checked' : ''}
            onchange="comboToggleResidence(this.checked)">
          <span>🏠 包含民宿住宿</span>
        </label>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function renderComboCostBreakdown() {
  const container = document.getElementById('comboCostBreakdown');
  if (!container) return;

  const divingCost = comboGetDivingCost();
  const residenceCost = comboGetResidenceCost();

  let html = `
    <div style="background: var(--sand); padding: 1.5rem; border-radius: 0.375rem; margin-bottom: 1.5rem;">
      <h3 style="margin-bottom: 1rem; font-size: 1rem; font-weight: 600;">費用構成</h3>
  `;

  if (comboState.useDiving && divingCost > 0) {
    html += `
      <div style="display: flex; justify-content: space-between; padding: 0.75rem; border-bottom: 1px solid var(--border-light);">
        <span>🤿 潛水遊費用</span>
        <span style="font-weight: 600;">$${divingCost.toFixed(0)}</span>
      </div>
    `;
  }

  if (comboState.useResidence && residenceCost > 0) {
    html += `
      <div style="display: flex; justify-content: space-between; padding: 0.75rem; border-bottom: 1px solid var(--border-light);">
        <span>🏠 民宿住宿費用</span>
        <span style="font-weight: 600;">$${residenceCost.toFixed(0)}</span>
      </div>
    `;
  }

  if (divingCost === 0 && residenceCost === 0) {
    html += `<p style="color: var(--text-secondary); text-align: center;">請選擇並設置潛水或民宿</p>`;
  }

  html += `</div>`;

  container.innerHTML = html;
}

function renderComboSummary() {
  const container = document.getElementById('comboSummary');
  if (!container) return;

  const divingCost = comboGetDivingCost();
  const residenceCost = comboGetResidenceCost();
  const subtotal = divingCost + residenceCost;
  const total = comboGetTotal();

  const participantCount = Math.max(state.diverCount || 0, residenceState.occupancy || 1);
  const perPerson = participantCount > 0 ? (total / participantCount).toFixed(0) : 0;

  let html = `
    <div class="summary-row">
      <span class="summary-label">小計</span>
      <span class="summary-value">$${subtotal.toFixed(0)}</span>
    </div>

    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
      <label style="display: block; font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 600;">組合折扣</label>
      <input type="number" value="${comboState.globalDiscount}"
        onchange="comboState.globalDiscount = parseFloat(this.value) || 0; renderCombo();"
        placeholder="0"
        style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-light); border-radius: 0.375rem;">
    </div>

    <div class="total-box">
      <div class="total-label">組合總金額</div>
      <div class="total-amount">$${total.toFixed(0)}</div>
      <div class="per-person">平均每人: $${perPerson}</div>
    </div>

    <div class="button-group" style="margin-top: 1.5rem;">
      <button class="copy-btn" onclick="copyComboQuote()">複製組合報價</button>
    </div>
  `;

  container.innerHTML = html;
}

function copyComboQuote() {
  let text = '===== 組合套裝報價 =====\n\n';

  // 潛水部分
  if (comboState.useDiving && state.divers.length > 0) {
    text += '【潛水遊】\n';
    text += `人數: ${state.diverCount}\n`;
    text += `潛水員: ${state.divers.map(d => d.name).join(', ')}\n`;
    text += `行程天數: ${state.days.length}\n`;
    text += `潛水費用: $${comboGetDivingCost()}\n\n`;
  }

  // 民宿部分
  if (comboState.useResidence && residenceState.checkInDate && residenceState.checkOutDate) {
    text += '【民宿住宿】\n';
    const nights = calculateNightsBetween(residenceState.checkInDate, residenceState.checkOutDate);
    text += `入住: ${residenceState.checkInDate} ~ ${residenceState.checkOutDate} (${nights}晚)\n`;
    text += `人數: ${residenceState.occupancy}人\n`;
    text += `民宿費用: $${comboGetResidenceCost()}\n\n`;
  }

  // 合計
  text += '【費用合計】\n';
  const subtotal = comboGetDivingCost() + comboGetResidenceCost();
  const total = comboGetTotal();
  const participantCount = Math.max(state.diverCount || 0, residenceState.occupancy || 1);
  const perPerson = participantCount > 0 ? (total / participantCount).toFixed(0) : 0;

  text += `小計: $${subtotal.toFixed(0)}\n`;
  text += `組合折扣: -$${comboState.globalDiscount}\n`;
  text += `─────────────────\n`;
  text += `總金額: $${total.toFixed(0)}\n`;
  text += `平均每人: $${perPerson}\n`;

  navigator.clipboard.writeText(text).then(() => {
    showToast('已複製組合報價!');
  });
}

function saveComboToStorage() {
  localStorage.setItem('comboState', JSON.stringify(comboState));
}

function loadComboFromStorage() {
  const saved = localStorage.getItem('comboState');
  if (saved) {
    try {
      comboState = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load combo state:', e);
    }
  }
}

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
