class AICommentator {
    constructor() {
        this.isMuted = false;
        this.isSpeaking = false;
        this.lastCommentTime = 0;

        // UI-Check: Wir entfernen das manuelle API-Feld, da Puter keinen Key braucht
        const hideInterval = setInterval(() => {
            const apiField = document.getElementById('ai-api-key');
            if (apiField) {
                apiField.closest('.settings-group').style.display = 'none';
                clearInterval(hideInterval);
            }
        }, 100);
    }

    async onScoreChange(p1S, p2S, p1N, p2N, type) {
        if (this.isMuted || this.isSpeaking) return;
        
        // Cooldown 4 Sek.
        if (Date.now() - this.lastCommentTime < 4000) return;
        this.lastCommentTime = Date.now();

        this.setUI('thinking');

        const prompt = `Du bist ein leidenschaftlicher Tischtennis-Moderator. 
        Stand: ${p1N} (${p1S}) gegen ${p2N} (${p2S}). Ereignis: ${type}.
        Schreibe einen mitreißenden, professionellen Live-Kommentar (3-4 Sätze). 
        Analysiere kurz die Stimmung. Nutze keine Emojis. Sprache: Deutsch.`;

        try {
            // Puter.js AI Call - Kein API Key nötig!
            const response = await puter.ai.chat(prompt);
            const text = response.toString();
            
            if (text) {
                this.speak(text);
            } else {
                throw new Error("Empty response");
            }
        } catch (e) {
            console.error("Puter AI Error:", e);
            this.setUI('idle');
            // Bei Puter-Fehlern versuchen wir es nach 2 Sek erneut
            setTimeout(() => this.onScoreChange(p1S, p2S, p1N, p2N, type), 2000);
        }
    }

    speak(text) {
        window.speechSynthesis.cancel();
        this.setUI('speaking');
        this.isSpeaking = true;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'de-DE';
        utterance.rate = 1.05;
        
        const voices = window.speechSynthesis.getVoices();
        // Bevorzugt Google Deutsch oder eine beliebige deutsche Stimme
        utterance.voice = voices.find(v => v.name.includes("Google") && v.lang.includes("de")) || 
                          voices.find(v => v.lang.includes("de"));

        utterance.onend = () => {
            this.setUI('idle');
            this.isSpeaking = false;
        };
        window.speechSynthesis.speak(utterance);
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

// Globale Handler für Buttons
window.toggleAISettings = () => document.getElementById('ai-settings-popup').style.display = 'flex';
window.closeAISettings = () => document.getElementById('ai-settings-popup').style.display = 'none';
window.toggleAIMute = () => commentator.toggleMute();