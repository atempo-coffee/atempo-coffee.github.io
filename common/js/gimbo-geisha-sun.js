// --- 沖煮導航與曲線圖邏輯 (產品頁面專用) ---

let timerInterval = null;
let currentTime = 0; // in seconds
let isRunning = false;

const timerDisplay = document.getElementById('timer-display');
const instructionDisplay = document.getElementById('instruction-display');
const waterTargetDisplay = document.getElementById('water-target-display');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function updateDisplays() {
    timerDisplay.textContent = formatTime(currentTime);

    if (currentTime === 0) {
        instructionDisplay.textContent = '準備';
        waterTargetDisplay.textContent = '';
    } else if (currentTime <= 20) {
        instructionDisplay.textContent = '1. 悶蒸 (小水柱)';
        waterTargetDisplay.textContent = '目標水量: 約 30ml';
    } else if (currentTime <= 60) {
        instructionDisplay.textContent = '2. 主要注水 (中大水柱)';
        waterTargetDisplay.textContent = '目標水量: 230g - 240g';
    } else {
        instructionDisplay.textContent = '3. 注水完成';
        waterTargetDisplay.textContent = '總時間: ~1:30';
    }
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    startPauseBtn.textContent = '暫停';
    startPauseBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
    startPauseBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
    
    timerInterval = setInterval(() => {
        currentTime++;
        updateDisplays();
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    isRunning = false;
    startPauseBtn.textContent = '繼續';
    startPauseBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
    startPauseBtn.classList.add('bg-green-600', 'hover:bg-green-700');
    
    clearInterval(timerInterval);
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    currentTime = 0;
    isRunning = false;
    updateDisplays();
    
    startPauseBtn.textContent = '開始';
    startPauseBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
    startPauseBtn.classList.add('bg-green-600', 'hover:bg-green-700');
}

startPauseBtn.addEventListener('click', () => {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
});

resetBtn.addEventListener('click', resetTimer);

function initChart() {
    const ctx = document.getElementById('brew-chart').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['0s', '20s', '60s', '90s'],
            datasets: [{
                label: '目標水量 (g)',
                data: [0, 30, 230, 230],
                borderColor: 'rgb(148, 102, 45)', // amber-800
                backgroundColor: 'rgba(148, 102, 45, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.1,
                pointBackgroundColor: 'rgb(148, 102, 45)',
                pointRadius: 5,
                pointHoverRadius: 7,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '水量 (g)'
                    },
                    ticks: {
                        stepSize: 50
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '時間 (秒)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}g`;
                        }
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });
}

// 頁面載入時執行所有初始化腳本
document.addEventListener('DOMContentLoaded', () => {
    // 載入共用導航列 (使用 utils.js 中的全域函式)
    if (window.loadComponent) {
        window.loadComponent('/common/header-component.html', 'header-placeholder');
    }
    
    // 初始化沖煮計時器和曲線圖
    updateDisplays();
    initChart();
});
