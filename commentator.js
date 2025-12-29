class AICommentator {
    constructor() {
        this.isMuted = false;
        this.isSpeaking = false;
        this.mode = localStorage.getItem('ai_mode') || 'professional'; // professional oder trash

        // UI für Modus-Switch in Settings einfügen
        this.initSettings();
    }

    initSettings() {
        // Versteckt API-Feld und fügt Modus-Buttons hinzu
        const style = document.createElement('style');
        style.innerHTML = '#ai-api-key-container { display: none !important; } .ai-mode-btn { background: var(--glass-bg); border: 1px solid var(--glass-border); color: white; padding: 10px; border-radius: 10px; cursor: pointer; flex: 1; margin: 5px; } .ai-mode-btn.active { background: white; color: black; }';
        document.head.appendChild(style);

        setTimeout(() => {
            const popup = document.querySelector('#ai-settings-popup .popup-content');
            if (popup) {
                const modeContainer = document.createElement('div');
                modeContainer.innerHTML = `
                    <label style="display:block; margin-top:15px;">KI Persönlichkeit</label>
                    <div style="display:flex;">
                        <button class="ai-mode-btn ${this.mode==='professional'?'active':''}" onclick="commentator.setMode('professional')">Professionell</button>
                        <button class="ai-mode-btn ${this.mode==='trash'?'active':''}" onclick="commentator.setMode('trash')">Trash Talk</button>
                    </div>
                `;
                popup.insertBefore(modeContainer, popup.querySelector('button'));
            }
        }, 500);
    }

    setMode(m) {
        this.mode = m;
        localStorage.setItem('ai_mode', m);
        document.querySelectorAll('.ai-mode-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
    }

    async onScoreChange(p1S, p2S, p1N, p2N, eventType, extraInfo = {}) {
        if (this.isMuted || this.isSpeaking) return;
        this.setUI('thinking');

        // Die KI erhält das volle Wissen über die Spielmechanik
        const context = `
        REGELN: 4 Ligen (Bronze, Silber, Gold, Platin). Bei Aufstieg werden alle Pkt darunter auf 0 gesetzt.
        SPIELSTAND:
        ${p1N}: Bronze(${p1S[0]}), Silber(${p1S[1]}), Gold(${p1S[2]}), Platin(${p1S[3]})
        ${p2N}: Bronze(${p2S[0]}), Silber(${p2S[1]}), Gold(${p2S[2]}), Platin(${p2S[3]})
        EREIGNIS: ${eventType} (z.B. Punkt, Aufstieg, Comeback).
        PERSÖNLICHKEIT: ${this.mode === 'trash' ? 'Extremer Trash-Talk, sarkastisch, beleidigt den Verlierer leicht' : 'Professioneller TV-Kommentator, sachlich aber begeistert'}.
        AUFGABE: 2 Sätze Kommentar auf Deutsch.
        `;

        try {
            const response = await puter.ai.chat(context);
            this.speak(response.toString());
        } catch (e) {
            console.error("AI Error", e);
            this.setUI('idle');
        }
    }

    speak(text) {
        window.speechSynthesis.cancel();
        this.setUI('speaking');
        this.isSpeaking = true;
        const ut = new SpeechSynthesisUtterance(text);
        ut.lang = 'de-DE';
        ut.rate = 1.1;
        const voices = window.speechSynthesis.getVoices();
        ut.voice = voices.find(v => v.name.includes("Google") && v.lang.includes("de")) || voices.find(v => v.lang.includes("de"));
        ut.onend = () => { this.setUI('idle'); this.isSpeaking = false; };
        window.speechSynthesis.speak(ut);
    }

    setUI(state) {
        const orb = document.querySelector('.ai-orb');
        if (orb) {
            orb.classList.remove('thinking', 'speaking');
            if (state !== 'idle') orb.classList.add(state);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        document.querySelector('.ai-orb').classList.toggle('muted', this.isMuted);
    }
}

const commentator = new AICommentator();