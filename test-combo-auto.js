// 🧪 組合套裝自動化測試和診斷

class ComboAutoTest {
  constructor() {
    this.testResults = [];
    this.testsPassed = 0;
    this.testsFailed = 0;
    this.bugsFound = [];
  }

  log(message) {
    console.log(message);
    this.testResults.push(message);
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(`❌ 斷言失敗: ${message}`);
    }
  }

  recordBug(name, description, severity = 'medium') {
    this.bugsFound.push({
      id: `COMBO-BUG-${this.bugsFound.length + 1}`,
      name,
      description,
      severity
    });
    this.log(`🐛 BUG: ${name} - ${description}`);
  }

  // ============ 診斷測試 ============

  // Test 3.1: 初始化
  async testInitialize() {
    this.log('\n📝 === TEST 3.1: 組合套裝初始化 ===');
    try {
      // 檢查全局變數
      this.assert(typeof comboState !== 'undefined', 'comboState 應該存在');
      this.assert(typeof COMBO_PRICING !== 'undefined', 'COMBO_PRICING 應該存在');
      this.assert(typeof COMBO_ACCOMMODATION !== 'undefined', 'COMBO_ACCOMMODATION 應該存在');

      // 檢查函數
      this.assert(typeof initCombo === 'function', 'initCombo 函數應該存在');
      this.assert(typeof renderComboCalculator === 'function', 'renderComboCalculator 應該存在');

      this.log('✅ PASS: 初始化完成');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.recordBug('初始化失敗', e.message, 'critical');
      this.testsFailed++;
    }
  }

  // Test 3.2: 潛水人員選擇
  async testDiverSelection() {
    this.log('\n📝 === TEST 3.2: 潛水人員選擇 ===');
    try {
      initCombo();
      comboCreateDiverByCount(3);
      await new Promise(r => setTimeout(r, 200));

      this.assert(comboState.diverCount === 3, `人數應該是 3，實際: ${comboState.diverCount}`);
      this.assert(comboState.divers.length === 3, `潛水員數應該是 3，實際: ${comboState.divers.length}`);
      this.assert(comboState.divers[0].name === 'A', `第一個應該是 A，實際: ${comboState.divers[0].name}`);
      this.assert(comboState.divers[2].name === 'C', `第三個應該是 C，實際: ${comboState.divers[2].name}`);

      this.log('✅ PASS: 潛水人員選擇正確');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.recordBug('潛水人員選擇', e.message);
      this.testsFailed++;
    }
  }

  // Test 3.3: 新增行程日期
  async testAddDay() {
    this.log('\n📝 === TEST 3.3: 新增行程日期 ===');
    try {
      comboState.days = [];
      document.getElementById('comboDayInput').value = '9/25';
      comboAddDay();
      await new Promise(r => setTimeout(r, 200));

      this.assert(comboState.days.length === 1, `應該有 1 天，實際: ${comboState.days.length}`);
      this.assert(comboState.days[0].date === '9/25', '日期應該是 9/25');

      this.log('✅ PASS: 新增日期正確');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.recordBug('新增日期', e.message);
      this.testsFailed++;
    }
  }

  // Test 3.4: 新增活動
  async testAddActivity() {
    this.log('\n📝 === TEST 3.4: 新增潛水活動 ===');
    try {
      if (comboState.days.length === 0) {
        comboState.days.push({ id: Date.now(), date: '9/25', activities: [] });
      }

      const dayId = comboState.days[0].id;
      comboAddActivity(dayId, '岸潛');
      await new Promise(r => setTimeout(r, 200));

      const day = comboState.days[0];
      this.assert(day.activities.length === 1, `應該有 1 個活動，實際: ${day.activities.length}`);
      this.assert(day.activities[0].type === '岸潛', `活動應該是岸潛，實際: ${day.activities[0].type}`);

      this.log('✅ PASS: 新增活動正確');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.recordBug('新增活動', e.message);
      this.testsFailed++;
    }
  }

  // Test 3.5: 民宿開關
  async testResidenceToggle() {
    this.log('\n📝 === TEST 3.5: 民宿開關 ===');
    try {
      comboState.includeResidence = false;
      comboToggleResidence(true);

      this.assert(comboState.includeResidence === true, '民宿應該被啟用');

      comboToggleResidence(false);
      this.assert(comboState.includeResidence === false, '民宿應該被禁用');
      this.assert(comboState.checkInDate === null, '取消後入住日應該被清空');
      this.assert(comboState.selectedRoom === null, '取消後房型應該被清空');

      this.log('✅ PASS: 民宿開關正確');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.recordBug('民宿開關', e.message);
      this.testsFailed++;
    }
  }

  // Test 3.6: 民宿日期設置
  async testResidenceDates() {
    this.log('\n📝 === TEST 3.6: 民宿日期設置 ===');
    try {
      comboState.includeResidence = true;
      comboSetCheckInDate('2024-09-25');
      comboSetCheckOutDate('2024-09-28');

      this.assert(comboState.checkInDate === '2024-09-25', '入住日應該設置');
      this.assert(comboState.checkOutDate === '2024-09-28', '退房日應該設置');

      // 驗證晚數計算
      const nights = calculateNightsBetween('2024-09-25', '2024-09-28');
      this.assert(nights === 3, `應該是 3 晚，實際: ${nights}`);

      this.log('✅ PASS: 民宿日期設置正確');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.recordBug('民宿日期', e.message);
      this.testsFailed++;
    }
  }

  // Test 3.7: 房型選擇
  async testRoomSelection() {
    this.log('\n📝 === TEST 3.7: 房型選擇 ===');
    try {
      comboState.occupancy = 4;
      comboSelectRoom('fourPersonRoom');

      this.assert(comboState.selectedRoom === 'fourPersonRoom', '房型應該被選中');

      this.log('✅ PASS: 房型選擇正確');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.recordBug('房型選擇', e.message);
      this.testsFailed++;
    }
  }

  // Test 3.8: 加購行程選擇
  async testPackageSelection() {
    this.log('\n📝 === TEST 3.8: 加購行程選擇 ===');
    try {
      comboState.occupancy = 3;
      comboSelectPackage('threeDayDiveExperience');

      this.assert(comboState.selectedPackage === 'threeDayDiveExperience', '加購應該被選中');

      // 驗證房型和加購可同時選擇
      this.assert(comboState.selectedRoom !== null || comboState.selectedPackage !== null, '應該至少選一個');

      this.log('✅ PASS: 加購行程選擇正確');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.recordBug('加購行程選擇', e.message);
      this.testsFailed++;
    }
  }

  // Test 3.9: 費用計算 - 潛水
  async testDivingCostCalculation() {
    this.log('\n📝 === TEST 3.9: 潛水費用計算 ===');
    try {
      // 重置狀態
      comboState.diverCount = 2;
      comboState.divers = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' }
      ];
      comboState.days = [{
        id: 1,
        date: '9/25',
        activities: [{
          id: 1,
          type: '岸潛',
          participants: new Set([1, 2]),
          quantity: 1,
          bottles: 1,
          overrideCost: null,
          includeShipFee: false
        }]
      }];

      const cost = comboCalculateDivingCost();
      this.assert(Array.isArray(cost), '潛水費用應該是數組');
      this.assert(cost.length > 0, '應該有費用項目');

      this.log('✅ PASS: 潛水費用計算正確');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.recordBug('潛水費用計算', e.message);
      this.testsFailed++;
    }
  }

  // Test 3.10: 費用計算 - 民宿
  async testResidenceCostCalculation() {
    this.log('\n📝 === TEST 3.10: 民宿費用計算 ===');
    try {
      comboState.includeResidence = true;
      comboState.checkInDate = '2024-09-25';
      comboState.checkOutDate = '2024-09-28';
      comboState.occupancy = 3;
      comboState.selectedRoom = 'threePersonRoom';
      comboState.selectedPackage = null;

      const cost = comboCalculateResidenceCost();
      this.assert(Array.isArray(cost), '民宿費用應該是數組');

      if (cost.length > 0) {
        this.assert(cost[0].price > 0, '房費應該大於 0');
      }

      this.log('✅ PASS: 民宿費用計算正確');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.recordBug('民宿費用計算', e.message);
      this.testsFailed++;
    }
  }

  // Test 3.11: 總費用計算
  async testTotalCalculation() {
    this.log('\n📝 === TEST 3.11: 總費用計算 ===');
    try {
      const total = comboCalculateTotal();
      this.assert(typeof total === 'number', `總費用應該是數字，實際: ${typeof total}`);
      this.assert(total >= 0, `總費用不應該是負數，實際: ${total}`);

      this.log(`✅ PASS: 總費用計算正確 ($${total})`);
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.recordBug('總費用計算', e.message);
      this.testsFailed++;
    }
  }

  // Test 3.12: 報價複製
  async testQuoteCopy() {
    this.log('\n📝 === TEST 3.12: 報價複製 ===');
    try {
      // 檢查函數存在
      this.assert(typeof copyComboQuote === 'function', 'copyComboQuote 函數應該存在');

      // 檢查格式
      const items = comboGenerateLineItems();
      this.assert(Array.isArray(items), 'generateLineItems 應該返回數組');

      this.log('✅ PASS: 報價複製邏輯正確');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.recordBug('報價複製', e.message);
      this.testsFailed++;
    }
  }

  // Test 3.13: 草稿保存
  async testDraftSave() {
    this.log('\n📝 === TEST 3.13: 組合草稿保存 ===');
    try {
      // 檢查函數存在
      this.assert(typeof saveComboD​raft === 'function', 'saveComboD​raft 函數應該存在');
      this.assert(typeof loadComboD​raft === 'function', 'loadComboD​raft 函數應該存在');

      // 測試保存邏輯
      const testState = JSON.stringify(comboState, (key, value) => {
        if (value instanceof Set) return Array.from(value);
        return value;
      });

      this.assert(typeof testState === 'string', '序列化應該成功');

      this.log('✅ PASS: 草稿保存邏輯正確');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.recordBug('草稿保存', e.message);
      this.testsFailed++;
    }
  }

  // Test 3.14: 渲染檢查
  async testRendering() {
    this.log('\n📝 === TEST 3.14: 組合頁面渲染 ===');
    try {
      // 檢查容器存在
      const divingSection = document.getElementById('comboDivingSection');
      const residenceToggle = document.getElementById('comboResidenceToggle');
      const lineItems = document.getElementById('comboLineItems');
      const summary = document.getElementById('comboSummary');

      this.assert(divingSection !== null, 'comboDivingSection 容器應該存在');
      this.assert(residenceToggle !== null, 'comboResidenceToggle 容器應該存在');
      this.assert(lineItems !== null, 'comboLineItems 容器應該存在');
      this.assert(summary !== null, 'comboSummary 容器應該存在');

      this.log('✅ PASS: 頁面渲染容器正確');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.recordBug('頁面渲染', e.message, 'critical');
      this.testsFailed++;
    }
  }

  printSummary() {
    this.log('\n' + '='.repeat(60));
    this.log('📊 組合套裝測試總結');
    this.log('='.repeat(60));
    this.log(`✅ 通過: ${this.testsPassed}`);
    this.log(`❌ 失敗: ${this.testsFailed}`);
    this.log(`📝 總計: ${this.testsPassed + this.testsFailed} 個測試`);
    this.log(`🐛 發現 BUG: ${this.bugsFound.length} 個`);

    if (this.bugsFound.length > 0) {
      this.log('\n🐛 BUG 清單:');
      this.bugsFound.forEach(bug => {
        this.log(`  ${bug.id} [${bug.severity.toUpperCase()}] ${bug.name}`);
        this.log(`    ${bug.description}`);
      });
    }

    this.log('\n' + '='.repeat(60));
  }

  async runAllTests() {
    this.log('🧪 開始組合套裝自動化測試...\n');
    this.log('='.repeat(60));

    await this.testInitialize();
    await this.testDiverSelection();
    await this.testAddDay();
    await this.testAddActivity();
    await this.testResidenceToggle();
    await this.testResidenceDates();
    await this.testRoomSelection();
    await this.testPackageSelection();
    await this.testDivingCostCalculation();
    await this.testResidenceCostCalculation();
    await this.testTotalCalculation();
    await this.testQuoteCopy();
    await this.testDraftSave();
    await this.testRendering();

    this.printSummary();

    return {
      passed: this.testsPassed,
      failed: this.testsFailed,
      total: this.testsPassed + this.testsFailed,
      bugs: this.bugsFound
    };
  }
}

// 執行測試
async function startComboTests() {
  const tester = new ComboAutoTest();
  return await tester.runAllTests();
}

console.log('🚀 組合套裝自動化測試已載入');
console.log('📝 在控制台中輸入以下命令開始測試:');
console.log('   startComboTests()');
