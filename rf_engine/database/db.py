import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "vos.db")


def get_connection():
    return sqlite3.connect(DB_PATH)


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            signal INTEGER,
            threat TEXT,
            score INTEGER,
            fingerprint TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


def save_report(filename, signal, threat, score, fingerprint):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO reports
        (filename, signal, threat, score, fingerprint)
        VALUES (?, ?, ?, ?, ?)
    """, (filename, signal, threat, score, fingerprint))

    conn.commit()
    conn.close()


def get_reports():
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("""
        SELECT filename,
               signal,
               threat,
               score,
               fingerprint,
               created_at
        FROM reports
        ORDER BY id DESC
        LIMIT 20
    """)

    data = [dict(row) for row in cur.fetchall()]
    conn.close()
    return data