// League Configuration
const leagueConfig = [
    { name: "Bronze", class: "bronze" },
    { name: "Silber", class: "silver" },
    { name: "Gold", class: "gold" },
    { name: "Platin", class: "platinum" }
];

// Game State
let players = [{ scores: [0, 0, 0, 0] }, { scores: [0, 0, 0, 0] }];
let currentGameId = null;
let playerNames = ["Spieler 1", "Spieler 2"];

// Score Management
function modifyScore(playerIndex, change) {
    if (change > 0) addWin(playerIndex, 0);
    else removeWin(playerIndex);
    updateUI();
    saveData();
}

function addWin(pIdx, leagueIdx) {
    if (leagueIdx >= leagueConfig.length) return;
    players[pIdx].scores[leagueIdx]++;

    // Gold ist auf 3 limitiert
    if (leagueConfig[leagueIdx].name === "Gold") {
        if (players[pIdx].scores[leagueIdx] >= 3) {
            // Reset alles unter Platinum (Bronze, Silber, Gold)
            for (let i = 0; i < players.length; i++) {
                for (let l = 0; l < leagueIdx; l++) players[i].scores[l] = 0;
            }
            // Setze Gold zurück auf 0
            players[0].scores[leagueIdx] = 0;
            players[1].scores[leagueIdx] = 0;
            // Platinum ist unbegrenzt, also einfach weiter erhöhen
            addWin(pIdx, leagueIdx + 1);
        }
        return;
    }

    // Platinum ist unbegrenzt
    if (leagueConfig[leagueIdx].name === "Platin") {
        return; // Keine Limitierung, einfach weiter erhöhen
    }

    // Bronze und Silber: bei 3 Wins zur nächsten Liga
    if (players[pIdx].scores[leagueIdx] >= 3) {
        players[0].scores[leagueIdx] = 0;
        players[1].scores[leagueIdx] = 0;
        addWin(pIdx, leagueIdx + 1);
    }
}

function removeWin(pIdx) {
    if (players[pIdx].scores[0] > 0) players[pIdx].scores[0]--;
}

// UI Updates
function updateUI() {
    [0, 1].forEach(pIdx => {
        const p = players[pIdx];
        document.getElementById(pIdx === 0 ? 'p1-display' : 'p2-display').innerText = p.scores[0];
        const container = document.getElementById(pIdx === 0 ? 'p1-leagues' : 'p2-leagues');
        container.innerHTML = '';
        
        // Auf Mobile: Silber unten, Gold darüber, Platinum oben
        // Reihenfolge: Silber (idx 1), Gold (idx 2), Platinum (idx 3)
        // Auf Mobile sollen sie in umgekehrter Reihenfolge angezeigt werden: Platinum, Gold, Silber
        const isMobile = window.innerWidth <= 768;
        const leaguesToShow = [];
        
        leagueConfig.forEach((league, idx) => {
            if (idx === 0) return; // Bronze überspringen
            leaguesToShow.push({ league, idx });
        });
        
        // Auf Mobile umkehren für vertikale Anzeige: Platinum oben, Gold Mitte, Silber unten
        if (isMobile) {
            leaguesToShow.reverse();
        }
        
        leaguesToShow.forEach(({ league, idx }) => {
            const item = document.createElement('div');
            item.className = `league-item ${league.class} ${p.scores[idx] > 0 ? 'active' : ''}`;
            item.innerHTML = `<div class="league-left"><div class="league-icon"></div><div class="league-name">${league.name}</div></div><div class="league-count">${p.scores[idx]}</div>`;
            container.appendChild(item);
        });
    });
}

// Update UI when window is resized to handle mobile/desktop switch
window.addEventListener('resize', () => {
    updateUI();
});

function updatePlayerNames() {
    document.getElementById('p1-header').textContent = playerNames[0];
    document.getElementById('p2-header').textContent = playerNames[1];
    const p1Input = document.getElementById('p1-name-input');
    const p2Input = document.getElementById('p2-name-input');
    if (p1Input) p1Input.value = playerNames[0];
    if (p2Input) p2Input.value = playerNames[1];
}

// Popup Functions
function openSettings() {
    document.getElementById('settings-popup').classList.add('active');
    updatePlayerNames();
}

function closeSettings() {
    document.getElementById('settings-popup').classList.remove('active');
    document.getElementById('reset-confirmation').style.display = 'none';
}

function openAchievements() {
    document.getElementById('achievements-popup').classList.add('active');
}

function closeAchievements() {
    document.getElementById('achievements-popup').classList.remove('active');
}

function onGameSelect() {
    const select = document.getElementById('game-select');
    const newGameTitle = document.getElementById('new-game-title');
    const createBtn = document.getElementById('create-game-btn');
    
    if (select.value === '') {
        newGameTitle.style.display = 'block';
        createBtn.style.display = 'block';
    } else {
        newGameTitle.style.display = 'none';
        createBtn.style.display = 'none';
        currentGameId = parseInt(select.value);
        loadGameData(currentGameId);
    }
}

async function savePlayerNames() {
    playerNames[0] = document.getElementById('p1-name-input').value.trim() || 'Spieler 1';
    playerNames[1] = document.getElementById('p2-name-input').value.trim() || 'Spieler 2';
    updatePlayerNames();
    await saveData();
}

function showResetConfirmation() {
    document.getElementById('reset-confirmation').style.display = 'block';
}

function cancelReset() {
    document.getElementById('reset-confirmation').style.display = 'none';
}

// Close popups when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('popup-overlay')) {
        closeSettings();
        closeAchievements();
    }
});

// Verhindere Zoom komplett - Stärkere Implementierung
(function() {
    let lastTouchEnd = 0;
    let touchStartDistance = 0;
    
    // Verhindere Double-Tap-Zoom
    document.addEventListener('touchend', function (event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
            event.stopPropagation();
        }
        lastTouchEnd = now;
    }, { passive: false });
    
    // Verhindere Pinch-Zoom
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            touchStartDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    }, { passive: false });
    
    document.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });
    
    // Verhindere Gesture-Zoom (iOS Safari)
    document.addEventListener('gesturestart', function (e) {
        e.preventDefault();
        e.stopPropagation();
    }, { passive: false });
    
    document.addEventListener('gesturechange', function (e) {
        e.preventDefault();
        e.stopPropagation();
    }, { passive: false });
    
    document.addEventListener('gestureend', function (e) {
        e.preventDefault();
        e.stopPropagation();
    }, { passive: false });
    
    // Verhindere Zoom mit Strg+/- oder Cmd+/-
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && (e.keyCode === 61 || e.keyCode === 107 || e.keyCode === 173 || e.keyCode === 109 || e.keyCode === 187 || e.keyCode === 189 || e.key === '+' || e.key === '-' || e.key === '=')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, { passive: false });
    
    // Verhindere Zoom mit Mausrad bei gedrückter Strg/Cmd
    document.addEventListener('wheel', function(e) {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, { passive: false });
    
    // Verhindere Zoom durch Viewport-Manipulation
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no');
    }
    
    // Verhindere Zoom durch Text-Größenänderung
    document.addEventListener('DOMContentLoaded', function() {
        const style = document.createElement('style');
        style.textContent = `
            * {
                -webkit-text-size-adjust: 100% !important;
                -moz-text-size-adjust: 100% !important;
                -ms-text-size-adjust: 100% !important;
                text-size-adjust: 100% !important;
            }
        `;
        document.head.appendChild(style);
    });
})();

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    loadData();
});