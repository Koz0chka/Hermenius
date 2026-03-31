import json
import os
from typing import Dict

LOCALES_DIR = os.path.join(os.path.dirname(__file__), "..", "locales")

class Translator:
    def __init__(self):
        self._cache: Dict[str, Dict[str, str]] = {}

    def _load_locale(self, lang: str) -> Dict[str, str]:
        if lang in self._cache:
            return self._cache[lang]
        
        file_path = os.path.join(LOCALES_DIR, f"{lang}.json")
        
        if not os.path.exists(file_path):
            if lang != "en":
                return self._load_locale("en")
            return {}

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self._cache[lang] = data
                return data
        except Exception:
            return {}

    def t(self, key: str, lang: str = "ru", *args) -> str:
        translations = self._load_locale(lang)
        text = translations.get(key, key)
        try:
            return text.format(*args)
        except IndexError:
            return text

translator = Translator()

def t(key: str, lang: str = "ru", *args) -> str:
    return translator.t(key, lang, *args)