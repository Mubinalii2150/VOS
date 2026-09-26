from database.db import get_reports

def match_fingerprint(fp):
    rows = get_reports()

    best = 0
    device = "UNKNOWN"
    seen = 0

    for r in rows:
        old = r[5]

        if old == fp:
            best = 100
            device = r[0]
            seen += 1

        elif old[:16] == fp[:16]:
            best = max(best, 82)

    return {
        "device": device if device != "UNKNOWN" else "No Registered Device",
        "similarity": best,
        "seen": seen,
        "status": "KNOWN" if best == 100 else "UNKNOWN"
    }