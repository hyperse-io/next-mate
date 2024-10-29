import type { OAuth2Tokens } from 'arctic';

export interface OAuth2Provider {
  createAuthorizationURL(state: string, scopes?: string[]): Promise<URL>;
  validateAuthorizationCode(code: string): Promise<OAuth2Tokens>;
  refreshAccessToken?(refreshToken: string): Promise<OAuth2Tokens>;
}

export interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  enterpriseDomain?: string;
}
