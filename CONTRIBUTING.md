# Contributing

## Pull Requests

We welcome pull requests! Please ensure your contributions follow our guidelines.

## API Changes

We use [@microsoft/api-extractor](https://github.com/microsoft/rushstack/wiki/api-extractor) to validate the public API and detect breaking changes.

If you need to modify the public API, regenerate the API documentation by running:

```bash
npm run test-api
```

This will update `/etc/aitu-bridge.api.md` to reflect your changes.
