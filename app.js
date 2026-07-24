// 潛水費用計算器 - 主應用邏輯

// 狀態管理
let state = {
  diverCount: 0,
  divers: [],
  days: [],
  equipmentByDiver: {},
  customItems: [],
  globalDiscount: 0
};

let PRICING = getPricing();

// 初始化
function init() {
  loadFromStorage();
  render();
}

// ============ 人員管理（人數選擇模式）============

function createDiverByCount(count) {
  state.divers = [];
  state.equipmentByDiver = {};

  const codes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  for (let i = 0; i < count; i++) {
    const id = Date.now() + i;
    const code = codes[i] || `潛水員${i+1}`;
    state.divers.push({ id, name: code });
    state.equipmentByDiver[id] = {
      type: 'none',
      rentDays: 0,
      addons: {},
      highOxygenBottles: 0,
      weightBeltInsurance: 0,
      overrideTotal: null
    };
  }
  state.diverCount = count;
  render();
}

// ============ 行程管理 ============

function addDay() {
  const input = document.getElementById('dayInput');
  const date = input.value.trim();
  if (!date) {
    showToast('請輸入日期');
    return;
  }
  state.days.push({ id: Date.now(), date, activities: [] });
  input.value = '';
  render();
}

function removeDay(dayId) {
  state.days = state.days.filter(d => d.id !== dayId);
  render();
}

function addActivity(dayId, type = '岸潛') {
  const day = state.days.find(d => d.id === dayId);
  if (day) {
    day.activities.push({
      id: Date.now(),
      type,
      participants: new Set(state.divers.map(d => d.id)),
      quantity: 1,
      bottles: type === '岸潛' || type === '夜潛' || type === 'checkDive' ? 1 : 2,
      overrideCost: null,
      includeShipFee: type === '船潛'
    });
    render();
  }
}

function removeActivity(dayId, actId) {
  const day = state.days.find(d => d.id === dayId);
  if (day) {
    day.activities = day.activities.filter(a => a.id !== actId);
    render();
  }
}

function toggleParticipant(dayId, actId, diverId) {
  const day = state.days.find(d => d.id === dayId);
  const act = day?.activities.find(a => a.id === actId);
  if (act) {
    if (act.participants.has(diverId)) {
      act.participants.delete(diverId);
    } else {
      act.participants.add(diverId);
    }
    render();
  }
}

// ============ 裝備管理 ============

function setEquipmentType(diverId, type) {
  state.equipmentByDiver[diverId].type = type;
  state.equipmentByDiver[diverId].overrideTotal = null;
  render();
}

// ============ 計算函式 ============

function calculateRentDays(diverId) {
  const daysWithActivity = new Set();
  state.days.forEach(day => {
    const hasActivity = day.activities.some(act => act.participants.has(diverId));
    if (hasActivity) daysWithActivity.add(day.id);
  });
  return daysWithActivity.size;
}

function calculateBottlesPerDay(diverId) {
  const bottlesByDay = {};
  state.days.forEach(day => {
    let bottles = 0;
    day.activities.forEach(act => {
      if (act.participants.has(diverId)) {
        bottles += (act.bottles || 1) * (act.quantity || 1);
      }
    });
    if (bottles > 0) bottlesByDay[day.id] = bottles;
  });
  return bottlesByDay;
}

function calculateEquipmentCost(diverId) {
  const equip = state.equipmentByDiver[diverId];
  if (equip.overrideTotal !== null) return equip.overrideTotal;

  let cost = 0;
  const rentDays = calculateRentDays(diverId);
  const bottlesByDay = calculateBottlesPerDay(diverId);

  if (equip.type === 'none') {
    cost = rentDays * PRICING.weightBeltInsurance;
  } else if (equip.type === 'fullRental') {
    let subtotal = 0;
    Object.values(bottlesByDay).forEach(bottles => {
      subtotal += bottles > 2 ? PRICING.equipment.fullRental.fullDay : PRICING.equipment.fullRental.halfDay;
    });
    cost = subtotal;
  } else if (equip.type === 'heavySet') {
    let subtotal = 0;
    Object.values(bottlesByDay).forEach(bottles => {
      subtotal += bottles > 2 ? PRICING.equipment.heavySet.fullDay : PRICING.equipment.heavySet.halfDay;
    });
    cost = subtotal;
  }

  Object.entries(equip.addons || {}).forEach(([addon, include]) => {
    if (include && PRICING.equipment[addon]) {
      const addonPrice = PRICING.equipment[addon].fullDay || PRICING.equipment[addon].halfDay || 0;
      cost += addonPrice * rentDays;
    }
  });

  cost += (equip.highOxygenBottles || 0) * PRICING.highOxygen;

  if (equip.weightBeltInsurance !== null) {
    cost += equip.weightBeltInsurance;
  } else if (equip.type === 'none') {
    cost += rentDays * PRICING.weightBeltInsurance;
  }

  return cost;
}

function calculateActivityCost(dayId, activity) {
  if (activity.overrideCost !== null) return activity.overrideCost;

  const participantCount = activity.participants.size;
  if (participantCount === 0) return 0;

  if (!PRICING || !PRICING.funDive) {
    console.error('价目表未初始化:', { PRICING });
    return 0;
  }

  const peopleKey = Math.min(participantCount, 8);
  const pricing = PRICING.funDive[peopleKey];

  if (!pricing) {
    console.error(`找不到 ${peopleKey} 人的价格表`, { PRICING });
    return 0;
  }

  let cost = 0;
  if (activity.type && pricing[activity.type]) {
    cost = pricing[activity.type] * participantCount * (activity.quantity || 1);
  }

  if (activity.includeShipFee && activity.type === '船潛') {
    cost += PRICING.shipFee * participantCount * (activity.quantity || 1);
  }

  return cost;
}

function generateLineItems() {
  const items = [];

  state.days.forEach(day => {
    day.activities.forEach(act => {
      const cost = calculateActivityCost(day.id, act);
      if (cost > 0) {
        const participantCount = act.participants.size;
        let description = `${day.date} - ${act.type}`;
        if (act.quantity > 1) description += `×${act.quantity}`;
        if (act.bottles && act.bottles > 1) description += `(${act.bottles}支)`;

        let calcStr = '';
        if (participantCount > 0) {
          const peopleKey = Math.min(participantCount, 8);
          const pricing = PRICING.funDive[peopleKey];
          const unitPrice = pricing[act.type] || 0;
          calcStr = `${unitPrice}/人 × ${participantCount}人`;
          if (act.quantity > 1) calcStr += ` × ${act.quantity}`;
          if (act.includeShipFee && act.type === '船潛') {
            calcStr += ` + 船費${PRICING.shipFee}`;
          }
        }

        items.push({
          category: '活動費',
          label: description,
          calc: calcStr,
          price: cost,
          id: `act-${day.id}-${act.id}`,
          override: act.overrideCost,
          setOverride: (val) => { act.overrideCost = val === '' ? null : parseFloat(val); render(); }
        });
      }
    });
  });

  state.divers.forEach(diver => {
    const cost = calculateEquipmentCost(diver.id);
    if (cost > 0) {
      const rentDays = calculateRentDays(diver.id);
      const equip = state.equipmentByDiver[diver.id];
      const typeLabel = {
        'none': '自備(配重保險)',
        'fullRental': '全裝租賃',
        'heavySet': '重裝租賃',
        'lightSet': '輕裝租賃'
      }[equip.type] || '無';

      items.push({
        category: '裝備費',
        label: `${diver.name} - ${typeLabel}`,
        calc: `${rentDays}天`,
        price: cost,
        id: `equip-${diver.id}`,
        override: equip.overrideTotal,
        setOverride: (val) => { equip.overrideTotal = val === '' ? null : parseFloat(val); render(); }
      });
    }
  });

  state.customItems.forEach((item, idx) => {
    items.push({
      category: '其他',
      label: item.name,
      calc: '',
      price: item.amount,
      id: `custom-${idx}`,
      override: null,
      isCustom: true,
      removeCustom: () => {
        state.customItems.splice(idx, 1);
        render();
      }
    });
  });

  return items;
}

function calculateTotal() {
  const items = generateLineItems();
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ============ 自訂項目 ============

function addCustomItem() {
  const name = document.getElementById('customName').value.trim();
  const amount = parseFloat(document.getElementById('customAmount').value);
  if (!name || isNaN(amount)) {
    showToast('請輸入項目名稱和金額');
    return;
  }
  state.customItems.push({ name, amount });
  document.getElementById('customName').value = '';
  document.getElementById('customAmount').value = '';
  render();
}

// ============ 渲染函式 ============

function renderDiversSelector() {
  const container = document.getElementById('diverSelector');
  const buttons = Array.from({ length: 12 }, (_, i) => i + 1)
    .map(count => `
      <button class="diver-btn ${state.diverCount === count ? 'active' : ''}"
        onclick="createDiverByCount(${count})">${count}人</button>
    `).join('');

  container.innerHTML = `
    <div class="diver-selector">
      <label>選擇潛水人數:</label>
      <div class="diver-buttons">${buttons}</div>
    </div>
  `;
}

function renderDiversList() {
  const container = document.getElementById('diverList');
  if (state.divers.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); padding: 1rem;">請先選擇潛水人數</p>';
    return;
  }

  container.innerHTML = `
    <div class="diver-list">
      ${state.divers.map(diver => `
        <div class="diver-item">
          <span class="diver-name">${diver.name}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderDaysAndActivities() {
  const container = document.getElementById('daysList');
  if (state.divers.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); padding: 1rem;">請先選擇潛水人數</p>';
    return;
  }

  container.innerHTML = state.days.map(day => {
    const activitiesHtml = day.activities.map(act => {
      const participantCheckboxes = state.divers.map(diver => `
        <div class="checkbox-wrap">
          <input type="checkbox" id="cb-${day.id}-${act.id}-${diver.id}"
            ${act.participants.has(diver.id) ? 'checked' : ''}
            onchange="toggleParticipant(${day.id}, ${act.id}, ${diver.id})">
          <label for="cb-${day.id}-${act.id}-${diver.id}">${diver.name}</label>
        </div>
      `).join('');

      return `
        <div class="activity-item">
          <div class="activity-type">
            <select onchange="const day = state.days.find(d=>d.id===${day.id}); const act = day.activities.find(a=>a.id===${act.id}); act.type = this.value; render();">
              <option value="岸潛" ${act.type === '岸潛' ? 'selected' : ''}>岸潛</option>
              <option value="船潛" ${act.type === '船潛' ? 'selected' : ''}>船潛</option>
              <option value="夜潛" ${act.type === '夜潛' ? 'selected' : ''}>夜潛</option>
              <option value="checkDive" ${act.type === 'checkDive' ? 'selected' : ''}>Check Dive</option>
            </select>
          </div>
          <div class="diver-checkboxes">${participantCheckboxes}</div>
          <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
            <button class="danger" style="flex: 1;" onclick="removeActivity(${day.id}, ${act.id})">刪除</button>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="day-panel">
        <div class="day-title">${day.date}</div>
        ${activitiesHtml}
        <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <select id="actType-${day.id}" style="flex: 1; min-width: 100px;">
            <option value="岸潛">岸潛</option>
            <option value="船潛">船潛</option>
            <option value="夜潛">夜潛</option>
            <option value="checkDive">Check Dive</option>
          </select>
          <button onclick="addActivity(${day.id}, document.getElementById('actType-${day.id}').value)">新增活動</button>
          <button class="danger" onclick="removeDay(${day.id})">刪除一天</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderEquipment() {
  const container = document.getElementById('equipmentSection');
  if (state.divers.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary);">請先選擇潛水人數</p>';
    return;
  }

  container.innerHTML = `
    <div class="equipment-grid">
      ${state.divers.map(diver => {
        const equip = state.equipmentByDiver[diver.id];
        const rentDays = calculateRentDays(diver.id);
        return `
          <div class="equipment-card">
            <div class="equipment-name">${diver.name}</div>
            <div class="equipment-options">
              <div class="radio-wrap">
                <input type="radio" name="equip-${diver.id}" value="none" id="equip-none-${diver.id}"
                  ${equip.type === 'none' ? 'checked' : ''}
                  onchange="setEquipmentType(${diver.id}, 'none')">
                <label for="equip-none-${diver.id}">自備 (${rentDays}天×${PRICING.weightBeltInsurance})</label>
              </div>
              <div class="radio-wrap">
                <input type="radio" name="equip-${diver.id}" value="fullRental" id="equip-full-${diver.id}"
                  ${equip.type === 'fullRental' ? 'checked' : ''}
                  onchange="setEquipmentType(${diver.id}, 'fullRental')">
                <label for="equip-full-${diver.id}">全裝租賃</label>
              </div>
              <div class="radio-wrap">
                <input type="radio" name="equip-${diver.id}" value="heavySet" id="equip-heavy-${diver.id}"
                  ${equip.type === 'heavySet' ? 'checked' : ''}
                  onchange="setEquipmentType(${diver.id}, 'heavySet')">
                <label for="equip-heavy-${diver.id}">重裝租賃</label>
              </div>
            </div>
            <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-light);">
              <label style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">覆寫:</label>
              <input type="number" value="${equip.overrideTotal || ''}" placeholder="自動"
                onchange="state.equipmentByDiver[${diver.id}].overrideTotal = this.value ? parseFloat(this.value) : null; render();">
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderLineItems() {
  const container = document.getElementById('lineItems');
  const items = generateLineItems();
  const itemsByCategory = {};

  items.forEach(item => {
    if (!itemsByCategory[item.category]) itemsByCategory[item.category] = [];
    itemsByCategory[item.category].push(item);
  });

  let html = '';
  Object.entries(itemsByCategory).forEach(([category, categoryItems]) => {
    html += `<div style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--slate);">${category}</h3>`;

    categoryItems.forEach(item => {
      const displayPrice = item.override !== null ? item.override : item.price;
      const originalPrice = item.price;
      html += `
        <div class="line-item">
          <div class="item-description">
            <div class="item-label">${item.label}</div>
            ${item.calc ? `<div class="item-calc">${item.calc}</div>` : ''}
          </div>
          <div class="override-wrap">
            <div class="item-price">
              ${item.override !== null ? `${originalPrice} → ` : ''}${displayPrice}
            </div>
            <input type="number" value="${item.override !== null ? item.override : ''}" placeholder="改"
              onchange="item.setOverride(this.value);">
          </div>
        </div>
      `;
    });

    html += '</div>';
  });

  html += `
    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
      <div class="input-group">
        <input type="text" id="customName" placeholder="項目名稱 (烤肉、代訂票等)">
        <input type="number" id="customAmount" placeholder="金額">
        <button onclick="addCustomItem()">新增</button>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function renderSummary() {
  const container = document.getElementById('summary');
  const total = calculateTotal();
  const participantCount = state.divers.length || 1;
  const perPerson = participantCount > 0 ? (total / participantCount).toFixed(0) : 0;

  container.innerHTML = `
    <div class="summary-row">
      <span class="summary-label">小計</span>
      <span class="summary-value">${total.toFixed(0)}</span>
    </div>
    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
      <label style="display: block; font-size: 0.9rem; margin-bottom: 0.5rem;">全體折扣:</label>
      <input type="number" value="${state.globalDiscount}"
        onchange="state.globalDiscount = parseFloat(this.value) || 0; render();" placeholder="0">
    </div>
    <div class="total-box">
      <div class="total-label">總金額</div>
      <div class="total-amount">$${(total - state.globalDiscount).toFixed(0)}</div>
      <div class="per-person">平均每人: $${perPerson}</div>
    </div>
  `;
}

function renderStorage() {
  const container = document.getElementById('storageSection');
  const drafts = JSON.parse(localStorage.getItem('diveQuoteDrafts') || '{}');
  const names = Object.keys(drafts);

  if (names.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary);">尚無儲存的草稿</p>';
    return;
  }

  container.innerHTML = '<div class="storage-list">' + names.map(name => `
    <div class="storage-item">
      <span class="storage-item-name">${name}</span>
      <div class="storage-item-actions">
        <button class="secondary" onclick="loadDraft('${name}')">載入</button>
        <button class="danger" onclick="deleteDraft('${name}')">刪除</button>
      </div>
    </div>
  `).join('') + '</div>';
}

// ============ 工具函式 ============

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function copyQuote() {
  const items = generateLineItems();
  const total = calculateTotal();
  const participantCount = state.divers.length || 1;
  const perPerson = (total / participantCount).toFixed(0);

  let text = '===== 潛水費用報價 =====\n\n';

  if (state.days.length > 0) {
    text += '行程:\n';
    state.days.forEach(day => {
      text += `${day.date}\n`;
      day.activities.forEach(act => {
        text += `  - ${act.type}`;
        if (act.quantity > 1) text += `×${act.quantity}`;
        text += `(${Array.from(act.participants).map(id => state.divers.find(d => d.id === id)?.name).filter(Boolean).join(', ')})`;
        text += '\n';
      });
    });
    text += '\n';
  }

  if (state.divers.length > 0) {
    text += '參加人員:\n';
    state.divers.forEach(diver => {
      const equip = state.equipmentByDiver[diver.id];
      const equipLabel = {
        'none': '自備',
        'fullRental': '全裝',
        'heavySet': '重裝',
        'lightSet': '輕裝'
      }[equip.type] || '無';
      text += `${diver.name} - ${equipLabel}\n`;
    });
    text += '\n';
  }

  text += '費用明細:\n';
  const itemsByCategory = {};
  items.forEach(item => {
    if (!itemsByCategory[item.category]) itemsByCategory[item.category] = [];
    itemsByCategory[item.category].push(item);
  });

  Object.entries(itemsByCategory).forEach(([category, categoryItems]) => {
    text += `${category}:\n`;
    categoryItems.forEach(item => {
      const price = item.override !== null ? item.override : item.price;
      text += `  ${item.label} = ${price}\n`;
    });
  });

  text += `\n合計: $${(total - state.globalDiscount).toFixed(0)}\n`;
  text += `平均每人: $${perPerson}\n`;
  text += `總人數: ${participantCount}\n`;

  navigator.clipboard.writeText(text).then(() => {
    showToast('已複製到剪貼簿!');
  });
}

function saveDraft() {
  const name = prompt('輸入草稿名稱:');
  if (!name) return;
  const drafts = JSON.parse(localStorage.getItem('diveQuoteDrafts') || '{}');
  drafts[name] = JSON.stringify(state);
  localStorage.setItem('diveQuoteDrafts', JSON.stringify(drafts));
  showToast(`草稿 "${name}" 已儲存`);
  renderStorage();
}

function loadDraft(name) {
  const drafts = JSON.parse(localStorage.getItem('diveQuoteDrafts') || '{}');
  if (drafts[name]) {
    state = JSON.parse(drafts[name]);
    restoreSets();
    render();
    showToast(`已載入草稿 "${name}"`);
  }
}

function deleteDraft(name) {
  if (!confirm(`確定要刪除草稿 "${name}" 嗎?`)) return;
  const drafts = JSON.parse(localStorage.getItem('diveQuoteDrafts') || '{}');
  delete drafts[name];
  localStorage.setItem('diveQuoteDrafts', JSON.stringify(drafts));
  showToast(`草稿 "${name}" 已刪除`);
  renderStorage();
}

function restoreSets() {
  state.days.forEach(day => {
    day.activities.forEach(act => {
      if (act.participants && !(act.participants instanceof Set)) {
        act.participants = new Set(act.participants);
      }
    });
  });
}

function saveToStorage() {
  localStorage.setItem('diveQuoteState', JSON.stringify(state));
}

function loadFromStorage() {
  const saved = localStorage.getItem('diveQuoteState');
  if (saved) {
    state = JSON.parse(saved);
    restoreSets();
  }
}

// ============ 主渲染 ============

function render() {
  renderDiversSelector();
  renderDiversList();
  renderDaysAndActivities();
  renderEquipment();
  renderLineItems();
  renderSummary();
  renderStorage();
  saveToStorage();
}

// 初始化
init();
