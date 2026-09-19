def rf_integrity_score(snr_db):

    if snr_db >= 30:
        return {"risk_level":"LOW","confidence":100,"color":"green"}

    elif snr_db >= 20:
        return {"risk_level":"MEDIUM","confidence":75,"color":"yellow"}

    elif snr_db >= 10:
        return {"risk_level":"HIGH","confidence":50,"color":"orange"}

    else:
        return {"risk_level":"CRITICAL","confidence":25,"color":"red"}