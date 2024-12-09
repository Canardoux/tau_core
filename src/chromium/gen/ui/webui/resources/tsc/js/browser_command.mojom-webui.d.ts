import { mojo } from '//resources/mojo/mojo/public/js/bindings.js';
export declare const CommandSpec: {
    $: mojo.internal.MojomType;
};
export declare enum Command {
    MIN_VALUE = 0,
    MAX_VALUE = 16,
    kUnknownCommand = 0,
    kOpenSafetyCheck = 1,
    kOpenSafeBrowsingEnhancedProtectionSettings = 2,
    kOpenFeedbackForm = 3,
    kOpenPrivacyGuide = 4,
    kStartTabGroupTutorial = 5,
    kOpenPasswordManager = 6,
    kNoOpCommand = 7,
    kOpenPerformanceSettings = 8,
    kOpenNTPAndStartCustomizeChromeTutorial = 9,
    kStartPasswordManagerTutorial = 10,
    kStartSavedTabGroupTutorial = 11,
    kOpenAISettings = 12,
    kOpenSafetyCheckFromWhatsNew = 13,
    kOpenPaymentsSettings = 14,
    KOpenHistorySearchSettings = 15,
    kShowCustomizeChromeToolbar = 16
}
export declare class CommandHandlerFactoryPendingReceiver implements mojo.internal.interfaceSupport.PendingReceiver {
    handle: mojo.internal.interfaceSupport.Endpoint;
    constructor(handle: MojoHandle | mojo.internal.interfaceSupport.Endpoint);
    bindInBrowser(scope?: string): void;
}
export interface CommandHandlerFactoryInterface {
    createBrowserCommandHandler(handler: CommandHandlerPendingReceiver): void;
}
export declare class CommandHandlerFactoryRemote implements CommandHandlerFactoryInterface {
    private proxy;
    $: mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper<CommandHandlerFactoryPendingReceiver>;
    onConnectionError: mojo.internal.interfaceSupport.ConnectionErrorEventRouter;
    constructor(handle?: MojoHandle | mojo.internal.interfaceSupport.Endpoint);
    createBrowserCommandHandler(handler: CommandHandlerPendingReceiver): void;
}
/**
 * An object which receives request messages for the CommandHandlerFactory
 * mojom interface. Must be constructed over an object which implements that
 * interface.
 */
export declare class CommandHandlerFactoryReceiver {
    private helper_internal_;
    $: mojo.internal.interfaceSupport.InterfaceReceiverHelper<CommandHandlerFactoryRemote>;
    onConnectionError: mojo.internal.interfaceSupport.ConnectionErrorEventRouter;
    constructor(impl: CommandHandlerFactoryInterface);
}
export declare class CommandHandlerFactory {
    static get $interfaceName(): string;
    /**
     * Returns a remote for this interface which sends messages to the browser.
     * The browser must have an interface request binder registered for this
     * interface and accessible to the calling document's frame.
     */
    static getRemote(): CommandHandlerFactoryRemote;
}
/**
 * An object which receives request messages for the CommandHandlerFactory
 * mojom interface and dispatches them as callbacks. One callback receiver exists
 * on this object for each message defined in the mojom interface, and each
 * receiver can have any number of listeners added to it.
 */
export declare class CommandHandlerFactoryCallbackRouter {
    private helper_internal_;
    $: mojo.internal.interfaceSupport.InterfaceReceiverHelper<CommandHandlerFactoryRemote>;
    router_: mojo.internal.interfaceSupport.CallbackRouter;
    createBrowserCommandHandler: mojo.internal.interfaceSupport.InterfaceCallbackReceiver;
    onConnectionError: mojo.internal.interfaceSupport.ConnectionErrorEventRouter;
    constructor();
    /**
     * @param id An ID returned by a prior call to addListener.
     * @return True iff the identified listener was found and removed.
     */
    removeListener(id: number): boolean;
}
export declare class CommandHandlerPendingReceiver implements mojo.internal.interfaceSupport.PendingReceiver {
    handle: mojo.internal.interfaceSupport.Endpoint;
    constructor(handle: MojoHandle | mojo.internal.interfaceSupport.Endpoint);
    bindInBrowser(scope?: string): void;
}
export interface CommandHandlerInterface {
    canExecuteCommand(commandId: Command): Promise<{
        canExecute: boolean;
    }>;
    executeCommand(commandId: Command, clickInfo: ClickInfo): Promise<{
        commandExecuted: boolean;
    }>;
}
export declare class CommandHandlerRemote implements CommandHandlerInterface {
    private proxy;
    $: mojo.internal.interfaceSupport.InterfaceRemoteBaseWrapper<CommandHandlerPendingReceiver>;
    onConnectionError: mojo.internal.interfaceSupport.ConnectionErrorEventRouter;
    constructor(handle?: MojoHandle | mojo.internal.interfaceSupport.Endpoint);
    canExecuteCommand(commandId: Command): Promise<{
        canExecute: boolean;
    }>;
    executeCommand(commandId: Command, clickInfo: ClickInfo): Promise<{
        commandExecuted: boolean;
    }>;
}
/**
 * An object which receives request messages for the CommandHandler
 * mojom interface. Must be constructed over an object which implements that
 * interface.
 */
export declare class CommandHandlerReceiver {
    private helper_internal_;
    $: mojo.internal.interfaceSupport.InterfaceReceiverHelper<CommandHandlerRemote>;
    onConnectionError: mojo.internal.interfaceSupport.ConnectionErrorEventRouter;
    constructor(impl: CommandHandlerInterface);
}
export declare class CommandHandler {
    static get $interfaceName(): string;
    /**
     * Returns a remote for this interface which sends messages to the browser.
     * The browser must have an interface request binder registered for this
     * interface and accessible to the calling document's frame.
     */
    static getRemote(): CommandHandlerRemote;
}
/**
 * An object which receives request messages for the CommandHandler
 * mojom interface and dispatches them as callbacks. One callback receiver exists
 * on this object for each message defined in the mojom interface, and each
 * receiver can have any number of listeners added to it.
 */
export declare class CommandHandlerCallbackRouter {
    private helper_internal_;
    $: mojo.internal.interfaceSupport.InterfaceReceiverHelper<CommandHandlerRemote>;
    router_: mojo.internal.interfaceSupport.CallbackRouter;
    canExecuteCommand: mojo.internal.interfaceSupport.InterfaceCallbackReceiver;
    executeCommand: mojo.internal.interfaceSupport.InterfaceCallbackReceiver;
    onConnectionError: mojo.internal.interfaceSupport.ConnectionErrorEventRouter;
    constructor();
    /**
     * @param id An ID returned by a prior call to addListener.
     * @return True iff the identified listener was found and removed.
     */
    removeListener(id: number): boolean;
}
export declare const ClickInfoSpec: {
    $: mojo.internal.MojomType;
};
export declare const CommandHandlerFactory_CreateBrowserCommandHandler_ParamsSpec: {
    $: mojo.internal.MojomType;
};
export declare const CommandHandler_CanExecuteCommand_ParamsSpec: {
    $: mojo.internal.MojomType;
};
export declare const CommandHandler_CanExecuteCommand_ResponseParamsSpec: {
    $: mojo.internal.MojomType;
};
export declare const CommandHandler_ExecuteCommand_ParamsSpec: {
    $: mojo.internal.MojomType;
};
export declare const CommandHandler_ExecuteCommand_ResponseParamsSpec: {
    $: mojo.internal.MojomType;
};
export interface ClickInfoMojoType {
    middleButton: boolean;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
}
export type ClickInfo = ClickInfoMojoType;
export interface CommandHandlerFactory_CreateBrowserCommandHandler_ParamsMojoType {
    handler: CommandHandlerPendingReceiver;
}
export type CommandHandlerFactory_CreateBrowserCommandHandler_Params = CommandHandlerFactory_CreateBrowserCommandHandler_ParamsMojoType;
export interface CommandHandler_CanExecuteCommand_ParamsMojoType {
    commandId: Command;
}
export type CommandHandler_CanExecuteCommand_Params = CommandHandler_CanExecuteCommand_ParamsMojoType;
export interface CommandHandler_CanExecuteCommand_ResponseParamsMojoType {
    canExecute: boolean;
}
export type CommandHandler_CanExecuteCommand_ResponseParams = CommandHandler_CanExecuteCommand_ResponseParamsMojoType;
export interface CommandHandler_ExecuteCommand_ParamsMojoType {
    commandId: Command;
    clickInfo: ClickInfo;
}
export type CommandHandler_ExecuteCommand_Params = CommandHandler_ExecuteCommand_ParamsMojoType;
export interface CommandHandler_ExecuteCommand_ResponseParamsMojoType {
    commandExecuted: boolean;
}
export type CommandHandler_ExecuteCommand_ResponseParams = CommandHandler_ExecuteCommand_ResponseParamsMojoType;
