import { createMcpHandler, withMcpAuth } from 'mcp-handler';
import { CELLAR_READ_SCOPE } from '@/lib/oauth/constants';
import { LIST_WINES_DESCRIPTION, wineForMcp } from '@/lib/mcp/cellarPosition';
import { userIdFromAuth, verifyMcpBearer } from '@/lib/mcp/verifyAccess';
import { mcpResourceIdentifier } from '@/lib/oauth/metadata';
import { getConfiguredResourceUrl } from '@/lib/oauth/urls';
import { getUserWine } from '@/mongoDB/getUserWine';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const handler = createMcpHandler(
  server => {
    server.registerTool(
      'list_wines',
      {
        title: 'List wines',
        description: LIST_WINES_DESCRIPTION,
        inputSchema: {},
      },
      async (_args, extra) => {
        const userId = userIdFromAuth(extra.authInfo);
        if (!userId) {
          return {
            content: [{ type: 'text', text: 'Unauthorized' }],
            isError: true,
          };
        }

        const wines = (await getUserWine({ _id: userId })).map(wineForMcp);
        return {
          content: [{ type: 'text', text: JSON.stringify(wines) }],
        };
      }
    );
  },
  {},
  {
    basePath: '/api',
    disableSse: true,
    maxDuration: 60,
  }
);

const configuredOrigin = getConfiguredResourceUrl();

const authHandler = withMcpAuth(handler, verifyMcpBearer, {
  required: true,
  requiredScopes: [CELLAR_READ_SCOPE],
  resourceMetadataPath: '/.well-known/oauth-protected-resource/api/mcp',
  resourceUrl: configuredOrigin
    ? mcpResourceIdentifier(configuredOrigin)
    : undefined,
});

export { authHandler as GET, authHandler as POST, authHandler as DELETE };
