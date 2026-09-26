import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "vos.db")


def connect():
    return sqlite3.connect(DB_PATH)


def init_db():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        signal REAL,
        score REAL,
        threat TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        fingerprint TEXT
    )
    """)

    conn.commit()
    conn.close()


def save_report(filename, signal, threat, score, fingerprint):
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO reports
    (filename, signal, score, threat, fingerprint)
    VALUES (?, ?, ?, ?, ?)
    """, (filename, signal, score, threat, fingerprint))

    conn.commit()
    conn.close()


def get_reports():
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT filename, signal, score, threat, created_at, fingerprint
    FROM reports
    ORDER BY id DESC
    """)

    rows = cursor.fetchall()
    conn.close()
    return rows