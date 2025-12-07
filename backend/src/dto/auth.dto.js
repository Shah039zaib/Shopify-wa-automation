/**
 * Auth DTOs
 * Data Transfer Objects for authentication
 */

/**
 * Format user response (hide sensitive data)
 */
function formatUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

/**
 * Format login response
 */
function formatLoginResponse(user, tokens) {
  return {
    user: formatUserResponse(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
}

/**
 * Format token response
 */
function formatTokenResponse(tokens) {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tokenType: 'Bearer',
    expiresIn: process.env.JWT_EXPIRE || '7d'
  };
}

module.exports = {
  formatUserResponse,
  formatLoginResponse,
  formatTokenResponse
};
