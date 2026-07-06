# Vulnerability Report

**Report ID:** VULN-002
**Date:** July 6, 2026
**Reported By:** Malik (Security Task Force — Day 2)
**Target Application:** OWASP Juice Shop (local sandbox, `localhost:3000`)
**Environment:** Docker container `bkimminich/juice-shop`, running locally on Docker Desktop (Windows 11). Traffic was intercepted using Burp Suite Community Edition (Proxy + Repeater).

---

## 1. Summary

| Field | Value |
|---|---|
| Title | SQL Injection Login Bypass (Authentication Bypass) |
| Severity | Critical |
| CVSS 3.1 Score | 9.1 (Critical) |
| CVSS Vector | `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N` |
| CWE Classification | CWE-89: SQL Injection |
| OWASP Top 10 Category | A03:2021 – Injection |
| Affected Component | Login endpoint (`POST /rest/user/login`) |

---

## 2. Description

The login form on OWASP Juice Shop takes the email and password entered by the user and puts them directly into a SQL query without properly checking or escaping them first. Because of this, it's possible to inject SQL code into the email field and change how the query actually works.

By entering a specific payload in the email field, the query's condition can be forced to always return true, and the part of the query that checks the password can be commented out completely. This tricks the database into logging in as the first user it finds — which turned out to be the admin account — without ever needing the real password.

---

## 3. Steps to Reproduce

1. Set up Burp Suite Community Edition as a proxy and open Burp's built-in browser.
2. Go to `http://localhost:3000/#/login`.
3. Type in any email/password (like `test@test.com` / `test123`) and hit login, so the request shows up in Burp's HTTP History.
4. Right-click that request and send it to Repeater.
5. In the request body, change the email value to:
   ```
   ' OR 1=1--
   ```
   So the body now looks like:
   ```json
   {
     "email": "' OR 1=1--",
     "password": "test123"
   }
   ```
6. Hit **Send** in Repeater.
7. The response comes back as `200 OK` with a valid login token, and the account returned is `admin@juice-sh.op` — meaning the login worked as admin without knowing the actual password.

**Note:** No automated tools like SQLMap were used — the payload was written manually and tested through Burp Repeater, as required by the task.

---

## 4. Expected vs. Actual Behavior

| Behavior | Description |
|---|---|
| Expected | The email and password should just be treated as plain data (using parameterized queries), so typing SQL syntax into the email field shouldn't change how the query behaves. Wrong credentials should just return "Invalid email or password." |
| Actual | The email field gets directly inserted into the query. The `' OR 1=1--` payload makes the condition always true and comments out the rest of the query (including the password check), so the database returns the admin account and the app logs us in as admin. |

---

## 5. Evidence

- **Screenshot 1:** Burp Repeater request showing the `' OR 1=1--` payload in the email field. (`screenshots/sqli-request-payload.png`)
- **Screenshot 2:** Burp Repeater response showing `200 OK` and `"umail": "admin@juice-sh.op"`, confirming the bypass worked. (`screenshots/sqli-response-bypass-success.png`)

(Screenshots attached in the repo)

---

## 6. Impact

If this existed on a real production app, someone could:

- Log in as any account, including admin, without ever knowing the password
- Get access to private data, order history, and admin-only features
- Possibly go further and pull, change, or delete data straight from the database

Since no login is needed to try this and it works instantly with no user interaction, this is rated **Critical**.

---

## 7. Remediation

How to actually fix this:

1. **Use parameterized queries / prepared statements** — never build SQL queries by directly plugging in user input as a string. Let the database library handle it as a parameter instead.
2. **Limit database user permissions** — the app's DB account shouldn't have more access than it actually needs.
3. **Validate input formats** — e.g., check that the email field actually looks like an email — but this is a backup, not the main fix.
4. **Use an ORM** where possible (like Sequelize) since it parameterizes queries automatically instead of building raw SQL strings.

**Example fix (Node.js / Sequelize):**

```js
// BAD: user input directly inserted into query string
const query = `SELECT * FROM Users WHERE email = '${email}' AND password = '${password}'`;
db.sequelize.query(query);

// GOOD: parameters passed separately, not as part of the string
const query = `SELECT * FROM Users WHERE email = :email AND password = :password`;
db.sequelize.query(query, {
  replacements: { email, password },
  type: db.sequelize.QueryTypes.SELECT
});

// EVEN BETTER: use the ORM's own methods instead of raw SQL
const user = await db.Users.findOne({
  where: { email: email, password: hashedPassword }
});
```

---

## 8. References

- OWASP Top 10 2021 – A03:2021 Injection: https://owasp.org/Top10/A03_2021-Injection/
- CWE-89: https://cwe.mitre.org/data/definitions/89.html
- OWASP SQL Injection Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
- PortSwigger Web Security Academy – SQL Injection: https://portswigger.net/web-security/sql-injection

---

## 9. Ethical & Scope Notes

All testing was done manually on a locally-deployed, isolated Docker sandbox (OWASP Juice Shop) — nothing was tested against any public/live server. No automated SQLi tools were used; the payload was written and tested by hand through Burp Suite Repeater, as required for this assignment.

This report is for educational/training purposes only, as part of the Cyber Security Task Force Day 2 assignment.
