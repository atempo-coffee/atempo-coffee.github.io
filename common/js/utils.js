/**
 * 載入外部 HTML 元件並插入到指定位置。
 * 這個函式是共用函式庫的核心，允許將 header-component.html 等檔案載入到任何頁面。
 * @param {string} componentUrl 元件的 URL (例如: 'header-component.html')
 * @param {string} targetElementId 要插入內容的元素 ID (例如: 'header-placeholder')
 */
async function loadComponent(componentUrl, targetElementId) {
    try {
        const response = await fetch(componentUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const htmlText = await response.text();
        const placeholder = document.getElementById(targetElementId);
        if (placeholder) {
            // 使用 insertAdjacentHTML 插入內容
            placeholder.insertAdjacentHTML('afterbegin', htmlText);
            
            // 執行元件中的任何腳本 (這對於載入的 header-component.html 內的 mobile-menu 腳本很重要)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlText;
            const scripts = tempDiv.getElementsByTagName('script');
            for (let i = 0; i < scripts.length; i++) {
                // 創建一個新的 script 元素並複製內容，以確保它被執行
                const newScript = document.createElement('script');
                if (scripts[i].src) {
                    newScript.src = scripts[i].src;
                } else {
                    newScript.textContent = scripts[i].textContent;
                }
                document.body.appendChild(newScript);
            }
        }
    } catch (error) {
        console.error(`無法載入元件 ${componentUrl}:`, error);
        // 可以在這裡插入一個錯誤訊息的替代內容
    }
}

// 將 loadComponent 附加到 window 物件，使其可供其他頁面腳本使用
window.loadComponent = loadComponent;

/**
 * 模擬的成功訊息顯示功能。
 * 由於按鈕使用 onclick='showSuccessMessage(...)', 必須是全域可訪問的。
 * @param {string} message 要顯示的訊息
 */
window.showSuccessMessage = function(message) {
    const msgElement = document.getElementById('successMessage');
    const button = document.getElementById('addToCartButton');

    if (!button) {
        console.warn("addToCartButton not found. Skipping showSuccessMessage animation.");
        if (msgElement) {
            msgElement.textContent = message;
            msgElement.classList.remove('hidden');
            setTimeout(() => { msgElement.classList.add('hidden'); }, 3000);
        }
        return;
    }
    
    // 替換按鈕文字以模擬處理中
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 處理中...';
    button.disabled = true;

    setTimeout(() => {
        // 恢復按鈕
        button.innerHTML = originalText;
        button.disabled = false;

        // 顯示成功訊息
        if (msgElement) {
            msgElement.textContent = message;
            msgElement.classList.remove('hidden');
            
            // 訊息顯示 3 秒後自動隱藏
            setTimeout(() => {
                msgElement.classList.add('hidden');
            }, 3000);
        }
    }, 800);
}
