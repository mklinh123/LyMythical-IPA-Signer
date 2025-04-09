from flask import Flask, request, send_file
import tempfile
import os
import subprocess

app = Flask(__name__)

@app.route('/sign', methods=['POST'])
def sign_ipa():
    ipa = request.files['ipa']
    cert = request.files['cert']
    provision = request.files['provision']
    password = request.form['password']

    with tempfile.TemporaryDirectory() as temp_dir:
        ipa_path = os.path.join(temp_dir, 'input.ipa')
        cert_path = os.path.join(temp_dir, 'cert.p12')
        provision_path = os.path.join(temp_dir, 'profile.mobileprovision')
        output_path = os.path.join(temp_dir, 'signed.ipa')

        ipa.save(ipa_path)
        cert.save(cert_path)
        provision.save(provision_path)

        # Call the signing script (assumed to be implemented separately)
        cmd = [
            './sign.sh',
            ipa_path,
            cert_path,
            provision_path,
            password,
            output_path
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        if result.returncode != 0:
            return f"Signing failed:\n{result.stderr.decode()}", 500

        return send_file(output_path, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
