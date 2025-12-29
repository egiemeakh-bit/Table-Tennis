/**
 * AI Commentator for Table Tennis Liquid
 * Powered by Puter.js
 */

class AICommentator {
    constructor() {
        this.isMuted = false;
        this.isSpeaking = false;
        this.lastCommentTime = 0;
        this.mode = localStorage.getItem('ai_personality') || 'professional'; 

        this.initUI();
    }

    initUI() {
        // Blende das API-Feld aus und style die Modus-Buttons
        const style = document.createElement('style');
        style.innerHTML = `
            #ai-api-key-container { display: none !important; }
            .mode-toggle { display: flex; gap: 10px; margin-top: 10px; margin-bottom: 20px; }
            .mode-btn { 
                flex: 1; 
                padding: 12px; 
                border-radius: 14px; 
                border: 1px solid rgba(255,255,255,0.1); 
                background: rgba(255,255,255,0.05); 
                color: white; 
                cursor: pointer;
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
                font-weight: 500;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .mode-btn.active { 
                background: white; 
                color: black; 
                box-shadow: 0 4px 20px rgba(255,255,255,0.4);
                transform: scale(1.02);
            }
        `;
        document.head.appendChild(style);

        // Sicherer UI-Einschub
        setTimeout(() => {
            const popupContent = document.querySelector('#ai-settings-popup .popup-content');
            if (popupContent) {
                // Wir erstellen eine Sektion für die Persönlichkeit
                const modeSection = document.createElement('div');
                modeSection.className = 'settings-group';
                modeSection.style.marginTop = '20px';
                modeSection.innerHTML = `
                    <label style="display:block; margin-bottom:8px; font-size:0.75rem; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:1px;">KI Charakter</label>
                    <div class="mode-toggle">
                        <button id="mode-pro" class="mode-btn ${this.mode === 'professional' ? 'active' : ''}" onclick="commentator.setMode('professional')">Pro</button>
                        <button id="mode-trash" class="mode-btn ${this.mode === 'trash' ? 'active' : ''}" onclick="commentator.setMode('trash')">Trash Talk</button>
                    </div>
                `;
                
                // Wir hängen es einfach VOR dem letzten Button (Schließen) an
                const closeBtn = popupContent.querySelector('button:last-of-type');
                if (closeBtn) {
                    popupContent.insertBefore(modeSection, closeBtn);
                } else {
                    popupContent.appendChild(modeSection);
                }
            }
        }, 1000);
    }

    setMode(m) {
        this.mode = m;
        localStorage.setItem('ai_personality', m);
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.getElementById(m === 'professional' ? 'mode-pro' : 'mode-trash');
        if (activeBtn) activeBtn.classList.add('active');
    }

    async onScoreChange(p1Scores, p2Scores, p1Name, p2Name, eventType) {
        if (this.isMuted || this.isSpeaking) return;

        const now = Date.now();
        if (now - this.lastCommentTime < 4000) return;
        this.lastCommentTime = now;

        this.setUIState('thinking');

        // Umfassender Kontext für die KI (Liquid Glass Deep Logic)
        const context = `
        Rolle: Live-Kommentator für Tischtennis.
        Charakter: ${this.mode === 'trash' ? 'Extremer Trash-Talk, sarkastisch, beleidigt Verlierer leicht, feiert Fehler.' : 'Professionell, hochemotional, wie ein TV-Profi.'}
        
        Spielstand-Daten:
        - ${p1Name}: [B:${p1Scores[0]}, S:${p1Scores[1]}, G:${p1Scores[2]}, P:${p1Scores[3]}]
        - ${p2Name}: [B:${p2Scores[0]}, S:${p2Scores[1]}, G:${p2Scores[2]}, P:${p2Scores[3]}]
        
        Event: ${eventType}. 
        HINWEIS: Wenn Scores einer Liga auf 0 sinken, gab es einen Aufstieg in die Liga darüber!
        
        Anweisung: Schreib 2 kurze, knackige Sätze auf Deutsch. Antworte NUR mit dem Sprechtext.
        `;

        try {
            const response = await puter.ai.chat(context);
            const text = response.toString().trim();
            if (text) this.speak(text);
        } catch (error) {
            console.error("Puter Error:", error);
            this.setUIState('idle');
        }
    }

    speak(text) {
        window.speechSynthesis.cancel();
        this.setUIState('speaking');
        this.isSpeaking = true;

        const ut = new SpeechSynthesisUtterance(text);
        ut.lang = 'de-DE';
        ut.rate = 1.1; 
        
        const voices = window.speechSynthesis.getVoices();
        ut.voice = voices.find(v => v.name.includes('Google') && v.lang.includes('de')) || 
                   voices.find(v => v.lang.includes('de'));

        ut.onend = () => {
            this.setUIState('idle');
            this.isSpeaking = false;
        };

        window.speechSynthesis.speak(ut);
    }

    setUIState(state) {
        const orb = document.getElementById('ai-orb');
        if (!orb) return;
        orb.classList.remove('thinking', 'speaking');
        if (state !== 'idle') orb.classList.add(state);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const orb = document.getElementById('ai-orb');
        const muteBtn = document.getElementById('ai-mute-btn');
        if (orb) orb.classList.toggle('muted', this.isMuted);
        if (muteBtn) muteBtn.innerText = this.isMuted ? "KI Aktivieren" : "Stummschalten";
        if (this.isMuted) window.speechSynthesis.cancel();
    }
}

// Instanz
const commentator = new AICommentator();

// Globale Fenster-Funktionen (Apple Style)
window.toggleAISettings = () => {
    const p = document.getElementById('ai-settings-popup');
    if (p) p.style.display = (p.style.display === 'none') ? 'flex' : 'none';
};

window.closeAISettings = () => {
    const p = document.getElementById('ai-settings-popup');
    if (p) p.style.display = 'none';
};

window.toggleAIMute = () => {
    commentator.toggleMute();
};