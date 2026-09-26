THREAT_KEYWORDS = {
    "CRITICAL": [
        "attack",
        "bomb",
        "missile",
        "target",
        "fire",
        "kill",
        "destroy",
        "weapon"
    ],

    "HIGH": [
        "enemy",
        "strike",
        "drone",
        "explosive",
        "hostile"
    ],

    "MEDIUM": [
        "suspicious",
        "unknown",
        "alert",
        "tracking"
    ]
}

def detect_threat(text):
    text = str(text).lower()

    critical = ["attack","strike","bomb","drone","target","missile"]
    medium = ["mission","sector","weapon","enemy"]

    keywords = []

    for w in critical + medium:
        if w in text:
            keywords.append(w)

    if len(keywords) >= 3:
        level = "CRITICAL"
    elif len(keywords) >= 1:
        level = "MEDIUM"
    else:
        level = "LOW"

    return {
        "level": level,
        "keywords": keywords
    }