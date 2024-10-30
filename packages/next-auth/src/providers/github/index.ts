import { GitHub } from 'arctic';
import {
  type OAuth2Provider,
  type OAuth2Tokens,
  type ProviderConfig,
} from '../providerType.js';
import { authorizeCallbackHandler, authorizeHandler } from './handlers.js';

export const createGithubProvider = (
  config: ProviderConfig
): OAuth2Provider => {
  const { redirectUri, clientId, clientSecret } = config;
  const provider = new GitHub(clientId, clientSecret, redirectUri || null);

  return {
    createAuthorizationURL: async (state: string, scopes?: string[]) => {
      return provider.createAuthorizationURL(state, scopes || []);
    },
    validateAuthorizationCode: async (code: string): Promise<OAuth2Tokens> => {
      const result = await provider.validateAuthorizationCode(code);
      return {
        idToken: result.idToken(),
        accessToken: result.accessToken(),
        accessTokenExpiresAt: result.accessTokenExpiresAt(),
        refreshToken: result.refreshToken(),
        refreshTokenExpiresAt: result.accessTokenExpiresAt(),
      };
    },
    refreshAccessToken: async (refreshToken: string): Promise<OAuth2Tokens> => {
      const result = await provider.refreshAccessToken(refreshToken);
      return {
        idToken: result.idToken(),
        accessToken: result.accessToken(),
        accessTokenExpiresAt: result.accessTokenExpiresAt(),
        refreshToken: result.refreshToken(),
        refreshTokenExpiresAt: result.accessTokenExpiresAt(),
      };
    },
  };
};

export const githubProviderHandlers = {
  authorizeCallbackHandler,
  authorizeHandler,
};
