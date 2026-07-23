# 🧪 運行自動化測試指南

## 🚀 快速開始

### 步驟 1: 打開計算器網頁
```
在瀏覽器中打開:
  http://localhost:8000/index.html
  或
  file:///C:/Users/yanchangtung/OneDrive/桌面/Counting_fee/index.html
```

### 步驟 2: 打開瀏覽器控制台
```
按 F12 或 Ctrl+Shift+I 打開開發者工具
點擊 "Console" 標籤
```

### 步驟 3: 載入測試腳本
在控制台中輸入:
```javascript
// 方法 A: 直接複製粘貼 test-residence-auto.js 的內容
// 或
// 方法 B: 動態載入腳本
const script = document.createElement('script');
script.src = 'test-residence-auto.js';
document.body.appendChild(script);
```

### 步驟 4: 運行測試
```javascript
startResidenceTests()
```

---

## 📊 預期輸出

```
🧪 開始民宿功能自動化測試...

============================================================
📝 === TEST 2.1: 日期選擇 ===
✅ PASS: 日期選擇和自動判斷正確

📝 === TEST 2.2: 人數選擇 ===
✅ PASS: 人數選擇和房型過濾正確

[... 更多測試 ...]

📊 測試總結
============================================================
✅ 通過: 13
❌ 失敗: 0
📝 總計: 13 個測試
🐛 發現 BUG: 0 個
```

---

## 🔍 測試涵蓋範圍

### 基礎功能 (Test 2.1 - 2.9)
- ✅ Test 2.1: 日期選擇和平日/假日自動判斷
- ✅ Test 2.2: 人數選擇和房型過濾
- ✅ Test 2.3: 房型費用計算
- ✅ Test 2.4: 加購行程（支持非互斥）
- ✅ Test 2.5: 機車差價（奇數人數）
- ✅ Test 2.6: 費用覆寫和自訂項目
- ✅ Test 2.7: 全體折扣
- ✅ Test 2.8: 報價複製格式
- ✅ Test 2.9: 草稿保存/載入

### 邊界情況 (Test 2.10 - 2.13)
- ✅ Test 2.10: 空日期處理
- ✅ Test 2.11: 單日住宿
- ✅ Test 2.12: 負數折扣
- ✅ Test 2.13: 清空數據

---

## 🐛 已知可能的 BUG

基於代碼分析，以下是可能存在的 BUG：

### 疑似 BUG #1: 自訂項目刪除
**位置**: residence.js renderResidenceLineItems()  
**問題**: 自訂項目是否有刪除按鈕？  
**預期**: 每個自訂項目旁應該有刪除按鈕

### 疑似 BUG #2: 房型/加購清除後的刪除按鈕
**位置**: residence.js renderResidenceRoomOptions()  
**問題**: 清除房型/加購後，清除按鈕是否消失？  
**預期**: 應該消失並重新顯示選擇卡片

### 疑似 BUG #3: 草稿數據完整性
**位置**: residence.js saveResidenceToStorage()  
**問題**: customItems 是否被正確保存？  
**預期**: 應該完整保存所有字段

---

## 📝 測試結果記錄

運行測試後，請記錄：

### 格式 A: 如果測試全部通過
```
✅ 所有 13 個測試通過
❌ 0 個失敗
🐛 0 個 BUG 發現
→ 可以安全部署
```

### 格式 B: 如果發現失敗
```
❌ 失敗的測試: [列出 Test 編號]
🐛 相關 BUG:
  - BUG 名稱
  - 復現步驟
  - 預期 vs 實際

→ 需要修復後再測試
```

---

## 🔧 調試技巧

### 檢查狀態變數
```javascript
// 查看民宿狀態
console.table(residenceState)

// 查看所有房型
console.table(ACCOMMODATION.rooms)

// 查看加購行程
console.table(ACCOMMODATION.packages)

// 檢查費用計算
console.log('房費:', calculateRoomCostTotal())
console.log('加購費:', calculatePackageCost())
console.log('總費用:', calculateResidenceTotal())
```

### 手動測試某個功能
```javascript
// 模擬選擇房型
residenceState.selectedRoom = 'fourPersonRoom';
residenceState.occupancy = 4;
residenceState.checkInDate = '2024-09-25';
residenceState.checkOutDate = '2024-09-28';
renderResidenceCalculator();

// 檢查結果
console.table(generateResidenceLineItems())
```

### 清空所有數據
```javascript
localStorage.clear()
location.reload()
```

---

## ✅ 測試完成檢查清單

- [ ] 成功運行自動化測試
- [ ] 記錄了所有測試結果
- [ ] 發現並記錄了 BUG（如果有）
- [ ] 已準備好修復列表

---

## 📤 下一步

測試完成後，告訴我：

1. **測試結果**
   - 通過: ___/ 13
   - 失敗: ___/ 13

2. **發現的 BUG**
   - BUG 編號
   - 簡短描述
   - 嚴重程度

3. **可以部署嗎？**
   - ✅ 是 (無阻礙 BUG)
   - ❌ 否 (需要修復)

---

Happy Testing! 🚀
