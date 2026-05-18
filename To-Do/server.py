from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

tasks = []

@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks)

@app.route('/add', methods=['POST'])
def add_task():

    data = request.json

    tasks.append(data['task'])

    return jsonify({"message":"Task added"})


@app.route('/delete', methods=['POST'])
def delete_task():

    data = request.json

    index = data['index']

    if 0 <= index < len(tasks):
        tasks.pop(index)

    return jsonify({"message":"Task deleted"})


if __name__ == '__main__':
    app.run(debug=True)