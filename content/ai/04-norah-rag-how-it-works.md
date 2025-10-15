# Norah RAG: How It Works

Norah AI uses Retrieval-Augmented Generation (RAG) to provide accurate, contextual responses grounded in M1SSION's knowledge base.

## RAG Architecture

### Document Ingestion
1. **Content Sources**: Markdown files, documentation, FAQs, policies
2. **Parsing**: Extract text, metadata, tags
3. **Storage**: Store in `ai_docs` table with full text

### Embedding Generation
1. **Text Chunking**: Split documents into semantic chunks (~800-1200 chars)
2. **Vector Embedding**: Use OpenAI `text-embedding-3-large` (3072 dimensions)
3. **Storage**: Save embeddings in `ai_docs_embeddings` with pgvector

### Search Process
1. **Query Embedding**: Convert user question to vector
2. **Similarity Search**: Find top-k most similar chunks using cosine distance
3. **Score Filtering**: Return only results above similarity threshold
4. **Context Assembly**: Compile relevant chunks for LLM

### Response Generation
1. **Prompt Engineering**: Construct prompt with retrieved context
2. **LLM Query**: Send to GPT model with instructions
3. **Response Streaming**: Stream tokens back to user
4. **Citation**: Include source references

## Vector Database

M1SSION uses PostgreSQL with pgvector extension:
- **Distance Metric**: Cosine distance (1 - cosine similarity)
- **Index Type**: IVFFlat or HNSW for fast approximate nearest neighbor search
- **Dimensionality**: 3072 (text-embedding-3-large)

### Performance Optimization
- Indexes on frequently queried fields
- Batch embedding operations
- Caching of common queries
- Pre-computed similarities for hot documents

## Embedding Models

### Current: text-embedding-3-large
- **Dimensions**: 3072
- **Quality**: High semantic understanding
- **Cost**: Moderate
- **Speed**: Fast enough for real-time

### Why This Model?
- Superior performance on domain-specific content
- Better multilingual support
- Reduced hallucination in retrieval
- Compatible with pgvector limits

## Quality Assurance

### Relevance Scoring
- Minimum similarity threshold (typically 0.1-0.3)
- Adjustable based on query type
- Fallback to broader search if no results

### Context Window Management
- Prioritize most relevant chunks
- Respect LLM token limits
- Balance breadth vs depth of context

### Continuous Improvement
- Monitor query patterns
- Track response quality metrics
- Retrain on new content
- A/B test embedding strategies

## Edge Cases

### Low-Quality Queries
- Typo tolerance via semantic similarity
- Query expansion for single words
- Clarification prompts for ambiguity

### No Results
- Gradual threshold relaxation
- Alternative phrasing suggestions
- Fallback to general knowledge

### Multilingual Support
- Language detection
- Cross-lingual embeddings
- Locale-specific document filtering

## Privacy Considerations

- User queries not stored with personal identifiers
- Anonymized analytics only
- Option to disable query logging
- GDPR-compliant data retention
