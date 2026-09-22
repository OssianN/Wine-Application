import {
  GET_protectedResource,
  OPTIONS_discovery,
} from '@/lib/oauth/discoveryRoutes';

export const dynamic = 'force-dynamic';

export const GET = GET_protectedResource;
export const OPTIONS = OPTIONS_discovery;
