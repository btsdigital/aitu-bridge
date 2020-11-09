# Aitu Bridge

[![npm version](https://badge.fury.io/js/%40btsd%2Faitu-bridge.svg)](https://badge.fury.io/js/%40btsd%2Faitu-bridge)

## Installation
```bash
npm i @btsd/aitu-bridge
yarn add @btsd/aitu-bridge
```

## Documentation
https://docs.aitu.io/aitudocs/aitu.apps/aitu-bridge-api

## Usage
```js
import aituBridge from '@btsd/aitu-bridge';

async function getData() {
  try {
    // getMe method
    const data = await aituBridge.getMe();
    // handle data
  } catch (e) {
    // handle error
    console.log(e);
  }
}
```
