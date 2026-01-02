import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { Document } from "langchain/document";
import { AdvancedQueryResult, CategoryClassification, SearchQueryResult, StreamChunk } from '@/services/common/types';
import { Summary_Template, Tags_Template } from "../common/constants";
import { CommaSeparatedListOutputParser, JsonOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { CATEGORY_CLASSIFICATION_TEMPLATE, UNIVERSAL_SEARCH_QUERY_TEMPLATE } from "../common/prompts";
import { utility } from "../common/utils";

export class SummaryService {
  private llm: ChatGroq;

  constructor() {
    this.llm = this.initializeModel();
  }

  private initializeModel(): ChatGroq {
    return new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      apiKey: process.env.GROQ_API_KEY!,
      temperature: 0.7,
      streaming: true,
    });
  }

  public createTemplate(template: string): PromptTemplate {
    return PromptTemplate.fromTemplate(template);
  }

  public async createChain(prompt: PromptTemplate) {
    return await createStuffDocumentsChain({
      llm: this.llm,
      prompt,
    });
  }

  public async generateSummary(text: string): Promise<Response> {
    const docs: Document[] = [new Document({ pageContent: text })];
    const prompt = this.createTemplate(Summary_Template);
    const chain = await this.createChain(prompt);

    const stream = new ReadableStream<Uint8Array>({
      async start(controller: ReadableStreamDefaultController<Uint8Array>) {
        const asyncIterable: AsyncIterable<StreamChunk> = await chain.stream({ context: docs });
        for await (const chunk of asyncIterable) {
          const textChunk: string =
            typeof chunk === 'string'
              ? chunk
              : chunk?.content ?? '';
          controller.enqueue(new TextEncoder().encode(textChunk));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
      },
    });
  }

  public async generateTags(prompt: string): Promise<string[]> {
    const parser = new CommaSeparatedListOutputParser();
    const template = this.createTemplate(Tags_Template);

    const chain = RunnableSequence.from([
      (input: { data: string }) => ({ data: input }),
      template,
      this.llm,
      parser
    ]);

    const output: string[] = await chain.invoke({ data: prompt });
    return output;
  }

  public async generateSearchQuery(
    category: string, 
    customTags: string[], 
    similarity: string,
    options?: { includeAlternatives?: boolean; maxAlternatives?: number }
  ): Promise<{
    primary: SearchQueryResult;
    alternatives: string[];
    categoryName: string;
    qualityMetrics: {
      qualityScore: number;
      expertiseLevel: 'beginner' | 'intermediate' | 'expert';
      hasTechnicalTerms: boolean;
    };
  }> {
    
    try {
      const classification: CategoryClassification = await this.classifyContent(category, customTags, category);
      const categoryName = utility.getCategoryFromId(classification.categoryId);
      console.log('Tags:', customTags);
      
      const advancedResult = await this.generateAdvancedQuery(
        category, 
        customTags, 
        classification,
        categoryName
      );
      
      const primaryQuery = this.selectOptimalQuery(advancedResult, similarity, classification.confidence);
      
      let alternatives: string[] = [];
      if (options?.includeAlternatives) {
        alternatives = [
          ...advancedResult.alternativeQueries,
          this.generateFallbackQuery(category, customTags, classification)
        ]
        .map(query => this.optimizeQueryForQuality(query, classification.categoryId))
        .filter(query => this.calculateQueryQuality(query, classification.categoryId) >= 20)
        .slice(0, options?.maxAlternatives || 3);
      }
      
      const qualityScore = this.calculateQueryQuality(primaryQuery, classification.categoryId);
      const hasTechnicalTerms = this.validateTechnicalTerms(primaryQuery, classification.categoryId);
      const expertiseLevel = this.calculateExpertiseLevel(primaryQuery, classification.categoryId);

      console.log('🎯 Complete Query Analysis:', {
        primary: primaryQuery,
        alternatives,
        qualityScore,
        expertiseLevel,
        hasTechnicalTerms
      });

      return {
        primary: {
          searchQuery: primaryQuery,
          categoryId: classification.categoryId,
          topicId: classification.topicId,
          confidence: classification.confidence
        },
        alternatives,
        categoryName,
        qualityMetrics: {
          qualityScore,
          expertiseLevel,
          hasTechnicalTerms
        }
      };

    } catch (error) {
      console.error('Generate Search Query Error:', error);
      return {
        primary: {
          searchQuery: `${category} ${customTags.join(' ')}`.trim(),
          categoryId: '27',
          topicId: '/m/0403l3g',
          confidence: 'low'
        },
        alternatives: [],
        categoryName: utility.getCategoryFromId('27'),
        qualityMetrics: {
          qualityScore: 0,
          expertiseLevel: 'beginner',
          hasTechnicalTerms: false
        }
      };
    }
  }

  public async getRotatedSearchQueries(
    category: string,
    customTags: string[],
  ): Promise<string[]> {
    
    console.log('🔄 Generating rotated search queries for comprehensive coverage');
    
    try {
      const classification:CategoryClassification = await this.classifyContent(category, customTags, category);
      const categoryName = utility.getCategoryFromId(classification.categoryId);
      
      const advancedResult = await this.generateAdvancedQuery(
        category, 
        customTags, 
        classification,
        categoryName
      );
      
      const queries = [
        advancedResult.primaryQuery,
        ...advancedResult.alternativeQueries,
        this.generateFallbackQuery(category, customTags, classification)
      ];
      
      const qualityQueries = queries.map(query => 
        this.optimizeQueryForQuality(query, classification.categoryId)
      );
      
      const uniqueQueries = [...new Set([...queries, ...qualityQueries])]
        .filter(query => this.calculateQueryQuality(query, classification.categoryId) >= 20)
        .slice(0, 5);
      
      console.log('🎯 Rotated Queries Generated:', uniqueQueries);
      return uniqueQueries;
      
    } catch (error) {
      console.error('Rotated Queries Error:', error);
      return [`${category} ${customTags.join(' ')}`.trim()];
    }
  }

  public async searchQueryHelper(
    category: string, 
    customTags: string[], 
    similarity: string,
    classification: CategoryClassification
  ): Promise<string> {
    
    const formattedTags = customTags.map((tag: string) => tag.replace('#', '')).join(', ');
    const categoryName = utility.getCategoryFromId(classification.categoryId);
    
    try {
      const advancedResult = await this.generateAdvancedQuery(
        category, 
        customTags, 
        classification,
        categoryName
      );
      
      const finalQuery = this.selectOptimalQuery(advancedResult, similarity, classification.confidence);
      
      console.log('Advanced Query Analysis:', {
        primary: advancedResult.primaryQuery,
        alternatives: advancedResult.alternativeQueries,
        selected: finalQuery,
        qualityTerms: advancedResult.qualityIndicators
      });
      
      return finalQuery;
      
    } catch (error) {
      console.error('Advanced Query Error:', error);
      return this.generateFallbackQuery(category, customTags, classification);
    }
  }

  private async generateAdvancedQuery(
    category: string,
    customTags: string[],
    classification: CategoryClassification,
    categoryName: string
  ): Promise<AdvancedQueryResult> {
    
    const formattedTags = customTags.map(tag => tag.replace('#', '')).join(', ');
    
    try {
      const prompt = UNIVERSAL_SEARCH_QUERY_TEMPLATE
                    .replace('{categoryName}', categoryName)
                    .replace('{categoryId}', classification.categoryId)
                    .replace('{category}', category)
                    .replace('{formattedTags}', formattedTags)
                    .replace('{confidence}', classification.confidence);
      console.log('Advanced Query Prompt:', prompt);

      const parser = new JsonOutputParser();
      const template = this.createTemplate(prompt);
      const chain = RunnableSequence.from([template, this.llm, parser]);
      
      const result = await chain.invoke({
        categoryName,
        categoryId: classification.categoryId,
        category,
        formattedTags,
        confidence: classification.confidence
      });

      return {
        primaryQuery: result.primaryQuery || `${formattedTags}`,
        alternativeQueries: Array.isArray(result.alternatives) ? result.alternatives : [],
        qualityIndicators: Array.isArray(result.qualityTerms) ? result.qualityTerms : [],
        antiAlgorithmTerms: Array.isArray(result.antiAlgorithmTerms) ? result.antiAlgorithmTerms : []
      };
      
    } catch (error) {
      console.error('Advanced Query Generation Error:', error);
      return {
        primaryQuery: this.generateFallbackQuery(category, customTags, classification),
        alternativeQueries: [],
        qualityIndicators: utility.getQualityTermsForCategory(classification.categoryId),
        antiAlgorithmTerms: []
      };
    }
  }

  private selectOptimalQuery(
    queryResult: AdvancedQueryResult, 
    similarity: string, 
    confidence: string
  ): string {
    
    // Score all available queries
    const primaryScore = this.calculateQueryQuality(queryResult.primaryQuery, '');
    const alternativeScores = queryResult.alternativeQueries.map((query:string) => 
      ({ query, score: this.calculateQueryQuality(query, '') })
    );
    
    // For high similarity + high confidence: use highest scoring query
    if (similarity === 'high' && confidence === 'high') {
      const bestAlternative = alternativeScores.find((alt: { score: number; }) => alt.score > primaryScore);
      return bestAlternative?.query || queryResult.primaryQuery;
    }
    
    // For medium confidence: combine alternative with quality term
    if (confidence === 'medium' && queryResult.alternativeQueries.length > 0) {
      const alternative = queryResult.alternativeQueries[0];
      const qualityTerm = queryResult.qualityIndicators[0];
      return qualityTerm ? `${alternative} ${qualityTerm}` : alternative;
    }
    
    // For low confidence: add anti-algorithm terms
    if (confidence === 'low' && queryResult.antiAlgorithmTerms.length > 0) {
      const antiTerm = queryResult.antiAlgorithmTerms[0];
      return `${queryResult.primaryQuery} ${antiTerm}`;
    }
    
    return queryResult.primaryQuery;
  }

  private calculateQueryQuality(query: string, categoryId: string): number {
    let score = 0;
    
    // Professional terms bonus
    const professionalTerms = ['composition', 'analysis', 'technique', 'breakdown', 'professional', 'implementation', 'methodology'];
    professionalTerms.forEach(term => {
      if (query.toLowerCase().includes(term)) score += 10;
    });
    
    // Specific names/brands bonus (indicates targeted content)
    const hasSpecificNames = /[A-Z][a-z]+ (?:& |and )?[A-Z][a-z]+/.test(query) || /[A-Z][a-z]+(?:Corp|Inc|LLC|Ltd)/.test(query);
    if (hasSpecificNames) score += 15;
    
    // Technical terms bonus by category
    const categoryTechnicalTerms:Record<string, string[]> = {
      '28': ['implementation', 'architecture', 'framework', 'protocol', 'algorithm'],
      '10': ['composition', 'arrangement', 'production', 'mixing', 'mastering'],
      '25': ['policy', 'legislation', 'governance', 'jurisprudence', 'constitutional']
    };
    
    const technicalTerms = categoryTechnicalTerms[categoryId] || [];
    technicalTerms.forEach((term:string) => {
      if (query.toLowerCase().includes(term)) score += 8;
    });
    
    // Anti-algorithm terms bonus
    const algorithmicTerms = ['viral', 'trending', 'best', 'top', 'amazing', 'incredible', 'shocking'];
    const hasAlgorithmicTerms = algorithmicTerms.some(term => 
      query.toLowerCase().includes(term)
    );
    if (!hasAlgorithmicTerms) score += 10;
    
    // Length penalty for overly complex queries
    const wordCount = query.split(' ').length;
    if (wordCount > 8) score -= 5;
    if (wordCount < 3) score -= 10;
    
    return Math.max(0, score);
  }

  private validateTechnicalTerms(query: string, categoryId: string): boolean {
    const technicalTerms:Record<string, string[]> = {
      '28': ['implementation', 'architecture', 'framework', 'methodology', 'protocol', 'algorithm', 'system', 'engineering'],
      '10': ['composition', 'arrangement', 'production', 'mixing', 'mastering', 'recording', 'acoustic', 'synthesis'],
      '27': ['methodology', 'pedagogy', 'curriculum', 'assessment', 'instruction', 'learning', 'educational'],
      '25': ['policy', 'legislation', 'governance', 'analysis', 'jurisprudence', 'constitutional', 'regulatory'],
      '19': ['cultural', 'destination', 'tourism', 'heritage', 'authentic', 'local', 'traditional'],
      '26': ['technique', 'craftsmanship', 'method', 'process', 'application', 'skill', 'artisanal']
    };
    
    const terms = technicalTerms[categoryId] || [];
    return terms.some((term:string) => query.toLowerCase().includes(term));
  }

  private calculateExpertiseLevel(query: string, categoryId: string): 'beginner' | 'intermediate' | 'expert' {
    const expertTerms:Record<string, string[]> = {
      '28': ['fermions', 'topological', 'quantum', 'architecture', 'implementation', 'protocol', 'algorithm'],
      '10': ['composition', 'arrangement', 'mastering', 'production', 'synthesis', 'harmonic', 'counterpoint'],
      '25': ['jurisprudence', 'constitutional', 'precedent', 'statutory', 'regulatory', 'governance'],
      '27': ['pedagogy', 'curriculum', 'methodology', 'assessment', 'cognitive', 'instructional']
    };
    
    const categoryExpertTerms = expertTerms[categoryId] || [];
    const expertTermCount = categoryExpertTerms.filter((term:string) => 
      query.toLowerCase().includes(term)
    ).length;
    
    if (expertTermCount >= 2) return 'expert';
    if (expertTermCount >= 1) return 'intermediate';
    return 'beginner';
  }

  private optimizeQueryForQuality(query: string, categoryId: string): string {
    const algorithmicTerms = ['viral', 'trending', 'popular', 'best', 'top', 'amazing', 'incredible', 'shocking', 'ultimate'];
    let optimizedQuery = query;
    
    algorithmicTerms.forEach(term => {
      optimizedQuery = optimizedQuery.replace(new RegExp(`\\b${term}\\b`, 'gi'), '');
    });
    
    const qualityIndicators = ['technique', 'method', 'analysis', 'review', 'breakdown'];
    const hasQualityIndicator = qualityIndicators.some(indicator => 
      optimizedQuery.toLowerCase().includes(indicator)
    );
    
    if (!hasQualityIndicator && this.calculateQueryQuality(optimizedQuery, categoryId) < 30) {
      const categoryQualityTerms = utility.getQualityTermsForCategory(categoryId);
      optimizedQuery += ` ${categoryQualityTerms[0]}`;
    }
    
    return optimizedQuery.trim().replace(/\s+/g, ' ');
  }


  private generateFallbackQuery(
    category: string,
    customTags: string[],
    classification: CategoryClassification
  ): string {
    const cleanTags = customTags.map((tag:string) => tag.replace('#', '').trim());
    const qualityTerms = utility.getQualityTermsForCategory(classification.categoryId);
    
    const userTerms = cleanTags.slice(0, 4);
    const qualityTerm = qualityTerms[0];
    
    return `${userTerms.join(' ')} ${qualityTerm}`.trim();
  }

  public async classifyContent(
    query: string, 
    customTags: string[], 
    category?: string
  ): Promise<CategoryClassification> {
    
    const contextText = [
      category ? `Original Category: ${category}` : '',
      `Search Query: ${query}`,
      `Custom Tags: ${customTags.join(', ')}`
    ].filter(Boolean).join('\n');

    console.log('Classification Input:', contextText);

    try {
      const parser = new JsonOutputParser();
      const template = this.createTemplate(CATEGORY_CLASSIFICATION_TEMPLATE);

      const chain = RunnableSequence.from([
        template,
        this.llm,
        parser
      ]);

      // Pass the data directly to the chain
      const result = await chain.invoke({ data: contextText });
      const classification = this.validateClassification(result);
      console.log('🎯 LLM Classification Result:', classification);
      return classification;
    } catch (error: any) {
      console.error('LLM Classification Error:', error);      
      return {
        categoryId: '27', 
        topicId: '/m/0403l3g',
        confidence: 'low',
        reasoning: `Fallback due to classification error: ${error.message}`
      };
    }
  }

  private validateClassification(result: any): CategoryClassification {
    const classification: CategoryClassification = {
      categoryId: result.categoryId || '27',
      topicId: result.topicId || '/m/0403l3g', 
      confidence: (['high', 'medium', 'low'].includes(result.confidence)) ? result.confidence : 'low',
      reasoning: result.reasoning || 'No reasoning provided'
    };

    if (!/^\d+$/.test(classification.categoryId)) {
      console.warn('⚠️ Invalid categoryId format, using fallback');
      classification.categoryId = '27';
    }

    if (!classification.topicId.startsWith('/m/')) {
      console.warn('⚠️ Invalid topicId format, using fallback');
      classification.topicId = '/m/0403l3g';
    }

    return classification;
  }
}
