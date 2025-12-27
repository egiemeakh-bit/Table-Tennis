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
let isDarkMode = true;
let soundFiles = {
    win: null,
    promoted: null,
    comeback: null
};
let previousTotalScores = [0, 0]; // Für Comeback-Erkennung

// Score Management
function modifyScore(playerIndex, change) {
    if (change > 0) addWin(playerIndex, 0);
    else removeWin(playerIndex);
    updateUI();
    saveData();
}

function getTotalScore(pIdx) {
    return players[pIdx].scores.reduce((a, b) => a + b, 0);
}

function checkComeback(pIdx) {
    const otherIdx = pIdx === 0 ? 1 : 0;
    const currentTotal = getTotalScore(pIdx);
    const otherTotal = getTotalScore(otherIdx);
    const prevTotal = previousTotalScores[pIdx];
    const prevOtherTotal = previousTotalScores[otherIdx];
    
    // Prüfe ob Gegner 10+ Vorsprung hatte und man jetzt aufholt
    if (prevOtherTotal - prevTotal >= 10 && currentTotal >= otherTotal) {
        return true;
    }
    return false;
}

function addWin(pIdx, leagueIdx) {
    if (leagueIdx >= leagueConfig.length) return;
    
    players[pIdx].scores[leagueIdx]++;
    
    // Prüfe auf Comeback NACH dem Score-Update
    const isComeback = checkComeback(pIdx);
    
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
            
            // Aktualisiere previousTotalScores vor Promotion
            previousTotalScores[0] = getTotalScore(0);
            previousTotalScores[1] = getTotalScore(1);
            
            // Platinum ist unbegrenzt, also einfach weiter erhöhen
            addWin(pIdx, leagueIdx + 1);
            
            // Promoted Sound abspielen
            playSound('promoted');
            return;
        }
    }

    // Platinum ist unbegrenzt
    if (leagueConfig[leagueIdx].name === "Platin") {
        // Aktualisiere previousTotalScores
        previousTotalScores[0] = getTotalScore(0);
        previousTotalScores[1] = getTotalScore(1);
        
        // Prüfe auf Comeback
        if (isComeback) {
            playSound('comeback');
        } else {
            playSound('win');
        }
        return; // Keine Limitierung, einfach weiter erhöhen
    }

    // Bronze und Silber: bei 3 Wins zur nächsten Liga
    if (players[pIdx].scores[leagueIdx] >= 3) {
        players[0].scores[leagueIdx] = 0;
        players[1].scores[leagueIdx] = 0;
        
        // Aktualisiere previousTotalScores vor Promotion
        previousTotalScores[0] = getTotalScore(0);
        previousTotalScores[1] = getTotalScore(1);
        
        addWin(pIdx, leagueIdx + 1);
        
        // Promoted Sound abspielen
        playSound('promoted');
        return;
    }
    
    // Aktualisiere previousTotalScores
    previousTotalScores[0] = getTotalScore(0);
    previousTotalScores[1] = getTotalScore(1);
    
    // Normales Win (kein Promotion)
    if (isComeback) {
        playSound('comeback');
    } else {
        playSound('win');
    }
}

function removeWin(pIdx) {
    if (players[pIdx].scores[0] > 0) {
        players[pIdx].scores[0]--;
        previousTotalScores[0] = getTotalScore(0);
        previousTotalScores[1] = getTotalScore(1);
    }
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
    // Aktualisiere Delete-Button Sichtbarkeit
    const select = document.getElementById('game-select');
    const deleteBtn = document.getElementById('delete-game-btn');
    if (select && deleteBtn) {
        deleteBtn.style.display = (select.value && select.value !== '') ? 'block' : 'none';
    }
}

function closeSettings() {
    document.getElementById('settings-popup').classList.remove('active');
    document.getElementById('reset-confirmation').style.display = 'none';
    document.getElementById('delete-confirmation').style.display = 'none';
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
    const deleteBtn = document.getElementById('delete-game-btn');
    
    if (select.value === '') {
        newGameTitle.style.display = 'block';
        createBtn.style.display = 'block';
        deleteBtn.style.display = 'none';
    } else {
        newGameTitle.style.display = 'none';
        createBtn.style.display = 'none';
        deleteBtn.style.display = 'block';
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

function showDeleteConfirmation() {
    document.getElementById('delete-confirmation').style.display = 'block';
}

function cancelDelete() {
    document.getElementById('delete-confirmation').style.display = 'none';
}

// Close popups when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('popup-overlay')) {
        closeSettings();
        closeAchievements();
    }
});

// Verhindere Double-Tap-Zoom auf Mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Verhindere Pinch-Zoom
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

document.addEventListener('gesturechange', function (e) {
    e.preventDefault();
});

document.addEventListener('gestureend', function (e) {
    e.preventDefault();
});

// Verhindere Zoom mit Strg+/- oder Cmd+/-
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.keyCode === 61 || e.keyCode === 107 || e.keyCode === 173 || e.keyCode === 109 || e.keyCode === 187 || e.keyCode === 189)) {
        e.preventDefault();
    }
});

// Verhindere Zoom mit Mausrad bei gedrückter Strg/Cmd
document.addEventListener('wheel', function(e) {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
    }
}, { passive: false });

// Theme Toggle
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('light-mode', !isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    
    if (isDarkMode) {
        // Sonne (Light Mode Icon)
        icon.innerHTML = `
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
    } else {
        // Mond (Dark Mode Icon)
        icon.innerHTML = `
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `;
    }
}

// Sound Management
async function handleSoundUpload(type) {
    const input = document.getElementById(`${type}-sound-input`);
    const preview = document.getElementById(`${type}-sound-preview`);
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Konvertiere File zu Base64 für persistente Speicherung
        const reader = new FileReader();
        reader.onload = async function(e) {
            const base64 = e.target.result;
            soundFiles[type] = base64;
            preview.src = base64;
            preview.style.display = 'block';
            
            // Speichere in Datenbank
            if (currentGameId) {
                try {
                    const soundColumn = `sound_${type}`;
                    const updateData = {};
                    updateData[soundColumn] = base64;
                    
                    const { error } = await supabaseClient.from('games').update(updateData).eq('id', currentGameId);
                    if (error) throw error;
                } catch (err) {
                    console.error("Fehler beim Speichern des Sounds:", err.message);
                    alert('Fehler beim Speichern des Sounds!');
                }
            }
        };
        reader.readAsDataURL(file);
    }
}

function testSound(type) {
    if (soundFiles[type]) {
        const audio = new Audio(soundFiles[type]);
        audio.volume = 1.0;
        audio.play().catch(e => console.error('Sound konnte nicht abgespielt werden:', e));
        
        // Nach 5 Sekunden langsam ausfaden
        setTimeout(() => {
            const fadeOutInterval = setInterval(() => {
                if (audio.volume > 0.05) {
                    audio.volume -= 0.05;
                } else {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.volume = 1.0;
                    clearInterval(fadeOutInterval);
                }
            }, 50);
        }, 5000);
    } else {
        alert('Bitte lade zuerst eine Sound-Datei hoch!');
    }
}

let activeAudioInstances = [];

function playSound(type) {
    if (soundFiles[type]) {
        const audio = new Audio(soundFiles[type]);
        audio.volume = 1.0;
        
        // Stoppe alle laufenden Sounds
        activeAudioInstances.forEach(a => {
            a.pause();
            a.currentTime = 0;
        });
        activeAudioInstances = [];
        
        audio.play().catch(e => console.error('Sound konnte nicht abgespielt werden:', e));
        activeAudioInstances.push(audio);
        
        // Nach 5 Sekunden langsam ausfaden
        setTimeout(() => {
            const fadeOutInterval = setInterval(() => {
                if (audio.volume > 0.05) {
                    audio.volume -= 0.05;
                } else {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.volume = 1.0;
                    clearInterval(fadeOutInterval);
                    const index = activeAudioInstances.indexOf(audio);
                    if (index > -1) {
                        activeAudioInstances.splice(index, 1);
                    }
                }
            }, 50); // Alle 50ms um 0.05 reduzieren (ca. 1 Sekunde Fade-Out)
        }, 5000);
    }
}

function loadSounds() {
    // Sounds werden jetzt aus der Datenbank geladen, nicht mehr aus localStorage
    // Diese Funktion wird von loadGameData aufgerufen
}

function displaySounds() {
    ['win', 'promoted', 'comeback'].forEach(type => {
        if (soundFiles[type]) {
            const preview = document.getElementById(`${type}-sound-preview`);
            if (preview) {
                preview.src = soundFiles[type];
                preview.style.display = 'block';
            }
        }
    });
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    // Load theme
    const savedTheme = localStorage.getItem('theme');
    isDarkMode = savedTheme !== 'light';
    if (!isDarkMode) {
        document.body.classList.add('light-mode');
    }
    updateThemeIcon();
    
    // Initialize previousTotalScores
    previousTotalScores[0] = getTotalScore(0);
    previousTotalScores[1] = getTotalScore(1);
    
    // Load data (Sounds werden in loadGameData geladen)
    loadData();
});
