from flask import Flask, render_template, request, jsonify
import requests
import time

app = Flask(__name__)

# Sphere Engine API credentials
API_KEY = "76e081612384877ee93d93d579dc2992"
API_ENDPOINT = "https://2ba4c51b.compilers.sphere-engine.com/api/v4"
COMPILER_ID = 56  # ID for node.js
versionID = 8

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit_code', methods=['POST'])
def submit_code():
    data = request.get_json()
    html_code = data['htmlCode']
    js_code = data['jsCode']
    combined_code = f"""
// Simulate a basic DOM environment
let document = {{
    body: {{
        innerHTML: `{html_code}`,
        querySelector: function (selector) {{
            const match = this.innerHTML.match(new RegExp(`<[^>]*id="${{selector.slice(1)}}"[^>]*>`));
            if (match) {{
                const element = {{
                    outerHTML: match[0],
                    addEventListener: function (event, callback) {{
                        if (event === 'click') {{
                            this.click = callback;
                        }}
                        if (event === 'dbclick') {{
                            this.dbclick = callback;
                        }}
                    }},
                    click: null
                }};
                return element;
            }}
            return null;
        }}
    }},
    getElementById: function (id) {{
        return this.body.querySelector(`#${{id}}`);
    }},
    addEventListener: function (event, callback) {{
        if (event === 'DOMContentLoaded') {{
            callback();
        }}
    }}
}};

{js_code}
"""
    print(combined_code)

    try:
        # Create a new submission
        response = requests.post(
            f"{API_ENDPOINT}/submissions",
            data={
                'compilerVersionId' : versionID,
                'compilerId': COMPILER_ID,
                'source': combined_code,
                'input': ''  # Add input data here if needed
            },
            headers={
                'Authorization': f'Bearer {API_KEY}'
            }
        )
        if response.status_code != 201:
            return jsonify({'error': 'Failed to create submission', 'details': response.json()})

        submission = response.json()
        submission_id = submission['id']
        
        # Wait for the submission to be processed
        while True:
            time.sleep(2)  # Wait for 2 seconds before checking the status again
            submission_details_response = requests.get(
                f"{API_ENDPOINT}/submissions/{submission_id}",
                headers={
                    'Authorization': f'Bearer {API_KEY}'
                }
            )
            submission_details = submission_details_response.json()
            
            # Check if 'executing' key is in the response
            if 'executing' in submission_details and not submission_details['executing']:
                break
        print(submission_details)
        return jsonify(submission_details)
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=80)
