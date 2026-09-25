# INCIDENT-2026-0042 — Credential-phishing campaign against power distribution utilities

SYNTHETIC SAMPLE — created for demonstration. Not real operational data.

Classification: INTERNAL. Severity: HIGH.

## Summary

Between 14 and 17 September 2026, sensors at 37 organisations in the power distribution sector recorded indicators consistent with a possible phishing campaign.

Analysts attribute the activity, with moderate confidence, to the threat cluster tracked as TC-7.

Three of the 37 organisations have confirmed credential compromise.

The remaining organisations were potentially exposed but show no evidence of successful access.

## Technical details

The campaign delivered approximately 1,200 emails impersonating a vendor firmware notice.

Links led to login-verify.example[.]com and portal-update.example[.]com, which harvested VPN credentials.

In the three confirmed cases, attackers used the stolen credentials to access edge VPN concentrators running firmware version 9.4.2, which is affected by CVE-2026-31337.

Lateral movement toward operational technology networks was suspected at one site but has not been confirmed.

## Indicators

- Domain: login-verify.example[.]com
- Domain: portal-update.example[.]com
- IP address: 203.0.113.47
- IP address: 198.51.100.12
- Attachment SHA-256: 3f7a9c1e5b2d4f6a8c0e1b3d5f7a9c2e4b6d8f0a1c3e5b7d9f1a3c5e7b9d0f2a

## Recommended actions

1. Block the listed domains and IP addresses at the perimeter.
2. Reset VPN credentials for all users at affected organisations.
3. Upgrade edge VPN concentrators to firmware 9.4.3 or later.
4. Enforce multi-factor authentication on all remote access.
5. Report any matching activity to the sector CERT within 6 hours.