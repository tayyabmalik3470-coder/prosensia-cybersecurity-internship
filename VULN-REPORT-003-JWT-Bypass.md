# Vulnerability Report

**Report ID:** VULN-003
**Date:** July 7, 2026
**Reported By:** Malik (Security Task Force — Day 3)
**Target Application:** OWASP Juice Shop (local sandbox, `localhost:3000`)
**Environment:** Docker container `bkimminich/juice-shop`, running locally on Docker Desktop (Windows 11). Traffic was intercepted using Burp Suite Community Edition (Proxy + Repeater).

---

## 1. Summary

| Field | Value |
|---|---|
| Title | JWT "alg:none" Signature Bypass leading to Privilege Escalation |
| Severity | Critical |
| CVSS 3.1 Score | 9.8 (Critical) |
| CVSS Vector | `AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H` |
| CWE Classification | CWE-347: Improper Verification of Cryptographic Signature |
| OWASP Top 10 Category | A07:2021 – Identification and Authentication Failures |
| Affected Component | JWT verification on authenticated endpoints (e.g. `/rest/user/whoami`, `/rest/admin/application-configuration`) |

---

## 2. Description

Juice Shop uses JSON Web Tokens (JWT) to keep users logged in. After logging in, every request carries this token in the `Authorization: Bearer <token>` header so the server knows who's making the request.

A JWT has 3 parts separated by dots: Header, Payload, and Signature. The Header and Payload are just Base64-encoded — not encrypted — so anyone can decode and read them. The Signature is supposed to be the only thing stopping someone from tampering with the token, since it's generated using a secret key only the server knows.

The problem is that the server didn't properly check the signature. By setting the algorithm in the Header to `"alg": "none"` and completely removing the signature part, it was possible to submit a token where the payload said `"role": "admin"` — and the server accepted it as valid, without checking whether it was actually signed by anyone.

---

## 3. Steps to Reproduce

1. Registered a normal account (`hacker@test.com`) on Juice Shop and logged in through Burp's browser.
2. Went to Burp's HTTP History, found the login response, and copied the JWT from the `token` field.
3. Pasted the token into jwt.io to decode it. Confirmed the payload showed `"role": "customer"`.
4. Took the decoded Header (`{"alg":"HS256","typ":"JWT"}`) and manually changed it to:
   ```json
   {"alg":"none","typ":"JWT"}
   ```
5. Took the decoded Payload and changed `"role":"customer"` to `"role":"admin"`, keeping everything else (id, email, password hash) the same.
6. Base64URL-encoded both the new Header and new Payload manually (using base64encode.org, with the URL-safe option enabled — no signing library or extension used).
7. Built the final forged token as: `<new-header>.<new-payload>.` — note the trailing dot with nothing after it, since there's no signature.
8. Sent a request to `GET /rest/user/whoami` in Repeater with the forged token in the `Authorization` header — got `200 OK`.
9. To confirm privilege escalation more clearly, sent the same forged token to an admin-only endpoint: `GET /rest/admin/application-configuration`.
10. Got `200 OK` back with the full server/application configuration — an endpoint that should only be reachable by an admin account.

**Note:** No JWT-forging extensions or automated tools were used. The header and payload were edited and re-encoded by hand in Burp Repeater, as required by the task.

---

## 4. Expected vs. Actual Behavior

| Behavior | Description |
|---|---|
| Expected | The server should reject any token where the signature doesn't verify, and should specifically reject tokens using `"alg":"none"` since that means no signature was applied at all. A tampered `role` claim should never be trusted. |
| Actual | The server accepted a token with `"alg":"none"` and no signature at all, and trusted the `role: admin` claim inside it, granting access to an admin-only endpoint. |

---

## 5. Evidence

- **Screenshot 1:** jwt.io showing the original, legitimate token decoded — payload shows `"role":"customer"`. (`screenshots/jwt-original-payload-decoded.png`)
- **Screenshot 2:** Burp Repeater request to `/rest/admin/application-configuration` with the manually forged `alg:none` token in the Authorization header. (`screenshots/jwt-forged-request-admin-endpoint.png`)
- **Screenshot 3:** Burp Repeater response — `200 OK` with the full application configuration returned, proving the forged admin token was accepted. (`screenshots/jwt-forged-response-admin-access.png`)

(Screenshots attached in the repo)

---

## 6. Impact

If this were a real deployed app, this bug would let anyone:

- Turn any normal account into an admin account just by editing a token — no password, no real credentials needed
- Access admin-only endpoints and data (as shown here with the application configuration endpoint)
- Potentially access, modify, or delete any user's data by simply changing the `id` or `email` in the forged payload
- Fully take over the authentication system, since the "proof of identity" (the token) turned out not to actually need proving

Because this requires no real access to begin with (just decode a token anyone can obtain by registering an account) and directly leads to full admin access, this is rated **Critical**.

---

## 7. Remediation

How this should actually be fixed:

1. **Explicitly reject `"alg":"none"`** — the server-side JWT library should be configured to only accept a specific expected algorithm (e.g. `HS256`), and reject anything else outright, instead of trusting whatever algorithm the token claims to use.
2. **Always verify the signature on every request** — never skip verification, and never let the algorithm specified inside the token itself decide how it gets verified.
3. **Use a well-tested JWT library correctly** — most JWT libraries (like `jsonwebtoken` for Node.js) support this safely if configured properly, but are vulnerable if the algorithm isn't explicitly pinned during verification.
4. **Never trust claims like `role` without re-checking server-side** — ideally the server should look up the actual user's role from the database rather than fully trusting whatever role is written inside the token.

**Example fix (Node.js / `jsonwebtoken` library):**

```js
// BAD: verifies without specifying which algorithm is allowed
// this can let an attacker pick "none" and skip verification entirely
jwt.verify(token, secretOrPublicKey);

// GOOD: explicitly restrict which algorithm(s) are accepted
jwt.verify(token, secretKey, {
  algorithms: ["HS256"]   // "none" and anything else will be rejected
});

// EVEN BETTER: don't fully trust the role from the token,
// re-check it against the database for sensitive actions
const decoded = jwt.verify(token, secretKey, { algorithms: ["HS256"] });
const user = await db.Users.findByPk(decoded.data.id);
if (user.role !== "admin") {
  return res.status(403).send("Forbidden");
}
```

---

## 8. References

- OWASP Top 10 2021 – A07:2021 Identification and Authentication Failures: https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/
- CWE-347: https://cwe.mitre.org/data/definitions/347.html
- PortSwigger Web Security Academy – JWT Attacks: https://portswigger.net/web-security/jwt
- JWT.io Introduction: https://jwt.io/introduction

---

## 9. Ethical & Scope Notes

All testing was done manually on a locally-deployed, isolated Docker sandbox (OWASP Juice Shop) — nothing was tested against any public/live server. No JWT-forging tools or browser extensions were used; the header and payload were edited and re-encoded by hand to actually understand the byte-level mechanics of the exploit, as required for this assignment.

This report is for educational/training purposes only, as part of the Cyber Security Task Force Day 3 assignment.
