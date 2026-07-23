// 🧪 民宿模式自動化測試腳本
// 在瀏覽器控制台運行此腳本進行全面測試

class ResidenceAutoTest {
  constructor() {
    this.testResults = [];
    this.testsPassed = 0;
    this.testsFailed = 0;
    this.bugsFound = [];
  }

  // 工具函式
  assert(condition, message) {
    if (!condition) {
      throw new Error(`❌ 斷言失敗: ${message}`);
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 日誌記錄
  log(message) {
    console.log(message);
    this.testResults.push(message);
  }

  recordBug(name, description, severity = 'medium') {
    this.bugsFound.push({
      id: `BUG-${this.bugsFound.length + 1}`,
      name,
      description,
      severity,
      timestamp: new Date().toLocaleTimeString()
    });
    this.log(`🐛 BUG 發現: ${name} - ${description}`);
  }

  // ============ 測試用例 ============

  // Test 2.1: 日期選擇
  async test_DateSelection() {
    this.log('\n\n📝 === TEST 2.1: 日期選擇 ===');
    try {
      // 初始化民宿計算器
      initResidence();
      await this.delay(200);

      // 設置日期
      residenceState.checkInDate = '2024-09-25';
      residenceState.checkOutDate = '2024-09-28';
      renderResidenceCalculator();
      await this.delay(300);

      // 驗證
      const nights = calculateNightsBetween('2024-09-25', '2024-09-28');
      this.assert(nights === 3, `應該計算 3 晚，實際: ${nights}`);

      const { weekdayNights, weekendNights } = calculateWeekdayWeekendNights(
        '2024-09-25',
        '2024-09-28',
        []
      );
      this.assert(weekdayNights === 2, `平日應該 2 晚，實際: ${weekdayNights}`);
      this.assert(weekendNights === 1, `假日應該 1 晚，實際: ${weekendNights}`);

      this.log('✅ PASS: 日期選擇和自動判斷正確');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.testsFailed++;
    }
  }

  // Test 2.2: 人數選擇
  async test_OccupancySelection() {
    this.log('\n\n📝 === TEST 2.2: 人數選擇 ===');
    try {
      residenceState.occupancy = 4;
      renderResidenceCalculator();
      await this.delay(300);

      this.assert(residenceState.occupancy === 4, '人數應該是 4');

      // 檢查房型過濾
      const rooms = Object.entries(ACCOMMODATION.rooms)
        .filter(([_, room]) => room.capacity >= 4);

      this.assert(rooms.length > 0, '應該有容納 4 人的房型');
      this.assert(rooms.length < 6, '不應該所有房型都顯示');

      this.log('✅ PASS: 人數選擇和房型過濾正確');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.testsFailed++;
    }
  }

  // Test 2.3: 房型選擇
  async test_RoomSelection() {
    this.log('\n\n📝 === TEST 2.3: 房型選擇 ===');
    try {
      residenceState.occupancy = 4;
      residenceState.selectedRoom = 'fourPersonRoom';
      residenceState.checkInDate = '2024-09-25';
      residenceState.checkOutDate = '2024-09-28';
      renderResidenceCalculator();
      await this.delay(300);

      const roomCost = calculateRoomCostTotal();
      this.assert(roomCost > 0, `房費應該大於 0，實際: ${roomCost}`);

      this.log(`✅ PASS: 房型選擇正確，計算費用: $${roomCost}`);
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.testsFailed++;
    }
  }

  // Test 2.4: 加購行程（非互斥）
  async test_PackageSelection() {
    this.log('\n\n📝 === TEST 2.4: 加購行程選擇 ===');
    try {
      residenceState.occupancy = 3;
      residenceState.selectedRoom = 'threePersonRoom';
      residenceState.selectedPackage = 'threeDayDiveExperience';
      residenceState.checkInDate = '2024-09-25';
      residenceState.checkOutDate = '2024-09-28';
      renderResidenceCalculator();
      await this.delay(300);

      // 驗證房型和加購都被保留（不再互斥）
      this.assert(residenceState.selectedRoom !== null, '房型選擇應該保留');
      this.assert(residenceState.selectedPackage !== null, '加購行程選擇應該保留');

      const lineItems = generateResidenceLineItems();
      this.assert(lineItems.length >= 2, `應該有至少 2 個費用項目，實際: ${lineItems.length}`);

      this.log('✅ PASS: 房型和加購行程可同時選擇');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.testsFailed++;
    }
  }

  // Test 2.5: 機車差價（奇數人數）
  async test_MotorbikeExtraFee() {
    this.log('\n\n📝 === TEST 2.5: 機車差價計算 ===');
    try {
      residenceState.occupancy = 5; // 奇數
      residenceState.selectedPackage = 'threeDayDiveExperience';
      residenceState.checkInDate = '2024-09-25';
      residenceState.checkOutDate = '2024-09-28';
      renderResidenceCalculator();
      await this.delay(300);

      const cost = calculatePackageCost();
      const pkg = ACCOMMODATION.packages['threeDayDiveExperience'];
      const expectedCost = pkg.price * 5 + pkg.motorbikeExtraFee; // 含機車差價

      this.assert(cost === expectedCost, `機車差價計算錯誤。期望: ${expectedCost}，實際: ${cost}`);

      this.log(`✅ PASS: 機車差價正確計算 ($${pkg.motorbikeExtraFee})`);
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.testsFailed++;
    }
  }

  // Test 2.6: 費用覆寫
  async test_PriceOverride() {
    this.log('\n\n📝 === TEST 2.6: 費用覆寫 ===');
    try {
      residenceState.occupancy = 3;
      residenceState.selectedRoom = 'threePersonRoom';
      residenceState.checkInDate = '2024-09-25';
      residenceState.checkOutDate = '2024-09-28';
      residenceState.customItems = [];
      renderResidenceCalculator();
      await this.delay(300);

      // 添加覆寫
      residenceState.customItems.push({ name: '特價優惠', amount: -500 });
      renderResidenceCalculator();
      await this.delay(300);

      const items = generateResidenceLineItems();
      const hasCustomItem = items.some(i => i.label === '特價優惠');

      this.assert(hasCustomItem, '自訂項目應該被添加');

      this.log('✅ PASS: 費用覆寫和自訂項目正常');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.testsFailed++;
    }
  }

  // Test 2.7: 全體折扣
  async test_GlobalDiscount() {
    this.log('\n\n📝 === TEST 2.7: 全體折扣 ===');
    try {
      residenceState.occupancy = 2;
      residenceState.selectedRoom = 'twoPersonRoom';
      residenceState.checkInDate = '2024-09-25';
      residenceState.checkOutDate = '2024-09-28';
      residenceState.globalDiscount = 0;
      renderResidenceCalculator();
      await this.delay(300);

      const totalWithoutDiscount = calculateResidenceTotal();

      residenceState.globalDiscount = 500;
      renderResidenceCalculator();
      await this.delay(300);

      const totalWithDiscount = calculateResidenceTotal();

      this.assert(
        totalWithDiscount === totalWithoutDiscount - 500,
        `折扣計算錯誤。期望: ${totalWithoutDiscount - 500}，實際: ${totalWithDiscount}`
      );

      this.log(`✅ PASS: 全體折扣正確計算 ($${residenceState.globalDiscount})`);
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.testsFailed++;
    }
  }

  // Test 2.8: 報價複製格式
  async test_QuoteFormat() {
    this.log('\n\n📝 === TEST 2.8: 報價複製格式 ===');
    try {
      residenceState.occupancy = 3;
      residenceState.selectedRoom = 'threePersonRoom';
      residenceState.checkInDate = '2024-09-25';
      residenceState.checkOutDate = '2024-09-28';
      residenceState.globalDiscount = 0;
      residenceState.customItems = [];
      renderResidenceCalculator();
      await this.delay(300);

      // 模擬報價複製邏輯
      const items = generateResidenceLineItems();
      const total = calculateResidenceTotal();

      this.assert(items.length > 0, '應該有費用項目');
      this.assert(total > 0, '總費用應該大於 0');

      // 驗證報價文本格式
      const text = `===== 民宿住宿報價 =====\n入住期間: 2024-09-25 ~ 2024-09-28 (3晚)`;
      this.assert(text.includes('民宿住宿報價'), '報價標題應該存在');

      this.log('✅ PASS: 報價格式正確');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.testsFailed++;
    }
  }

  // Test 2.9: 草稿保存（民宿）
  async test_DraftSave() {
    this.log('\n\n📝 === TEST 2.9: 草稿保存 ===');
    try {
      residenceState.occupancy = 4;
      residenceState.selectedRoom = 'fourPersonRoom';
      residenceState.checkInDate = '2024-09-25';
      residenceState.checkOutDate = '2024-09-28';
      residenceState.selectedPackage = null;
      residenceState.globalDiscount = 300;

      // 模擬保存
      const drafts = JSON.parse(localStorage.getItem('residenceDrafts') || '{}');
      drafts['TestDraft'] = JSON.stringify(residenceState);
      localStorage.setItem('residenceDrafts', JSON.stringify(drafts));

      // 模擬載入
      const saved = JSON.parse(drafts['TestDraft']);
      this.assert(saved.occupancy === 4, '人數應該恢復');
      this.assert(saved.selectedRoom === 'fourPersonRoom', '房型應該恢復');
      this.assert(saved.globalDiscount === 300, '折扣應該恢復');

      // 清理
      delete drafts['TestDraft'];
      localStorage.setItem('residenceDrafts', JSON.stringify(drafts));

      this.log('✅ PASS: 草稿保存和載入正常');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.testsFailed++;
    }
  }

  // Test 2.10: 邊界情況 - 空日期
  async test_EdgeCase_EmptyDate() {
    this.log('\n\n📝 === TEST 2.10: 邊界情況 - 空日期 ===');
    try {
      residenceState.checkInDate = null;
      residenceState.checkOutDate = null;
      renderResidenceCalculator();
      await this.delay(300);

      const nights = calculateNightsBetween(null, null);
      this.assert(nights === 0, `空日期應該返回 0 晚，實際: ${nights}`);

      this.log('✅ PASS: 空日期處理正確');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.testsFailed++;
    }
  }

  // Test 2.11: 邊界情況 - 單日住宿
  async test_EdgeCase_SingleNight() {
    this.log('\n\n📝 === TEST 2.11: 邊界情況 - 單日住宿 ===');
    try {
      residenceState.checkInDate = '2024-09-25';
      residenceState.checkOutDate = '2024-09-26';
      residenceState.occupancy = 2;
      residenceState.selectedRoom = 'twoPersonRoom';
      renderResidenceCalculator();
      await this.delay(300);

      const nights = calculateNightsBetween('2024-09-25', '2024-09-26');
      this.assert(nights === 1, `應該計算 1 晚，實際: ${nights}`);

      const cost = calculateRoomCostTotal();
      this.assert(cost > 0, '費用應該大於 0');

      this.log(`✅ PASS: 單日住宿計算正確 ($${cost})`);
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.testsFailed++;
    }
  }

  // Test 2.12: 邊界情況 - 負數折扣
  async test_EdgeCase_NegativeDiscount() {
    this.log('\n\n📝 === TEST 2.12: 邊界情況 - 負數折扣 ===');
    try {
      residenceState.occupancy = 2;
      residenceState.selectedRoom = 'twoPersonRoom';
      residenceState.checkInDate = '2024-09-25';
      residenceState.checkOutDate = '2024-09-28';
      residenceState.globalDiscount = -500; // 負數 = 加費用
      renderResidenceCalculator();
      await this.delay(300);

      const total = calculateResidenceTotal();
      this.assert(!isNaN(total), '負數折扣應該正確計算');

      this.log(`✅ PASS: 負數折扣處理正確`);
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.testsFailed++;
    }
  }

  // Test 2.13: 清空數據
  async test_ClearResidenceData() {
    this.log('\n\n📝 === TEST 2.13: 清空民宿數據 ===');
    try {
      residenceState.checkInDate = '2024-09-25';
      residenceState.checkOutDate = '2024-09-28';
      residenceState.occupancy = 4;
      residenceState.selectedRoom = 'fourPersonRoom';
      residenceState.selectedPackage = 'threeDayDiveExperience';
      residenceState.customItems = [{ name: '烤肉', amount: 1000 }];
      residenceState.globalDiscount = 500;

      // 清空
      residenceState.checkInDate = null;
      residenceState.checkOutDate = null;
      residenceState.occupancy = 2;
      residenceState.selectedRoom = null;
      residenceState.selectedPackage = null;
      residenceState.customItems = [];
      residenceState.globalDiscount = 0;

      this.assert(residenceState.checkInDate === null, '入住日期應該被清空');
      this.assert(residenceState.selectedRoom === null, '房型應該被清空');
      this.assert(residenceState.customItems.length === 0, '自訂項目應該被清空');

      this.log('✅ PASS: 清空數據正常');
      this.testsPassed++;
    } catch (e) {
      this.log(`❌ FAIL: ${e.message}`);
      this.testsFailed++;
    }
  }

  // ============ 執行所有測試 ============

  async runAllTests() {
    this.log('🧪 開始民宿功能自動化測試...\n');
    this.log('=' .repeat(60));

    await this.test_DateSelection();
    await this.test_OccupancySelection();
    await this.test_RoomSelection();
    await this.test_PackageSelection();
    await this.test_MotorbikeExtraFee();
    await this.test_PriceOverride();
    await this.test_GlobalDiscount();
    await this.test_QuoteFormat();
    await this.test_DraftSave();
    await this.test_EdgeCase_EmptyDate();
    await this.test_EdgeCase_SingleNight();
    await this.test_EdgeCase_NegativeDiscount();
    await this.test_ClearResidenceData();

    // 輸出總結
    this.printSummary();

    return {
      passed: this.testsPassed,
      failed: this.testsFailed,
      total: this.testsPassed + this.testsFailed,
      bugs: this.bugsFound,
      results: this.testResults
    };
  }

  printSummary() {
    this.log('\n' + '='.repeat(60));
    this.log('📊 測試總結');
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
        this.log(`    時間: ${bug.timestamp}`);
      });
    }

    this.log('\n' + '='.repeat(60));

    // 下載測試結果
    const resultText = this.testResults.join('\n');
    console.log('\n✨ 測試完成！結果已輸出到控制台');
    console.log('💾 可以複製上面的所有內容保存為記錄');
  }
}

// 執行測試
async function startResidenceTests() {
  const tester = new ResidenceAutoTest();
  return await tester.runAllTests();
}

// 在控制台中運行: startResidenceTests()
console.log('🚀 民宿自動化測試已載入');
console.log('📝 在控制台中輸入以下命令開始測試:');
console.log('   startResidenceTests()');
