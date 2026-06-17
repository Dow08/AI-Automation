"""
CyberDailyWatch - Générateur Audio
Module de synthèse vocale utilisant edge-tts (Microsoft Azure Neural Voices).

Ce module convertit du texte en fichier audio MP3 en utilisant
les voix neuronales gratuites de Microsoft Edge.

Configuration modifiable:
    - VOICE: Voix utilisée pour la synthèse (ligne 18)
    - OUTPUT_DIR: Dossier de sortie par défaut (ligne 21)

Voix françaises disponibles:
    - fr-FR-HenriNeural (homme, utilisé par défaut)
    - fr-FR-DeniseNeural (femme)
    - fr-CA-AntoineNeural (homme, accent québécois)
    - fr-CA-SylvieNeural (femme, accent québécois)
"""

import asyncio
import edge_tts
from pathlib import Path

# =============================================================================
# CONFIGURATION - Modifiez ces valeurs selon vos besoins
# =============================================================================

# Voix utilisée pour la synthèse vocale
# Changez pour "fr-FR-DeniseNeural" pour une voix féminine
VOICE = "fr-FR-HenriNeural"

# Dossier de sortie par défaut pour les fichiers audio
DEFAULT_OUTPUT_DIR = Path(__file__).parent.parent / "public" / "audio"

# Nom du fichier audio par défaut
DEFAULT_FILENAME = "latest_briefing.mp3"


async def generate_audio(
    text: str,
    output_path: str | Path | None = None,
    voice: str = VOICE
) -> Path:
    """
    Génère un fichier audio MP3 à partir d'un texte.
    
    Cette fonction utilise edge-tts pour convertir le texte en audio
    avec une voix neuronale de haute qualité.
    
    Args:
        text: Le texte à convertir en audio
              Peut contenir plusieurs paragraphes
        output_path: Chemin du fichier MP3 de sortie (optionnel)
                     Si non spécifié, utilise le dossier par défaut
        voice: Identifiant de la voix à utiliser (optionnel)
               Défaut: fr-FR-HenriNeural (voix masculine française)
    
    Returns:
        Path: Chemin absolu vers le fichier audio généré
    
    Raises:
        Exception: En cas d'erreur lors de la génération
    
    Exemple d'utilisation:
        >>> import asyncio
        >>> text = "Bonjour, voici les actualités cyber du jour."
        >>> path = asyncio.run(generate_audio(text))
        >>> print(f"Audio sauvegardé: {path}")
    """
    # Déterminer le chemin de sortie
    if output_path is None:
        DEFAULT_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        output_path = DEFAULT_OUTPUT_DIR / DEFAULT_FILENAME
    else:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Créer l'objet de communication avec edge-tts
    communicate = edge_tts.Communicate(text, voice)
    
    # Sauvegarder l'audio
    await communicate.save(str(output_path))
    
    return output_path


def generate_audio_sync(
    text: str,
    output_path: str | Path | None = None,
    voice: str = VOICE
) -> Path:
    """
    Version synchrone de generate_audio.
    
    Wrapper pratique pour utiliser la génération audio
    sans avoir à gérer asyncio manuellement.
    
    Args:
        text: Le texte à convertir en audio
        output_path: Chemin du fichier MP3 de sortie (optionnel)
        voice: Identifiant de la voix à utiliser (optionnel)
    
    Returns:
        Path: Chemin absolu vers le fichier audio généré
    
    Exemple d'utilisation:
        >>> path = generate_audio_sync("Bonjour le monde!")
        >>> print(f"Audio sauvegardé: {path}")
    """
    return asyncio.run(generate_audio(text, output_path, voice))


# =============================================================================
# POINT D'ENTRÉE - Test direct du module
# =============================================================================
if __name__ == "__main__":
    import sys
    
    # Texte de test par défaut
    test_text = """
    Bonjour et bienvenue dans votre flash info cybersécurité.
    Ceci est un test de génération audio avec edge-tts.
    La voix utilisée est une voix neuronale française de haute qualité.
    """
    
    # Utiliser le texte passé en argument si disponible
    if len(sys.argv) > 1:
        test_text = sys.argv[1]
    
    print(f"🎙️ Test du générateur audio")
    print(f"📢 Voix: {VOICE}")
    print(f"📝 Texte: {test_text[:80]}...")
    print()
    
    try:
        output = generate_audio_sync(test_text)
        print(f"✅ Audio généré avec succès!")
        print(f"📁 Fichier: {output}")
        print(f"📊 Taille: {output.stat().st_size / 1024:.1f} Ko")
    except Exception as e:
        print(f"❌ Erreur: {e}")
