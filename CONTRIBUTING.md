# Contributing

## Pull Requests

We welcome pull requests! Please ensure your contributions follow our guidelines.

## API Changes

We use [@microsoft/api-extractor](https://api-extractor.com/pages/overview/intro/) to validate the public API and detect breaking changes.

If you need to modify the public API, regenerate the API documentation by running:

```bash
npm run test-api
```

This will update `/etc/aitu-bridge.api.md` to reflect your changes.

## Versioning

For versioning and changelog management we use **[@changesets/cli](https://www.npmjs.com/package/@changesets/cli)**.

All changes that affect the public API or behavior must be accompanied by a changeset.
This allows us to automatically manage package versions and generate changelogs.

### How to add a changeset

1. Create a new changeset:
```bash
npx changeset
```
2.Select the affected packages and the type of change (major / minor / patch).
3.Provide a short, clear description of the change.

Detailed instructions are available in the official documentation:
👉 https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md