from flask import Flask, jsonify, request, session
from orders_db import get_db_connection

app = Flask(__name__)
app.secret_key = "voiceauth-dev-secret"

@app.route("/me", methods=["GET"])
def who_am_i():
    username = session.get("username")
    if username is None:
        return jsonify({"error": "Not logged in"}), 401
    return jsonify({"username": username})


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})


@app.route("/deliveries", methods=["GET"])
def list_deliveries():
    username = session.get("username")
    if username is None:
        return jsonify({"error": "Not logged in"}), 401

    conn = get_db_connection()
    rows = conn.execute(
        "SELECT * FROM deliveries WHERE username = ? ORDER BY id DESC", (username,)
    ).fetchall()
    conn.close()

    return jsonify([dict(row) for row in rows])


@app.route("/deliveries", methods=["POST"])
def add_delivery():
    data = request.get_json()

    username = session.get("username")
    if username is None:
        return jsonify({"error": "Not logged in"}), 401

    conn = get_db_connection()
    conn.execute(
        "INSERT INTO deliveries (username, order_id, platform, item, expected_date) VALUES (?, ?, ?, ?, ?)",
        (username, data["order_id"], data["platform"], data["item"], data["expected_date"])
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Delivery saved."}), 201


@app.route("/deliveries/<int:delivery_id>", methods=["PATCH"])
def update_status(delivery_id):
    data = request.get_json()

    conn = get_db_connection()
    row = conn.execute("SELECT * FROM deliveries WHERE id = ?", (delivery_id,)).fetchone()
    if row is None:
        conn.close()
        return jsonify({"error": "Delivery not found"}), 404
    conn.execute("UPDATE deliveries SET status = ? WHERE id = ?", (data["status"], delivery_id))

    conn.commit()
    conn.close()

    return jsonify({"message": "Status updated."})


@app.route("/verify", methods=["GET"])
def verify_order():
    order_id = request.args.get("order_id")

    conn = get_db_connection()
    row = conn.execute(
        "SELECT * FROM deliveries WHERE order_id = ? AND status = 'Expected'", (order_id,)
    ).fetchone()
    conn.close()

    if row is None:
        return jsonify({"verified": False}), 404
    return jsonify({"verified": True, "delivery": dict(row)})


if __name__ == "__main__":
    app.run(port=5002)
