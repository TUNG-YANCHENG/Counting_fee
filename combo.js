// 組合套裝計算器 - 潛水 + 民宿整合

let comboState = {
  // 潛水部分
  diverCount: 0,
  divers: [],
  days: [],
  equipmentByDiver: {},
  customItems: [],

  // 民宿部分
  includeResidence: false,
  checkInDate: null,
  checkOutDate: null,
  occupancy: 2,
  selectedRoom: null,
  selectedPackage: null,
  residenceCustomItems: [],

  // 整體折扣
  globalDiscount: 0
};

let COMBO_PRICING = getPricing();
let COMBO_ACCOMMODATION = getAccommodation();

// ============ 初始化 ============

function initCombo() {
  loadComboFromStorage();
  renderComboCalculator();
}

// ============ 潛水部分 ============

function comboCreateDiverByCount(count) {
  comboState.divers = [];
  comboState.equipmentByDiver = {};

  const codes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  for (let i = 0; i < count; i++) {
    const id = Date.now() + i;
    const code = codes[i] || `潛水員${i+1}`;
    comboState.divers.push({ id, name: code });
    comboState.equipmentByDiver[id] = {
      type: 'none',
      rentDays: 0,
      addons: {},
      highOxygenBottles: 0,
      weightBeltInsurance: 0,
      overrideTotal: null
    };
  }
  comboState.diverCount = count;
  renderComboCalculator();
}

function comboAddDay() {
  const input = document.getElementById('comboDayInput');
  const date = input.value.trim();
  if (!date) {
    showToast('請輸入日期');
    return;
  }
  comboState.days.push({ id: Date.now(), date, activities: [] });
  input.value = '';
  renderComboCalculator();
}

function comboRemoveDay(dayId) {
  comboState.days = comboState.days.filter(d => d.id !== dayId);
  renderComboCalculator();
}

function comboAddActivity(dayId, type = '岸潛') {
  const day = comboState.days.find(d => d.id === dayId);
  if (day) {
    day.activities.push({
      id: Date.now(),
      type,
      participants: new Set(comboState.divers.map(d => d.id)),
      quantity: 1,
      bottles: type === '岸潛' || type === '夜潛' || type === 'checkDive' ? 1 : 2,
      overrideCost: null,
      includeShipFee: type === '船潛'
    });
    renderComboCalculator();
  }
}

function comboRemoveActivity(dayId, actId) {
  const day = comboState.days.find(d => d.id === dayId);
  if (day) {
    day.activities = day.activities.filter(a => a.id !== actId);
    renderComboCalculator();
  }
}

function comboToggleParticipant(dayId, actId, diverId) {
  const day = comboState.days.find(d => d.id === dayId);
  const act = day?.activities.find(a => a.id === actId);
  if (act) {
    if (act.participants.has(diverId)) {
      act.participants.delete(diverId);
    } else {
      act.participants.add(diverId);
    }
    renderComboCalculator();
  }
}

// ============ 民宿切換 ============

function comboToggleResidence(enable) {
  if (!enable) {
    // 取消民宿時清空相關數據
    comboState.includeResidence = false;
    comboState.checkInDate = null;
    comboState.checkOutDate = null;
    comboState.occupancy = 2;
    comboState.selectedRoom = null;
    comboState.selectedPackage = null;
    comboState.residenceCustomItems = [];
  } else {
    comboState.includeResidence = true;
  }
  renderComboCalculator();
}

function comboSetCheckInDate(dateStr) {
  comboState.checkInDate = dateStr;
  renderComboCalculator();
}

function comboSetCheckOutDate(dateStr) {
  comboState.checkOutDate = dateStr;
  renderComboCalculator();
}

function comboSetOccupancy(count) {
  comboState.occupancy = count;
  renderComboCalculator();
}

function comboSelectRoom(roomType) {
  comboState.selectedRoom = roomType;
  renderComboCalculator();
}

function comboSelectPackage(packageId) {
  comboState.selectedPackage = packageId;
  renderComboCalculator();
}

function comboResetResidenceSelection() {
  comboState.includeResidence = false;
  comboState.checkInDate = null;
  comboState.checkOutDate = null;
  comboState.occupancy = 2;
  comboState.selectedRoom = null;
  comboState.selectedPackage = null;
  comboState.residenceCustomItems = [];
  renderComboCalculator();
}

// ============ 費用計算 ============

function comboCalculateActivityCost(activity, participantCount) {
  if (participantCount === 0) return 0;

  const table = COMBO_PRICING.funDive[participantCount] || COMBO_PRICING.funDive[8];
  const activityType = activity.type;
  const quantity = activity.quantity || 1;
  const basePrice = table[activityType] || 0;

  let cost = basePrice * participantCount * quantity;

  // 加船費
  if (activity.includeShipFee && activityType === '船潛') {
    cost += COMBO_PRICING.basicFee.shipFee * participantCount * quantity;
  }

  return cost;
}

function comboCalculateDivingCost() {
  const items = [];

  comboState.days.forEach(day => {
    day.activities.forEach(act => {
      const participantCount = act.participants.size;
      if (participantCount === 0) return;

      let cost = comboCalculateActivityCost(act, participantCount);

      items.push({
        category: '潛水活動費',
        label: `${day.date} - ${act.type}`,
        calc: `${day.date} ${act.type}(${participantCount}人) × ${act.quantity}`,
        price: cost,
        overridePrice: act.overrideCost,
        id: `activity-${day.id}-${act.id}`
      });
    });
  });

  return items;
}

function comboCalculateEquipmentCost() {
  const items = [];

  comboState.divers.forEach(diver => {
    const equipment = comboState.equipmentByDiver[diver.id];
    if (!equipment) return;

    // 計算租用天數
    let rentDays = 0;
    comboState.days.forEach(day => {
      const hasActivity = day.activities.some(act => act.participants.has(diver.id));
      if (hasActivity) rentDays++;
    });

    if (rentDays === 0) return;

    // 裝備租賃費用
    if (equipment.type !== 'none') {
      const halfDayBottles = 0;
      let fullDayCount = 0;

      comboState.days.forEach(day => {
        const divActivities = day.activities.filter(act => act.participants.has(diver.id));
        const totalBottles = divActivities.reduce((sum, a) => sum + a.bottles, 0);
        if (totalBottles > 2) fullDayCount++;
      });

      const costPerDay = COMBO_PRICING.equipment[equipment.type];
      const cost = (fullDayCount * costPerDay.fullDay) + ((rentDays - fullDayCount) * costPerDay.halfDay);

      if (cost > 0) {
        items.push({
          category: '裝備費',
          label: `${diver.name} - ${getEquipmentTypeName(equipment.type)}`,
          calc: `${rentDays}天`,
          price: cost,
          overridePrice: equipment.overrideTotal,
          id: `equipment-${diver.id}`
        });
      }
    }

    // 配重保險費
    if (equipment.type === 'none') {
      const insuranceCost = COMBO_PRICING.basicFee.weightBeltInsurance * rentDays;
      if (insuranceCost > 0) {
        items.push({
          category: '裝備費',
          label: `${diver.name} - 配重保險`,
          calc: `${COMBO_PRICING.basicFee.weightBeltInsurance}/天 × ${rentDays}天`,
          price: insuranceCost,
          id: `insurance-${diver.id}`
        });
      }
    }
  });

  return items;
}

function comboCalculateResidenceCost() {
  if (!comboState.includeResidence) return [];

  const items = [];

  // 房費（可選）
  if (comboState.selectedRoom) {
    const roomCost = calculateRoomCost(
      comboState.selectedRoom,
      comboState.occupancy,
      calculateNightsBetween(comboState.checkInDate, comboState.checkOutDate),
      comboState.checkInDate,
      comboState.checkOutDate,
      []
    );

    if (roomCost > 0) {
      const room = COMBO_ACCOMMODATION.rooms[comboState.selectedRoom];
      const nights = calculateNightsBetween(comboState.checkInDate, comboState.checkOutDate);
      items.push({
        category: '民宿住宿',
        label: `${room.name} (${comboState.occupancy}人)`,
        calc: `${nights}晚`,
        price: roomCost,
        id: `residence-room-${comboState.selectedRoom}`
      });
    }
  }

  // 加購行程（可選，可與房費並存）
  if (comboState.selectedPackage) {
    const pkg = COMBO_ACCOMMODATION.packages[comboState.selectedPackage];
    let cost = pkg.price * comboState.occupancy;

    if (comboState.occupancy % 2 === 1) {
      cost += pkg.motorbikeExtraFee;
    }

    if (cost > 0) {
      items.push({
        category: '民宿住宿',
        label: pkg.name,
        calc: `${pkg.price}/人 × ${comboState.occupancy}人${comboState.occupancy % 2 === 1 ? ` + 機車差價${pkg.motorbikeExtraFee}` : ''}`,
        price: cost,
        id: `residence-package-${comboState.selectedPackage}`
      });
    }
  }

  // 如果既沒選房型也沒選加購，顯示提示
  if (!comboState.selectedRoom && !comboState.selectedPackage) {
    // 空列表，費用部分會顯示空的民宿住宿類別
  }

  return items;
}

function comboGenerateLineItems() {
  let items = [];
  items = items.concat(comboCalculateDivingCost());
  items = items.concat(comboCalculateEquipmentCost());
  items = items.concat(comboCalculateResidenceCost());

  // 自訂項目
  comboState.customItems.forEach((item, idx) => {
    items.push({
      category: '其他',
      label: item.name,
      calc: '',
      price: item.amount,
      id: `custom-${idx}`,
      isCustom: true
    });
  });

  return items;
}

function comboRemoveCustomItem(idx) {
  comboState.customItems.splice(idx, 1);
  renderComboCalculator();
}

function comboCalculateTotal() {
  const items = comboGenerateLineItems();
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.overridePrice !== null ? item.overridePrice : item.price);
  }, 0);
  return subtotal - comboState.globalDiscount;
}

// ============ 渲染函式 ============

function renderComboCalculator() {
  renderComboDivingSection();
  renderComboResidenceToggle();
  if (comboState.includeResidence) {
    renderComboResidenceSection();
  }
  renderComboLineItems();
  renderComboSummary();
  saveComboToStorage();
}

function renderComboDivingSection() {
  const container = document.getElementById('comboDivingSection');
  if (!container) return;

  // 人數選擇
  const diverButtons = Array.from({ length: 12 }, (_, i) => i + 1)
    .map(count => `
      <button class="diver-btn ${comboState.diverCount === count ? 'active' : ''}"
        onclick="comboCreateDiverByCount(${count})">${count}人</button>
    `).join('');

  let html = `
    <div class="section-title">潛水人員</div>
    <div class="diver-selector">
      <label>選擇人數:</label>
      <div class="diver-buttons">${diverButtons}</div>
    </div>
  `;

  if (comboState.diverCount > 0) {
    html += `
      <div style="margin-top: 1rem; padding: 1rem; background: var(--sand); border-radius: 0.375rem;">
        <div style="font-size: 0.9rem; font-weight: 600;">潛水員代號：${comboState.divers.map(d => d.name).join(', ')}</div>
      </div>
    `;
  }

  // 行程編輯
  html += `
    <div style="margin-top: 1.5rem;">
      <div class="section-title">行程規劃</div>
      <div class="input-group">
        <input type="text" id="comboDayInput" placeholder="例：9/25">
        <button onclick="comboAddDay()">新增一天</button>
      </div>
      <div id="comboDaysList"></div>
    </div>
  `;

  container.innerHTML = html;
  renderComboDaysList();
}

function renderComboDaysList() {
  const container = document.getElementById('comboDaysList');
  if (!container) return;

  let html = '';

  comboState.days.forEach(day => {
    html += `
      <div style="margin-top: 1rem; padding: 1rem; background: var(--sand); border-radius: 0.375rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <strong>${day.date}</strong>
          <button class="danger" onclick="comboRemoveDay(${day.id})" style="padding: 0.25rem 0.75rem; font-size: 0.9rem;">刪除</button>
        </div>

        <div id="activities-${day.id}"></div>

        <div style="margin-top: 0.75rem;">
          <select id="actType-${day.id}" style="padding: 0.5rem; border: 1px solid var(--border-light); border-radius: 0.25rem;">
            <option value="岸潛">岸潛</option>
            <option value="船潛">船潛</option>
            <option value="夜潛">夜潛</option>
            <option value="checkDive">Check Dive</option>
          </select>
          <button onclick="comboAddActivity(${day.id}, document.getElementById('actType-${day.id}').value)"
            style="margin-left: 0.5rem; padding: 0.5rem 1rem;">新增活動</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // 渲染每天的活動
  comboState.days.forEach(day => {
    const actContainer = document.getElementById(`activities-${day.id}`);
    if (!actContainer) return;

    let actHtml = '';
    day.activities.forEach(act => {
      const partStr = Array.from(act.participants)
        .map(pid => comboState.divers.find(d => d.id === pid)?.name || '')
        .join(', ');

      actHtml += `
        <div style="margin-bottom: 0.5rem; padding: 0.5rem; background: white; border-radius: 0.25rem; border: 1px solid var(--border-light);">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <div style="font-weight: 600;">${act.type}</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); cursor: pointer; margin-top: 0.25rem;">
                <span id="part-${day.id}-${act.id}" onclick="this.parentElement.parentElement.parentElement.querySelector('#partList-${day.id}-${act.id}').style.display = 'block'">
                  參加人員: ${partStr} [編輯]
                </span>
                <div id="partList-${day.id}-${act.id}" style="display: none; margin-top: 0.5rem; gap: 0.25rem;">
                  ${comboState.divers.map(d => `
                    <label style="display: inline-block; margin-right: 0.75rem;">
                      <input type="checkbox" ${act.participants.has(d.id) ? 'checked' : ''}
                        onchange="comboToggleParticipant(${day.id}, ${act.id}, ${d.id})">
                      ${d.name}
                    </label>
                  `).join('')}
                </div>
              </div>
            </div>
            <button class="danger" onclick="comboRemoveActivity(${day.id}, ${act.id})" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">刪除</button>
          </div>
        </div>
      `;
    });

    actContainer.innerHTML = actHtml;
  });
}

function renderComboResidenceToggle() {
  const container = document.getElementById('comboResidenceToggle');
  if (!container) return;

  container.innerHTML = `
    <div style="margin: 1.5rem 0; padding: 1rem; background: var(--sand); border-radius: 0.375rem; border-left: 3px solid var(--seafoam);">
      <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600;">
        <input type="checkbox" ${comboState.includeResidence ? 'checked' : ''}
          onchange="comboToggleResidence(this.checked)">
        <span>+ 加入民宿住宿</span>
      </label>
    </div>
  `;
}

function renderComboResidenceSection() {
  const container = document.getElementById('comboResidenceSection');
  if (!container) return;

  // 日期選擇
  let html = `
    <div class="section-title" style="margin-top: 1.5rem;">民宿住宿資訊</div>
    <div class="input-group">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">入住日期</label>
        <input type="date" value="${comboState.checkInDate || ''}"
          onchange="comboSetCheckInDate(this.value)">
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">退房日期</label>
        <input type="date" value="${comboState.checkOutDate || ''}"
          onchange="comboSetCheckOutDate(this.value)">
      </div>
    </div>
  `;

  // 人數選擇
  if (comboState.checkInDate && comboState.checkOutDate) {
    const nights = calculateNightsBetween(comboState.checkInDate, comboState.checkOutDate);
    const occupancyButtons = Array.from({ length: 5 }, (_, i) => i + 2)
      .map(count => `
        <button class="diver-btn ${comboState.occupancy === count ? 'active' : ''}"
          onclick="comboSetOccupancy(${count})">${count}人</button>
      `).join('');

    html += `
      <div style="margin-top: 1rem; padding: 1rem; background: var(--sand); border-radius: 0.375rem;">
        <div>${nights}晚住宿</div>
      </div>

      <div style="margin-top: 1.5rem;">
        <div class="section-title">入住人數</div>
        <div class="diver-selector">
          <div class="diver-buttons">${occupancyButtons}</div>
        </div>
      </div>
    `;

    // 房型選擇
    const roomsHtml = Object.entries(COMBO_ACCOMMODATION.rooms)
      .filter(([_, room]) => room.capacity >= comboState.occupancy)
      .map(([roomId, room]) => {
        const pricing = room.pricing[comboState.occupancy];
        if (!pricing) return '';

        const isSelected = comboState.selectedRoom === roomId;
        return `
          <div class="equipment-card" style="cursor: pointer; border: ${isSelected ? '2px solid var(--ocean)' : '1px solid var(--border-light)'}"
            onclick="comboSelectRoom('${roomId}')">
            <div class="equipment-name">${room.name}</div>
            <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
              容納最多 ${room.capacity} 人
            </div>
            <div style="font-family: var(--font-mono);">
              <div>平日: $${pricing.weekday}</div>
              <div>假日: $${pricing.weekend}</div>
            </div>
          </div>
        `;
      }).join('');

    // 房型選擇（一直可見）
    html += `
      <div style="margin-top: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div class="section-title" style="margin: 0;">房型選擇</div>
          ${comboState.selectedRoom ? `<button class="danger" onclick="comboSelectRoom(null)" style="padding: 0.25rem 0.75rem;">清除房型</button>` : ''}
        </div>
        <div class="equipment-grid">${roomsHtml}</div>
      </div>
    `;

    // 加購行程（一直可見）
    const packageIds = Object.keys(COMBO_ACCOMMODATION.packages);
    const packagesHtml = packageIds.map(pkgId => {
      const pkg = COMBO_ACCOMMODATION.packages[pkgId];
      const isSelected = comboState.selectedPackage === pkgId;

      return `
        <div class="equipment-card" style="cursor: pointer; border: ${isSelected ? '2px solid var(--ocean)' : '1px solid var(--border-light)'}"
          onclick="comboSelectPackage('${pkgId}')">
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

    html += `
      <div style="margin-top: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div class="section-title" style="margin: 0;">加購行程 (可選)</div>
          ${comboState.selectedPackage ? `<button class="danger" onclick="comboSelectPackage(null)" style="padding: 0.25rem 0.75rem;">清除行程</button>` : ''}
        </div>
        <div class="equipment-grid">${packagesHtml}</div>
      </div>
    `;
  }

  container.innerHTML = html;
}

function renderComboLineItems() {
  const container = document.getElementById('comboLineItems');
  if (!container) return;

  const items = comboGenerateLineItems();
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
      const finalPrice = item.overridePrice !== null ? item.overridePrice : item.price;
      const overrideDisplay = item.overridePrice !== null ? ` → ${item.overridePrice}` : '';
      const isCustom = item.isCustom || false;
      const customIdx = isCustom ? comboState.customItems.findIndex(c => c.name === item.label && c.amount === item.price) : -1;

      html += `
        <div class="line-item">
          <div class="item-description">
            <div class="item-label">${item.label}</div>
            ${item.calc ? `<div class="item-calc">${item.calc}</div>` : ''}
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div class="item-price" style="min-width: 100px;">${item.price}${overrideDisplay}</div>
            <input type="number" value="${item.overridePrice !== null ? item.overridePrice : ''}"
              placeholder="改" style="width: 80px; padding: 0.4rem; border: 1px solid var(--border-light); border-radius: 0.25rem;"
              data-item-id="${item.id}" class="override-input">
            ${isCustom ? `<button class="danger" onclick="comboRemoveCustomItem(${customIdx})" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">刪除</button>` : ''}
          </div>
        </div>
      `;
    });

    html += '</div>';
  });

  // 自訂項目輸入
  html += `
    <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
      <div class="input-group">
        <input type="text" id="comboCustomName" placeholder="項目名稱">
        <input type="number" id="comboCustomAmount" placeholder="金額">
        <button onclick="comboAddCustomItem()">新增</button>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // 綁定覆寫輸入事件
  document.querySelectorAll('.override-input').forEach(input => {
    input.addEventListener('change', function() {
      const itemId = this.getAttribute('data-item-id');
      const value = this.value ? parseInt(this.value) : null;
      comboUpdateItemOverride(itemId, value);
    });
  });
}

function comboUpdateItemOverride(itemId, value) {
  const items = comboGenerateLineItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  if (item.id.startsWith('activity-')) {
    const [_, dayIdStr, actIdStr] = item.id.split('-');
    const dayId = parseInt(dayIdStr);
    const actId = parseInt(actIdStr);
    const day = comboState.days.find(d => d.id === dayId);
    const act = day?.activities.find(a => a.id === actId);
    if (act) act.overrideCost = value;
  } else if (item.id.startsWith('equipment-')) {
    const diverId = parseInt(item.id.replace('equipment-', ''));
    if (comboState.equipmentByDiver[diverId]) {
      comboState.equipmentByDiver[diverId].overrideTotal = value;
    }
  } else if (item.id.startsWith('insurance-')) {
    const diverId = parseInt(item.id.replace('insurance-', ''));
    if (comboState.equipmentByDiver[diverId]) {
      comboState.equipmentByDiver[diverId].weightBeltInsurance = value;
    }
  }

  renderComboCalculator();
}

function renderComboSummary() {
  const container = document.getElementById('comboSummary');
  if (!container) return;

  const total = comboCalculateTotal();
  const participantCount = comboState.diverCount || 1;
  const perPerson = participantCount > 0 ? (total / participantCount).toFixed(0) : 0;

  container.innerHTML = `
    <div class="summary-row">
      <span class="summary-label">小計</span>
      <span class="summary-value">${comboGenerateLineItems().reduce((sum, item) => sum + item.price, 0)}</span>
    </div>
    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
      <label style="display: block; font-size: 0.9rem; margin-bottom: 0.5rem;">全體折扣:</label>
      <input type="number" value="${comboState.globalDiscount}"
        onchange="comboState.globalDiscount = parseFloat(this.value) || 0; renderComboCalculator();"
        placeholder="0">
    </div>
    <div class="total-box">
      <div class="total-label">總金額</div>
      <div class="total-amount">$${total.toFixed(0)}</div>
      <div class="per-person">平均每人: $${perPerson}</div>
    </div>
    <div class="button-group" style="margin-top: 1.5rem;">
      <button class="copy-btn" onclick="copyComboQuote()">複製報價文本</button>
      <button class="secondary" onclick="saveComboD​raft()">儲存草稿</button>
    </div>

    <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid var(--border-light);">
      <div class="section-title">已儲存草稿</div>
      <div id="comboDraftsList"></div>
    </div>
  `;

  // 渲染草稿清單
  const draftsList = document.getElementById('comboDraftsList');
  if (draftsList) {
    try {
      const drafts = JSON.parse(localStorage.getItem('comboDrafts') || '{}');
      const draftNames = Object.keys(drafts);

      if (draftNames.length === 0) {
        draftsList.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">還沒有保存的草稿</p>';
      } else {
        let draftsHtml = '';
        draftNames.forEach(name => {
          draftsHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--sand); border-radius: 0.375rem; margin-bottom: 0.5rem;">
              <span style="font-weight: 500;">${name}</span>
              <div style="display: flex; gap: 0.5rem;">
                <button class="secondary" onclick="loadComboD​raft('${name.replace(/'/g, "\\'")}'" style="padding: 0.25rem 0.75rem; font-size: 0.9rem;">載入</button>
                <button class="danger" onclick="deleteComboD​raft('${name.replace(/'/g, "\\'")}'" style="padding: 0.25rem 0.75rem; font-size: 0.9rem;">刪除</button>
              </div>
            </div>
          `;
        });
        draftsList.innerHTML = draftsHtml;
      }
    } catch (e) {
      draftsList.innerHTML = `<p style="color: var(--text-secondary);">載入草稿清單失敗</p>`;
      console.error('Error loading drafts list:', e);
    }
  }
}

// ============ 自訂項目 ============

function comboAddCustomItem() {
  const name = document.getElementById('comboCustomName')?.value.trim();
  const amount = parseFloat(document.getElementById('comboCustomAmount')?.value);

  if (!name || isNaN(amount)) {
    showToast('請輸入項目名稱和金額');
    return;
  }

  comboState.customItems.push({ name, amount });
  document.getElementById('comboCustomName').value = '';
  document.getElementById('comboCustomAmount').value = '';
  renderComboCalculator();
}

// ============ 複製報價 ============

function copyComboQuote() {
  const items = comboGenerateLineItems();
  const total = comboCalculateTotal();
  const participantCount = comboState.diverCount || 1;
  const perPerson = (total / participantCount).toFixed(0);

  let text = '===== 組合套裝報價 =====\n\n';

  text += '潛水人員:\n';
  comboState.divers.forEach(d => {
    const equip = comboState.equipmentByDiver[d.id];
    const equipName = getEquipmentTypeName(equip.type);
    text += `${d.name} - ${equipName}\n`;
  });

  text += '\n潛水行程:\n';
  comboState.days.forEach(day => {
    day.activities.forEach(act => {
      const parts = Array.from(act.participants)
        .map(pid => comboState.divers.find(d => d.id === pid)?.name || '')
        .join(', ');
      text += `${day.date} - ${act.type} (${parts})\n`;
    });
  });

  if (comboState.includeResidence) {
    text += '\n民宿資訊:\n';
    if (comboState.checkInDate && comboState.checkOutDate) {
      const nights = calculateNightsBetween(comboState.checkInDate, comboState.checkOutDate);
      text += `入住: ${comboState.checkInDate} ~ ${comboState.checkOutDate} (${nights}晚)\n`;
      text += `人數: ${comboState.occupancy}人\n`;
    }
  }

  text += '\n費用明細:\n';
  const itemsByCategory = {};
  items.forEach(item => {
    if (!itemsByCategory[item.category]) itemsByCategory[item.category] = [];
    itemsByCategory[item.category].push(item);
  });

  Object.entries(itemsByCategory).forEach(([category, categoryItems]) => {
    text += `${category}:\n`;
    categoryItems.forEach(item => {
      const finalPrice = item.overridePrice !== null ? item.overridePrice : item.price;
      text += `  ${item.label} = $${finalPrice}\n`;
    });
  });

  text += `\n合計: $${total.toFixed(0)}\n`;
  text += `平均每人: $${perPerson}\n`;
  text += `總人數: ${participantCount}\n`;

  navigator.clipboard.writeText(text).then(() => {
    showToast('已複製到剪貼簿!');
  });
}

function saveComboD​raft() {
  const name = prompt('輸入草稿名稱:');
  if (!name) return;

  try {
    // 序列化state，將Set轉換為Array
    const serialized = JSON.stringify(comboState, (key, value) => {
      if (value instanceof Set) {
        return Array.from(value);
      }
      return value;
    });

    // 保存到localStorage
    const drafts = JSON.parse(localStorage.getItem('comboDrafts') || '{}');
    drafts[name] = serialized;
    localStorage.setItem('comboDrafts', JSON.stringify(drafts));
    showToast(`草稿 "${name}" 已儲存`);
  } catch (e) {
    showToast(`儲存失敗: ${e.message}`);
    console.error('Combo draft save error:', e);
  }
}

function loadComboD​raft(name) {
  try {
    const drafts = JSON.parse(localStorage.getItem('comboDrafts') || '{}');
    const saved = JSON.parse(drafts[name]);

    // 恢復state，將Array轉換回Set
    saved.days = saved.days.map(day => ({
      ...day,
      activities: day.activities.map(act => ({
        ...act,
        participants: new Set(act.participants)
      }))
    }));

    comboState = saved;
    renderComboCalculator();
    showToast(`已載入草稿 "${name}"`);
  } catch (e) {
    showToast(`載入失敗: ${e.message}`);
    console.error('Combo draft load error:', e);
  }
}

function deleteComboD​raft(name) {
  if (!confirm(`確定要刪除草稿 "${name}" 嗎?`)) return;

  try {
    const drafts = JSON.parse(localStorage.getItem('comboDrafts') || '{}');
    delete drafts[name];
    localStorage.setItem('comboDrafts', JSON.stringify(drafts));
    showToast(`草稿 "${name}" 已刪除`);
    renderComboSummary(); // 重新渲染摘要區域
  } catch (e) {
    showToast(`刪除失敗: ${e.message}`);
  }
}

// ============ 儲存/載入 ============

function saveComboToStorage() {
  localStorage.setItem('comboState', JSON.stringify(comboState, (key, value) => {
    if (value instanceof Set) {
      return Array.from(value);
    }
    return value;
  }));
}

function loadComboFromStorage() {
  const saved = localStorage.getItem('comboState');
  if (saved) {
    const loaded = JSON.parse(saved);
    loaded.days = loaded.days.map(day => ({
      ...day,
      activities: day.activities.map(act => ({
        ...act,
        participants: new Set(act.participants)
      }))
    }));
    comboState = loaded;
  }
}

// ============ 輔助函式 ============

function getEquipmentTypeName(type) {
  const names = {
    'none': '自備',
    'full': '全裝租賃',
    'heavy': '重裝租賃',
    'light': '輕裝租賃'
  };
  return names[type] || type;
}
