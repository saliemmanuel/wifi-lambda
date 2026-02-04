export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';
import type { Tenant } from './tenant';

export type SharedData = {
    name: string;
    auth: Auth;
    tenant: Tenant | null;
    sidebarOpen: boolean;
    [key: string]: unknown;
};
