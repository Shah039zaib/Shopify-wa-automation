```javascript
/**
 * AI Analytics Model
 * Tracks and analyzes AI performance metrics
 */

const { query } = require('../config/database');

class AIAnalytics {
  /**
   * Get overall AI statistics
   */
  static async getOverallStats(start_date = null, end_date = null) {
    let sql = `
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN success = true THEN 1 END) as successful_requests,
        COUNT(CASE WHEN success = false THEN 1 END) as failed_requests,
        ROUND(
          COUNT(CASE WHEN success = true THEN 1 END) * 100.0 / COUNT(*), 
          2
        ) as success_rate,
        AVG(response_time_ms) as avg_response_time,
        SUM(tokens_used) as total_tokens,
        AVG(tokens_used) as avg_tokens_per_request
      FROM ai_logs
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (start_date) {
      sql += ` AND timestamp >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      sql += ` AND timestamp <= $${paramCount}`;
      params.push(end_date);
    }

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Get AI provider comparison
   */
  static async getProviderComparison(start_date = null, end_date = null) {
    let sql = `
      SELECT 
        ap.name as provider_name,
        COUNT(al.id) as total_requests,
        COUNT(CASE WHEN al.success = true THEN 1 END) as successful_requests,
        ROUND(
          COUNT(CASE WHEN al.success = true THEN 1 END) * 100.0 / COUNT(al.id), 
          2
        ) as success_rate,
        AVG(al.response_time_ms) as avg_response_time,
        SUM(al.tokens_used) as total_tokens,
        AVG(al.tokens_used) as avg_tokens
      FROM ai_providers ap
      LEFT JOIN ai_logs al ON ap.id = al.provider_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (start_date) {
      sql += ` AND al.timestamp >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      sql += ` AND al.timestamp <= $${paramCount}`;
      params.push(end_date);
    }

    sql += ` GROUP BY ap.id ORDER BY total_requests DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Get daily AI usage trends
   */
  static async getDailyUsage(days = 30) {
    const sql = `
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as request_count,
        COUNT(CASE WHEN success = true THEN 1 END) as successful_requests,
        AVG(response_time_ms) as avg_response_time,
        SUM(tokens_used) as total_tokens
      FROM ai_logs
      WHERE timestamp >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get hourly distribution (peak hours)
   */
  static async getHourlyDistribution() {
    const sql = `
      SELECT 
        EXTRACT(HOUR FROM timestamp) as hour,
        COUNT(*) as request_count,
        AVG(response_time_ms) as avg_response_time
      FROM ai_logs
      WHERE timestamp >= NOW() - INTERVAL '7 days'
      GROUP BY EXTRACT(HOUR FROM timestamp)
      ORDER BY hour ASC
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get response time distribution
   */
  static async getResponseTimeDistribution() {
    const sql = `
      SELECT 
        CASE 
          WHEN response_time_ms < 1000 THEN '< 1s'
          WHEN response_time_ms < 2000 THEN '1-2s'
          WHEN response_time_ms < 5000 THEN '2-5s'
          WHEN response_time_ms < 10000 THEN '5-10s'
          ELSE '> 10s'
        END as response_time_range,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ai_logs), 2) as percentage
      FROM ai_logs
      GROUP BY response_time_range
      ORDER BY 
        CASE response_time_range
          WHEN '< 1s' THEN 1
          WHEN '1-2s' THEN 2
          WHEN '2-5s' THEN 3
          WHEN '5-10s' THEN 4
          ELSE 5
        END
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get error analysis
   */
  static async getErrorAnalysis(limit = 10) {
    const sql = `
      SELECT 
        error_message,
        COUNT(*) as occurrence_count,
        MAX(timestamp) as last_occurred,
        STRING_AGG(DISTINCT ap.name, ', ') as affected_providers
      FROM ai_logs al
      JOIN ai_providers ap ON al.provider_id = ap.id
      WHERE al.success = false
        AND al.error_message IS NOT NULL
        AND al.timestamp >= NOW() - INTERVAL '7 days'
      GROUP BY error_message
      ORDER BY occurrence_count DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }

  /**
   * Get token usage by provider
   */
  static async getTokenUsageByProvider(start_date = null, end_date = null) {
    let sql = `
      SELECT 
        ap.name as provider_name,
        SUM(al.tokens_used) as total_tokens,
        AVG(al.tokens_used) as avg_tokens_per_request,
        COUNT(al.id) as request_count
      FROM ai_providers ap
      LEFT JOIN ai_logs al ON ap.id = al.provider_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (start_date) {
      sql += ` AND al.timestamp >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      sql += ` AND al.timestamp <= $${paramCount}`;
      params.push(end_date);
    }

    sql += ` GROUP BY ap.id ORDER BY total_tokens DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Get AI performance trends
   */
  static async getPerformanceTrends(days = 7) {
    const sql = `
      SELECT 
        DATE(timestamp) as date,
        ap.name as provider_name,
        AVG(al.response_time_ms) as avg_response_time,
        COUNT(CASE WHEN al.success = true THEN 1 END) as successful_requests,
        COUNT(*) as total_requests
      FROM ai_logs al
      JOIN ai_providers ap ON al.provider_id = ap.id
      WHERE al.timestamp >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(timestamp), ap.id
      ORDER BY date ASC, provider_name
    `;

    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get cost estimation (based on tokens)
   */
  static async getCostEstimation(start_date = null, end_date = null) {
    // Approximate costs per 1000 tokens (adjust based on actual pricing)
    const costs = {
      claude: 0.008, // $0.008 per 1k tokens
      gemini: 0.00025, // Free tier, then $0.00025
      groq: 0.0001, // Very cheap
      cohere: 0.001 // $0.001 per 1k tokens
    };

    let sql = `
      SELECT 
        ap.name as provider_name,
        SUM(al.tokens_used) as total_tokens,
        COUNT(*) as request_count
      FROM ai_logs al
      JOIN ai_providers ap ON al.provider_id = ap.id
      WHERE al.success = true
    `;
    const params = [];
    let paramCount = 1;

    if (start_date) {
      sql += ` AND al.timestamp >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      sql += ` AND al.timestamp <= $${paramCount}`;
      params.push(end_date);
    }

    sql += ` GROUP BY ap.id`;

    const result = await query(sql, params);

    // Calculate costs
    return result.rows.map(row => {
      const providerName = row.provider_name.toLowerCase();
      const costPer1k = costs[providerName] || 0;
      const estimatedCost = (row.total_tokens / 1000) * costPer1k;

      return {
        ...row,
        cost_per_1k_tokens: costPer1k,
        estimated_cost: Math.round(estimatedCost * 100) / 100
      };
    });
  }

  /**
   * Get best performing AI for specific use case
   */
  static async getBestPerformer(metric = 'success_rate') {
    let orderBy = 'success_rate DESC';
    
    if (metric === 'response_time') {
      orderBy = 'avg_response_time ASC';
    } else if (metric === 'cost') {
      orderBy = 'avg_tokens ASC';
    }

    const sql = `
      SELECT 
        ap.name as provider_name,
        COUNT(al.id) as total_requests,
        ROUND(
          COUNT(CASE WHEN al.success = true THEN 1 END) * 100.0 / COUNT(al.id), 
          2
        ) as success_rate,
        AVG(al.response_time_ms) as avg_response_time,
        AVG(al.tokens_used) as avg_tokens
      FROM ai_providers ap
      LEFT JOIN ai_logs al ON ap.id = al.provider_id
      WHERE al.timestamp >= NOW() - INTERVAL '7 days'
      GROUP BY ap.id
      HAVING COUNT(al.id) >= 10
      ORDER BY ${orderBy}
      LIMIT 1
    `;

    const result = await query(sql);
    return result.rows[0];
  }
}

module.exports = AIAnalytics;
