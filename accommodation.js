// 民宿房型和定價配置

const ACCOMMODATION_DEFAULTS = {
  rooms: {
    sixPersonRoom: {
      name: "六人房",
      capacity: 6,
      pricing: {
        // "人數": { weekday: 平日價, weekend: 假日價 }
        2: { weekday: 2800, weekend: 3000 },
        3: { weekday: 3900, weekend: 4200 },
        4: { weekday: 4800, weekend: 5200 },
        5: { weekday: 5500, weekend: 6000 },
        6: { weekday: 6000, weekend: 6600 }
      }
    },
    fivePersonRoom: {
      name: "五人房",
      capacity: 5,
      pricing: {
        2: { weekday: 2800, weekend: 3000 },
        3: { weekday: 3900, weekend: 4200 },
        4: { weekday: 4800, weekend: 5200 },
        5: { weekday: 5500, weekend: 6000 }
      }
    },
    fourPersonRoom: {
      name: "四人房",
      capacity: 4,
      pricing: {
        2: { weekday: 2800, weekend: 3000 },
        3: { weekday: 3900, weekend: 4200 },
        4: { weekday: 4800, weekend: 5200 }
      }
    },
    threePersonRoom: {
      name: "三人房",
      capacity: 3,
      pricing: {
        2: { weekday: 2800, weekend: 3000 },
        3: { weekday: 3900, weekend: 4200 }
      }
    },
    twoPersonRoom: {
      name: "兩人房",
      capacity: 2,
      pricing: {
        2: { weekday: 2800, weekend: 3000 }
      }
    },
    whiteHouse: {
      name: "大白屋",
      capacity: 6,
      pricing: {
        2: { weekday: 3400, weekend: 3600 },
        3: { weekday: 4500, weekend: 4800 },
        4: { weekday: 5200, weekend: 5600 },
        5: { weekday: 6000, weekend: 6500 },
        6: { weekday: 6600, weekend: 7200 }
      }
    }
  },

  // 加購行程
  packages: {
    threeDayDiveExperience: {
      name: "三天二夜超值行程（含潛水）",
      days: 3,
      durationHours: 48,
      price: 3700,
      unit: "人",
      includes: ["機車", "早餐券", "體驗潛水", "藍洞探險", "夜間潮間帶/溫泉/森吧", "接送", "導覽地圖"],
      motorbikeExtraFee: 500,
      includeMotorhiking: true,
      includeAirport: false
    },
    threeDaySnorkelExperience: {
      name: "三天二夜超值行程（含浮潛）",
      days: 3,
      durationHours: 48,
      price: 1800,
      unit: "人",
      includes: ["機車", "早餐券", "浮潛", "藍洞探險", "夜間潮間帶/溫泉/森吧", "接送", "導覽地圖"],
      motorbikeExtraFee: 500,
      includeMotorhiking: true
    },
    fourDayDiveExperience: {
      name: "四天三夜超值行程（含潛水）",
      days: 4,
      durationHours: 72,
      price: 4000,
      unit: "人",
      includes: ["機車", "早餐券", "體驗潛水", "藍洞探險", "夜間潮間帶/溫泉/森吧", "接送", "導覽地圖"],
      motorbikeExtraFee: 700,
      includeMotorhiking: true
    },
    fourDaySnorkelExperience: {
      name: "四天三夜超值行程（含浮潛）",
      days: 4,
      durationHours: 72,
      price: 2100,
      unit: "人",
      includes: ["機車", "早餐券", "浮潛", "藍洞探險", "夜間潮間帶/溫泉/森吧", "接送", "導覽地圖"],
      motorbikeExtraFee: 700,
      includeMotorhiking: true
    },
    threeDayDivePackage: {
      name: "三天二夜套裝行程（含潛水）",
      days: 3,
      durationHours: 48,
      price: 3100,
      unit: "人",
      includes: ["機車", "早餐券", "體驗潛水", "接送", "導覽地圖"],
      motorbikeExtraFee: 500,
      includeMotorhiking: true
    },
    threeDaySnorkelPackage: {
      name: "三天二夜套裝行程（含浮潛）",
      days: 3,
      durationHours: 48,
      price: 1100,
      unit: "人",
      includes: ["機車", "早餐券", "浮潛", "接送", "導覽地圖"],
      motorbikeExtraFee: 500,
      includeMotorhiking: true
    },
    fourDayDivePackage: {
      name: "四天三夜套裝行程（含潛水）",
      days: 4,
      durationHours: 72,
      price: 3300,
      unit: "人",
      includes: ["機車", "早餐券", "體驗潛水", "接送", "導覽地圖"],
      motorbikeExtraFee: 700,
      includeMotorhiking: true
    },
    fourDaySnorkelPackage: {
      name: "四天三夜套裝行程（含浮潛）",
      days: 4,
      durationHours: 72,
      price: 1400,
      unit: "人",
      includes: ["機車", "早餐券", "浮潛", "接送", "導覽地圖"],
      motorbikeExtraFee: 700,
      includeMotorhiking: true
    }
  }
};

// 從 localStorage 載入或使用預設值
function getAccommodation() {
  const saved = localStorage.getItem('accommodationPricing');
  return saved ? JSON.parse(saved) : ACCOMMODATION_DEFAULTS;
}

// 儲存到 localStorage
function saveAccommodation(data) {
  localStorage.setItem('accommodationPricing', JSON.stringify(data));
}

// 重置為預設值
function resetAccommodation() {
  localStorage.removeItem('accommodationPricing');
}

// 判斷日期是平日還是假日
// holidays: 國定假日日期陣列，格式 "YYYY-MM-DD"
function isDayOff(date, holidays = []) {
  const d = new Date(date);
  const dayOfWeek = d.getDay();

  // 星期五(5) 和星期六(6) 是假日
  if (dayOfWeek === 5 || dayOfWeek === 6) return true;

  // 檢查是否為國定假日
  const dateStr = d.toISOString().split('T')[0];
  if (holidays.includes(dateStr)) return true;

  return false;
}

// 計算入住天數
function calculateNights(checkInDate, checkOutDate) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = checkOut - checkIn;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// 根據日期範圍計算平日/假日晚數
function calculateWeekdayWeekendNights(checkInDate, checkOutDate, holidays = []) {
  let weekdayNights = 0;
  let weekendNights = 0;

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  // 從 checkIn 開始逐天檢查
  for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
    if (isDayOff(d, holidays)) {
      weekendNights++;
    } else {
      weekdayNights++;
    }
  }

  return { weekdayNights, weekendNights };
}

// 計算房費
function calculateRoomCost(roomType, occupancy, nights, checkInDate, checkOutDate, holidays = []) {
  const accommodation = getAccommodation();
  const room = accommodation.rooms[roomType];

  if (!room) return 0;
  if (!room.pricing[occupancy]) return 0;

  const { weekdayNights, weekendNights } = calculateWeekdayWeekendNights(checkInDate, checkOutDate, holidays);
  const pricing = room.pricing[occupancy];

  const weekdayPrice = pricing.weekday * weekdayNights;
  const weekendPrice = pricing.weekend * weekendNights;

  return weekdayPrice + weekendPrice;
}
