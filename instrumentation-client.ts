// Runs before any other client code (Next.js instrumentation-client hook).
//
// zod v4 probes for eval support with `new Function('')` whenever a module
// creates a `z.object` schema. The CSP has no 'unsafe-eval'
// (lib/security-headers.mjs), so the probe is reported as a CSP violation even
// though zod catches it. jitless skips the probe; parsing results are the same.
// It must run here, before the first schema is built, not in a component.
import { config } from 'zod/v4/core';

config({ jitless: true });
