// 组合套装潜水费用计算测试

function testComboDivingCost() {
  console.clear();
  console.log('🧪 组合套装潜水费用计算测试\n');

  // 设置测试数据
  console.log('📋 设置测试数据...\n');

  // 创建2个潜水员
  createDiverByCount(2);
  console.log(`✅ 创建潜水员: ${state.divers.map(d => d.name).join(', ')}`);

  // 添加一天
  state.days.push({
    id: Date.now(),
    date: '2026-07-25',
    activities: []
  });
  console.log('✅ 添加行程日期: 2026-07-25');

  // 添加活动
  const dayId = state.days[0].id;
  addActivity(dayId, '岸潛');
  console.log('✅ 添加活动: 岸潛');

  // 启用组合潜水模式
  comboToggleDiving(true);
  console.log('✅ 启用组合潜水模式\n');

  // ========== 测试计费 ==========
  console.log('💰 潜水费用计算:\n');

  try {
    const items = generateLineItems();
    console.log(`✅ 生成了 ${items.length} 项费用:`);
    items.forEach((item, idx) => {
      console.log(`  ${idx + 1}. [${item.category}] ${item.label} = $${item.price}`);
    });
    console.log('');

    const divingCost = comboGetDivingCost();
    console.log(`✅ comboGetDivingCost() = $${divingCost}`);

    if (isNaN(divingCost)) {
      console.log('❌ 错误: 潜水费用是 NaN!');
    } else if (divingCost === 0) {
      console.log('⚠️  警告: 潜水费用为 0');
    } else {
      console.log('✅ 潜水费用计算正确');
    }
  } catch (e) {
    console.log('❌ 计算错误:', e.message);
    console.log(e.stack);
  }

  console.log('');

  // ========== 测试组合总费用 ==========
  console.log('📊 组合总费用:\n');

  try {
    const residenceCost = comboGetResidenceCost();
    const divingCost = comboGetDivingCost();
    const total = comboGetTotal();

    console.log(`潜水费用: $${divingCost}`);
    console.log(`民宿费用: $${residenceCost}`);
    console.log(`组合折扣: $${comboState.globalDiscount}`);
    console.log(`─────────────────`);
    console.log(`组合总额: $${total}`);

    if (isNaN(total)) {
      console.log('❌ 错误: 组合总额是 NaN!');
    } else {
      console.log('✅ 组合费用计算正确');
    }
  } catch (e) {
    console.log('❌ 计算错误:', e.message);
  }
}

// 快速验证: 检查 generateLineItems 返回的项目结构
function validateLineItemsStructure() {
  console.log('🔍 验证线项结构\n');

  // 创建简单数据
  state.divers = [{ id: 1, name: 'A' }];
  state.days = [{
    id: 100,
    date: '2026-07-25',
    activities: [{
      id: 1,
      type: '岸潛',
      participants: new Set([1]),
      quantity: 1,
      bottles: 1,
      overrideCost: null,
      includeShipFee: false
    }]
  }];

  const items = generateLineItems();
  if (items.length > 0) {
    const firstItem = items[0];
    console.log('第一个项目结构:');
    console.log('  - category:', firstItem.category);
    console.log('  - label:', firstItem.label);
    console.log('  - price:', firstItem.price);
    console.log('  - override:', firstItem.override);
    console.log('  - 其他字段:', Object.keys(firstItem).join(', '));

    if (firstItem.hasOwnProperty('override')) {
      console.log('\n✅ 正确: 项目有 "override" 字段');
    } else if (firstItem.hasOwnProperty('overridePrice')) {
      console.log('\n❌ 错误: 项目有 "overridePrice" 字段（应该是 "override"）');
    } else {
      console.log('\n⚠️  警告: 项目没有 override 相关字段');
    }
  }
}
