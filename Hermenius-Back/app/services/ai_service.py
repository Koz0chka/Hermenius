import hashlib
import json
from pathlib import Path
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.localization import t


MODEL_GROUPS = {
    "Nemotron": [
        "nvidia/nemotron-3-super-120b-a12b:free",
        "nvidia/nemotron-3-nano-30b-a3b:free",
    ],
    "Z-AI": [
        "z-ai/glm-4.5-air:free",
    ],
    "OpenAI": [
        "openai/gpt-oss-120b:free",
        "openai/gpt-oss-20b:free",
    ],
    "Gemma": [
        "google/gemma-4-31b-it:free",
        "google/gemma-4-26b-a4b-it:free",
        "google/gemma-3-27b-it:free",
    ],
    "Qwen": [
        "qwen/qwen3-next-80b-a3b-instruct:free",
        "qwen/qwen3-coder:free",
    ],
    "Llama": [
        "meta-llama/llama-3.3-70b-instruct:free",
    ],
    "Nous": [
        "nousresearch/hermes-3-llama-3.1-405b:free",
    ],
}

GROUP_PRIORITY = ["Nemotron", "Z-AI", "OpenAI", "Gemma", "Qwen", "Llama", "Nous"]

AVAILABLE_GROUPS = list(GROUP_PRIORITY)


class AnalysisCache:
    """File-based cache for AI analysis results.
    Key = SHA-256(file_content + group_name + lang).
    Stored as JSON files in app/.cache/
    """

    def __init__(self, cache_dir: str = None):
        if cache_dir is None:
            base = Path(__file__).resolve().parent.parent.parent
            cache_dir = str(base / ".cache")
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _make_key(file_content: bytes, group_name: str, lang: str) -> str:
        raw = hashlib.sha256(file_content).hexdigest() + f"|{group_name}|{lang}"
        return hashlib.sha256(raw.encode()).hexdigest()

    def get(self, file_content: bytes, group_name: str, lang: str) -> dict | None:
        key = self._make_key(file_content, group_name, lang)
        path = self.cache_dir / f"{key}.json"
        if not path.exists():
            return None
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return None

    def put(self, file_content: bytes, group_name: str, lang: str, result: dict) -> None:
        key = self._make_key(file_content, group_name, lang)
        path = self.cache_dir / f"{key}.json"
        try:
            path.write_text(
                json.dumps(result, ensure_ascii=False, default=str, indent=2),
                encoding="utf-8",
            )
        except Exception:
            pass

    def clear(self) -> int:
        count = 0
        for f in self.cache_dir.glob("*.json"):
            f.unlink(missing_ok=True)
            count += 1
        return count


analysis_cache = AnalysisCache()


class AIService:
    def __init__(self, group_name: str, lang: str = "ru"):
        self.lang = lang
        self.group_name = group_name
        self.client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY,
            timeout=90.0,
        )
        self.attempt_queue = self._build_attempt_queue(group_name)[:3]

    def _build_attempt_queue(self, selected_group: str) -> list[tuple[str, str]]:
        seen = set()
        queue = []

        for mid in MODEL_GROUPS.get(selected_group, []):
            if mid not in seen:
                queue.append((mid, selected_group))
                seen.add(mid)
        
        for group in GROUP_PRIORITY:
            if group == selected_group:
                continue
            for mid in MODEL_GROUPS.get(group, []):
                if mid not in seen:
                    queue.append((mid, group))
                    seen.add(mid)

        return queue

    def _safe_parse_json(self, text: str) -> dict | None:
        cleaned = text.strip()
        if cleaned.startswith("```"):
            first_newline = cleaned.find("\n")
            if first_newline != -1:
                cleaned = cleaned[first_newline + 1:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

        try:
            result = json.loads(cleaned)
            if isinstance(result, str):
                result = json.loads(result)
            if not isinstance(result, dict):
                return None
            return result
        except json.JSONDecodeError:
            try:
                if cleaned.count('"') % 2 != 0:
                    cleaned += '"'
                open_square = cleaned.count("[") - cleaned.count("]")
                open_curly = cleaned.count("{") - cleaned.count("}")
                cleaned += "]" * max(0, open_square)
                cleaned += "}" * max(0, open_curly)
                result = json.loads(cleaned)
                if isinstance(result, str):
                    result = json.loads(result)
                return result
            except Exception:
                return None
        except Exception:
            return None

    def _normalize_result(self, result: dict) -> dict:
        raw_plots = result.get("plots", [])
        raw_insights = result.get("insights", [])

        if not raw_plots:
            raw_plots = result.get("subtable_recommendations", [])
        if not raw_insights:
            plan = result.get("analysis_plan", {})
            if isinstance(plan, dict):
                raw_insights = plan.get("key_insights", [])
            elif isinstance(plan, list):
                raw_insights = plan

        valid_plots = []
        for p in raw_plots:
            if isinstance(p, dict) and "type" in p and "columns" in p:
                valid_plots.append({
                    "type": str(p["type"]).strip(),
                    "columns": p["columns"] if isinstance(p["columns"], list) else [p["columns"]],
                    "title": str(p.get("title", "")),
                })

        result["plots"] = valid_plots
        result["analysis_plan"] = {"key_insights": raw_insights if isinstance(raw_insights, list) else []}
        return result

    def _short_name(self, model_id: str) -> str:
        """Extract readable name from model ID, e.g. 'google/gemma-4-31b-it:free' → 'gemma-4-31b'."""
        name = model_id.split("/")[-1].removesuffix(":free")
        return name

    @staticmethod
    def _compress_metadata(metadata: dict, max_cols: int = 30) -> dict:
        """Create a compact summary for the AI prompt.
        Includes richer statistics for better AI insights."""
        cols = metadata.get("columns", {})
        all_cols = cols.get("all", [])[:max_cols]
        numeric = [c for c in all_cols if c in (cols.get("numeric", []))]
        categorical = [c for c in all_cols if c in (cols.get("categorical", []))]

        stats = metadata.get("column_statistics", {})
        compact_stats = {}
        for col in all_cols:
            if col not in stats:
                continue
            s = stats[col]
            entry = {
                "dtype": s.get("dtype", "unknown"),
                "unique": s.get("unique", 0),
                "missing%": s.get("missing%", 0),
            }
            if "mean" in s:
                entry.update({
                    "min": round(s["min"], 3),
                    "max": round(s["max"], 3),
                    "mean": round(s["mean"], 3),
                })
                if "std" in s:
                    entry["std"] = round(s["std"], 3)
                if "q1" in s:
                    entry["q1"] = round(s["q1"], 3)
                    entry["median"] = round(s["median"], 3)
                    entry["q3"] = round(s["q3"], 3)
            elif "top" in s:
                entry["top"] = s["top"]
            compact_stats[col] = entry

        return {
            "total_rows": metadata.get("total_rows", 0),
            "columns": {"all": all_cols, "numeric": numeric, "categorical": categorical},
            "column_statistics": compact_stats,
            "top_correlations": metadata.get("top_correlations", []),
        }

    async def get_analysis_recommendations(
        self, metadata: dict, file_content: bytes | None = None, skip_cache: bool = False
    ) -> dict:
        if not skip_cache and file_content is not None:
            cached = analysis_cache.get(file_content, self.group_name, self.lang)
            if cached is not None:
                print(f"[CACHE HIT] group={self.group_name}, lang={self.lang}")
                cached = self._normalize_result(cached)
                cached["_cached"] = True
                return cached

        compact = self._compress_metadata(metadata)
        context_json = json.dumps(compact, indent=2, ensure_ascii=False)

        total_rows = compact.get("total_rows", 0)
        n_numeric = len(compact["columns"]["numeric"])
        n_categorical = len(compact["columns"]["categorical"])
        n_all = len(compact["columns"]["all"])

        if total_rows > 10000 or n_all > 25:
            data_hint = f"IMPORTANT: Large dataset ({total_rows} rows, {n_all} cols). Pick the most informative columns only."
        else:
            data_hint = ""

        numeric_str = ', '.join(compact["columns"]["numeric"])
        categorical_str = ', '.join(compact["columns"]["categorical"])

        correlations = compact.get("top_correlations", [])
        if correlations:
            corr_lines = "\n".join(
                f"  - {c['col1']} ↔ {c['col2']}: {c['correlation']:+.2f}"
                for c in correlations[:8]
            )
            corr_hint = f"\nTop column correlations:\n{corr_lines}"
        else:
            corr_hint = ""

        prompt = f"""Given this dataset with {total_rows} rows.
Numeric columns: {numeric_str}
Categorical columns: {categorical_str}
{data_hint}

Column statistics:
{context_json}
{corr_hint}

Return a JSON object with exactly 8 chart recommendations.
Each chart needs "type", "columns" (array of column names), and "title".
Also include 5 "insights" — meaningful observations about the data.

For insights, analyze the statistics above and write factual observations such as:
- Columns with high/low variance (compare std to mean)
- Strong positive or negative correlations between columns
- Columns with many missing values
- Skewed distributions (mean far from median)
- Columns with very few or very many unique values
Do NOT just restate numbers. Explain what they MEAN for the dataset.

Available chart types: histogram, pie, scatter, heatmap, line, box, violin.
Rules:
- histogram: 1 numeric column (distribution)
- pie: 1 categorical column with <10 unique values
- scatter: 2 numeric columns (relationship)
- heatmap: 3-8 numeric columns (correlation matrix)
- line: 1 numeric column (trend across rows) or 2 columns (x, y)
- box: 1 numeric, optionally 1 categorical (outliers and quartiles)
- violin: 1 numeric, optionally 1 categorical (distribution density)
- Use ONLY column names listed above
- CRITICAL: maximize variety. Each of the 7 types should appear at least once across the 8 charts.
- You MUST include at least one "line" chart
- You MUST include at least one "box" or "violin"
- You MUST include at least one "heatmap" (if 2+ numeric columns)
- If a type repeats, use different columns for it
- Titles in {self.lang}

Example:
{{"plots": [{{"type": "heatmap", "columns": ["col1", "col2", "col3"], "title": "..."}}, {{"type": "histogram", "columns": ["col1"], "title": "..."}}, {{"type": "line", "columns": ["col2"], "title": "..."}}, {{"type": "scatter", "columns": ["col1", "col2"], "title": "..."}}, {{"type": "box", "columns": ["col3"], "title": "..."}}, {{"type": "pie", "columns": ["cat_col"], "title": "..."}}, {{"type": "violin", "columns": ["col4"], "title": "..."}}, {{"type": "line", "columns": ["col3"], "title": "..."}}], "insights": ["...", "...", "...", "...", "..."]}}"""

        last_error = None

        while self.attempt_queue:
            model_id, group = self.attempt_queue.pop(0)

            try:
                print(f"Attempting: {self._short_name(model_id)} (group: {group})")

                response = await self.client.chat.completions.create(
                    model=model_id,
                    messages=[
                        {"role": "system", "content": f"You are a data analyst. Return ONLY raw JSON. No markdown, no code blocks, no explanation. Output language: {self.lang}."},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.5,
                    max_tokens=4000,
                )

                content = response.choices[0].message.content
                if not content or content.strip() == "":
                    raise ValueError("Empty content")

                print(f"[RAW RESPONSE] {content[:2000]}")

                result = self._safe_parse_json(content)
                if not result:
                    raise ValueError("JSON Parse Failed")

                print(f"[PARSED KEYS] {list(result.keys())}")
                print(f"[RAW PLOTS] {result.get('plots', 'MISSING')}")
                print(f"[RAW INSIGHTS] {result.get('insights', result.get('analysis_plan', 'MISSING'))}")

                result = self._normalize_result(result)

                result["used_model"] = self._short_name(model_id)
                result["used_group"] = group
                print(f"Success: {self._short_name(model_id)} → {len(result['plots'])} valid plots")

                if file_content is not None:
                    analysis_cache.put(file_content, self.group_name, self.lang, result)

                result["_cached"] = False

                return result

            except Exception as e:
                error_msg = str(e)
                print(f"Error ({self._short_name(model_id)}): {error_msg}")
                if any(
                    x in error_msg.lower()
                    for x in ["429", "503", "empty", "timeout", "rate limit"]
                ):
                    last_error = f"{self._short_name(model_id)}: Busy"
                else:
                    last_error = f"{self._short_name(model_id)}: Error"
                continue

        return {
            "analysis_plan": {"key_insights": []},
            "plots": [],
            "error": last_error if last_error else "All providers failed",
        }
