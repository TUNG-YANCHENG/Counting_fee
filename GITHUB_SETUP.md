# 🚀 GitHub Pages 設定指南

## 步驟 1：在 GitHub 建立新倉庫

1. 訪問 https://github.com/new
2. 填寫倉庫資訊：
   - **Repository name**: `Counting_fee`
   - **Description**: 潛水費用計算器 - Fun Dive 報價工具
   - **Visibility**: Public（需要公開才能用 GitHub Pages）
   - **Add .gitignore**: 選 Node（稍後會覆蓋）
   - **Add a README**: 暫不勾選（已有 README.md）
3. 點擊 **Create repository**

## 步驟 2：連結遠端倉庫並推送代碼

在你的本地資料夾（Counting_fee）中執行：

```bash
# 新增遠端倉庫（將 TUNG-YANCHENG 替換為你的 GitHub 用戶名）
git remote add origin https://github.com/TUNG-YANCHENG/Counting_fee.git

# 重新命名 master 分支為 main（GitHub 預設）
git branch -M main

# 推送代碼到 GitHub
git push -u origin main
```

**如果出現認證問題：**
- 使用 GitHub 個人訪問令牌（Personal Access Token）而不是密碼
- 或設定 SSH 密鑰

## 步驟 3：啟用 GitHub Pages

1. 進入倉庫設定頁面：
   https://github.com/TUNG-YANCHENG/Counting_fee/settings

2. 在左側導航欄找到 **Pages** 選項

3. 在 **Source** 下拉選單選擇：
   - **Branch**: `main`
   - **Folder**: `/ (root)`

4. 點擊 **Save**

## 步驟 4：等待部署完成

- GitHub 會自動部署，通常需要 1-5 分鐘
- 頁面頂部會顯示：
  ```
  ✅ Your site is live at https://TUNG-YANCHENG.github.io/Counting_fee/
  ```

## 驗證部署成功

在瀏覽器訪問：
- **首頁**：https://TUNG-YANCHENG.github.io/Counting_fee/
- **後台**：https://TUNG-YANCHENG.github.io/Counting_fee/admin.html

## 🔄 更新代碼流程

每次修改後，執行以下命令推送更新：

```bash
cd "c:\Users\yanchangtung\OneDrive\桌面\Counting_fee"

# 檢查狀態
git status

# 新增更改
git add .

# 提交更新
git commit -m "你的更新說明"

# 推送到 GitHub（會自動重新部署）
git push
```

## ⚙️ PowerShell 快速推送腳本

在你的專案資料夾建立 `push.ps1`：

```powershell
# push.ps1
param(
    [string]$message = "Update"
)

cd "c:\Users\yanchangtung\OneDrive\桌面\Counting_fee"
git add .
git commit -m $message
git push

Write-Host "✅ 推送完成！檢視：https://TUNG-YANCHENG.github.io/Counting_fee/" -ForegroundColor Green
```

使用方式：
```powershell
.\push.ps1 "新增功能 XXX"
```

## 🌐 自訂域名（可選）

如果你有自己的域名，可以：

1. 在倉庫設定 → Pages → Custom domain 填入你的域名
2. 在域名 DNS 設定中新增 CNAME 記錄指向 `TUNG-YANCHENG.github.io`

## 📊 監控部署

訪問 https://github.com/TUNG-YANCHENG/Counting_fee/deployments

可查看所有部署歷史和狀態。

## 🔒 安全建議

- ✅ 已設定 `.gitignore` 防止洩露敏感資訊
- ✅ GitHub Pages 自動啟用 HTTPS
- ✅ 所有資料存儲在用戶瀏覽器，無伺服器風險

## 常見問題

### Q: 推送後網站沒有更新？
A: 等待 1-5 分鐘，或在倉庫設定 → Actions 檢查部署狀態。

### Q: 如何回滾到上一版本？
A:
```bash
git revert HEAD
git push
```

### Q: 想刪除倉庫？
A: 進入倉庫 Settings → Danger Zone → Delete this repository

---

**完成後，你的潛水費用計算器將在以下地址 24/7 線上可用：**

🔗 https://TUNG-YANCHENG.github.io/Counting_fee/
