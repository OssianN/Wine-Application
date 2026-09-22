import { createMcpHandler, withMcpAuth } from 'mcp-handler';
import { CELLAR_READ_SCOPE } from '@/lib/oauth/constants';
import { userIdFromAuth, verifyMcpBearer } from '@/lib/mcp/verifyAccess';
import { getConfiguredResourceUrl } from '@/lib/oauth/urls';
import { getUserWine } from '@/mongoDB/getUserWine';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const LIST_WINES_DESCRIPTION = `Return the signed-in user's wine list. Use this list to answer questions about food pairing, price, drinking window, or anything else.

drinkingWindowStatus values:
0, 1, 2: Drink at your pace
3: Hold
4: Drink or hold
5: Drink now
6: Past its peak`;

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

        const wines = await getUserWine({ _id: userId });
        return {
          content: [{ type: 'text', text: JSON.stringify(wines) }],
        };
      }
    );
  },
  {},
  {
    basePath: '',
    disableSse: true,
    maxDuration: 60,
  }
);

const authHandler = withMcpAuth(handler, verifyMcpBearer, {
  required: true,
  requiredScopes: [CELLAR_READ_SCOPE],
  resourceMetadataPath: '/.well-known/oauth-protected-resource',
  resourceUrl: getConfiguredResourceUrl() ?? undefined,
});

export { authHandler as GET, authHandler as POST, authHandler as DELETE };
