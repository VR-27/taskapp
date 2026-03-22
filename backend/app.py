from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
CORS(app)

# Database config from environment variables
DB_USER = os.getenv("DB_USER", "taskuser")
DB_PASSWORD = os.getenv("DB_PASSWORD", "taskpassword123")
DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "taskdb")

app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# --- Model ---
class Task(db.Model):
    __tablename__ = "tasks"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    done = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {"id": self.id, "title": self.title, "done": self.done}


# Create tables on startup
with app.app_context():
    db.create_all()


# --- Routes ---
@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/tasks", methods=["GET"])
def get_tasks():
    tasks = Task.query.order_by(Task.id.desc()).all()
    return jsonify([t.to_dict() for t in tasks])


@app.route("/tasks", methods=["POST"])
def create_task():
    data = request.get_json()
    if not data or not data.get("title", "").strip():
        return jsonify({"error": "Title is required"}), 400
    task = Task(title=data["title"].strip())
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@app.route("/tasks/<int:task_id>", methods=["PATCH"])
def toggle_task(task_id):
    task = Task.query.get_or_404(task_id)
    task.done = not task.done
    db.session.commit()
    return jsonify(task.to_dict())


@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"deleted": task_id})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
