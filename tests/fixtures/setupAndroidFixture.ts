import type { AndroidBridge, RequestMethods, HandlerMethodsMap } from '../../src/types';
import { createFnMock, BridgeFnMock } from './createFnMock';

type AndroidBridgeStub = {
  [P in RequestMethods]: BridgeFnMock<AndroidBridge[P]>;
} & {
  [P in keyof HandlerMethodsMap]: BridgeFnMock<HandlerMethodsMap[P]>;
};

export const setupAndroidFixture = () => {
  const androidBridgeStub: AndroidBridgeStub = {
    copyToClipboard: createFnMock<AndroidBridge['copyToClipboard']>(),
    invoke: createFnMock<AndroidBridge['invoke']>(),
    storage: createFnMock<AndroidBridge['storage']>(),
    share: createFnMock<AndroidBridge['share']>(),
    getGeo: createFnMock<AndroidBridge['getGeo']>(),
    getQr: createFnMock<AndroidBridge['getQr']>(),
    getSMSCode: createFnMock<AndroidBridge['getSMSCode']>(),
    selectContact: createFnMock<AndroidBridge['selectContact']>(),
    openSettings: createFnMock<AndroidBridge['openSettings']>(),
    closeApplication: createFnMock<AndroidBridge['closeApplication']>(),
    setTitle: createFnMock<AndroidBridge['setTitle']>(),
    enableScreenCapture: createFnMock<AndroidBridge['enableScreenCapture']>(),
    disableScreenCapture: createFnMock<AndroidBridge['disableScreenCapture']>(),
    vibrate: createFnMock<AndroidBridge['vibrate']>(),
    setHeaderMenuItems: createFnMock<AndroidBridge['setHeaderMenuItems']>(),
    shareFile: createFnMock<AndroidBridge['shareFile']>(),
    getUserStepInfo: createFnMock<AndroidBridge['getUserStepInfo']>(),
    getCustomBackArrowMode: createFnMock<AndroidBridge['getCustomBackArrowMode']>(),
    setCustomBackArrowMode: createFnMock<AndroidBridge['setCustomBackArrowMode']>(),
    setCustomBackArrowVisible: createFnMock<AndroidBridge['setCustomBackArrowVisible']>(),
    openPayment: createFnMock<AndroidBridge['openPayment']>(),
    checkBiometry: createFnMock<AndroidBridge['checkBiometry']>(),
    openExternalUrl: createFnMock<AndroidBridge['openExternalUrl']>(),
    enableSwipeBack: createFnMock<AndroidBridge['enableSwipeBack']>(),
    disableSwipeBack: createFnMock<AndroidBridge['disableSwipeBack']>(),
    setNavigationItemMode: createFnMock<AndroidBridge['setNavigationItemMode']>(),
    getNavigationItemMode: createFnMock<AndroidBridge['getNavigationItemMode']>(),
    isESimSupported: createFnMock<AndroidBridge['isESimSupported']>(),
    activateESim: createFnMock<AndroidBridge['activateESim']>(),
    readNFCData: createFnMock<AndroidBridge['readNFCData']>(),
    readNFCPassport: createFnMock<AndroidBridge['readNFCPassport']>(),
    subscribeUserStepInfo: createFnMock<AndroidBridge['subscribeUserStepInfo']>(),
    unsubscribeUserStepInfo: createFnMock<AndroidBridge['unsubscribeUserStepInfo']>(),
    openUserProfile: createFnMock<AndroidBridge['openUserProfile']>(),
    setShakeHandler: createFnMock<AndroidBridge['setShakeHandler']>(),
    setTabActiveHandler: createFnMock<AndroidBridge['setTabActiveHandler']>(),
    setCustomBackArrowOnClickHandler: createFnMock<AndroidBridge['setCustomBackArrowOnClickHandler']>(),
    setHeaderMenuItemClickHandler: createFnMock<AndroidBridge['setHeaderMenuItemClickHandler']>(),
  };

  if (!window.AndroidBridge) {
    window.AndroidBridge = androidBridgeStub as unknown as AndroidBridge;
  }

  return {
    stub: androidBridgeStub,
    cleanup: () => {
      window.AndroidBridge = undefined;
    },
  };
};
