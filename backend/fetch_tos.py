import requests
from bs4 import BeautifulSoup
import sys
def get_tos_text(url):
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        text = soup.get_text(separator=' ', strip=True)
        print(text)
        return text
    else:
        return "Failed to fetch the URL. Status code: " + str(response.status_code)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        url = sys.argv[1]
        get_tos_text(url)
    else:
        print("Please provide a URL as an argument.")