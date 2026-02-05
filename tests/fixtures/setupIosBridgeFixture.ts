import type { HandlerMethodsMap, IosBridge, RequestMethods } from '../../src/types';
import { createFnMock, createMessageHandlerMock, type BridgeFnMock } from './createFnMock';

type IosBridgeStub = {
  [P in RequestMethods]: { postMessage: BridgeFnMock<IosBridge[P]['postMessage']> };
} & {
  [P in keyof HandlerMethodsMap]: BridgeFnMock<HandlerMethodsMap[P]>;
};

export const setupIosFixture = () => {
  const iosBridgeStub: IosBridgeStub = {
    copyToClipboard: createMessageHandlerMock<'copyToClipboard'>(),
    invoke: createMessageHandlerMock<'invoke'>(),
    storage: createMessageHandlerMock<'storage'>(),
    share: createMessageHandlerMock<'share'>(),
    getGeo: createMessageHandlerMock<'getGeo'>(),
    getQr: createMessageHandlerMock<'getQr'>(),
    getSMSCode: createMessageHandlerMock<'getSMSCode'>(),
    selectContact: createMessageHandlerMock<'selectContact'>(),
    openSettings: createMessageHandlerMock<'openSettings'>(),
    closeApplication: createMessageHandlerMock<'closeApplication'>(),
    setTitle: createMessageHandlerMock<'setTitle'>(),
    enableScreenCapture: createMessageHandlerMock<'enableScreenCapture'>(),
    disableScreenCapture: createMessageHandlerMock<'disableScreenCapture'>(),
    vibrate: createMessageHandlerMock<'vibrate'>(),
    setHeaderMenuItems: createMessageHandlerMock<'setHeaderMenuItems'>(),
    shareFile: createMessageHandlerMock<'shareFile'>(),
    getUserStepInfo: createMessageHandlerMock<'getUserStepInfo'>(),
    getCustomBackArrowMode: createMessageHandlerMock<'getCustomBackArrowMode'>(),
    setCustomBackArrowMode: createMessageHandlerMock<'setCustomBackArrowMode'>(),
    setCustomBackArrowVisible: createMessageHandlerMock<'setCustomBackArrowVisible'>(),
    openPayment: createMessageHandlerMock<'openPayment'>(),
    checkBiometry: createMessageHandlerMock<'checkBiometry'>(),
    openExternalUrl: createMessageHandlerMock<'openExternalUrl'>(),
    enableSwipeBack: createMessageHandlerMock<'enableSwipeBack'>(),
    disableSwipeBack: createMessageHandlerMock<'disableSwipeBack'>(),
    setNavigationItemMode: createMessageHandlerMock<'setNavigationItemMode'>(),
    getNavigationItemMode: createMessageHandlerMock<'getNavigationItemMode'>(),
    isESimSupported: createMessageHandlerMock<'isESimSupported'>(),
    activateESim: createMessageHandlerMock<'activateESim'>(),
    readNFCData: createMessageHandlerMock<'readNFCData'>(),
    readNFCPassport: createMessageHandlerMock<'readNFCPassport'>(),
    subscribeUserStepInfo: createMessageHandlerMock<'subscribeUserStepInfo'>(),
    unsubscribeUserStepInfo: createMessageHandlerMock<'unsubscribeUserStepInfo'>(),
    openUserProfile: createMessageHandlerMock<'openUserProfile'>(),
    setShakeHandler: createFnMock<IosBridge['setShakeHandler']>(),
    setTabActiveHandler: createFnMock<IosBridge['setTabActiveHandler']>(),
    setCustomBackArrowOnClickHandler: createFnMock<IosBridge['setCustomBackArrowOnClickHandler']>(),
    setHeaderMenuItemClickHandler: createFnMock<IosBridge['setHeaderMenuItemClickHandler']>(),
  };

  if (!window?.webkit) {
    window.webkit = {
      messageHandlers: iosBridgeStub as unknown as IosBridge,
    };
  }

  return {
    stub: iosBridgeStub,
    cleanup: () => {
      window.webkit = undefined;
    },
  };
};
