"""
CyberDailyWatch - Scraper d'actualités
Module de récupération des actualités cybersécurité depuis TheHackerNews.

Ce module fournit des fonctions pour scraper les derniers articles
de TheHackerNews.com et extraire les titres, URLs et résumés.

Configuration modifiable:
    - URL_SOURCE: URL du site à scraper (ligne 16)
    - NUM_ARTICLES: Nombre d'articles par défaut (paramètre de fonction)
    - USER_AGENT: Agent utilisateur pour les requêtes (ligne 23)
"""

import requests
from bs4 import BeautifulSoup
from typing import List, Dict

# =============================================================================
# CONFIGURATION - Modifiez ces valeurs selon vos besoins
# =============================================================================

# URL du site source des actualités
URL_SOURCE = "https://thehackernews.com"

# En-têtes HTTP pour simuler un navigateur classique
# Modifiez si vous rencontrez des blocages
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# Délai d'attente maximal pour les requêtes (en secondes)
TIMEOUT = 15


def scrape_hackernews(num_articles: int = 3) -> List[Dict[str, str]]:
    """
    Récupère les dernières actualités de TheHackerNews.com.
    
    Cette fonction effectue une requête HTTP vers le site, parse le HTML
    et extrait les informations des articles.
    
    Args:
        num_articles: Nombre d'articles à récupérer (défaut: 3)
                      Modifiez cette valeur pour obtenir plus/moins d'articles
    
    Returns:
        Liste de dictionnaires contenant pour chaque article:
        - title: Titre de l'article (en anglais)
        - url: Lien vers l'article complet
        - summary: Résumé/extrait de l'article
    
    Raises:
        Ne lève pas d'exception, retourne une liste vide en cas d'erreur
    
    Exemple d'utilisation:
        >>> articles = scrape_hackernews(5)  # Récupère 5 articles
        >>> for article in articles:
        ...     print(article['title'])
    """
    try:
        # Effectuer la requête HTTP
        response = requests.get(URL_SOURCE, headers=HEADERS, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"❌ Erreur lors de la récupération de {URL_SOURCE}: {e}")
        return []
    
    # Parser le HTML avec BeautifulSoup
    soup = BeautifulSoup(response.text, "html.parser")
    articles = []
    
    # Rechercher les éléments d'articles
    # Structure HTML de TheHackerNews: <a class="story-link"> contient le lien et titre
    story_links = soup.find_all("a", class_="story-link")
    
    for link in story_links[:num_articles]:
        try:
            # Extraire l'URL de l'article
            article_url = link.get("href", "")
            
            # Extraire le titre depuis l'élément h2
            title_element = link.find("h2", class_="home-title")
            if not title_element:
                continue
            
            title = title_element.get_text(strip=True)
            
            # Extraire le résumé depuis le parent (div.body-post)
            parent = link.find_parent("div", class_="body-post")
            summary = ""
            if parent:
                excerpt_element = parent.find("div", class_="home-desc")
                summary = excerpt_element.get_text(strip=True) if excerpt_element else ""
            
            # Ajouter l'article si les données essentielles sont présentes
            if title and article_url:
                articles.append({
                    "title": title,
                    "url": article_url,
                    "summary": summary
                })
                
        except Exception as e:
            # Continuer avec les autres articles en cas d'erreur
            print(f"⚠️ Erreur lors du parsing d'un article: {e}")
            continue
    
    return articles


# =============================================================================
# POINT D'ENTRÉE - Test direct du module
# =============================================================================
if __name__ == "__main__":
    import json
    
    print("🔍 Test du scraper TheHackerNews...")
    print(f"📡 Source: {URL_SOURCE}")
    print()
    
    # Récupérer les articles
    news = scrape_hackernews(3)
    
    if news:
        print(f"✅ {len(news)} articles récupérés:\n")
        print(json.dumps(news, indent=2, ensure_ascii=False))
    else:
        print("❌ Aucun article trouvé")
        print("💡 Vérifiez votre connexion internet ou la structure du site")
