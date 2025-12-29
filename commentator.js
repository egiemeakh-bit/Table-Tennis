class AICommentator {
    constructor() {
        this.isMuted = false;
        this.isSpeaking = false;
        this.lastCommentTime = 0;

        // Sofortiges Ausblenden der API-Einstellungen
        const style = document.createElement('style');
        style.innerHTML = '#ai-api-key-container, .settings-group:has(#ai-api-key) { display: none !important; }';
        document.head.appendChild(style);
    }

    async onScoreChange(p1S, p2S, p1N, p2N, type) {
        if (this.isMuted || this.isSpeaking) return;
        
        // Cooldown auf 3 Sek reduziert für mehr Action
        if (Date.now() - this.lastCommentTime < 3000) return;
        this.lastCommentTime = Date.now();

        this.setUI('thinking');

        // Wir halten den Prompt extrem kurz, das beschleunigt die Generierung massiv
        const shortPrompt = `Moderator: ${p1N} ${p1S} pkt, ${p2N} ${p2S} pkt. Event: ${type}. Kurz & emotional, max 2 Sätze. Deutsch.`;

        try {
            // Wir nutzen puter.ai.chat mit einer niedrigen Wortzahl-Vorgabe (implizit durch Prompt)
            // Puter wählt automatisch das schnellste verfügbare Modell
            const response = await puter.ai.chat(shortPrompt);
            const text = response.toString().trim();
            
            if (text) {
                this.speak(text);
            }
        } catch (e) {
            console.error("Speed Error:", e);
            // Bei Fehler sofortiger Retry ohne Verzögerung
            this.onScoreChange(p1S, p2S, p1N, p2N, type);
        }
    }

    speak(text) {
        // Falls noch was im Puffer ist, sofort löschen
        window.speechSynthesis.cancel();
        
        this.setUI('speaking');
        this.isSpeaking = true;

        const ut = new SpeechSynthesisUtterance(text);
        ut.lang = 'de-DE';
        
        // Etwas schnelleres Sprechen wirkt "aufgeregter" und moderner
        ut.rate = 1.15; 
        ut.pitch = 1.0;
        
        const voices = window.speechSynthesis.getVoices();
        // Google Stimmen sind meist schneller in der Initialisierung
        ut.voice = voices.find(v => v.name.includes("Google") && v.lang.includes("de")) || 
                   voices.find(v => v.lang.includes("de"));

        ut.onend = () => {
            this.setUI('idle');
            this.isSpeaking = false;
        };
        
        window.speechSynthesis.speak(ut);
    }

    setUI(state) {
        const orb = document.querySelector('.ai-orb');
        if (!orb) return;
        orb.classList.remove('thinking', 'speaking');
        if (state !== 'idle') orb.classList.add(state);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        document.querySelector('.ai-orb').classList.toggle('muted', this.isMuted);
        if (this.isMuted) window.speechSynthesis.cancel();
    }
}

const commentator = new AICommentator();