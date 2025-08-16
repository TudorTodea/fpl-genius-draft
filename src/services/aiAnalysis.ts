import { Player } from '@/types/player';

interface AIAnalysisResponse {
  analysis: string;
  captainViability: number; // 1-5 stars
  transferAdvice: string;
  riskFactors: string[];
}

export class AIAnalysisService {
  private cache = new Map<string, { data: AIAnalysisResponse; timestamp: number }>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  async analyzePlayer(player: Player): Promise<AIAnalysisResponse> {
    // Check cache first
    const cached = this.cache.get(player.id);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const prompt = this.buildPrompt(player);
      const analysis = await this.callAI(prompt);
      
      // Cache the result
      this.cache.set(player.id, {
        data: analysis,
        timestamp: Date.now()
      });

      return analysis;
    } catch (error) {
      console.error('AI Analysis failed:', error);
      return this.getFallbackAnalysis(player);
    }
  }

  private buildPrompt(player: Player): string {
    const injuryWarning = player.injuryStatus !== 'Fit' ? ` (Currently ${player.injuryStatus})` : '';
    const newsAlert = player.news?.length ? ` News: ${player.news.join('. ')}` : '';
    
    return `Analyze this Fantasy Premier League player for strategic decision making:

${player.name} (${player.position}) - ${player.team}${injuryWarning}
Price: £${player.price}m | Ownership: ${player.ownership}%
Minutes Last 5 GWs: ${player.minutesL5} | Form: ${player.formL5.toFixed(1)}
Expected Goals (Season): ${player.xG_season.toFixed(2)} | Expected Assists: ${player.xA_season.toFixed(2)}
Predicted Points Next GW: ${player.predPts_gw.toFixed(1)}
Next Opponent: ${player.nextOpponent} (Difficulty: ${player.nextOpponentFDR}/5)
Rotation Risk: ${player.rotationRiskPct}%${newsAlert}

Recent form (last 5 GWs): ${player.lastMatches.map(m => `GW${m.gw}: ${m.points}pts`).join(', ')}

Provide analysis in this exact JSON format:
{
  "analysis": "2-3 sentence tactical analysis focusing on current form, fixtures, and role in team",
  "captainViability": 1-5,
  "transferAdvice": "Brief recommendation: essential/consider/avoid with reason",
  "riskFactors": ["list", "of", "key", "risks"]
}

Be specific about their playing time security, fixture difficulty, and current form trajectory. Consider rotation risk and injury status.`;
  }

  private async callAI(prompt: string): Promise<AIAnalysisResponse> {
    // Use a simple rule-based analysis for now (free alternative)
    // This could be replaced with a local AI model or free API later
    const response = await this.generateLocalAnalysis(prompt);
    return response;
  }

  private async generateLocalAnalysis(prompt: string): Promise<AIAnalysisResponse> {
    // Extract player data from prompt for rule-based analysis
    const ownershipMatch = prompt.match(/Ownership: ([\d.]+)%/);
    const rotationMatch = prompt.match(/Rotation Risk: ([\d.]+)%/);
    const predPtsMatch = prompt.match(/Predicted Points Next GW: ([\d.]+)/);
    const priceMatch = prompt.match(/Price: £([\d.]+)m/);
    const fdrMatch = prompt.match(/Difficulty: (\d+)\/5/);
    
    const ownership = ownershipMatch ? parseFloat(ownershipMatch[1]) : 0;
    const rotationRisk = rotationMatch ? parseFloat(rotationMatch[1]) : 50;
    const predPts = predPtsMatch ? parseFloat(predPtsMatch[1]) : 0;
    const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
    const fdr = fdrMatch ? parseInt(fdrMatch[1]) : 3;
    
    return this.generateSmartAnalysis(ownership, rotationRisk, predPts, price, fdr, prompt);
  }

  private generateSmartAnalysis(ownership: number, rotationRisk: number, predPts: number, price: number, fdr: number, prompt: string): AIAnalysisResponse {
    let analysis = '';
    let captainViability = 1;
    let transferAdvice = 'Monitor';
    const riskFactors: string[] = [];

    // Extract player name and position from prompt
    const nameMatch = prompt.match(/^([A-Za-z\s]+) \(([A-Z]+)\)/);
    const playerName = nameMatch ? nameMatch[1] : 'Player';
    const position = nameMatch ? nameMatch[2] : 'UNK';

    // Determine player quality based on multiple factors
    const isHighOwnership = ownership >= 15;
    const isLowRotationRisk = rotationRisk <= 20;
    const isGoodFixture = fdr <= 3;
    const isHighPredicted = predPts >= 5;
    const isPremium = price >= 8;

    // Generate analysis based on player profile
    if (rotationRisk >= 80) {
      analysis = `${playerName} is a squad player with very limited game time. High rotation risk makes them unsuitable for regular selection.`;
      captainViability = 1;
      transferAdvice = 'Avoid - rarely plays';
      riskFactors.push('Very high rotation risk', 'Limited playing time');
    } else if (isHighOwnership && isLowRotationRisk && predPts > 6) {
      analysis = `${playerName} is a premium template pick with excellent underlying stats. Strong captaincy potential with consistent returns expected.`;
      captainViability = predPts > 8 ? 5 : 4;
      transferAdvice = 'Essential - template player';
      if (!isGoodFixture) riskFactors.push('Difficult fixture');
    } else if (isLowRotationRisk && predPts > 4) {
      analysis = `${playerName} offers solid returns as a regular starter. Good value pick with decent underlying numbers and secure playing time.`;
      captainViability = predPts > 6 ? 3 : 2;
      transferAdvice = 'Consider - reliable option';
      if (fdr >= 4) riskFactors.push('Tough fixture');
    } else if (ownership < 2 && rotationRisk > 50) {
      analysis = `${playerName} is a fringe player with uncertain game time. Low ownership suggests limited appeal among FPL managers.`;
      captainViability = 1;
      transferAdvice = 'Avoid - rotation concerns';
      riskFactors.push('High rotation risk', 'Low ownership');
    } else {
      analysis = `${playerName} represents a moderate option with ${predPts.toFixed(1)} predicted points. Monitor team news and form trends before selecting.`;
      captainViability = 2;
      transferAdvice = 'Monitor - potential differential';
      if (rotationRisk > 40) riskFactors.push('Moderate rotation risk');
    }

    // Add position-specific insights
    if (position === 'GK' && rotationRisk > 30) {
      riskFactors.push('Backup goalkeeper');
    }

    // Add fixture difficulty as risk factor
    if (fdr >= 4) {
      riskFactors.push('Difficult upcoming fixture');
    }

    return {
      analysis,
      captainViability,
      transferAdvice,
      riskFactors
    };
  }

  private getFallbackAnalysis(player: Player): AIAnalysisResponse {
    return this.generateSmartAnalysis(
      player.ownership,
      player.rotationRiskPct,
      player.predPts_gw,
      player.price,
      player.nextOpponentFDR,
      `${player.name} (${player.position})`
    );
  }
}

export const aiAnalysisService = new AIAnalysisService();