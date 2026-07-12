# Vulnerability Report

**Report ID:** VULN-004
**Date:** July 9, 2026
**Reported By:** Malik (Security Task Force — Day 4)
**Target Application:** OWASP Juice Shop (local sandbox, `localhost:3000`)
**Environment:** Docker container `bkimminich/juice-shop`, local Docker Desktop (Windows 11). Attack run using Burp Suite Community Edition (Intruder).

---

## 1. Summary

| Field | Value |
|---|---|
| Title | No Rate Limiting on Login (Brute-Force Attack Possible) |
| Severity | High |
| CVSS 3.1 Score | 8.1 (High) |
| CVSS Vector | `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:N` |
| CWE Classification | CWE-307: Improper Restriction of Excessive Authentication Attempts |
| OWASP Top 10 Category | A07:2021 – Identification and Authentication Failures |
| Affected Component | Login endpoint (`POST /rest/user/login`) |

---

## 2. Description

The login page doesn't stop you from trying passwords over and over. No lockout, no delay, no CAPTCHA, nothing — you can just keep sending login attempts back to back as fast as you want.

This basically means it doesn't matter how strong the password hashing is on the backend, because the attack isn't on the hash, it's just on the login form itself. If you can guess unlimited times, you'll eventually land on the right password, especially a common one.

---

## 3. Steps to Reproduce

1. Caught a failed login request (`admin@juice-sh.op` + wrong password) in Burp and sent it to Intruder.
2. In Positions, only marked the password field as the payload spot — email stayed fixed.
3. In Payloads, added a small list of common passwords manually (15 total — things like `123456`, `password`, `admin123`, `qwerty`, etc). Didn't use the full rockyou.txt, just a small sample for this test.
4. Hit Start Attack.
5. All 15 attempts fired one after another instantly, no blocking of any kind.
6. Checked the results table — attempt #3 (`admin123`) came back `200 OK` with a different response length (1170) compared to every other failed attempt (401, length 413).
7. That confirmed the admin password is `admin123` — cracked in literally 15 tries with zero resistance from the server.

**Quick log note:** all 15 requests finished in under a second (response times were like 10-39ms each). At that speed someone could realistically throw hundreds of attempts per minute at one IP. A simple way to flag this kind of attack would be something like: if one IP fails login more than ~20-30 times in a minute, that's not a real person typing, that's a script.

---

## 4. Expected vs. Actual Behavior

| Behavior | Description |
|---|---|
| Expected | After a handful of failed attempts (say 5) from the same IP in a short window, the server should start blocking or slowing things down, no matter how fast the requests come in. |
| Actual | It just let all 15 rapid attempts through with no resistance, and the correct password was found almost instantly. |

---

## 5. Evidence

- Screenshot 1: Intruder Positions tab, password field marked as the payload spot. (`screenshots/intruder-payload-position-marked.png`)
- Screenshot 2: Intruder Payloads tab, the 15 passwords loaded in. (`screenshots/intruder-payload-list-loaded-day4.png`)
- Screenshot 3: Intruder Results table — attempt #3 (`admin123`) at 200 OK, everything else at 401. (`screenshots/intruder-attack-results-admin123-found.png`)

(Screenshots attached in the repo)

---

## 6. Impact

If this were live:

- Anyone could throw thousands of guesses a minute at any account with nothing stopping them
- Weak/common passwords get cracked in minutes, like admin's here
- Credential stuffing (using leaked email/password combos from other breaches) would work great here too
- All the password hashing in the world doesn't help if the login form itself has no limit

Since it needs zero special access and directly cracked an admin account in this test, calling this **High** severity.

---

## 7. Remediation

What actually needs to happen:

1. Rate-limit the login route — like max 5 failed attempts per IP per 15 minutes, then block/delay further tries.
2. Also throttle per-account, not just per-IP, since attackers can rotate IPs but usually keep hitting the same account.
3. Add a CAPTCHA after a few failed tries to stop automated tools like Intruder.
4. Log/alert on repeated failed logins so someone notices an attack while it's happening, not after.

**Fix example (Node.js / Express, using `express-rate-limit`):**

```js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,                    // 5 tries per IP per window
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

app.post('/rest/user/login', loginLimiter, (req, res) => {
  // ...existing login logic
});
```

Basic account-level lockout on top of that:

```js
if (user.failedLoginCount >= 5) {
  const lockoutEnds = new Date(user.lastFailedLogin.getTime() + 15 * 60 * 1000);
  if (new Date() < lockoutEnds) {
    return res.status(429).send("Account temporarily locked. Try later.");
  }
}
```

---

## 8. References

- OWASP A07:2021 – Identification and Authentication Failures: https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/
- CWE-307: https://cwe.mitre.org/data/definitions/307.html
- OWASP Credential Stuffing Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html
- express-rate-limit docs: https://www.npmjs.com/package/express-rate-limit

---

## 9. Ethical & Scope Notes

Everything was tested only on my own local Docker sandbox, never against any public server — kept strictly to the "Do No Harm" rule for this task. Used a small self-made password list instead of a full breach dictionary since this is just for a local training exercise.

This report is for educational/training purposes only, as part of the Cyber Security Task Force Day 4 assignment.
