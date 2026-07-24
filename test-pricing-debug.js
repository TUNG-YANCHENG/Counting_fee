// 价目表诊断脚本

function diagnosePricing() {
  console.clear();
  console.log('🔍 价目表诊断\n');

  // 检查 PRICING_DEFAULTS
  console.log('1️⃣  检查 PRICING_DEFAULTS:');
  if (typeof PRICING_DEFAULTS === 'undefined') {
    console.log('❌ PRICING_DEFAULTS 未定义');
  } else {
    console.log('✅ PRICING_DEFAULTS 存在');
    console.log('  - funDive:', typeof PRICING_DEFAULTS.funDive);
    console.log('  - shipFee:', PRICING_DEFAULTS.shipFee);
    if (PRICING_DEFAULTS.funDive) {
      console.log('  - funDive 键:', Object.keys(PRICING_DEFAULTS.funDive));
      console.log('  - funDive[1]:', PRICING_DEFAULTS.funDive[1]);
      console.log('  - funDive[2]:', PRICING_DEFAULTS.funDive[2]);
    }
  }
  console.log('');

  // 检查 PRICING
  console.log('2️⃣  检查 PRICING:');
  if (typeof PRICING === 'undefined') {
    console.log('❌ PRICING 未定义');
  } else {
    console.log('✅ PRICING 存在');
    console.log('  - 类型:', typeof PRICING);
    console.log('  - funDive:', typeof PRICING.funDive);
    if (PRICING.funDive) {
      console.log('  - funDive 键:', Object.keys(PRICING.funDive));
      console.log('  - funDive[1]:', PRICING.funDive[1]);
      console.log('  - funDive[2]:', PRICING.funDive[2]);
    } else {
      console.log('❌ PRICING.funDive 未定义');
    }
  }
  console.log('');

  // 检查 getPricing 函数
  console.log('3️⃣  检查 getPricing 函数:');
  if (typeof getPricing === 'function') {
    console.log('✅ getPricing 函数存在');
    const result = getPricing();
    console.log('  - 返回类型:', typeof result);
    if (result) {
      console.log('  - 返回对象键:', Object.keys(result));
      if (result.funDive) {
        console.log('  - result.funDive 存在');
      } else {
        console.log('❌ result.funDive 不存在');
      }
    }
  } else {
    console.log('❌ getPricing 函数不存在');
  }
  console.log('');

  // 测试计算活动成本
  console.log('4️⃣  测试计算活动成本:');
  try {
    // 创建测试数据
    const testActivity = {
      type: '岸潛',
      participants: new Set([1, 2]),
      quantity: 1,
      bottles: 1,
      overrideCost: null,
      includeShipFee: false
    };

    const participantCount = testActivity.participants.size;
    const peopleKey = Math.min(participantCount, 8);

    console.log(`参加人数: ${participantCount}`);
    console.log(`人数键: ${peopleKey}`);

    const pricing = PRICING.funDive[peopleKey];
    console.log(`PRICING.funDive[${peopleKey}]:`, pricing);

    if (pricing) {
      console.log(`✅ 找到价格表`);
      console.log(`  - 岸潛: ${pricing['岸潛']}`);
      console.log(`  - 船潛: ${pricing['船潛']}`);
    } else {
      console.log(`❌ 价格表不存在 PRICING.funDive[${peopleKey}]`);
    }

    if (testActivity.type && pricing && pricing[testActivity.type]) {
      const cost = pricing[testActivity.type] * participantCount * (testActivity.quantity || 1);
      console.log(`✅ 计算成功: $${cost}`);
    } else {
      console.log('❌ 无法计算费用');
      console.log(`  - activity.type: ${testActivity.type}`);
      console.log(`  - pricing: ${pricing}`);
      if (pricing) {
        console.log(`  - pricing[activity.type]: ${pricing[testActivity.type]}`);
      }
    }
  } catch (e) {
    console.log(`❌ 错误: ${e.message}`);
    console.log(e.stack);
  }
  console.log('');

  // 显示完整的 PRICING 对象
  console.log('5️⃣  完整的 PRICING 对象:');
  console.log(PRICING);
}

// 快速测试：创建潜水员并添加活动
function quickDivingTest() {
  console.log('\n🧪 快速潜水测试\n');

  try {
    console.log('1. 创建2个潜水员...');
    createDiverByCount(2);
    console.log(`✅ 已创建: ${state.divers.map(d => d.name).join(', ')}`);

    console.log('\n2. 添加行程日期...');
    state.days.push({
      id: Date.now(),
      date: '2026-07-25',
      activities: []
    });
    console.log('✅ 已添加行程');

    console.log('\n3. 添加岸潛活动...');
    const dayId = state.days[0].id;
    addActivity(dayId, '岸潛');
    console.log('✅ 已添加活动');

    console.log('\n4. 计算费用...');
    const items = generateLineItems();
    console.log(`✅ 生成了 ${items.length} 项费用`);
    items.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.label} = $${item.price}`);
    });

    console.log('\n✅ 测试完成，没有错误！');
  } catch (e) {
    console.log(`❌ 错误: ${e.message}`);
    console.log(e.stack);
  }
}
