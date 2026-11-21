import sqlite3

DB_NAME = "orders.db"

def get_db_connection():
  conn = sqlite3.connect(DB_NAME)
  conn.row_factory = sqlite3.Row
  return conn

def init_db():
  conn = get_db_connection()
  conn.execute("""
    CREATE TABLE IF NOT EXISTS deliveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      order_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      item TEXT,
      expected_date TEXT NOT NULL,
      status TEXT DEFAULT 'Expected'
    )
  """)

  conn.commit()
  conn.close()

init_db()
