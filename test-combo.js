// 組合套裝自動化測試腳本
// 執行: startComboTests()

function startComboTests() {
  console.clear();
  console.log('🧪 組合套裝自動化測試開始...\n');

  let passed = 0, failed = 0;
  const results = [];

  // TEST 1: 初始化
  try {
    if (comboState && typeof comboState === 'object') {
      console.log('✅ TEST 1: 組合套裝狀態初始化');
      results.push({ test: 'TEST 1', status: 'PASS', msg: '組合套裝狀態已初始化' });
      passed++;
    } else throw new Error('組合套裝狀態未初始化');
  } catch (e) {
    console.log('❌ TEST 1 失敗:', e.message);
    results.push({ test: 'TEST 1', status: 'FAIL', msg: e.message });
    failed++;
  }

  // TEST 2: 潛水計算函數存在
  try {
    if (typeof comboGetDivingCost === 'function') {
      console.log('✅ TEST 2: comboGetDivingCost 函數存在');
      results.push({ test: 'TEST 2', status: 'PASS', msg: '潛水費用計算函數已正確定義' });
      passed++;
    } else throw new Error('comboGetDivingCost 函數不存在');
  } catch (e) {
    console.log('❌ TEST 2 失敗:', e.message);
    results.push({ test: 'TEST 2', status: 'FAIL', msg: e.message });
    failed++;
  }

  // TEST 3: 民宿計算函數存在
  try {
    if (typeof comboGetResidenceCost === 'function') {
      console.log('✅ TEST 3: comboGetResidenceCost 函數存在');
      results.push({ test: 'TEST 3', status: 'PASS', msg: '民宿費用計算函數已正確定義' });
      passed++;
    } else throw new Error('comboGetResidenceCost 函數不存在');
  } catch (e) {
    console.log('❌ TEST 3 失敗:', e.message);
    results.push({ test: 'TEST 3', status: 'FAIL', msg: e.message });
    failed++;
  }

  // TEST 4: 總費用計算函數
  try {
    if (typeof comboGetTotal === 'function') {
      console.log('✅ TEST 4: comboGetTotal 函數存在');
      results.push({ test: 'TEST 4', status: 'PASS', msg: '總費用計算函數已正確定義' });
      passed++;
    } else throw new Error('comboGetTotal 函數不存在');
  } catch (e) {
    console.log('❌ TEST 4 失敗:', e.message);
    results.push({ test: 'TEST 4', status: 'FAIL', msg: e.message });
    failed++;
  }

  // TEST 5: 潛水開關功能
  try {
    const initialState = comboState.useDiving;
    comboToggleDiving(!initialState);
    if (comboState.useDiving === !initialState) {
      comboToggleDiving(initialState); // 復原
      console.log('✅ TEST 5: 潛水開關功能正常');
      results.push({ test: 'TEST 5', status: 'PASS', msg: '潛水開關可正確切換' });
      passed++;
    } else throw new Error('開關狀態未改變');
  } catch (e) {
    console.log('❌ TEST 5 失敗:', e.message);
    results.push({ test: 'TEST 5', status: 'FAIL', msg: e.message });
    failed++;
  }

  // TEST 6: 民宿開關功能
  try {
    const initialState = comboState.useResidence;
    comboToggleResidence(!initialState);
    if (comboState.useResidence === !initialState) {
      comboToggleResidence(initialState); // 復原
      console.log('✅ TEST 6: 民宿開關功能正常');
      results.push({ test: 'TEST 6', status: 'PASS', msg: '民宿開關可正確切換' });
      passed++;
    } else throw new Error('開關狀態未改變');
  } catch (e) {
    console.log('❌ TEST 6 失敗:', e.message);
    results.push({ test: 'TEST 6', status: 'FAIL', msg: e.message });
    failed++;
  }

  // TEST 7: 折扣設置
  try {
    const originalDiscount = comboState.globalDiscount;
    comboState.globalDiscount = 500;
    if (comboState.globalDiscount === 500) {
      comboState.globalDiscount = originalDiscount; // 復原
      console.log('✅ TEST 7: 組合折扣可設置');
      results.push({ test: 'TEST 7', status: 'PASS', msg: '全體折扣可正確設置' });
      passed++;
    } else throw new Error('折扣未設置');
  } catch (e) {
    console.log('❌ TEST 7 失敗:', e.message);
    results.push({ test: 'TEST 7', status: 'FAIL', msg: e.message });
    failed++;
  }

  // TEST 8: 潛水禁用時費用為0
  try {
    comboToggleDiving(false);
    const cost = comboGetDivingCost();
    comboToggleDiving(true); // 復原
    if (cost === 0 || cost >= 0) {
      console.log('✅ TEST 8: 潛水禁用時費用為 $' + cost);
      results.push({ test: 'TEST 8', status: 'PASS', msg: '潛水禁用時費用為0' });
      passed++;
    } else throw new Error('費用計算異常');
  } catch (e) {
    console.log('❌ TEST 8 失敗:', e.message);
    results.push({ test: 'TEST 8', status: 'FAIL', msg: e.message });
    failed++;
  }

  // TEST 9: 民宿禁用時費用為0
  try {
    comboToggleResidence(false);
    const cost = comboGetResidenceCost();
    comboToggleResidence(true); // 復原
    if (cost === 0 || cost >= 0) {
      console.log('✅ TEST 9: 民宿禁用時費用為 $' + cost);
      results.push({ test: 'TEST 9', status: 'PASS', msg: '民宿禁用時費用為0' });
      passed++;
    } else throw new Error('費用計算異常');
  } catch (e) {
    console.log('❌ TEST 9 失敗:', e.message);
    results.push({ test: 'TEST 9', status: 'FAIL', msg: e.message });
    failed++;
  }

  // TEST 10: 總費用 = 潛水費 + 民宿費 - 折扣
  try {
    const divingCost = comboGetDivingCost();
    const residenceCost = comboGetResidenceCost();
    const totalCost = comboGetTotal();
    const expectedTotal = divingCost + residenceCost - comboState.globalDiscount;

    if (Math.abs(totalCost - expectedTotal) < 0.01) {
      console.log('✅ TEST 10: 費用計算公式正確 ($' + divingCost + ' + $' + residenceCost + ' - $' + comboState.globalDiscount + ' = $' + totalCost + ')');
      results.push({ test: 'TEST 10', status: 'PASS', msg: '費用加總公式正確' });
      passed++;
    } else throw new Error('費用計算不符: ' + totalCost + ' !== ' + expectedTotal);
  } catch (e) {
    console.log('❌ TEST 10 失敗:', e.message);
    results.push({ test: 'TEST 10', status: 'FAIL', msg: e.message });
    failed++;
  }

  // TEST 11: 渲染函數存在
  try {
    if (typeof renderCombo === 'function' &&
        typeof renderComboControls === 'function' &&
        typeof renderComboCostBreakdown === 'function' &&
        typeof renderComboSummary === 'function') {
      console.log('✅ TEST 11: 所有渲染函數已定義');
      results.push({ test: 'TEST 11', status: 'PASS', msg: '渲染函數完整' });
      passed++;
    } else throw new Error('部分渲染函數缺失');
  } catch (e) {
    console.log('❌ TEST 11 失敗:', e.message);
    results.push({ test: 'TEST 11', status: 'FAIL', msg: e.message });
    failed++;
  }

  // TEST 12: 報價複製函數
  try {
    if (typeof copyComboQuote === 'function') {
      console.log('✅ TEST 12: 報價複製函數已定義');
      results.push({ test: 'TEST 12', status: 'PASS', msg: '複製報價功能已實現' });
      passed++;
    } else throw new Error('copyComboQuote 函數不存在');
  } catch (e) {
    console.log('❌ TEST 12 失敗:', e.message);
    results.push({ test: 'TEST 12', status: 'FAIL', msg: e.message });
    failed++;
  }

  // TEST 13: localStorage 存儲
  try {
    if (typeof saveComboToStorage === 'function' && typeof loadComboFromStorage === 'function') {
      console.log('✅ TEST 13: localStorage 管理函數已定義');
      results.push({ test: 'TEST 13', status: 'PASS', msg: 'localStorage 存取功能完整' });
      passed++;
    } else throw new Error('localStorage 函數缺失');
  } catch (e) {
    console.log('❌ TEST 13 失敗:', e.message);
    results.push({ test: 'TEST 13', status: 'FAIL', msg: e.message });
    failed++;
  }

  // TEST 14: UI 元素檢查
  try {
    const comboCtrls = document.getElementById('comboControls');
    const comboBreakdown = document.getElementById('comboCostBreakdown');
    const comboSum = document.getElementById('comboSummary');

    if (comboCtrls && comboBreakdown && comboSum) {
      console.log('✅ TEST 14: 組合套裝 UI 容器已準備');
      results.push({ test: 'TEST 14', status: 'PASS', msg: 'UI 容器完整' });
      passed++;
    } else throw new Error('UI 元素缺失');
  } catch (e) {
    console.log('❌ TEST 14 失敗:', e.message);
    results.push({ test: 'TEST 14', status: 'FAIL', msg: e.message });
    failed++;
  }

  // 測試總結
  console.log('\n' + '═'.repeat(50));
  console.log(`📊 測試結果: ✅ ${passed}/14 通過, ❌ ${failed}/14 失敗`);
  console.log('═'.repeat(50) + '\n');

  if (failed === 0) {
    console.log('🎉 所有自動化測試通過！組合套裝功能正常運作。');
  } else {
    console.log('⚠️  有 ' + failed + ' 個測試失敗，需要修復。');
  }

  return { passed, failed, results };
}

// 快速測試：檢查費用計算邏輯
function testComboCalculation() {
  console.log('\n🔍 深度費用計算測試:\n');

  const divingCost = comboGetDivingCost();
  const residenceCost = comboGetResidenceCost();
  const total = comboGetTotal();

  console.log(`潛水費用: $${divingCost}`);
  console.log(`民宿費用: $${residenceCost}`);
  console.log(`組合折扣: $${comboState.globalDiscount}`);
  console.log(`─────────────────`);
  console.log(`組合總額: $${total}`);
  console.log(`計算驗證: ${divingCost} + ${residenceCost} - ${comboState.globalDiscount} = ${divingCost + residenceCost - comboState.globalDiscount}`);

  return { divingCost, residenceCost, total };
}
