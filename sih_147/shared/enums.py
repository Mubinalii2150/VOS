"""Minimal enums needed by Member 4 and Member 5."""

from enum import StrEnum


class ModulationType(StrEnum):
    BPSK = "BPSK"
    QPSK = "QPSK"
    FSK2 = "2-FSK"
    FSK4 = "4-FSK"
    GFSK = "GFSK"
    MSK = "MSK"
    QAM16 = "16-QAM"
    UNKNOWN = "Unknown"


class ConfidenceLevel(StrEnum):
    CONFIRMED = "Confirmed"
    PROBABLE = "Probable"
    POSSIBLE = "Possible"
    UNSUPPORTED = "Unsupported"
    UNKNOWN = "Unknown"
