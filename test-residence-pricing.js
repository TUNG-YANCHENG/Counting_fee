// 民宿计费诊断测试

function diagnoseResidencePricing() {
  console.clear();
  console.log('🔍 民宿计费诊断测试\n');

  // ========== 检查状态 ==========
  console.log('📋 当前状态:');
  console.log('入住日期:', residenceState.checkInDate);
  console.log('退房日期:', residenceState.checkOutDate);
  console.log('人数:', residenceState.occupancy);
  console.log('选择房型:', residenceState.selectedRoom);
  console.log('选择加购:', residenceState.selectedPackage);
  console.log('');

  // ========== 测试房型数据 ==========
  console.log('📦 房型数据检查:');
  if (ACCOMMODATION && ACCOMMODATION.rooms) {
    console.log('✅ ACCOMMODATION.rooms 存在');
    console.log('可用房型:', Object.keys(ACCOMMODATION.rooms));

    if (residenceState.selectedRoom) {
      const room = ACCOMMODATION.rooms[residenceState.selectedRoom];
      if (room) {
        console.log(`✅ 房型 "${residenceState.selectedRoom}" 存在`);
        console.log('  房型名称:', room.name);
        console.log('  容纳人数:', room.capacity);
        console.log('  可用occupancy:', Object.keys(room.pricing));

        if (room.pricing[residenceState.occupancy]) {
          const pricing = room.pricing[residenceState.occupancy];
          console.log(`✅ ${residenceState.occupancy}人定价存在`);
          console.log('  平日价格:', pricing.weekday);
          console.log('  假日价格:', pricing.weekend);
        } else {
          console.log(`❌ ${residenceState.occupancy}人定价不存在`);
          console.log('  需要的occupancy:', residenceState.occupancy);
          console.log('  可用定价:', room.pricing);
        }
      } else {
        console.log(`❌ 房型 "${residenceState.selectedRoom}" 不存在`);
      }
    } else {
      console.log('⚠️  没有选择房型');
    }
  } else {
    console.log('❌ ACCOMMODATION.rooms 不存在');
  }
  console.log('');

  // ========== 测试日期计算 ==========
  console.log('📅 日期计算检查:');
  if (residenceState.checkInDate && residenceState.checkOutDate) {
    const nights = calculateNightsBetween(residenceState.checkInDate, residenceState.checkOutDate);
    console.log(`✅ 入住期间: ${residenceState.checkInDate} ~ ${residenceState.checkOutDate}`);
    console.log(`✅ 总晚数: ${nights}`);

    const { weekdayNights, weekendNights } = calculateWeekdayWeekendNights(
      residenceState.checkInDate,
      residenceState.checkOutDate,
      residenceState.holidays || []
    );
    console.log(`✅ 平日: ${weekdayNights}晚, 假日: ${weekendNights}晚`);
  } else {
    console.log('⚠️  日期未完整设置');
    console.log('  入住:', residenceState.checkInDate);
    console.log('  退房:', residenceState.checkOutDate);
  }
  console.log('');

  // ========== 测试房费计算 ==========
  console.log('💰 房费计算检查:');
  try {
    const roomCost = calculateRoomCostTotal();
    console.log(`✅ calculateRoomCostTotal() = $${roomCost}`);

    if (roomCost === 0) {
      console.log('⚠️  房费为 0，检查原因:');
      console.log('  - selectedRoom:', residenceState.selectedRoom);
      console.log('  - checkInDate:', residenceState.checkInDate);
      console.log('  - checkOutDate:', residenceState.checkOutDate);
    }
  } catch (e) {
    console.log('❌ 计算房费时出错:', e.message);
  }
  console.log('');

  // ========== 测试线项生成 ==========
  console.log('📝 线项生成检查:');
  try {
    const items = generateResidenceLineItems();
    console.log(`✅ 生成了 ${items.length} 项费用`);

    items.forEach((item, idx) => {
      console.log(`  ${idx + 1}. [${item.category}] ${item.label} = $${item.price}`);
      if (item.calc) console.log(`     计算: ${item.calc}`);
    });

    const hasRoomItem = items.some(i => i.id && i.id.startsWith('room-'));
    if (!hasRoomItem) {
      console.log('❌ 缺少房费项目');
    } else {
      console.log('✅ 找到房费项目');
    }
  } catch (e) {
    console.log('❌ 生成线项时出错:', e.message);
  }
  console.log('');

  // ========== 测试总费用 ==========
  console.log('💵 总费用计算:');
  try {
    const total = calculateResidenceTotal();
    console.log(`✅ 总费用 = $${total}`);
  } catch (e) {
    console.log('❌ 计算总费用时出错:', e.message);
  }
}

// 快速测试：选择日期和房型，然后检查
function quickResidenceTest() {
  console.log('\n🧪 快速民宿测试:\n');

  // 设置测试数据
  console.log('设置测试数据...');
  residenceState.checkInDate = '2026-07-25';
  residenceState.checkOutDate = '2026-07-28';
  residenceState.occupancy = 2;
  console.log('入住: 2026-07-25, 退房: 2026-07-28, 人数: 2人\n');

  // 测试选择房型
  console.log('选择房型: fourPersonRoom');
  selectRoom('fourPersonRoom');

  // 诊断
  diagnoseResidencePricing();
}
