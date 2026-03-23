# verify-ocr (eKYC)

Identity verification uses **Mistral AI (Pixtral)** only: OCR and face verification are done via server API routes. No Tesseract or face-api in the flow.

## Flow

1. **Step 1 – Document:** Client sends image to `POST /api/identity-verification/ocr`. Server uses [Mistral Pixtral](https://ai-sdk.dev/providers/ai-sdk-providers/mistral) to extract text/fields. Requires `MISTRAL_API_KEY`.
2. **Step 2 – Face:** Client sends reference image (document) + selfie to `POST /api/identity-verification/verify`. Server uses Pixtral to compare. Requires `MISTRAL_API_KEY`.

## Setup

Set `MISTRAL_API_KEY` in `.env.local`. If the key is missing, API routes return 503 and the client shows an error.

**Security:** The key is used only in API routes (server-side). Never use `NEXT_PUBLIC_` for `MISTRAL_API_KEY`. Keep `.env.local` in `.gitignore` (it is by default).
