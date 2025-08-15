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
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Fantasy Premier League analyst. Provide concise, tactical insights focusing on playing time, form, and fixtures. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 400
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid JSON response from AI');
    }
  }

  private getFallbackAnalysis(player: Player): AIAnalysisResponse {
    let analysis = '';
    let captainViability = 1;
    let transferAdvice = 'Monitor form and fixtures';
    const riskFactors: string[] = [];

    // Generate analysis based on data
    if (player.rotationRiskPct > 60) {
      analysis = `High rotation risk (${player.rotationRiskPct}%) makes ${player.name} unreliable for consistent returns.`;
      riskFactors.push('High rotation risk');
      transferAdvice = 'Avoid - rotation concerns';
    } else if (player.predPts_gw > 6 && player.rotationRiskPct < 30) {
      analysis = `${player.name} offers excellent potential with ${player.predPts_gw.toFixed(1)} predicted points and secure starting position.`;
      captainViability = player.predPts_gw > 8 ? 5 : 4;
      transferAdvice = 'Essential - strong pick';
    } else if (player.ownership > 40) {
      analysis = `Popular template pick (${player.ownership}% owned) offering safe but unspectacular returns.`;
      captainViability = 3;
      transferAdvice = 'Consider - template safety';
    } else {
      analysis = `Moderate option with ${player.formL5.toFixed(1)} form. Monitor fixtures and recent performances.`;
      captainViability = 2;
    }

    if (player.injuryStatus !== 'Fit') {
      riskFactors.push(`Injury status: ${player.injuryStatus}`);
    }

    if (player.nextOpponentFDR >= 4) {
      riskFactors.push('Difficult fixture');
    }

    return {
      analysis,
      captainViability,
      transferAdvice,
      riskFactors
    };
  }
}

export const aiAnalysisService = new AIAnalysisService();