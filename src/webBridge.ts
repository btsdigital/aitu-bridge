import type { RequestMethods } from './types';

const AITU_DOMAIN_PARAM = '__aitu-domain'

const searchParams = new URLSearchParams(window.location.search)

let aituOrigin = searchParams.get(AITU_DOMAIN_PARAM)

if(aituOrigin){
    localStorage.setItem('mini-app-domain', aituOrigin)
}else{
    aituOrigin = localStorage.getItem('mini-app-domain')
}
interface WebBridge {
    execute(method: RequestMethods, reqId: string, ...payload: unknown[] ): void
    origin: string
}

let WebBridge: WebBridge | null = null

if (aituOrigin) {
    const origin = aituOrigin;

    WebBridge = {
        origin: aituOrigin,
        execute: (method, reqId, ...payload) => {
            window?.top?.postMessage({
                    source: 'aitu-bridge',
                    method,
                    reqId,
                    payload: [...payload],
                },
                origin
            )
    }

    }
    window.addEventListener('message', event => {
        if (event.origin === aituOrigin && event.data) {

            // dispatch aitu events
            window.dispatchEvent(new CustomEvent('aituEvents', { detail: event.data }));

            // try to detect handler call
            if (typeof event.data !== 'string' || event.data === '') {
                return;
            }

            try {
                const message = JSON.parse(event.data)

                if (message && message['method']) {
                    if (message.method === 'setCustomBackArrowOnClickHandler') {
                        window.onAituBridgeBackArrowClick?.()
                    } else if (message.method === 'setHeaderMenuItemClickHandler') {
                        window.onAituBridgeHeaderMenuItemClick?.(message.param)
                    }
                }
            } catch (e) {
                console.log('Error parsing message data: ' + e);
            }
        }
    })
}

export default WebBridge
