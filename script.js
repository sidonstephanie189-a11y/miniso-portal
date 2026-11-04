// ==========================================
// MINISO Member Portal — DEMO VERSION
// FOR EDUCATIONAL / SIMULATION PURPOSES ONLY
// ==========================================

// Data storage
let orders = JSON.parse(localStorage.getItem('demoOrders')) || [];
let balance = parseFloat(localStorage.getItem('demoBalance')) || 5000;
let totalDeposit = parseFloat(localStorage.getItem('demoTotalDeposit')) || 0;
let totalWithdraw = parseFloat(localStorage.getItem('demoTotalWithdraw')) || 0;
let lastClaim = localStorage.getItem('demoLastClaim') || null;

// DOM Elements
const navLinks = document.querySelectorAll('.nav-link, .bot-nav-link');
const sections = document.querySelectorAll('.section');
const balanceEl = document.querySelector('.balance');
const profitEl = document.querySelector('.profit .green');
const ordersListEl = document.getElementById('ordersList');
const totalDepositEl = document.getElementById('totalDeposit');
const totalWithdrawEl = document.getElementById('totalWithdraw');
const activeOrdersEl = document.getElementById('activeOrders');
const historyListEl = document.getElementById('historyList');
const claimBtn = document.getElementById('claimBtn');

// Initialize
updateUI();
checkClaimStatus();

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-section') || link.getAttribute('href').substring(1);
        
        // Update sections
        sections.forEach(sec => sec.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');
        
        // Update nav active states
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.bot-nav-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll(`[data-section="${targetId}"], [href="#${targetId}"]`).forEach(l => l.classList.add('active'));
    });
});

// Plan Selection
document.querySelectorAll('.btn-plan').forEach(btn => {
    btn.addEventListener('click', () => {
        const planName = btn.getAttribute('data-plan');
        const price = parseFloat(btn.getAttribute('data-price'));
        
        if (balance < price) {
            alert('⚠️ Demo balance is insufficient! Add demo funds first 💜');
            return;
        }
        
        balance -= price;
        totalDeposit += price;
        
        const newOrder = {
            id: Date.now(),
            plan: planName,
            price: price,
            date: new Date().toLocaleString(),
            daysLeft: planName === 'Pink Blossom' ? 30 : planName === 'Lavender Premium' ? 60 : 180,
            dailyIncome: planName === 'Pink Blossom' ? 5 : planName === 'Lavender Premium' ? 30 : 150,
            active: true
        };
        
        orders.push(newOrder);
        saveData();
        updateUI();
        
        alert(`✅ Plan Selected: ${planName}\n$${price} deducted from demo balance 💖`);
    });
});

// Claim Daily Bonus
if (claimBtn) {
    claimBtn.addEventListener('click', () => {
        const now = new Date();
        
        if (lastClaim) {
            const lastDate = new Date(lastClaim);
            const hoursPassed = (now - lastDate) / (1000 * 60 * 60);
            
            if (hoursPassed < 24) {
                alert(`⏳ Please wait ${Math.ceil(24 - hoursPassed)} more hours before claiming 💜`);
                return;
            }
        }
        
        balance += 10;
        lastClaim = now.toISOString();
        localStorage.setItem('demoLastClaim', lastClaim);
        saveData();
        updateUI();
        checkClaimStatus();
        
        alert('✅ $10 Demo Bonus Claimed! 💚');
    });
}

// Quick Actions
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.textContent.includes('Deposit')) {
            const amount = prompt('Enter demo deposit amount:');
            if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
                balance += parseFloat(amount);
                totalDeposit += parseFloat(amount);
                addHistory('Deposit', `+$${parseFloat(amount).toFixed(2)}`);
                saveData();
                updateUI();
                alert(`✅ $${amount} added to demo balance! 💖`);
            }
        } else if (btn.textContent.includes('Withdraw')) {
            const amount = prompt('Enter demo withdraw amount:');
            if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
                if (balance >= parseFloat(amount)) {
                    balance -= parseFloat(amount);
                    totalWithdraw += parseFloat(amount);
                    addHistory('Withdraw', `-$${parseFloat(amount).toFixed(2)}`);
                    saveData();
                    updateUI();
                    alert(`✅ $${amount} withdrawn from demo balance! 💜`);
                } else {
                    alert('⚠️ Insufficient demo balance!');
                }
            }
        } else if (btn.textContent.includes('Team')) {
            alert('👥 Team feature — DEMO ONLY\n\nInvite friends & earn bonus!\n(This is simulation only) 💚');
        } else if (btn.textContent.includes('Rewards')) {
            alert('🎁 Rewards feature — DEMO ONLY\n\nEarn points & get free MINISO products!\n(This is simulation only) 💖');
        }
    });
});

// Add Demo Funds
document.querySelector('.btn-primary').addEventListener('click', () => {
    balance += 1000;
    addHistory('Demo Funds Added', '+$1,000.00');
    saveData();
    updateUI();
    alert('✅ $1,000 Demo Funds Added! 💚✨');
});

// Update UI
function updateUI() {
    if (balanceEl) balanceEl.textContent = `$${balance.toFixed(2)}`;
    if (profitEl) profitEl.textContent = `+$${(balance - 5000).toFixed(2)}`;
    if (totalDepositEl) totalDepositEl.textContent = `$${totalDeposit.toFixed(2)}`;
    if (totalWithdrawEl) totalWithdrawEl.textContent = `$${totalWithdraw.toFixed(2)}`;
    if (activeOrdersEl) activeOrdersEl.textContent = orders.filter(o => o.active).length;
    
    // Render Orders
    if (ordersListEl) {
        if (orders.length === 0) {
            ordersListEl.innerHTML = '<p class="empty-text">No orders yet. Select a plan to start! 💜</p>';
        } else {
            ordersListEl.innerHTML = orders.map(order => `
                <div class="order-item">
                    <h4>${order.plan}</h4>
                    <p>Price: $${order.price.toFixed(2)} (Demo)</p>
                    <p>Daily Income: $${order.dailyIncome} (Demo)</p>
                    <p>Days Left: ${order.daysLeft}</p>
                    <p>Ordered: ${order.date}</p>
                    <span style="color: ${order.active ? '#68D391' : '#FF8FB1'}">${order.active ? '✅ Active' : '✅ Completed'}</span>
                </div>
            `).reverse().join('');
        }
    }
    
    // Render History
    renderHistory();
}

// Check Claim Status
function checkClaimStatus() {
    if (!claimBtn) return;
    
    if (!lastClaim) {
        claimBtn.disabled = false;
        claimBtn.textContent = 'Claim Now';
        return;
    }
    
    const hoursPassed = (new Date() - new Date(lastClaim)) / (1000 * 60 * 60);
    
    if (hoursPassed < 24) {
        claimBtn.disabled = true;
        claimBtn.textContent = `Wait ${Math.ceil(24 - hoursPassed)}h`;
    } else {
        claimBtn.disabled = false;
        claimBtn.textContent = 'Claim Now';
    }
}

// History Management
function addHistory(type, amount) {
    const history = JSON.parse(localStorage.getItem('demoHistory')) || [];
    history.unshift({ type, amount, date: new Date().toLocaleString() });
    localStorage.setItem('demoHistory', JSON.stringify(history));
}

function renderHistory() {
    if (!historyListEl) return;
    const history = JSON.parse(localStorage.getItem('demoHistory')) || [];
    
    if (history.length === 0) {
        historyListEl.innerHTML = '<p class="empty-text">No transactions yet! 💖</p>';
    } else {
        historyListEl.innerHTML = history.map(item => `
            <div class="history-item">
                <div>
                    <strong>${item.type}</strong>
                    <br><small>${item.date}</small>
                </div>
                <div class="amount">${item.amount}</div>
            </div>
        `).join('');
    }
}

// Save Data
function saveData() {
    localStorage.setItem('demoOrders', JSON.stringify(orders));
    localStorage.setItem('demoBalance', balance.toString());
    localStorage.setItem('demoTotalDeposit', totalDeposit.toString());
    localStorage.setItem('demoTotalWithdraw', totalWithdraw.toString());
}

// Simulate daily earnings (for demo display)
setInterval(() => {
    orders.forEach(order => {
        if (order.active && order.daysLeft > 0) {
            // In real app this would be server-side
        }
    });
}, 1000 * 60 * 60);
