from openai import AsyncOpenAI
import json
from app.core.config import settings
from app.core.localization import t

class AIService:
    MODEL_PRIORITY = ["Z-AI", "Nemotron", "Step", "Qwen", "Llama", "GPT"]
    
    MODEL_MAPPING = {
        "Nemotron": "nvidia/nemotron-3-super-120b-a12b:free",
        "Step": "stepfun/step-3.5-flash:free",
        "Z-AI": "z-ai/glm-4.5-air:free",
        "Qwen": "qwen/qwen3-coder:free",
        "Llama": "meta-llama/llama-3.3-70b-instruct:free",
        "GPT": "openai/gpt-oss-120b:free"
    }

    def __init__(self, model_name: str, lang: str = "ru"):
        self.lang = lang
        self.client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY,
            timeout=45.0
        )
        self.attempt_queue = self._build_attempt_queue(model_name)

    def _build_attempt_queue(self, preferred_model: str) -> list:
        queue = [preferred_model]
        for model in self.MODEL_PRIORITY:
            if model not in queue: queue.append(model)
        return queue

    def _safe_parse_json(self, text: str) -> dict:
        try:
            result = json.loads(text)
            if isinstance(result, str):
                result = json.loads(result)
            if not isinstance(result, dict):
                return None
            return result
        except json.JSONDecodeError:
            try:
                cleaned = text.strip()
                if cleaned.count('"') % 2 != 0: cleaned += '"'
                open_square = cleaned.count('[') - cleaned.count(']')
                open_curly = cleaned.count('{') - cleaned.count('}')
                cleaned += ']' * open_square
                cleaned += '}' * open_curly
                result = json.loads(cleaned)
                if isinstance(result, str):
                    result = json.loads(result)
                return result
            except:
                return None
        except Exception:
            return None

    def _create_robust_context(self, metadata: dict) -> str:
        lines = []

        lines.append(f"DATASET: {metadata.get('file_name')}")
        lines.append(f"TOTAL ROWS: {metadata.get('total_rows')}\n")

        stats = metadata.get("column_statistics", {})

        numeric_cols = []
        categorical_cols = []

        cols_items = list(stats.items())
        if len(cols_items) > 20:
            cols_items = cols_items[:20]

        for col, s in cols_items:
            if "mean" in s:
                numeric_cols.append(col)
            else:
                categorical_cols.append(col)

        lines.append(f"NUMERIC COLUMNS ({len(numeric_cols)}): {', '.join(numeric_cols)}")
        lines.append(f"CATEGORICAL COLUMNS ({len(categorical_cols)}): {', '.join(categorical_cols)}\n")

        lines.append("DETAILED STATS:")
        for col, s in stats.items():
            if col not in numeric_cols and col not in categorical_cols:
                continue
                
            examples_str = str(s.get('examples', []))
            
            if "mean" in s:
                lines.append(f"- '{col}' (Num): Range[{s['min']:.1f}-{s['max']:.1f}], Mean={s['mean']:.1f}. Examples: {examples_str}")
            else:
                lines.append(f"- '{col}' (Cat): Unique={s['unique']}. Examples: {examples_str}")
                
        return "\n".join(lines)

    async def get_analysis_recommendations(self, metadata: dict) -> dict:
        context_json = json.dumps(metadata, indent=2, ensure_ascii=False, default=str)
        
        prompt = f"""
Ты — Data Analyst. Язык ответа: {self.lang}.
Проанализируй структуру данных и примеры значений.

ДАННЫЕ:
{context_json}

ЗАДАЧА 1: ИНСАЙТЫ
Напиши 3 кратких, но емких вывода о данных.
Формат: "Факты и выводы".

ЗАДАЧА 2: ВИЗУАЛИЗАЦИИ
Выбери ровно 4 самых важных графика.
Типы графиков:
1. Pie: для категорий (если уникальных значений < 6).
2. Box: для сравнения Категория vs Число.
3. Histogram: для распределения чисел.
4. Scatter: для корреляции двух чисел.
5. Heatmap: для матрицы корреляций (использовать 1 раз).

ВАЖНО: Соблюдай разнообразие. Не используй один тип дважды.
Придумай понятные заголовки на языке {self.lang}.

ПРИМЕР ОТВЕТА (JSON):
{{
  "analysis_plan": {{ "key_insights": ["Вывод 1", "Вывод 2", "Вывод 3"] }},
  "plots": [
    {{ "type": "pie", "columns": ["category_col"], "title": "Заголовок" }},
    {{ "type": "box", "columns": ["cat", "num"], "title": "Заголовок" }},
    {{ "type": "histogram", "columns": ["num_col"], "title": "Заголовок" }},
    {{ "type": "scatter", "columns": ["num1", "num2"], "title": "Заголовок" }}
  ]
}}

Твой ответ (только JSON, без markdown):
"""

        last_error = None

        while self.attempt_queue:
            current_model_alias = self.attempt_queue.pop(0)
            model_id = self.MODEL_MAPPING.get(current_model_alias)
            if not model_id: continue

            try:
                print(f"Attempting model: {current_model_alias}")
                
                response = await self.client.chat.completions.create(
                    model=model_id,
                    messages=[
                        {"role": "system", "content": "You are a JSON API. Output ONLY valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.0,
                    max_tokens=1500,
                    response_format={"type": "json_object"}
                )
                
                content = response.choices[0].message.content
                
                if not content or content.strip() == "":
                    raise ValueError("Empty content")

                result = self._safe_parse_json(content)
                
                if not result:
                    raise ValueError("JSON Parse Failed")

                if "analysis_plan" not in result:
                    result["analysis_plan"] = {"key_insights": []}
                if "subtable_recommendations" not in result:
                    result["subtable_recommendations"] = []

                result["used_model"] = current_model_alias
                print(f"Success with model: {current_model_alias}")
                return result

            except Exception as e:
                error_msg = str(e)
                print(f"Model Error ({current_model_alias}): {error_msg}")
                
                if any(x in error_msg.lower() for x in ["429", "503", "empty", "timeout", "rate limit"]):
                    last_error = f"{current_model_alias}: Busy"
                    continue
                else:
                    last_error = f"{current_model_alias}: Error"
                    continue
        
        return {
            "analysis_plan": {"key_insights": [t("ai_error_fallback", self.lang)]},
            "subtable_recommendations": [],
            "error": last_error if last_error else "All providers failed"
        }