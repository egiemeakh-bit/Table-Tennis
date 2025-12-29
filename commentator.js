/**
 * Enhanced Commentator Module for Table Tennis
 * Features: Advanced AI Context, Score Understanding, Fastest Player AI Model
 * Last Updated: 2025-12-29
 */

class Commentator {
    constructor(gameState) {
        this.gameState = gameState;
        this.scoreHistory = [];
        this.playerProfiles = {};
        this.aiModel = new FastestPlayerAIModel();
        this.contextEngine = new EnhancedAIContext();
    }

    /**
     * Initialize enhanced AI context for better score understanding
     */
    initializeAIContext() {
        this.contextEngine.setScoreThresholds({
            critical: 18, // Points needed to win
            momentum: 3,  // Point swing for momentum
            pressure: 15  // High-pressure scenarios
        });

        this.contextEngine.enableRealTimeAnalysis(true);
        this.contextEngine.setAnalysisDepth('advanced');
        
        return {
            status: 'initialized',
            timestamp: new Date().toISOString(),
            modelVersion: this.aiModel.version
        };
    }

    /**
     * Generate commentary based on enhanced AI understanding
     * @param {Object} scoreState - Current game state with scores
     * @returns {String} AI-generated commentary
     */
    generateCommentary(scoreState) {
        const context = this.analyzeGameContext(scoreState);
        const playerInsights = this.getPlayerInsights(scoreState);
        const aiPrediction = this.aiModel.predictNextPlay(scoreState, playerInsights);

        const commentary = this._buildCommentary({
            context,
            playerInsights,
            prediction: aiPrediction,
            scoreState
        });

        this.scoreHistory.push({
            timestamp: new Date().toISOString(),
            scoreState,
            commentary,
            context
        });

        return commentary;
    }

    /**
     * Analyze game context with enhanced AI understanding
     * @param {Object} scoreState - Current game scores
     * @returns {Object} Detailed context analysis
     */
    analyzeGameContext(scoreState) {
        const { player1Score, player2Score, gameNumber, totalPoints } = scoreState;
        const scoreDifference = Math.abs(player1Score - player2Score);
        
        // Enhanced context analysis
        const context = {
            momentum: this._calculateMomentum(scoreState),
            pressure: this._assessPressure(scoreState),
            gamePhase: this._identifyGamePhase(scoreState),
            criticalMoment: scoreDifference <= 2 && player1Score >= 15,
            scoreTrend: this._analyzeTrend(),
            contextConfidence: this._calculateContextConfidence(scoreState)
        };

        return context;
    }

    /**
     * Get AI-enhanced player insights
     * @param {Object} scoreState - Current game scores
     * @returns {Object} Player performance insights
     */
    getPlayerInsights(scoreState) {
        const player1Insights = this._analyzePlayer(scoreState, 1);
        const player2Insights = this._analyzePlayer(scoreState, 2);

        return {
            player1: {
                ...player1Insights,
                form: this._assessForm(scoreState, 1),
                consistency: this._measureConsistency(scoreState, 1),
                strengths: this._identifyStrengths(scoreState, 1),
                weaknesses: this._identifyWeaknesses(scoreState, 1)
            },
            player2: {
                ...player2Insights,
                form: this._assessForm(scoreState, 2),
                consistency: this._measureConsistency(scoreState, 2),
                strengths: this._identifyStrengths(scoreState, 2),
                weaknesses: this._identifyWeaknesses(scoreState, 2)
            },
            comparison: this._comparePerformance(scoreState)
        };
    }

    /**
     * Calculate momentum shift in the game
     * @private
     */
    _calculateMomentum(scoreState) {
        if (this.scoreHistory.length < 3) return 'neutral';

        const recentScores = this.scoreHistory.slice(-3);
        const trends = recentScores.map((entry, idx) => {
            if (idx === 0) return 0;
            const current = entry.scoreState;
            const previous = recentScores[idx - 1].scoreState;
            return (current.player1Score - previous.player1Score) - 
                   (current.player2Score - previous.player2Score);
        });

        const avgTrend = trends.reduce((a, b) => a + b, 0) / trends.length;
        return avgTrend > 1 ? 'player1' : avgTrend < -1 ? 'player2' : 'neutral';
    }

    /**
     * Assess pressure level in the game
     * @private
     */
    _assessPressure(scoreState) {
        const { player1Score, player2Score } = scoreState;
        const isCloseGame = Math.abs(player1Score - player2Score) <= 2;
        const isHighScore = Math.max(player1Score, player2Score) >= 15;

        return {
            level: isCloseGame && isHighScore ? 'critical' : isCloseGame ? 'high' : 'moderate',
            leader: player1Score > player2Score ? 'player1' : player2Score > player1Score ? 'player2' : 'tied',
            pointsFromWin: Math.max(0, 21 - Math.max(player1Score, player2Score))
        };
    }

    /**
     * Identify current game phase
     * @private
     */
    _identifyGamePhase(scoreState) {
        const maxScore = Math.max(scoreState.player1Score, scoreState.player2Score);
        if (maxScore < 5) return 'opening';
        if (maxScore < 12) return 'midgame';
        if (maxScore < 18) return 'endgame-approach';
        return 'critical-finish';
    }

    /**
     * Analyze trend from score history
     * @private
     */
    _analyzeTrend() {
        if (this.scoreHistory.length < 2) return 'insufficient_data';
        
        const recent = this.scoreHistory.slice(-5);
        const p1Trend = recent.map(e => e.scoreState.player1Score);
        const p2Trend = recent.map(e => e.scoreState.player2Score);

        const p1Direction = p1Trend[p1Trend.length - 1] - p1Trend[0];
        const p2Direction = p2Trend[p2Trend.length - 1] - p2Trend[0];

        return {
            player1: p1Direction > 0 ? 'improving' : 'declining',
            player2: p2Direction > 0 ? 'improving' : 'declining'
        };
    }

    /**
     * Calculate confidence in context analysis
     * @private
     */
    _calculateContextConfidence(scoreState) {
        const historySize = Math.min(this.scoreHistory.length / 10, 1);
        const baseConfidence = 0.85;
        return Math.min(baseConfidence + (historySize * 0.15), 1.0);
    }

    /**
     * Analyze individual player performance
     * @private
     */
    _analyzePlayer(scoreState, playerNumber) {
        const score = playerNumber === 1 ? scoreState.player1Score : scoreState.player2Score;
        return {
            currentScore: score,
            scorePercentage: (score / 21) * 100,
            pointsRemaining: Math.max(0, 21 - score)
        };
    }

    /**
     * Assess player form
     * @private
     */
    _assessForm(scoreState, playerNumber) {
        if (this.scoreHistory.length < 2) return 'unknown';
        
        const recent = this.scoreHistory.slice(-3);
        const score = playerNumber === 1 ? 'player1Score' : 'player2Score';
        
        const pointsGained = recent.map(e => e.scoreState[score])
            .reduce((a, b, i, arr) => i === 0 ? 0 : a + (b - arr[i-1]), 0);

        return pointsGained >= 3 ? 'excellent' : pointsGained >= 1 ? 'good' : 'struggling';
    }

    /**
     * Measure player consistency
     * @private
     */
    _measureConsistency(scoreState, playerNumber) {
        if (this.scoreHistory.length < 5) return 0.5;

        const recent = this.scoreHistory.slice(-5);
        const score = playerNumber === 1 ? 'player1Score' : 'player2Score';
        const pointsPerRound = recent.map((e, i) => {
            if (i === 0) return 0;
            return e.scoreState[score] - recent[i-1].scoreState[score];
        });

        const avg = pointsPerRound.reduce((a, b) => a + b, 0) / pointsPerRound.length;
        const variance = pointsPerRound.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / pointsPerRound.length;
        
        return 1 / (1 + variance); // Normalized consistency score
    }

    /**
     * Identify player strengths
     * @private
     */
    _identifyStrengths(scoreState, playerNumber) {
        const score = playerNumber === 1 ? scoreState.player1Score : scoreState.player2Score;
        const otherScore = playerNumber === 1 ? scoreState.player2Score : scoreState.player1Score;

        const strengths = [];
        
        if (score > otherScore) strengths.push('aggressive-scoring');
        if (this._measureConsistency(scoreState, playerNumber) > 0.7) strengths.push('consistency');
        if (this._calculateMomentum(scoreState) === (playerNumber === 1 ? 'player1' : 'player2')) {
            strengths.push('momentum');
        }

        return strengths.length > 0 ? strengths : ['developing'];
    }

    /**
     * Identify player weaknesses
     * @private
     */
    _identifyWeaknesses(scoreState, playerNumber) {
        const score = playerNumber === 1 ? scoreState.player1Score : scoreState.player2Score;
        const otherScore = playerNumber === 1 ? scoreState.player2Score : scoreState.player1Score;

        const weaknesses = [];
        
        if (score < otherScore) weaknesses.push('point-struggle');
        if (this._measureConsistency(scoreState, playerNumber) < 0.5) weaknesses.push('inconsistency');
        if (score >= 15 && (21 - score) <= 3 && otherScore >= 15) weaknesses.push('clutch-pressure');

        return weaknesses.length > 0 ? weaknesses : ['none'];
    }

    /**
     * Compare performance between players
     * @private
     */
    _comparePerformance(scoreState) {
        const { player1Score, player2Score } = scoreState;
        const difference = Math.abs(player1Score - player2Score);
        const leader = player1Score > player2Score ? 'player1' : 'player2';
        const isClose = difference <= 2;

        return {
            difference,
            leader,
            isClose,
            description: isClose ? 'very competitive' : 'one-sided'
        };
    }

    /**
     * Build comprehensive commentary
     * @private
     */
    _buildCommentary(data) {
        const { context, playerInsights, prediction, scoreState } = data;
        const { pressure } = context;

        let commentary = '';

        // Opening line
        commentary += `Score: ${scoreState.player1Score}-${scoreState.player2Score}. `;

        // Pressure assessment
        if (pressure.level === 'critical') {
            commentary += `This is a critical moment! `;
        } else if (pressure.level === 'high') {
            commentary += `The pressure is building. `;
        }

        // Momentum
        if (context.momentum !== 'neutral') {
            const player = context.momentum === 'player1' ? 'Player 1' : 'Player 2';
            commentary += `${player} has the momentum. `;
        }

        // Player insights
        const leading = pressure.leader === 'player1' ? 'Player 1' : 'Player 2';
        const trailing = pressure.leader === 'player1' ? 'Player 2' : 'Player 1';
        
        commentary += `${leading} leads with ${playerInsights[pressure.leader === 'player1' ? 'player1' : 'player2'].form} form. `;
        commentary += `${trailing} is ${playerInsights[pressure.leader === 'player1' ? 'player2' : 'player1'].form}. `;

        // Prediction
        if (prediction) {
            commentary += `AI predicts ${prediction.expectedOutcome}. `;
        }

        // Game phase insight
        commentary += `We're in the ${context.gamePhase} phase.`;

        return commentary;
    }

    /**
     * Get game statistics
     * @returns {Object} Comprehensive game statistics
     */
    getGameStatistics() {
        return {
            totalCommentaries: this.scoreHistory.length,
            averageConfidence: this._getAverageConfidence(),
            gameTimeline: this.scoreHistory,
            aiModelVersion: this.aiModel.version,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Calculate average confidence
     * @private
     */
    _getAverageConfidence() {
        if (this.scoreHistory.length === 0) return 0;
        const sum = this.scoreHistory.reduce((acc, entry) => 
            acc + (entry.context?.contextConfidence || 0), 0);
        return sum / this.scoreHistory.length;
    }
}

/**
 * Fastest Player AI Model
 * Optimized for real-time game prediction and analysis
 */
class FastestPlayerAIModel {
    constructor() {
        this.version = '2.1.0';
        this.modelType = 'FastestPlayer-OptimizedNN';
        this.performanceMetrics = {};
        this.predictionCache = new Map();
    }

    /**
     * Predict next play based on game state
     * @param {Object} gameState - Current game state
     * @param {Object} playerInsights - Player analysis
     * @returns {Object} Prediction data
     */
    predictNextPlay(gameState, playerInsights) {
        const cacheKey = JSON.stringify(gameState);
        
        if (this.predictionCache.has(cacheKey)) {
            return this.predictionCache.get(cacheKey);
        }

        const prediction = {
            expectedOutcome: this._predictOutcome(gameState, playerInsights),
            confidence: this._calculateConfidence(gameState, playerInsights),
            probability: this._calculateWinProbability(gameState, playerInsights),
            timeToWin: this._estimateTimeToWin(gameState, playerInsights),
            keyFactors: this._identifyKeyFactors(gameState, playerInsights)
        };

        // Cache prediction
        this.predictionCache.set(cacheKey, prediction);

        // Limit cache size
        if (this.predictionCache.size > 100) {
            const firstKey = this.predictionCache.keys().next().value;
            this.predictionCache.delete(firstKey);
        }

        return prediction;
    }

    /**
     * Predict game outcome
     * @private
     */
    _predictOutcome(gameState, playerInsights) {
        const p1Score = gameState.player1Score;
        const p2Score = gameState.player2Score;
        const difference = p1Score - p2Score;

        if (difference > 5) return 'Player 1 is favored to win';
        if (difference < -5) return 'Player 2 is favored to win';
        return 'Match remains competitive';
    }

    /**
     * Calculate prediction confidence
     * @private
     */
    _calculateConfidence(gameState, playerInsights) {
        const scoreDifference = Math.abs(gameState.player1Score - gameState.player2Score);
        const baseConfidence = 0.7;
        const differenceBoost = (scoreDifference / 10) * 0.2;

        return Math.min(baseConfidence + differenceBoost, 0.95);
    }

    /**
     * Calculate win probability
     * @private
     */
    _calculateWinProbability(gameState, playerInsights) {
        const p1Insight = playerInsights.player1;
        const p2Insight = playerInsights.player2;
        
        const p1BaseProb = p1Insight.currentScore / 21;
        const p2BaseProb = p2Insight.currentScore / 21;
        
        const total = p1BaseProb + p2BaseProb || 1;
        
        return {
            player1: (p1BaseProb / total) * 100,
            player2: (p2BaseProb / total) * 100
        };
    }

    /**
     * Estimate time to win
     * @private
     */
    _estimateTimeToWin(gameState, playerInsights) {
        const p1Remaining = 21 - gameState.player1Score;
        const p2Remaining = 21 - gameState.player2Score;
        const avgPointsPerRound = 1.5; // Average points per commentary cycle

        return {
            player1RoundsRemaining: Math.ceil(p1Remaining / avgPointsPerRound),
            player2RoundsRemaining: Math.ceil(p2Remaining / avgPointsPerRound)
        };
    }

    /**
     * Identify key factors influencing prediction
     * @private
     */
    _identifyKeyFactors(gameState, playerInsights) {
        const factors = [];

        if (gameState.player1Score > gameState.player2Score) {
            factors.push('Player 1 score advantage');
        }
        if (playerInsights.player1.form === 'excellent') {
            factors.push('Player 1 excellent form');
        }
        if (playerInsights.player2.consistency > 0.8) {
            factors.push('Player 2 high consistency');
        }

        return factors.length > 0 ? factors : ['neutral match state'];
    }
}

/**
 * Enhanced AI Context Engine
 * Provides deep game understanding and contextual analysis
 */
class EnhancedAIContext {
    constructor() {
        this.scoreThresholds = {};
        this.realTimeAnalysis = false;
        this.analysisDepth = 'standard';
        this.contextHistory = [];
    }

    /**
     * Set score thresholds for analysis
     * @param {Object} thresholds - Threshold configuration
     */
    setScoreThresholds(thresholds) {
        this.scoreThresholds = thresholds;
    }

    /**
     * Enable/disable real-time analysis
     * @param {Boolean} enabled - Enable flag
     */
    enableRealTimeAnalysis(enabled) {
        this.realTimeAnalysis = enabled;
    }

    /**
     * Set analysis depth level
     * @param {String} depth - 'standard', 'advanced', 'expert'
     */
    setAnalysisDepth(depth) {
        this.analysisDepth = depth;
    }

    /**
     * Get current context configuration
     * @returns {Object} Context configuration
     */
    getConfig() {
        return {
            scoreThresholds: this.scoreThresholds,
            realTimeAnalysis: this.realTimeAnalysis,
            analysisDepth: this.analysisDepth,
            contextHistorySize: this.contextHistory.length
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Commentator, FastestPlayerAIModel, EnhancedAIContext };
}