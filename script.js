document.addEventListener('DOMContentLoaded', () => {
    // ---------- DEFAULT USER DATA WALANG LOGIN ----------
    let currentUser = {
        username: 'Guest',
        balance: 5000,
        totalDeposit: 0,
        totalWithdraw: 0,
        totalCommission: 0,
        lastClaim: null,
        orders: [],
        redeemHistory: [],
        commissionHistory: [],
        transactions: [],
        referralCode: 'GUEST123',
        level1: [],
        level2: [],
        level3: []
    };

    // ---------- SAVE TO LOCALSTORAGE ----------
    function saveUser() {
        localStorage.setItem('minisoGuest', JSON.stringify(currentUser));
        updateAll();
    }

    // ---------- LOAD KUNG MAY NAISAVE NA ----------
    const saved = localStorage.getItem('minisoGuest');
    if (saved) currentUser = JSON.parse(saved);

    // ---------- UPDATE ALL NUMBERS ----------
    function updateAll() {
        document.getElementById('dispBalance').textContent = currentUser.balance.toFixed(2);
        document.getElementById('dispProfit').textContent = (currentUser.balance - 5000).toFixed(2);
        document.getElementById('teamDep').textContent = currentUser.totalDeposit.toFixed(2);
        document.getElementById('teamComm').textContent = currentUser.totalCommission.toFixed(2);
        document.getElementById('l1Count').textContent = currentUser.level1.length;
        document.getElementById('l23Count').textContent = currentUser.level2.length + currentUser.level3.length;
        document.getElementById('totDep').textContent = currentUser.totalDeposit.toFixed(2);
        document.getElementById('totWith').textContent = currentUser.totalWithdraw.toFixed(2);
        document.getElementById('activeCount').textContent = currentUser.orders.filter(o => o.active).length;
        document.getElementById('balOut').textContent = currentUser.balance.toFixed(2);
        document.getElementById('refLinkOut').value = `https://${window.location.host}?ref=${currentUser.referralCode}`;
        
        // Daily button
        const btn = document.getElementById('dailyClaimBtn');
        if (currentUser.lastClaim) {
            const hours = (new Date() - new Date(currentUser.lastClaim)) / 3600000;
            if (hours < 24) {
                btn.disabled = true;
                btn.textContent = `Wait ${Math.ceil(24 - hours)}h`;
            } else {
                btn.disabled = false;
                btn.textContent = 'Claim $10 Now ✨';
            }
        }

        renderPlans();
    }

    // ---------- NAVIGATION BOTTOM ----------
    document.querySelectorAll('.bottom-nav button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const id = btn.dataset.panel;
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        });
    });

    // ---------- PLANS ----------
    function getPlans() {
        return [
            {id:1, name:'Pink Blossom', price:100, daily:5, days:30, tag:'Standard'},
            {id:2, name:'Lavender Premium', price:500, daily:30, days:60, tag:'Popular'},
            {id:3, name:'Mint Luxury', price:2000, daily:150, days:180, tag:'VIP'}
        ];
    }

    function renderPlans() {
        const cont = document.getElementById('plansContainer');
        cont.innerHTML = getPlans().map(p => `
            <div class="plan-card ${p.tag==='Popular'?'featured':''}">
                <span class="tag">${p.tag}</span>
                <h3>${p.name}</h3>
                <p class="price">$${p.price}</p>
                <p>Daily: $${p.daily}</p>
                <p>Duration: ${p.days} days</p>
                <button class="pick-plan" data-price="${p.price}" data-name="${p.name}">Select 💖</button>
            </div>
        `).join('');

        cont.querySelectorAll('.pick-plan').forEach(btn => {
            btn.addEventListener('click', () => {
                const price = parseFloat(btn.dataset.price);
                if (currentUser.balance < price) return alert('⚠️ Kulang ang balance!');
                currentUser.balance -= price;
                currentUser.totalDeposit += price;
                currentUser.orders.push({name:btn.dataset.name, price, active:true});
                saveUser();
                alert(`✅ Napili mo: ${btn.dataset.name}`);
            });
        });
    }

    // ---------- RECHARGE ----------
    document.getElementById('doDep').addEventListener('click', () => {
        const amt = parseFloat(document.getElementById('depIn').value);
        if (!amt || amt <= 0) return alert('⚠️ Ilagay ang halaga!');
        currentUser.balance += amt;
        currentUser.totalDeposit += amt;
        document.getElementById('depIn').value = '';
        saveUser();
        alert(`✅ Naidagdag: $${amt}`);
    });

    // ---------- WITHDRAW ----------
    document.getElementById('doWith').addEventListener('click', () => {
        const amt = parseFloat(document.getElementById('withIn').value);
        if (!amt || amt <= 0) return alert('⚠️ Ilagay ang halaga!');
        if (currentUser.balance < amt) return alert('⚠️ Kulang ang balance!');
        currentUser.balance -= amt;
        currentUser.totalWithdraw += amt;
        document.getElementById('withIn').value = '';
        saveUser();
        alert(`✅ Na-withdraw: $${amt}`);
    });

    // ---------- DAILY CLAIM ----------
    document.getElementById('dailyClaimBtn').addEventListener('click', () => {
        if (currentUser.lastClaim) {
            const hours = (new Date() - new Date(currentUser.lastClaim)) / 3600000;
            if (hours < 24) return alert(`⏳ Subukan ulit pagkalipas ng ${Math.ceil(24-hours)} oras`);
        }
        currentUser.balance += 10;
        currentUser.lastClaim = new Date().toISOString();
        saveUser();
        alert('✅ Nakuha! +$10.00');
    });

    // ---------- COPY LINK ----------
    document.getElementById('copyLink').addEventListener('click', () => {
        navigator.clipboard.writeText(document.getElementById('refLinkOut').value);
        alert('✅ Nakopya na!');
    });

    // ---------- UNANG PAGBUBUKAS ----------
    updateAll();
});
