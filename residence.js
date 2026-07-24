// 民宿預訂計算器邏輯

let residenceState = {
  checkInDate: null,
  checkOutDate: null,
  occupancy: 2,
  selectedRoom: null,
  selectedPackage: null,
  packageVariant: null,
  customItems: [],
  globalDiscount: 0,
  motorbikeCount: 0,
  holidays: [] // 國定假日列表 "YYYY-MM-DD"
};

let ACCOMMODATION = getAccommodation();

// 初始化
function initResidence() {
  loadResidenceFromStorage();
  renderResidenceCalculator();
}

// ============ 日期管理 ============

function setCheckInDate(dateStr) {
  residenceState.checkInDate = dateStr;
  renderResidenceCalculator();
}

function setCheckOutDate(dateStr) {
  residenceState.checkOutDate = dateStr;
  renderResidenceCalculator();
}

// ============ 房型選擇 ============

function selectRoom(roomType) {
  residenceState.selectedRoom = roomType;
  renderResidenceCalculator();
}

function clearRoom() {
  residenceState.selectedRoom = null;
  renderResidenceCalculator();
}

function setOccupancy(count) {
  residenceState.occupancy = count;
  renderResidenceCalculator();
}

// ============ 加購行程 ============

function selectPackage(packageId) {
  residenceState.selectedPackage = packageId;
  renderResidenceCalculator();
}

function clearPackage() {
  residenceState.selectedPackage = null;
  renderResidenceCalculator();
}

function setPackageVariant(variant) {
  residenceState.packageVariant = variant;
  renderResidenceCalculator();
}

// ============ 計算函式 ============

function calculateNightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  return Math.max(0, Math.ceil((co - ci) / (1000 * 60 * 60 * 24)));
}

function calculateRoomCostTotal() {
  if (!residenceState.selectedRoom || !residenceState.checkInDate || !residenceState.checkOutDate) {
    return 0;
  }

  return calculateRoomCost(
    residenceState.selectedRoom,
    residenceState.occupancy,
    calculateNightsBetween(residenceState.checkInDate, residenceState.checkOutDate),
    residenceState.checkInDate,
    residenceState.checkOutDate,
    residenceState.holidays
  );
}

function calculatePackageCost() {
  if (!residenceState.selectedPackage) return 0;

  const pkg = ACCOMMODATION.packages[residenceState.selectedPackage];
  if (!pkg) return 0;

  let cost = pkg.price * residenceState.occupancy;

  // 計算機車差價（奇數人數時）
  if (residenceState.occupancy % 2 === 1) {
    cost += pkg.motorbikeExtraFee;
  }

  return cost;
}

function calculateMotorbikeRental() {
  if (!residenceState.checkInDate || !residenceState.checkOutDate) return 0;

  const nights = calculateNightsBetween(residenceState.checkInDate, residenceState.checkOutDate);
  const motorbikeCount = Math.ceil(residenceState.occupancy / 2);

  // 機車租賃 - 假設每台 300 元/天
  return motorbikeCount * nights * 300;
}

function calculateBreakfastVouchers() {
  if (!residenceState.checkInDate || !residenceState.checkOutDate) return 0;

  const nights = calculateNightsBetween(residenceState.checkInDate, residenceState.checkOutDate);
  // 早餐抵用券 - 每人每天 100 元
  return residenceState.occupancy * nights * 100;
}

function generateResidenceLineItems() {
  const items = [];

  // 房費
  if (residenceState.selectedRoom) {
    const roomCost = calculateRoomCostTotal();
    const nights = calculateNightsBetween(residenceState.checkInDate, residenceState.checkOutDate);
    const room = ACCOMMODATION.rooms[residenceState.selectedRoom];

    if (roomCost > 0) {
      items.push({
        category: '住宿費',
        label: `${room.name} (${residenceState.occupancy}人)`,
        calc: `${nights}晚 @ ${residenceState.occupancy}人`,
        price: roomCost,
        id: `room-${residenceState.selectedRoom}`
      });
    }
  }

  // 加購行程
  if (residenceState.selectedPackage) {
    const pkg = ACCOMMODATION.packages[residenceState.selectedPackage];
    const cost = calculatePackageCost();

    if (cost > 0) {
      let calcStr = `${pkg.price}/人 × ${residenceState.occupancy}人`;
      if (residenceState.occupancy % 2 === 1) {
        calcStr += ` + 機車差價${pkg.motorbikeExtraFee}`;
      }

      items.push({
        category: '加購行程',
        label: pkg.name,
        calc: calcStr,
        price: cost,
        id: `package-${residenceState.selectedPackage}`
      });
    }
  }

  // 自訂項目
  residenceState.customItems.forEach((item, idx) => {
    items.push({
      category: '其他',
      label: item.name,
      calc: '',
      price: item.amount,
      id: `custom-${idx}`,
      isCustom: true,
      removeCustom: () => {
        residenceState.customItems.splice(idx, 1);
        renderResidenceCalculator();
      }
    });
  });

  return items;
}

function calculateResidenceTotal() {
  const items = generateResidenceLineItems();
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ============ 自訂項目 ============

function addResidenceCustomItem() {
  const name = document.getElementById('residenceCustomName').value.trim();
  const amount = parseFloat(document.getElementById('residenceCustomAmount').value);

  if (!name || isNaN(amount)) {
    showToast('請輸入項目名稱和金額');
    return;
  }

  residenceState.customItems.push({ name, amount });
  document.getElementById('residenceCustomName').value = '';
  document.getElementById('residenceCustomAmount').value = '';
  renderResidenceCalculator();
}

// ============ 渲染函式 ============

function renderResidenceCalculator() {
  renderResidenceDateSelector();
  renderResidenceOccupancySelector();
  renderResidenceRoomOptions();
  renderResidencePackageOptions();
  renderResidenceLineItems();
  renderResidenceSummary();
  saveResidenceToStorage();
}

function renderResidenceDateSelector() {
  const container = document.getElementById('residenceDateSelector');
  if (!container) return;

  container.innerHTML = `
    <div class="input-group">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">入住日期</label>
        <input type="date" id="checkInInput" value="${residenceState.checkInDate || ''}"
          onchange="setCheckInDate(this.value)">
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">退房日期</label>
        <input type="date" id="checkOutInput" value="${residenceState.checkOutDate || ''}"
          onchange="setCheckOutDate(this.value)">
      </div>
    </div>
  `;

  if (residenceState.checkInDate && residenceState.checkOutDate) {
    const nights = calculateNightsBetween(residenceState.checkInDate, residenceState.checkOutDate);
    const { weekdayNights, weekendNights } = calculateWeekdayWeekendNights(
      residenceState.checkInDate,
      residenceState.checkOutDate,
      residenceState.holidays
    );

    const summary = document.createElement('div');
    summary.style.marginTop = '1rem';
    summary.style.padding = '0.75rem';
    summary.style.background = 'var(--sand)';
    summary.style.borderRadius = '0.375rem';
    summary.innerHTML = `
      <div style="font-size: 0.9rem; color: var(--text-secondary);">
        ${nights}晚 (平日${weekdayNights}晚 + 假日${weekendNights}晚)
      </div>
    `;
    container.appendChild(summary);
  }
}

function renderResidenceOccupancySelector() {
  const container = document.getElementById('residenceOccupancySelector');
  if (!container) return;

  const buttons = Array.from({ length: 6 }, (_, i) => i + 2)
    .map(count => `
      <button class="diver-btn ${residenceState.occupancy === count ? 'active' : ''}"
        onclick="setOccupancy(${count})">${count}人</button>
    `).join('');

  container.innerHTML = `
    <div class="diver-selector">
      <label>入住人數:</label>
      <div class="diver-buttons">${buttons}</div>
    </div>
  `;
}

function renderResidenceRoomOptions() {
  const container = document.getElementById('residenceRoomOptions');
  if (!container) return;

  const roomsHtml = Object.entries(ACCOMMODATION.rooms)
    .filter(([_, room]) => room.capacity >= residenceState.occupancy)
    .map(([roomId, room]) => {
      const pricing = room.pricing[residenceState.occupancy];
      if (!pricing) return '';

      const isSelected = residenceState.selectedRoom === roomId;
      return `
        <div class="equipment-card" style="cursor: pointer; border: ${isSelected ? '2px solid var(--ocean)' : '1px solid var(--border-light)'}"
          onclick="selectRoom('${roomId}')">
          <div class="equipment-name">${room.name}</div>
          <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
            容納: 最多 ${room.capacity} 人
          </div>
          <div style="font-family: var(--font-mono); font-size: 0.95rem;">
            <div>平日: $${pricing.weekday}</div>
            <div>假日: $${pricing.weekend}</div>
          </div>
        </div>
      `;
    }).join('');

  let html = `
    <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: var(--slate);">房型選擇</h3>
    <div class="equipment-grid">${roomsHtml}</div>
  `;

  if (residenceState.selectedRoom) {
    html += `
      <div style="margin-top: 1rem;">
        <button class="danger" onclick="clearRoom()" style="width: 100%;">✕ 清除房型選擇</button>
      </div>
    `;
  }

  container.innerHTML = html;
}

function renderResidencePackageOptions() {
  const container = document.getElementById('residencePackageOptions');
  if (!container) return;

  const packageIds = Object.keys(ACCOMMODATION.packages);
  const packagesHtml = packageIds.map(pkgId => {
    const pkg = ACCOMMODATION.packages[pkgId];
    const isSelected = residenceState.selectedPackage === pkgId;

    return `
      <div class="equipment-card" style="cursor: pointer; border: ${isSelected ? '2px solid var(--ocean)' : '1px solid var(--border-light)'}"
        onclick="selectPackage('${pkgId}')">
        <div class="equipment-name">${pkg.name}</div>
        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
          ${pkg.days}天 | $${pkg.price}/人
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">
          ${pkg.includes.join(' · ')}
        </div>
      </div>
    `;
  }).join('');

  let html = `
    <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: var(--slate);">加購行程</h3>
    <div class="equipment-grid">${packagesHtml}</div>
  `;

  if (residenceState.selectedPackage) {
    html += `
      <div style="margin-top: 1rem;">
        <button class="danger" onclick="clearPackage()" style="width: 100%;">✕ 清除加購選擇</button>
      </div>
    `;
  }

  container.innerHTML = html;
}

function renderResidenceLineItems() {
  const container = document.getElementById('residenceLineItems');
  if (!container) return;

  const items = generateResidenceLineItems();
  const itemsByCategory = {};

  items.forEach(item => {
    if (!itemsByCategory[item.category]) {
      itemsByCategory[item.category] = [];
    }
    itemsByCategory[item.category].push(item);
  });

  let html = '';
  Object.entries(itemsByCategory).forEach(([category, categoryItems]) => {
    html += `<div style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--slate);">${category}</h3>`;

    categoryItems.forEach((item, idx) => {
      let deleteBtn = '';
      if (item.isCustom) {
        const customIdx = parseInt(item.id.split('-')[1]);
        deleteBtn = `<button class="danger" onclick="residenceState.customItems.splice(${customIdx}, 1); renderResidenceCalculator();" style="padding: 0.5rem 0.75rem; font-size: 0.85rem;">✕ 刪除</button>`;
      }

      html += `
        <div class="line-item" style="display: flex; justify-content: space-between; align-items: start; padding: 0.875rem 0; border-bottom: 1px solid var(--border-light);">
          <div class="item-description" style="flex: 1; min-width: 0;">
            <div class="item-label" style="font-weight: 500; color: var(--text-primary); word-break: break-word;">${item.label}</div>
            ${item.calc ? `<div class="item-calc" style="font-size: 0.85rem; color: var(--text-secondary); font-family: var(--font-mono); margin-top: 0.25rem; word-break: break-word;">${item.calc}</div>` : ''}
          </div>
          <div style="display: flex; gap: 0.75rem; align-items: center; margin-left: 1rem;">
            <div class="item-price" style="text-align: right; font-weight: 600; font-family: var(--font-mono); white-space: nowrap; min-width: 90px;">$${item.price}</div>
            ${deleteBtn}
          </div>
        </div>
      `;
    });

    html += '</div>';
  });

  html += `
    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
      <div class="input-group">
        <input type="text" id="residenceCustomName" placeholder="項目名稱">
        <input type="number" id="residenceCustomAmount" placeholder="金額">
        <button onclick="addResidenceCustomItem()">新增</button>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function renderResidenceSummary() {
  const container = document.getElementById('residenceSummary');
  if (!container) return;

  const total = calculateResidenceTotal();
  const participantCount = residenceState.occupancy || 1;
  const perPerson = participantCount > 0 ? (total / participantCount).toFixed(0) : 0;

  container.innerHTML = `
    <div class="summary-row">
      <span class="summary-label">小計</span>
      <span class="summary-value">${total.toFixed(0)}</span>
    </div>
    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
      <label style="display: block; font-size: 0.9rem; margin-bottom: 0.5rem;">全體折扣:</label>
      <input type="number" value="${residenceState.globalDiscount}"
        onchange="residenceState.globalDiscount = parseFloat(this.value) || 0; renderResidenceCalculator();"
        placeholder="0">
    </div>
    <div class="total-box">
      <div class="total-label">總金額</div>
      <div class="total-amount">$${(total - residenceState.globalDiscount).toFixed(0)}</div>
      <div class="per-person">平均每人: $${perPerson}</div>
    </div>
  `;
}

// ============ 儲存/載入 ============

function saveResidenceToStorage() {
  localStorage.setItem('residenceState', JSON.stringify(residenceState));
}

function loadResidenceFromStorage() {
  const saved = localStorage.getItem('residenceState');
  if (saved) {
    residenceState = JSON.parse(saved);
  }
}
