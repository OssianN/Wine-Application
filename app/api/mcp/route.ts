import { createMcpHandler, withMcpAuth } from 'mcp-handler';
import { CELLAR_READ_SCOPE } from '@/lib/oauth/constants';
import { wineForMcp } from '@/lib/mcp/cellarPosition';
import { userIdFromAuth, verifyMcpBearer } from '@/lib/mcp/verifyAccess';
import { mcpResourceIdentifier } from '@/lib/oauth/metadata';
import { getConfiguredResourceUrl } from '@/lib/oauth/urls';
import { getUserWine } from '@/mongoDB/getUserWine';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const LIST_WINES_DESCRIPTION = `Return the signed-in user's wine list. Use this list to answer questions about food pairing, price, drinking window, or anything else.

Each wine already includes:
- position: shelf:column using the same 1-based numbers shown in the app (for example 2:5)
- drinkingWindowStatus: a label such as Drink now or Past its peak, not a number
- drinkingWindow: the drink-by years when known

When you recommend a bottle, always include its position and drinkingWindowStatus. Never say a numeric status.`;

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
