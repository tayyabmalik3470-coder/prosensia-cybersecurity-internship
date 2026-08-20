# Day 14 Internship Report: Credential Exfiltration & Password Cracking

**Date:** August 20, 2026  
**Task:** Credential Exfiltration, Offline Cracking, and Security Analysis  

---

## 1. Executive Summary
This report details the successful execution of the Day 14 mini-task, focusing on the mechanics of credential exfiltration and the security risks associated with improper password storage in Linux environments. The objective was to demonstrate how attackers leverage system-level access to extract authentication data and why cryptographic salting is vital for enterprise security.

---

## 2. Methodology & Execution
The lab task was executed through the following structured steps:
* **Data Acquisition:** Root-level privileges were utilized to replicate the critical system authentication files (`/etc/passwd` and `/etc/shadow`) into the working directory as `passwd.txt` and `shadow.txt`.
* **Preparation & Merging:** The `unshadow` utility was used to combine the user accounts from `passwd.txt` with their corresponding hashed credentials in `shadow.txt` into a unified target file (`unshadowed.txt`).
* **Offline Cracking:** Using **John the Ripper**, a dictionary-based brute-force attack was launched against the target file using a customized target wordlist (`wordlist.txt`).
* **Validation & Logging:** Successful credential recovery was verified, and plaintext passwords were exported to a dedicated proof log (`cracked_hashes.log`).

---

## 3. Technical Analysis: Cryptographic Salting

### Why Salting Matters
A fundamental enterprise security failure is storing passwords as unsalted hashes. If multiple users share identical passwords, standard hashing algorithms generate identical hash outputs, leaving the system highly vulnerable to **Rainbow Table attacks**. 

* **The Role of Salts:** Salting involves appending a unique, random string of characters to a password prior to hash computation. 
* **Mitigation:** This ensures that even if two users choose the exact same password (e.g., `password123`), their resulting hashes remain completely distinct, effectively neutralizing precomputed dictionary attacks and forcing attackers to crack each hash individually.

---

## 4. Results & Artifacts
The following files were successfully generated and committed to the repository as proof of task completion:

| Artifact Filename | Description |
| :--- | :--- |
| `cracked_hashes.log` | Detailed log capturing the successfully recovered plaintext passwords. |
| `hash.txt` / `unshadowed.txt` | Target dataset containing the structural user hashes used for validation. |
| `wordlist.txt` | Custom dictionary utilized for the offline cracking phase. |

---

## 5. Conclusion
This practical exercise demonstrated the severe risks of relying on legacy or unstrengthened password hashing mechanisms. The feasibility of offline credential cracking underscores why modern systems must implement adaptive, slow cryptographic hashing functions such as `bcrypt`, `scrypt`, or `Argon2` combined with robust salt values.