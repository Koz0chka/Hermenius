import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from app.core.localization import t

class Visualizer:
    def __init__(self, lang: str = "ru"):
        self.lang = lang

    def _convert_to_native(self, obj: Any) -> Any:
        if isinstance(obj, dict): return {k: self._convert_to_native(v) for k, v in obj.items()}
        elif isinstance(obj, list): return [self._convert_to_native(item) for item in obj]
        elif isinstance(obj, (np.integer)): return int(obj)
        elif isinstance(obj, (np.floating)): return float(obj)
        elif isinstance(obj, np.ndarray): return obj.tolist()
        elif pd.isna(obj): return None
        return obj

    def execute_instruction(self, df: pd.DataFrame, instruction: dict) -> Optional[Dict]:
        plot_type = instruction.get("type")
        cols = instruction.get("columns", [])

        valid_cols = [c for c in cols if c in df.columns]
        if not valid_cols: return None

        if plot_type == "histogram" and len(valid_cols) >= 1:
            return self._histogram_data(df, valid_cols[0])
            
        elif plot_type == "pie" and len(valid_cols) >= 1:
            return self._pie_data(df, valid_cols[0])
            
        elif plot_type == "scatter" and len(valid_cols) >= 2:
            return self._scatter_data(df, valid_cols[0], valid_cols[1])
            
        elif plot_type == "line" and len(valid_cols) >= 1:
            if len(valid_cols) >= 2:
                return self._line_data_xy(df, valid_cols[0], valid_cols[1])
            else:
                return self._line_data_simple(df, valid_cols[0])
                
        elif plot_type == "box" and len(valid_cols) >= 1:
            num_cols = df[valid_cols].select_dtypes(include=[np.number]).columns.tolist()
            cat_cols = df[valid_cols].select_dtypes(include=['object', 'category']).columns.tolist()
            if cat_cols and num_cols:
                return self._box_data(df, cat_cols[0], num_cols[0])
            elif num_cols:
                return self._box_data_simple(df, num_cols[0])
                
        elif plot_type == "violin" and len(valid_cols) >= 1:
            num_cols = df[valid_cols].select_dtypes(include=[np.number]).columns.tolist()
            cat_cols = df[valid_cols].select_dtypes(include=['object', 'category']).columns.tolist()
            if cat_cols and num_cols:
                return self._violin_data(df, cat_cols[0], num_cols[0])
            elif num_cols:
                return self._violin_data_simple(df, num_cols[0])

        elif plot_type == "heatmap":
            numeric_df = df[valid_cols].select_dtypes(include=[np.number])
            if numeric_df.shape[1] >= 2:
                return self._heatmap_data(numeric_df)
        
        return None

    def _histogram_data(self, df, col) -> Dict:
        data = df[col].dropna()
        if len(data) == 0: return None
        hist, bin_edges = np.histogram(data, bins=20)
        return {
            "type": "bar",
            "title": t("histogram_title", self.lang, col),
            "data": self._convert_to_native({
                "labels": [round(b, 2) for b in bin_edges[:-1]],
                "datasets": [{"label": col, "data": hist.tolist()}]
            })
        }

    def _scatter_data(self, df, x_col, y_col) -> Dict:
        sample = df[[x_col, y_col]].dropna().head(500)
        if sample.empty: return None
        points = [{"x": row[x_col], "y": row[y_col]} for _, row in sample.iterrows()]
        return {
            "type": "scatter",
            "title": t("scatter_title", self.lang, x_col, y_col),
            "data": self._convert_to_native({"datasets": [{"label": f"{x_col}/{y_col}", "data": points}]})
        }
    
    def _line_data_xy(self, df, x_col, y_col) -> Dict:
        sample = df[[x_col, y_col]].sort_values(by=x_col).dropna().head(200)
        if sample.empty: return None
        return {
            "type": "line",
            "title": f"Тренд: {y_col} по {x_col}",
            "data": self._convert_to_native({
                "labels": sample[x_col].tolist(),
                "datasets": [{"label": y_col, "data": sample[y_col].tolist()}]
            })
        }

    def _line_data_simple(self, df, y_col) -> Dict:
        sample = df[[y_col]].dropna().head(100)
        if sample.empty: return None
        return {
            "type": "line",
            "title": f"Динамика: {y_col}",
            "data": self._convert_to_native({
                "labels": sample.index.tolist(),
                "datasets": [{"label": y_col, "data": sample[y_col].tolist()}]
            })
        }

    def _pie_data(self, df, col) -> Dict:
        counts = df[col].value_counts().head(10)
        if counts.empty: return None
        return {
            "type": "pie",
            "title": f"Доли: {col}",
            "data": self._convert_to_native({
                "labels": counts.index.tolist(),
                "values": counts.values.tolist()
            })
        }

    def _heatmap_data(self, df_numeric) -> Dict:
        corr = df_numeric.corr().fillna(0).round(2)
        if corr.empty: return None
        return {
            "type": "heatmap",
            "title": t("correlation_title", self.lang),
            "data": self._convert_to_native({
                "labels": corr.columns.tolist(),
                "matrix": corr.values.tolist()
            })
        }
    
    def _box_data(self, df, cat_col, num_col) -> Dict:
        stats = []
        labels = []
        for name, group in df.groupby(cat_col):
            data = group[num_col].dropna()
            if len(data) > 0:
                labels.append(str(name))
                stats.append(self._calc_box_stats(data))
        if not stats: return None
        return {
            "type": "boxplot",
            "title": t("box_title", self.lang, num_col, cat_col),
            "data": self._convert_to_native({"labels": labels, "datasets": stats})
        }

    def _box_data_simple(self, df, num_col) -> Dict:
        data = df[num_col].dropna()
        if len(data) == 0: return None
        stats = [self._calc_box_stats(data)]
        return {
            "type": "boxplot",
            "title": f"Распределение: {num_col}",
            "data": self._convert_to_native({"labels": [num_col], "datasets": stats})
        }

    def _violin_data(self, df, cat_col, num_col) -> Dict:
        groups = []
        labels = []
        for name, group in df.groupby(cat_col):
            sample = group[num_col].dropna().head(100).tolist()
            if sample:
                labels.append(str(name))
                groups.append(sample)
        if not groups: return None
        return {
            "type": "violin",
            "title": f"Плотность: {num_col} по {cat_col}",
            "data": self._convert_to_native({"labels": labels, "datasets": groups})
        }
    
    def _violin_data_simple(self, df, num_col) -> Dict:
        sample = df[num_col].dropna().head(200).tolist()
        if not sample: return None
        return {
            "type": "violin",
            "title": f"Плотность: {num_col}",
            "data": self._convert_to_native({"labels": [num_col], "datasets": [sample]})
        }

    def _calc_box_stats(self, data):
        return {
            "min": data.min(), "q1": data.quantile(0.25),
            "median": data.median(), "q3": data.quantile(0.75), "max": data.max()
        }