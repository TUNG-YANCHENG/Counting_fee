// 潛水費用計算器 - 價目表配置
// 可在後台修改，儲存到 localStorage

const PRICING_DEFAULTS = {
  funDive: {
    // [人數] = { 岸潛, 船潛1趟, 夜潛, checkDive }
    1: { 岸潛: 1550, 船潛: 3100, 夜潛: 1850, checkDive: 1550 },
    2: { 岸潛: 950, 船潛: 1900, 夜潛: 1100, checkDive: 950 },
    3: { 岸潛: 750, 船潛: 1500, 夜潛: 850, checkDive: 750 },
    4: { 岸潛: 650, 船潛: 1300, 夜潛: 700, checkDive: 650 },
    5: { 岸潛: 600, 船潛: 1200, 夜潛: 650, checkDive: 600 },
    6: { 岸潛: 550, 船潛: 1100, 夜潛: 600, checkDive: 550 },
    7: { 岸潛: 525, 船潛: 1050, 夜潛: 550, checkDive: 525 },
    8: { 岸潛: 500, 船潛: 1000, 夜潛: 525, checkDive: 500 }
  },
  shipFee: 1300,
  tagalong: 300,
  waterSkillReview: 2500,
  equipment: {
    fullRental: { halfDay: 600, fullDay: 1000 },
    heavySet: { halfDay: 400, fullDay: 700 },
    lightSet: { halfDay: 600, fullDay: null },
    BCD: { halfDay: 200, fullDay: 400 },
    regulator: { halfDay: 200, fullDay: 400 },
    wetsuit: { halfDay: null, fullDay: 200 },
    mask: { halfDay: null, fullDay: 150 },
    fins: { halfDay: null, fullDay: 200 },
    booties: { halfDay: null, fullDay: 150 },
    torch: { halfDay: null, fullDay: 150 },
    fishTorpedo: { halfDay: null, fullDay: 150 },
    lifejacket: { halfDay: null, fullDay: 150 },
    computer: { halfDay: 300, fullDay: 600 },
    gopro: { halfDay: 400, fullDay: 800 },
    floatBall: { halfDay: null, fullDay: 300 }
  },
  highOxygen: 450, // per bottle
  weightBeltInsurance: 200 // per day
};

// 從 localStorage 載入或使用預設值
function getPricing() {
  const saved = localStorage.getItem('divePricing');
  return saved ? JSON.parse(saved) : PRICING_DEFAULTS;
}

// 儲存價目表到 localStorage
function savePricing(pricing) {
  localStorage.setItem('divePricing', JSON.stringify(pricing));
}

// 重置為預設值
function resetPricing() {
  localStorage.removeItem('divePricing');
}
