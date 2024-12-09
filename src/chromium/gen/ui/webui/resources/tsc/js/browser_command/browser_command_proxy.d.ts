import { CommandHandlerRemote } from '../browser_command.mojom-webui.js';
export declare class BrowserCommandProxy {
    static getInstance(): BrowserCommandProxy;
    static setInstance(newInstance: BrowserCommandProxy): void;
    handler: CommandHandlerRemote;
    constructor();
}
