export const CATEGORY_CLASSIFICATION_TEMPLATE = `
You are an expert content classifier with deep knowledge across all domains.

TASK: Analyze the content and classify it into the most appropriate YouTube category and topic.

AVAILABLE CATEGORIES:
- Music (ID: 10) - All music-related content
- Sports (ID: 17) - Sports, fitness, athletics  
- Travel & Events (ID: 19) - Travel, cultural events, destinations
- Gaming (ID: 20) - Video games, gaming content
- People & Blogs (ID: 22) - Personal content, vlogs, lifestyle
- Comedy (ID: 23) - Comedy, humor, entertainment
- Entertainment (ID: 24) - General entertainment content
- News & Politics (ID: 25) - Politics, current events, legal matters, policy, government
- Howto & Style (ID: 26) - DIY, lifestyle, fashion, cooking
- Education (ID: 27) - Educational content, tutorials, academic subjects
- Science & Technology (ID: 28) - Technology, programming, science, engineering

AVAILABLE TOPICS:
- Music (/m/04rlf) - Musical content
- Politics (/m/05qt0) - Political content, legal matters, policy
- Health (/m/0kt51) - Healthcare, medical, wellness
- Technology (/m/07c1v) - Tech, programming, engineering
- Business (/m/09s1f) - Business, finance, legal business matters
- Education (/m/0403l3g) - Learning, academic, professional education
- Knowledge (/m/05qjc) - General knowledge, legal knowledge, specialized topics
- Tourism (/m/07bxq) - Travel, cultural content
- Fitness (/m/027x7n) - Physical fitness, health
- Food (/m/02wbm) - Cooking, nutrition
- Hobby (/m/03glg) - Hobbies, interests

OUTPUT FORMAT (JSON only):
{{
  "categoryId": "category_number",
  "topicId": "topic_freebase_id", 
  "confidence": "high|medium|low",
  "reasoning": "brief explanation"
}}

INPUT TEXT TO CLASSIFY:
{data}
`;


export const UNIVERSAL_SEARCH_QUERY_TEMPLATE = `
You are an expert at creating YouTube search queries that find authentic, high-quality content while avoiding algorithm-pushed or commercialized results.

CONTENT ANALYSIS:
- Category: {categoryName} (ID: {categoryId})
- Domain: {category}
- User Tags: {formattedTags}
- Confidence: {confidence}

TASK: Generate multiple search query variations that will find genuine, quality content in this domain.

ANTI-ALGORITHM STRATEGY:
1. Use specific, niche terminology instead of popular trending terms
2. Include professional/technical terms that creators actually use
3. Avoid clickbait-associated words
4. Focus on descriptive, specific language
5. Use terms that passionate creators/experts would use

DOMAIN-SPECIFIC OPTIMIZATION:

FOR MUSIC:
- Use specific music terminology (mixing, mastering, composition, arrangement)
- Include genre-specific terms, music theory concepts
- Use artist collaboration terms, production techniques
- Avoid: "best music", "top songs", "viral hits"
- Prefer: "live session", "acoustic version", "studio recording", "original composition"

FOR TECHNOLOGY:
- Use specific frameworks, libraries, architectural patterns
- Include version numbers, technical specifications
- Use professional development terminology
- Avoid: "best tutorial", "easy coding", "learn fast"
- Prefer: "implementation guide", "architecture review", "deep dive", "production ready"

FOR HEALTH:
- Use medical terminology, specific conditions, treatment methods
- Include professional healthcare language
- Avoid: "quick fixes", "miracle cures", "lose weight fast"
- Prefer: "clinical study", "evidence based", "medical review", "professional analysis"

QUALITY INDICATORS TO INCLUDE:
- "analysis", "review", "breakdown", "technique", "method"
- "professional", "expert", "advanced", "in-depth"
- "case study", "real world", "practical", "hands-on"

GENERATE:
1. Primary optimized query (4-6 terms)
2. 2 alternative query variations
3. List quality indicator terms for this domain
4. List anti-algorithm terms to include

USER INPUT:
{formattedTags}

Format as JSON:
{{
  "primaryQuery": "main search query",
  "alternatives": ["query1", "query2"],
  "qualityTerms": ["term1", "term2", "term3"],
  "antiAlgorithmTerms": ["term1", "term2"]
}}
`;