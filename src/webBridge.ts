import type { AituBridge } from './index';

const AITU_DOMAIN_PARAM = '__aitu-domain'

const searchParams = new URLSearchParams(window.location.search)

let aituOrigin = searchParams.get(AITU_DOMAIN_PARAM)

if(aituOrigin){
    localStorage.setItem('mini-app-domain', aituOrigin)
}else{
    aituOrigin = localStorage.getItem('mini-app-domain')
}
interface WebBridge {
    execute(method: keyof AituBridge, reqId: string, ...payload: any[] ): void
    origin: string
}

let WebBridge: WebBridge | null = null

if (aituOrigin) {
    WebBridge = {
        origin: aituOrigin,
        execute: (method, reqId, ...payload) => {
            window.top.postMessage({
                    source: 'aitu-bridge',
                    method,
                    reqId,
                    payload: [...payload],
                },
                WebBridge.origin
            )
    }

    }
    window.addEventListener('message', event => {
        if (event.origin === aituOrigin && event.data) {
            window.dispatchEvent(new CustomEvent('aituEvents', { detail: event.data }));
        }
    })
}

export default WebBridge
