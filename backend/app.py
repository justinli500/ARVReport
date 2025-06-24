from flask import Flask, jsonify, request
from arv_script import generate_arv_report

app = Flask(__name__)


@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json() or {}
    address = data.get('address', '')
    state = data.get('state', '')
    zip_code = data.get('zip', '')

    if not address:
        return jsonify({'error': 'address is required'}), 400

    result = generate_arv_report(address, state, zip_code)
    return jsonify(result)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

