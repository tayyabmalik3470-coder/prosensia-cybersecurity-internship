# Cyber Security Task Force: Week 3, Tuesday
## Shell Stabilization & Linux Privilege Escalation Report

### 1. Executive Summary
During the Week 3, Day 2 execution mandate, our primary objective was to transition a raw, unstable Netcat backdoor foothold into a fully interactive Python TTY session. Furthermore, we performed a rigorous manual filesystem enumeration, isolating SUID binaries without relying on automated audit scripts, to analyze potential vertical privilege escalation paths and achieve full system compromise.

### 2. Action 1: Shell Stabilization (TTY Upgrade)
Initial reverse shell connections lack process control, rendering standard commands like `Ctrl+C` unusable and stripping terminal dimensions. To resolve this, the following manual steps were executed:

* **Interactive PTY Spawn:** Upgraded the standard shell environment by invoking Python to spawn a bash instance: `python3 -c 'import pty; pty.spawn("/bin/bash")'`
* **Environment Variable Configuration:** Configured the terminal type parameters to support full text-editing capabilities: `export TERM=xterm`
* **Raw Mode Adaptation:** Applied raw terminal echoing controls (`stty raw -echo`) to stabilize inputs and unlock complete keyboard control and command history

### 3. Action 2: Manual Filesystem Enumeration
Adhering strictly to the non-negotiable rule banning automated scanners (such as LinPEAS), we executed a manual enumeration checklist across the Linux environment:

* **Account Mapping:** Inspected `/etc/passwd` to evaluate valid user profiles and login shells
* **Privilege Review:** Audited superuser permissions using `sudo -l` to detect any unauthenticated execution rules or misconfigured NOPASSWD entries
* **SUID Binary Discovery:** Ran the explicit file permissions search command to locate binaries with the Set-User-ID bit active:
  ```bash
  find / -perm -4000 -type f 2>/dev/null
### Discovered SUID Binaries:
- `/usr/bin/chfn`
- `/usr/bin/umount`
- `/usr/bin/gpasswd`
- `/usr/bin/passwd`
- `/usr/bin/fuser-mount3`
- `/usr/bin/mount`
- `/usr/bin/su`
- `/usr/lib/dbus-1.0/dbus-daemon-launch-helper`
- `/usr/lib/landscape/apt-update`
- `/usr/lib/openssh/ssh-keysign`
- `/usr/lib/cargo/bin/sudo`
- `/usr/lib/cargo/bin/su`

### 4. Action 3: Interrogation Standard & OS Mechanics (Technical Defense)

**What the SUID bit does at the Linux kernel execution level:**
The Set-User-ID (SUID) special permission bit temporarily elevates the executing process's *effective user ID (euid)* to match the owner of the file (typically `root`) for the duration of its execution, rather than retaining the real user ID of the unprivileged account that launched it.

**Why leaving a shell-spawning binary with an SUID bit owned by root is a catastrophic architectural failure:**
If any binary capable of spawning a shell, reading arbitrary files, or modifying system configurations possesses an active root-owned SUID bit, any standard user can exploit it to inherit root-level privileges. This completely bypasses Discretionary Access Controls (DAC) and leads to immediate, total system compromise.

### 5. Verification & System Hygiene

* **Validation:** Verified identity, group memberships, and total system ownership using `whoami` and `id`, alongside validating flag access.
* **Hygiene Protocol:** Ensured that no core system passwords, configurations, or operational data files were permanently altered, corrupted, or deleted during the assessment.
