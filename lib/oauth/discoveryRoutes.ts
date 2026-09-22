import { oauthJson, oauthOptions } from './cors';
import {
  authorizationServerMetadata,
  protectedResourceMetadata,
} from './metadata';
import { resolveResourceUrl } from './urls';

export const GET_authorizationServer = (req: Request) =>
  oauthJson(authorizationServerMetadata(resolveResourceUrl(req)));

export const GET_protectedResource = (req: Request) =>
  oauthJson(protectedResourceMetadata(resolveResourceUrl(req)));

export const OPTIONS_discovery = () => oauthOptions();
