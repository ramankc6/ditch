import requests
from bs4 import BeautifulSoup

def get_tos_text(url):
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        text = soup.get_text(separator=' ', strip=True)
        return text
    else:
        return "Failed to fetch the URL. Status code: " + str(response.status_code)
