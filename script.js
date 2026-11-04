// ==========================================
// MINISO x Sanrio Portal — COMPLETE WORKING VERSION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // ---------- ELEMENTS ----------
    const paperBag = document.getElementById('paperBag');
    const authPanel = document.getElementById('authPanel');
    const splashScreen = document.getElementById('splashScreen');
    const mainDashboard = document.getElementById('mainDashboard');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // ---------- SKIP IF ALREADY LOGGED IN ----------
    const activeUser = localStorage.getItem('minisoActiveUser');
    if (activeUser) {
        splashScreen.style.display = 'none';
        mainDashboard.classList.remove('main-hidden');
        loadUserData(activeUser);
        initApp();
        return;
    }

    // ---------- TAP PAPER BAG → SHOW LOGIN ----------
    if (paperBag) {
        paperBag.style.cursor = 'pointer';
        paperBag.addEventListener('click', () => {
            paperBag.classList.add('opening');
            setTimeout(() => {
                paperBag.style.display = 'none';
                authPanel.classList.remove('hidden');
            }, 350);
        });
    }

    // ---------- AUTH TABS ----------
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.getAttribute('data-tab');
            document.getElementById('loginForm').classList.toggle('hidden', target !== 'login');
            document.getElementById('registerForm').classList.toggle('hidden', target !== 'register');
        });
    });

    // ---------- LOGIN FUNCTION ----------
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const user = document.getElementById('loginUser').value.trim();
            const pass = document.getElementById('loginPass').value;
            
            if (!user || !pass) {
                alert('⚠️ Ilagay ang Username at Password!');
                return;
            }

            const savedUser = JSON.parse(localStorage.getItem(`minisoUser_${user}`));
            if (savedUser && savedUser.password !== pass) {
                alert('❌ Maling Password!');
                return;
            }

            if (!savedUser) {
                createUser(user, pass);
            }

            localStorage.setItem('minisoActiveUser', user);
            enterDashboard(user);
        });
    }

    // ---------- REGISTER FUNCTION ----------
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            const user = document.getElementById('regUser').value.trim();
            const pass = document.getElementById('regPass').value;
            const refCode = document.getElementById('refCode').value.trim();
            
            if (!user || !pass) {
                alert('⚠️ Punan ang lahat ng patlang!');
                return;
            }
            if (localStorage.getItem(`minisoUser_${user}`)) {
                alert('❌ May gumagamit na ng pangalang ito!');
                return;
            }

            createUser(user, pass, refCode);
            localStorage.setItem('minisoActiveUser', user);
            enterDashboard(user);
        });
    }

    // ---------- LOGOUT ----------
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('minisoActiveUser');
            location.reload();
        });
    }

    // ---------- ENTER DASHBOARD ----------
    function enterDashboard(username) {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
            mainDashboard.classList.remove('main-hidden');
            loadUserData(username);
            initApp();
        }, 400);
    }

    // ---------- CREATE NEW USER ----------
    function createUser(username, password, refCode = null) {
        const newUser = {
            username,
            password,
            balance: 5000,
            totalDeposit: 0,
            totalWithdraw: 0,
            totalCommission: 0,
            lastClaim: null,
            orders: [],
            redeemHistory: [],
            commissionHistory: [],
            transactions: [],
            referrer: refCode || null,
            referralCode: username.toUpperCase().slice(0, 6) + Math.floor(Math.random() * 999),
            level1: [],
            level2: [],
            level3: []
        };
        localStorage.setItem(`minisoUser_${username}`, JSON.stringify(newUser));
    }

    // ---------- GLOBAL VARIABLES ----------
    let currentUser = null;

    // ---------- LOAD USER DATA ----------
    function loadUserData(username) {
        currentUser = JSON.parse(localStorage.getItem(`minisoUser_${username}`));
        if (!currentUser) {
            localStorage.removeItem('minisoActiveUser');
            location.reload();
            return;
        }
        document.getElementById('userName').textContent = username;
        updateAllDisplays();
    }

    // ---------- SAVE USER DATA ----------
    function saveUser() {
        localStorage.setItem(`minisoUser_${currentUser.username}`, JSON.stringify(currentUser));
        updateAllDisplays();
    }

    // ---------- UPDATE ALL NUMBERS ON SCREEN ----------
    function updateAllDisplays() {
        if (!currentUser) return;
        
        document.getElementById('dispBalance').textContent = currentUser.balance.toFixed(2);
        document.getElementById('dispProfit').textContent = (currentUser.balance - 5000).toFixed(2);
        document.getElementById('teamDeposit').textContent = currentUser.totalDeposit.toFixed(2);
        document.getElementById('teamComm').textContent = currentUser.totalCommission.toFixed(2);
        document.getElementById('l1Count').textContent = currentUser.level1.length;
        document.getElementById('l23Count').textContent = currentUser.level2.length + currentUser.level3.length;
        document.getElementById('accTotalDep').textContent = currentUser.totalDeposit.toFixed(2);
        document.getElementById('accTotalWith').textContent = currentUser.totalWithdraw.toFixed(2);
        document.getElementById('accActive').textContent = currentUser.orders.filter(o => o.active).length;
        document.getElementById('accBal').textContent = currentUser.balance.toFixed(2);
        document.getElementById('myRefLink').value = `https://idonstephanie189-a11y.github.io/miniso-portal/?ref=${currentUser.referralCode}`;
        
        // Daily claim button status
        const claimBtn = document.getElementById('dailyClaimBtn');
        if (claimBtn && currentUser.lastClaim) {
            const last = new Date(currentUser.lastClaim);
            const hoursPassed = (new Date() - last) / (1000 * 60 * 60);
            if (hoursPassed < 24) {
                claimBtn.disabled = true;
                claimBtn.textContent = `Try in ${Math.ceil(24 - hoursPassed)}h`;
            }
        }

        renderPlans();
        renderRedeemLog();
        renderCommLog();
        renderTransLog();
        loadSupportSettings();
    }

    // ---------- NAVIGATION BETWEEN SECTIONS ----------
    document.querySelectorAll('.nav-link, .feature-card').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href') || item.getAttribute('data-target');
            if (!targetId) return;
            
            document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
            const targetSection = document.querySelector(targetId);
            if (targetSection) targetSection.classList.add('active');
            
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            document.querySelectorAll(`[href="${targetId}"]`).forEach(link => link.classList.add('active'));
        });
    });

    // ---------- GET PLANS FROM ADMIN ----------
    function getPlans() {
        let plans = JSON.parse(localStorage.getItem('adminPlans'));
        if (!plans) {
            plans = [
                { id: 1, name: 'Pink Blossom', price: 100, daily: 5, days: 30, tag: 'Standard' },
                { id: 2, name: 'Lavender Premium', price: 500, daily: 30, days: 60, tag: 'Popular' },
                { id: 3, name: 'Mint Luxury', price: 2000, daily: 150, days: 180, tag: 'VIP' }
            ];
            localStorage.setItem('adminPlans', JSON.stringify(plans));
        }
        return plans;
    }

    // ---------- RENDER PLANS ----------
    function renderPlans() {
        const container = document.getElementById('plansContainer');
        if (!container || !currentUser) return;

        const plans = getPlans();
        container.innerHTML = plans.map(plan => {
            const isFeatured = plan.tag === 'Popular';
            return `
                <div class="plan-card ${isFeatured ? 'featured' : ''}">
                    <span class="plan-tag ${plan.tag.toLowerCase()}">${plan.tag}</span>
                    <h3>${plan.name}</h3>
                    <p class="price">$${plan.price} <small>(Demo)</small></p>
                    <ul class="features">
                        <li>Daily: $${plan.daily}</li>
                        <li>Duration: ${plan.days} Days</li>
                    </ul>
                    <button class="select-plan ${isFeatured ? 'featured-btn' : ''}"
                        data-name="${plan.name}"
                        data-price="${plan.price}"
                        data-daily="${plan.daily}"
                        data-days="${plan.days}">
                        Select Plan 💖
                    </button>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.select-plan').forEach(btn => {
            btn.addEventListener('click', () => {
                const price = parseFloat(btn.dataset.price);
                const name = btn.dataset.name;

                if (currentUser.balance < price) {
                    alert('⚠️ Kulang ang Balance! Mag-Recharge muna 💜');
                    return;
                }

                currentUser.balance -= price;
                currentUser.totalDeposit += price;
                currentUser.orders.push({
                    id: Date.now(),
                    name, price,
                    date: new Date().toLocaleString(),
                    active: true
                });

                addTransaction(`Plan: ${name}`, `-$${price.toFixed(2)}`);
                saveUser();
                alert(`✅ Napili mo: ${name}\n$${price} nabawas 💖`);
            });
        });
    }

    // ---------- RECHARGE ----------
    document.getElementById('doRecharge')?.addEventListener('click', () => {
        const amt = parseFloat(document.getElementById('depAmount').value);
        if (!amt || amt <= 0) {
            alert('⚠️ Ilagay ang tamang halaga!');
            return;
        }
        currentUser.balance += amt;
        currentUser.totalDeposit += amt;
        addTransaction('Recharge', `+$${amt.toFixed(2)}`);
        document.getElementById('depAmount').value = '';
        saveUser();
        alert(`✅ Naidagdag: $${amt} ✨`);
    });

    // ---------- WITHDRAW ----------
    document.getElementById('doWithdraw')?.addEventListener('click', () => {
        const amt = parseFloat(document.getElementById('withAmount').value);
        if (!amt || amt <= 0) {
            alert('⚠️ Ilagay ang halaga!');
            return;
        }
        if (currentUser.balance < amt) {
            alert('⚠️ Kulang ang Balance!');
            return;
        }
        currentUser.balance -= amt;
        currentUser.totalWithdraw += amt;
        addTransaction('Withdraw', `-$${amt.toFixed(2)}`);
        document.getElementById('withAmount').value = '';
        saveUser();
        alert(`✅ Na-withdraw: $${amt} 💌`);
    });

    // ---------- DAILY CLAIM ----------
    document.getElementById('dailyClaimBtn')?.addEventListener('click', () => {
        if (currentUser.lastClaim) {
            const last = new Date(currentUser.lastClaim);
            const hoursPassed = (new Date() - last) / (1000 * 60 * 60);
            if (hoursPassed < 24) {
                alert(`⏳ Subukan ulit pagkalipas ng ${Math.ceil(24 - hoursPassed)} oras`);
                return;
            }
        }
        currentUser.balance += 10;
        currentUser.lastClaim = new Date().toISOString();
        addTransaction('Daily Bonus', '+$10.00');
        saveUser();
        alert('✅ Nakuha! +$10.00 💖');
    });

    // ---------- REDEEM CODE ----------
    document.getElementById('redeemGo')?.addEventListener('click', () => {
        const codeInput = document.getElementById('redeemCodeInput').value.trim();
        if (!codeInput) {
            alert('⚠️ Ilagay ang Code!');
            return;
        }

        let codes = JSON.parse(localStorage.getItem('adminCodes')) || [];
        const match = codes.find(c => c.code === codeInput && c.active && !c.usedBy?.includes(currentUser.username));

        if (!match) {
            document.getElementById('redeemStatus').textContent = '❌ Di Tama o Nagamit na';
            document.getElementById('redeemStatus').style.color = '#FF6B6B';
            return;
        }

        if (!match.usedBy) match.usedBy = [];
        match.usedBy.push(currentUser.username);
        localStorage.setItem('adminCodes', JSON.stringify(codes));

        currentUser.balance += match.amount;
        currentUser.redeemHistory.unshift({
            code: codeInput,
            amount: `+$${match.amount.toFixed(2)}`,
            date: new Date().toLocaleString()
        });
        addTransaction('Redeem Code', `+$${match.amount.toFixed(2)}`);
        document.getElementById('redeemCodeInput').value = '';
        document.getElementById('redeemStatus').textContent = `✅ Nakuha! +$${match.amount} 💖`;
        document.getElementById('redeemStatus').style.color = '#7ED9B5';
        saveUser();
    });

    // ---------- COPY REF LINK ----------
    document.getElementById('copyRefBtn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(document.getElementById('myRefLink').value);
        alert('✅ Nakopya na! 💌');
   
