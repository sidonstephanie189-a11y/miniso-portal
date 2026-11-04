// Select Plan Function
function selectPlan(planName) {
    document.getElementById('planResult').innerHTML = 
        `✅ You selected: <strong>${planName}</strong> — Ready to start earning!`;
    
    // Save to localStorage for Admin Panel
    let plans = JSON.parse(localStorage.getItem('selectedPlans') || '[]');
    plans.push({
        name: planName,
        time: new Date().toLocaleString()
    });
    localStorage.setItem('selectedPlans', JSON.stringify(plans));
    
    updateAdminStats();
}

// Blind Box Rewards Function
let totalEarned = 0;

function openBlindBox(box) {
    if (box.classList.contains('opened')) return;
    
    // Random reward ₱5 to ₱20
    const reward = Math.floor(Math.random() * 16) + 5;
    
    box.classList.add('opened');
    box.textContent = `₱${reward}`;
    
    // Show result
    document.getElementById('rewardResult').innerHTML = 
        `🎉 Congratulations! You got ₱${reward}!`;
    
    // Add to history
    totalEarned += reward;
    const list = document.getElementById('historyList');
    const item = document.createElement('li');
    item.textContent = `🎁 ₱${reward} — ${new Date().toLocaleTimeString()}`;
    list.prepend(item);
    
    document.getElementById('totalEarned').textContent = 
        `Total Earned: ₱${totalEarned}`;
    
    // Save for Admin
    let rewards = JSON.parse(localStorage.getItem('allRewards') || '[]');
    rewards.push({
        amount: reward,
        time: new Date().toLocaleString()
    });
    localStorage.setItem('allRewards', JSON.stringify(rewards));
    
    updateAdminStats();
}

// Update Admin Stats
function updateAdminStats() {
    const rewards = JSON.parse(localStorage.getItem('allRewards') || '[]');
    const plans = JSON.parse(localStorage.getItem('selectedPlans') || '[]');
    
    const totalRewardAmount = rewards.reduce((sum, r) => sum + r.amount, 0);
    const totalPlans = plans.length;
    
    localStorage.setItem('adminTotalRewards', totalRewardAmount);
    localStorage.setItem('adminTotalPlans', totalPlans);
}
