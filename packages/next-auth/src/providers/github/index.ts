import { GitHub } from 'arctic';
import { type OAuth2Provider, type ProviderConfig } from '../providerType.js';
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
    validateAuthorizationCode: async (code: string) => {
      return provider.validateAuthorizationCode(code);
    },
    refreshAccessToken: async (refreshToken: string) => {
      return provider.refreshAccessToken(refreshToken);
    },
  };
};

export const githubProviderHandlers = {
  authorizeCallbackHandler,
  authorizeHandler,
};
