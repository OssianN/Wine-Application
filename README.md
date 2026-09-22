This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Cellar MCP

The app hosts a read-only MCP server at `/mcp`. ChatGPT and Grok can connect to `https://<your-app>/mcp` as a custom connector. The first time, you sign in on this app and allow read access. After that the connector stays linked until you remove it.

`list_wines` returns only the signed-in user's wine list. The chat decides what fits a meal, a budget, or a drinking window.

Set these on Vercel:

- `MCP_JWT_SECRET` — at least 16 characters
- `MCP_RESOURCE_URL` — the deployed origin, for example `https://your-app.vercel.app`

Optional, for local curl against the tools before OAuth is wired:

- `MCP_ACCESS_TOKEN`
- `MCP_USER_EMAIL` — the account whose cellar that token can read
