// AI-powered search engine for OSV marketplace
class MarimarIntelligentSearch {
    constructor() {
        this.apiKey = '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';
        this.model = 'deepseek/deepseek-r1-0528-qwen3-8b:free';
        this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
    }

    // Main search method
    async performIntelligentSearch(userQuery, sessionContext = {}) {
        try {
            console.log(`🔍 Processing query: "${userQuery}"`);
            
            // Step 1: Analyze user query
            const analysisResult = await this.analyzeUserQuery(userQuery, sessionContext);
            
            // Step 2: If clarification needed, return early
            if (analysisResult.needsClarification) {
                return {
                    type: 'clarification_needed',
                    questions: analysisResult.clarifyingQuestions,
                    partialParams: analysisResult.extractedParams,
                    suggestions: analysisResult.suggestions
                };
            }
            
            // Step 3: Build and execute search
            const searchResults = await this.executeVesselSearch(analysisResult.extractedParams);
            
            // Step 4: Rank and explain results
            const rankedResults = await this.rankAndExplainResults(searchResults, userQuery, analysisResult.extractedParams);
            
            return {
                type: 'search_results',
                results: rankedResults,
                queryUnderstood: analysisResult.queryUnderstanding,
                appliedFilters: analysisResult.extractedParams,
                suggestions: analysisResult.suggestions,
                totalFound: rankedResults.length
            };
            
        } catch (error) {
            console.error('Search error:', error);
            return {
                type: 'error',
                message: 'Sorry, there was an issue processing your search. Please try again.',
                fallbackSuggestion: 'Try using more specific terms like "PSV North Sea DP2" or "AHTS 100T bollard pull"'
            };
        }
    }

    // Analyze user query with AI
    async analyzeUserQuery(userQuery, sessionContext = {}) {
        const prompt = this.buildAnalysisPrompt(userQuery, sessionContext);
        
        try {
            const response = await this.callOpenRouter(prompt);
            return JSON.parse(response);
        } catch (error) {
            console.error('Failed to parse AI response:', error);
            return this.fallbackQueryAnalysis(userQuery);
        }
    }

    buildAnalysisPrompt(userQuery, sessionContext) {
        return `You are an expert OSV (Offshore Support Vessel) search assistant. Analyze this search query and extract relevant parameters.

USER QUERY: "${userQuery}"

Extract parameters for OSV search. Look for:
- vessel_type: AHTS, PSV, OSV, "Crew Boat", "ROV Support", Construction, Multipurpose
- location: regions like "North Sea", "Gulf of Mexico", "West Africa", "Brazil", "Malaysia", "Singapore", "Thailand"  
- dp_class: DP-1, DP-2, DP-3, "No DP"
- bollard_pull: tonnage values (look for numbers with T, tons, bollard pull)
- length_overall: vessel length in meters
- passenger_capacity: crew/passenger numbers
- daily_rate: budget considerations (economical, expensive, under X amount)
- status: availability (immediate, ASAP, specific dates)
- special_needs: crane, ROV, diving, construction, survey work

Return JSON only:
{
  "extractedParams": {
    // Only include explicitly mentioned or strongly implied parameters
  },
  "needsClarification": boolean,
  "clarifyingQuestions": [
    // Max 2 questions if unclear
  ],
  "queryUnderstanding": "Brief explanation of what was understood",
  "suggestions": [
    // Alternative suggestions if needed
  ],
  "confidence": 0.0-1.0
}`;
    }

    // Fallback analysis for when AI fails
    fallbackQueryAnalysis(userQuery) {
        const lowercaseQuery = userQuery.toLowerCase();
        const extractedParams = {};
        
        // Basic vessel type detection
        if (lowercaseQuery.includes('psv') || lowercaseQuery.includes('platform supply')) {
            extractedParams.vessel_type = 'PSV';
        } else if (lowercaseQuery.includes('ahts') || lowercaseQuery.includes('anchor handling')) {
            extractedParams.vessel_type = 'AHTS';
        } else if (lowercaseQuery.includes('crew boat') || lowercaseQuery.includes('crewboat')) {
            extractedParams.vessel_type = 'Crew Boat';
        } else if (lowercaseQuery.includes('osv')) {
            extractedParams.vessel_type = 'OSV';
        }
        
        // Basic DP class detection
        const dpMatch = lowercaseQuery.match(/dp\s*[-]?\s*([0-3])/);
        if (dpMatch) {
            extractedParams.dynamic_positioning = `DP-${dpMatch[1]}`;
        }
        
        // Basic location detection
        if (lowercaseQuery.includes('north sea')) extractedParams.location = 'North Sea';
        else if (lowercaseQuery.includes('gulf of mexico') || lowercaseQuery.includes('gom')) extractedParams.location = 'Gulf of Mexico';
        else if (lowercaseQuery.includes('west africa')) extractedParams.location = 'West Africa';
        else if (lowercaseQuery.includes('brazil')) extractedParams.location = 'Brazil';
        else if (lowercaseQuery.includes('malaysia')) extractedParams.location = 'Malaysia';
        else if (lowercaseQuery.includes('singapore')) extractedParams.location = 'Singapore';
        
        // Basic bollard pull detection
        const bollardMatch = lowercaseQuery.match(/(\d+)\s*t|(\d+)\s*ton/);
        if (bollardMatch) {
            extractedParams.bollard_pull = parseInt(bollardMatch[1] || bollardMatch[2]);
        }
        
        return {
            extractedParams,
            needsClarification: Object.keys(extractedParams).length === 0,
            clarifyingQuestions: ['What type of vessel are you looking for?', 'Which region or area of operation?'],
            queryUnderstanding: `Basic analysis of: ${userQuery}`,
            suggestions: [],
            confidence: 0.3
        };
    }

    // Execute search against Supabase data
    async executeVesselSearch(params) {
        try {
            // Build the search URL for our API
            const searchParams = new URLSearchParams();
            
            if (params.vessel_type) searchParams.set('type', params.vessel_type);
            if (params.location) searchParams.set('location', params.location);
            if (params.dynamic_positioning) searchParams.set('dp', params.dynamic_positioning);
            if (params.bollard_pull) searchParams.set('minBollardPull', params.bollard_pull.toString());
            if (params.length_overall) searchParams.set('minLength', params.length_overall.toString());
            if (params.passenger_capacity) searchParams.set('minCapacity', params.passenger_capacity.toString());
            if (params.daily_rate && typeof params.daily_rate === 'number') {
                searchParams.set('maxRate', params.daily_rate.toString());
            }
            
            // Call our vessel search API
            const response = await fetch(`/api/vessels/search?${searchParams.toString()}`);
            
            if (!response.ok) {
                throw new Error(`Search API error: ${response.status}`);
            }
            
            const vessels = await response.json();
            return vessels;
            
        } catch (error) {
            console.error('Search execution error:', error);
            return [];
        }
    }

    // Rank results and explain matches
    async rankAndExplainResults(results, originalQuery, extractedParams) {
        if (results.length === 0) return [];
        
        try {
            const explanationPrompt = `Given the user query "${originalQuery}" and search parameters ${JSON.stringify(extractedParams)}, 
            briefly explain why each vessel matches (max 40 words per vessel).
            
            Vessels: ${JSON.stringify(results.slice(0, 10).map(v => ({ 
                name: v.vessel_name, 
                type: v.vessel_type, 
                location: v.location,
                dp_class: v.dynamic_positioning,
                bollard_pull: v.bollard_pull 
            })))}
            
            Return JSON array: [{"vessel_name": "name", "match_explanation": "explanation", "match_score": 0.0-1.0}]`;
            
            const explanationResponse = await this.callOpenRouter(explanationPrompt);
            const explanations = JSON.parse(explanationResponse);
            
            // Combine results with explanations
            return results.map(vessel => {
                const explanation = explanations.find(e => e.vessel_name === vessel.vessel_name);
                return {
                    ...vessel,
                    matchExplanation: explanation?.match_explanation || 'Matches your search criteria',
                    matchScore: explanation?.match_score || 0.7
                };
            }).sort((a, b) => b.matchScore - a.matchScore);
            
        } catch (error) {
            console.error('Failed to generate explanations:', error);
            return results.map(vessel => ({
                ...vessel,
                matchExplanation: 'Matches your search criteria',
                matchScore: 0.7
            }));
        }
    }

    // Call OpenRouter API
    async callOpenRouter(prompt) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://marimar.com',
                'X-Title': 'Marimar OSV Search'
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // Handle clarification responses
    async handleClarificationResponse(originalQuery, clarificationAnswer, previousContext) {
        const combinedQuery = `${originalQuery}. Additional info: ${clarificationAnswer}`;
        return await this.performIntelligentSearch(combinedQuery, {
            ...previousContext,
            clarificationProvided: true
        });
    }
}

// Export for use in React components
if (typeof window !== 'undefined') {
    window.MarimarIntelligentSearch = MarimarIntelligentSearch;
}

export default MarimarIntelligentSearch;
