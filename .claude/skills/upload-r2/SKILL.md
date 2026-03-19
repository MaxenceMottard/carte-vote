---
name: upload-r2
description: Upload data files to the carte-vote Cloudflare R2 bucket. Use this when the user wants to upload or update files on R2.
---

Upload files to the `carte-vote` Cloudflare R2 bucket using wrangler.

## Rules

- Always use the `--remote` flag, otherwise wrangler writes locally
- Always specify `--content-type` to ensure correct HTTP headers
- Run uploads in parallel when uploading multiple files

## R2 bucket structure

```
carte-vote/
└── municipales-2026/
    ├── candidats-elus-t1.json
    └── resultats-communes-t1.json
```

## Steps

1. Confirm which files need to be uploaded and their target R2 paths
2. `cd` into the directory containing the files
3. Run the upload commands (in parallel if multiple files):

```bash
wrangler r2 object put carte-vote/<r2-path>/<filename>.json \
  --file <filename>.json \
  --content-type application/json \
  --remote
```

### Example — upload both municipales-2026 files

```bash
wrangler r2 object put carte-vote/municipales-2026/candidats-elus-t1.json \
  --file candidats-elus-t1.json \
  --content-type application/json \
  --remote &

wrangler r2 object put carte-vote/municipales-2026/resultats-communes-t1.json \
  --file resultats-communes-t1.json \
  --content-type application/json \
  --remote &

wait
```

4. Confirm "Upload complete" appears for each file
5. Report any failures and retry individually with the `--remote` flag
