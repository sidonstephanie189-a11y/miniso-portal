// ==========================================
// MINISO Member Portal — DEMO VERSION
// Complete: Splash Bag → Login/Register → Dashboard
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // ---------- SPLASH PAPER BAG ----------
    const paperBag = document.getElementById('paperBag');
    const authPanel = document.getElementById('authPanel');
    const splashScreen = document.getElementById('splashScreen');
    const mainDashboard = document.getElementById('mainDashboard');

    // ---------- CHECK SESSION ----------
    const activeUser = localStorage.getItem('minisoActiveUser');
    if (activeUser) {
        // Skip splash & auth if already logged in
        splashScreen.style.display = 'none';
        mainDashboard.classList.remove('main-hidden');
        loadUserData(activeUser);
        initApp();
    }

    // ---------- OPEN BAG → SHOW AUTH ----------
    if (paperBag) {
        paperBag.addEventListener('click', () => {
            paperBag.style.transform = 'scale(0.8) rotate(2deg)';
            paperBag.style.opacity = '0';
            setTimeout(() => {
                paperBag.style.display = 'none';
                authPanel.classList.remove('hidden');
                authPanel.style.animation = 'fadeInUp 0.5s ease forwards';
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

    // ---------- LOGIN ----------
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const user = document.getElementById('loginUser').value.trim();
            const pass = document.getElementById('loginPass').value;
            if (!user || !pass) return alert('⚠️ Fill in all fields!');
            
            const savedUser = JSON.parse(localStorage.getItem(`minisoUser_${user}`));
            if (savedUser && savedUser.password !== pass) {
                return alert('❌ Incorrect password!');
            }
            if (!savedUser) {
                // Auto-register new user on first login
                createUser(user, pass);
            }

            localStorage.setItem('minisoActiveUser', user);
            closeAuthAndEnter(user);
        });
    }

    // ---------- REGISTER ----------
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            const user = document.getElementById('regUser').value.trim();
            const pass = document.getElementById('regPass').value;
            const refInput = document.getElementById('refCode').value.trim();
            
            if (!user || !pass) return alert('⚠️ Fill in username & password!');
            if (localStorage.getItem(`minisoUser_${user}`)) {
                return alert('❌ Username already exists!');
            }

            createUser(user, pass, refInput);
            localStorage.setItem('minisoActiveUser', user);
            closeAuthAndEnter(user);
        });
    }

    // ---------- LOGOUT ----------
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('minisoActiveUser');
            location.reload();
        });
    }

    // ---------- CLOSE AUTH → SHOW DASHBOARD ----------
    function closeAuthAndEnter(username) {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
            mainDashboard.classList.remove('main-hidden');
            loadUserData(username);
            initApp();
        }, 400);
    }

    // ---------- CREATE NEW USER RECORD ----------
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
            referralCode: username.toUpperCase().slice(0, 6) + Math.floor(Math.random()*999),
            level1: [],
            level2: [],
            level3: []
        };
        localStorage.setItem(`minisoUser_${username}`, JSON.stringify(newUser));
        
        // Credit referrer if valid
        if (refCode) creditReferrer(username, refCode);
    }

    // ---------- LOAD CURRENT USER DATA ----------
    let currentUser = null;
    function loadUserData(username) {
        currentUser = JSON.parse(localStorage.getItem(`minisoUser_${username}`));
        document.getElementById('userName').textContent = username;
        updateAllDisplays();
    }

    // ---------- SAVE CURRENT USER ----------
    function saveUser() {
        localStorage.setItem(`minisoUser_${currentUser.username}`, JSON.stringify(currentUser));
        updateAllDisplays();
    }

    // ---------- REFERRER COMMISSION LOGIC ----------
    function creditReferrer(newUser, refCode) {
        // Level 1 = direct referrer
        const refUserKey = Object.keys(localStorage).find(
            k => k.startsWith('minisoUser_') && 
                 JSON.parse(localStorage.getItem(k)).referralCode === refCode
        );
        if (!refUserKey) return;

        const refUser = JSON.parse(localStorage.getItem(refUserKey));
        refUser.level1.push(newUser);
        localStorage.setItem(refUserKey, JSON.stringify(refUser));

        // Level 2 & 3 chain
        if (refUser.referrer) {
            const l2Key = Object.keys(localStorage).find(
                k => k.startsWith('minisoUser_') && 
                     JSON.parse(localStorage.getItem(k)).referralCode === refUser.referrer
            );
            if (l2Key) {
                const l2User = JSON.parse(localStorage.getItem(l2Key));
                l2User.level2.push(newUser);
                localStorage.setItem(l2Key, JSON.stringify(l2User));
                
                if (l2User.referrer) {
                    const l3Key = Object.keys(localStorage).find(
                        k => k.startsWith('minisoUser_') && 
                             JSON.parse(localStorage.getItem(k)).referralCode === l2User.referrer
                    );
                    if (l3Key) {
                        const l3User = JSON.parse(localStorage.getItem(l3Key));
                        l3User.level3.push(newUser);
                        localStorage.setItem(l3Key, JSON.stringify(l3User));
                    }
                }
            }
        }
    }

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

    // ---------- GET REDEEM CODES FROM ADMIN ----------
    function getRedeemCodes() {
        let codes = JSON.parse(localStorage.getItem('adminCodes'));
        if (!codes) codes = [];
        return codes;
    }

    // ---------- GET SUPPORT SETTINGS FROM ADMIN ----------
    function getSupportSettings() {
        let settings = JSON.parse(localStorage.getItem('adminSupport'));
        if (!settings) {
            settings = {
                telegramLink: '#',
                telegramText: 'Official MINISO Demo Group',
                supportInfo: 'demo@miniso-portal.fake'
            };
        }
        return settings;
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

        // Attach click listeners
        container.querySelectorAll('.select-plan').forEach(btn => {
            btn.addEventListener('click', () => {
                const price = parseFloat(btn.dataset.price);
                const daily = parseFloat(btn.dataset.daily);
                const days = parseInt(btn.dataset.days);
                const name = btn.dataset.name;

                if (currentUser.balance < price) {
                    return alert('⚠️ Insufficient balance! Recharge first 💜');
                }

                currentUser.balance -= price;
                currentUser.totalDeposit += price;
                currentUser.orders.push({
                    id: Date.now(),
                    name, price, dailyIncome: daily, daysLeft: days,
                    date: new Date().toLocaleString(), active: true
                });

                // Credit commissions to uplines
                creditCommissions(price);

                addTransaction(`Plan: ${name}`, `-$${price.toFixed(2)}`);
                saveUser();
                alert(`✅ Plan Selected: ${name}\n$${price} deducted 💖`);
            });
        });
    }

    // ---------- CREDIT COMMISSIONS ----------
    function creditCommissions(planPrice) {
        // L1 = 30%, L2 = 5%, L3 = 1%
        const l1Amount = planPrice * 0.30;
        const l2Amount = planPrice * 0.05;
        const l3Amount = planPrice * 0.01;

        // Find and credit uplines
        Object.keys(localStorage).forEach(key => {
            if (!key.startsWith('minisoUser_') || key === `minisoUser_${currentUser.username}`) return;
            
            const user = JSON.parse(localStorage.getItem(key));
            let credited = false;

            // Check if current user is in their L1
            if (user.level1.includes(currentUser.username)) {
                user.balance += l1Amount;
                user.totalCommission += l1Amount;
                user.commissionHistory.unshift({
                    type: 'Level 1 Commission',
                    amount: `+$${l1Amount.toFixed(2)}`,
                    from: currentUser.username,
                    date: new Date().toLocaleString()
                });
                credited = true;
            }
            // L2
            if (!credited && user.level2.includes(currentUser.username)) {
                user.balance += l2Amount;
                user.totalCommission += l2Amount;
                user.commissionHistory.unshift({
                    type: 'Level 2 Commission',
                    amount: `+$${l2Amount.toFixed(2)}`,
                    from: currentUser.username,
                    date: new Date().toLocaleString()
                });
                credited = true;
            }
            // L3
            if (!credited && user.level3.includes(currentUser.username)) {
                user.balance += l3Amount;
                user.totalCommission += l3Amount;
                user.commissionHistory.unshift({
                    type: 'Level 3 Commission',
                    amount: `+$${l3Amount.toFixed(2)}`,
                    from: currentUser.username,
                    date: new Date().toLocaleString()
                });
            }

            localStorage.setItem(key, JSON.stringify(user));
        });
    }

    // ---------- REDEEM CODE ----------
    const redeemBtn = document.getElementById('redeemGo');
    if (redeemBtn) {
        redeemBtn.addEventListener('click', () => {
            const codeInput = document.getElementById('redeemCodeInput').value.trim();
            const codes = getRedeemCodes();
            const match = codes.find(c => c.code === codeInput && c.active && !c.usedBy?.includes(currentUser.username));

            if (!match) {
                document.getElementById('redeemStatus').textContent = '❌ Invalid or already used code';
                document.getElementById('redeemStatus').style.color = '#FF6B6B';
                return;
            }

            // Mark as used
            if (!match.usedBy) match.usedBy = [];
            match.usedBy.push(currentUser.username);
            localStorage.setItem('adminCodes', JSON.stringify(codes));

            // Add funds
            currentUser.balance += match.amount;
            currentUser.redeemHistory.unshift({
                code: codeInput,
                amount: `+$${match.amount.toFixed(2)}`,
                date: new Date().toLocaleString()
            });
            addTransaction('Redeem Code', `+$${match.amount.toFixed(2)}`);
            saveUser();

            document.getElementById('redeemStatus').textContent = `✅ Redeemed! +$${match.amount} added 💖`;
            document.getElementById('redeemStatus').style.color = '#7ED9B5';
            document.getElementById('redeemCodeInput').value = '';
        });
    }

    // ---------- DAILY CLAIM ----------
    const claimBtn = document.getElementById('dailyClaimBtn');
    if (claimBtn) {
        claimBtn.addEventListener('click', () => {
            const now = new Date();
            if (currentUser.lastClaim) {
                const last = new Date(currentUser.lastClaim);
                const hoursPass
