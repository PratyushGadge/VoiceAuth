from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/", methods=["GET"])
def home():
  return jsonify(
      {"message": "Welcome to VoiceAuth API! System is up and running."}
  )


@app.route("/hello", methods=["GET"])
def hello_world():
  return jsonify({"status": "success", "message": "Hello, World!"})


if __name__ == "__main__":
  app.run()
