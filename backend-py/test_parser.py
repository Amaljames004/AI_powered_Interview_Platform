import requests
import json
import os

# Define the API endpoint URL
API_URL = "http://127.0.0.1:8000/parse-resume"

# Define the path to the sample PDF resume
# You should replace 'path/to/your/resume.pdf' with the actual path
RESUME_PATH = "./resume.pdf"

def test_resume_parser():
    """
    Sends a test resume to the FastAPI parser and prints the response.
    """
    if not os.path.exists(RESUME_PATH):
        print(f"Error: The file '{RESUME_PATH}' does not exist.")
        print("Please make sure you have created the PDF test file from the previous step.")
        return

    print(f"Sending '{RESUME_PATH}' to the parser...")
    
    try:
        # Open the PDF file in binary mode
        with open(RESUME_PATH, "rb") as f:
            # Prepare the file for the POST request
            files = {'file': (os.path.basename(RESUME_PATH), f, 'application/pdf')}
            
            # Send the request
            response = requests.post(API_URL, files=files, timeout=60)
            
            # Check for a successful response (status code 200)
            if response.status_code == 200:
                print("\n✅ Success! Resume parsed successfully.")
                
                # Print the JSON response in a readable format
                parsed_data = response.json()
                print(json.dumps(parsed_data, indent=4))
                
            else:
                print(f"\n❌ Error: Failed to parse resume. Status code: {response.status_code}")
                print("Response body:")
                print(response.text)
                
    except requests.exceptions.RequestException as e:
        print(f"\n❌ An error occurred during the request: {e}")
        print("Please ensure your FastAPI server is running at http://127.0.0.1:8000")

if __name__ == "__main__":
    test_resume_parser()