# Day 13: System Persistence Mechanism Report

## 1. Objective
The objective of this practical lab is to establish system persistence, ensuring that a custom binary (`system_backup.elf`) executes automatically upon every system reboot. This technique is commonly used to maintain long-term access in a compromised system environment.

## 2. Tools & Environment
* **Operating System:** Ubuntu 26.04.2 (via WSL2)
* **Compiler:** `gcc` (GNU Compiler Collection)
* **Scheduling Tool:** `cron` (crontab)
* **Editor:** `nano`

## 3. Methodology
### 3.1 Payload Creation
The `backdoor.c` source file was written to perform the required action. It was compiled into an executable binary using the following command:
```bash
gcc backdoor.c -o system_backup.elf
```

### 3.2 Stealth & Concealment
To enhance stealth and maintain organization, a hidden directory was created, and the binary was moved there:
```bash
sudo mkdir -p /usr/local/bin/.hidden/
sudo cp system_backup.elf /usr/local/bin/.hidden/
sudo chmod +x /usr/local/bin/.hidden/system_backup.elf
```

### 3.3 Persistence Configuration
The `crontab` utility was configured to execute the binary on startup.
- **Action:** Executed `sudo crontab -e`
- **Entry Added:** `@reboot /usr/local/bin/.hidden/system_backup.elf`

## 4. Verification
The persistence was verified by listing the current root crontab entries:
```bash
sudo crontab -l
```
*Expected Output:* The entry `@reboot /usr/local/bin/.hidden/system_backup.elf` is visible, confirming the persistence trigger.

## 5. Conclusion
The task was successfully completed. The system is now configured to trigger the `system_backup.elf` binary automatically upon reboot, fulfilling the lab's persistence requirements.
