export interface OAuth2Tokens {
  accessToken: string;
  refreshToken?: string | null;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date | null;
  idToken?: string;
}

export interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  enterpriseDomain?: string;
}

export interface OAuth2Provider {
  createAuthorizationURL(state: string, scopes?: string[]): Promise<URL>;
  validateAuthorizationCode(code: string): Promise<OAuth2Tokens>;
  refreshAccessToken?(refreshToken: string): Promise<OAuth2Tokens>;
}
