import { AsyncLocalStorage } from 'async_hooks';

export class RequestContext {
    static cls = new AsyncLocalStorage<RequestContext>();

    constructor() {
        // Initialize request context
    }

    public user: any;

    static getCurrentContext(): RequestContext | undefined {
        return this.cls.getStore();
    }
}
