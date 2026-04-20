import pandas as pd
import numpy as np
import os
from typing import Tuple, Dict, Any, List
from app.core.localization import t

class DataProcessor:
    def __init__(self, file_path: str, max_rows: int = 50000):
        self.file_path = file_path
        self.max_rows = max_rows
        self.df_full = None
        self.metadata = {}
        self.delimiter = ','
        self.encoding = 'utf-8'

    def detect_delimiter(self, sample_lines=10) -> Tuple[str, str]:
        encodings = ['utf-8', 'cp1251', 'windows-1251']
        for encoding in encodings:
            try:
                with open(self.file_path, 'r', encoding=encoding) as f:
                    content = f.read(3000)
                lines = [line.strip() for line in content.split('\n') if line.strip()]
                if not lines: continue
                delimiters = [';', ',', '\t', '|']
                delimiter_scores = {}
                for delimiter in delimiters:
                    field_counts = [len(line.split(delimiter)) for line in lines[:sample_lines]]
                    if field_counts:
                        avg_fields = sum(field_counts) / len(field_counts)
                        if avg_fields > 1:
                            consistent = len(set(field_counts)) == 1
                            delimiter_scores[delimiter] = {'avg': avg_fields, 'con': consistent}
                if delimiter_scores:
                    best = max(delimiter_scores.items(), key=lambda x: (x[1]['con'], x[1]['avg']))[0]
                    return best, encoding
            except: continue
        return ',', 'utf-8'

    def load_and_process(self) -> Tuple[bool, str]:
        try:
            self.delimiter, self.encoding = self.detect_delimiter()
            
            with open(self.file_path, 'r', encoding=self.encoding) as f:
                total_rows = sum(1 for _ in f) - 1

            self.df_full = pd.read_csv(
                self.file_path, 
                delimiter=self.delimiter, 
                encoding=self.encoding, 
                nrows=self.max_rows,
                low_memory=False,
                on_bad_lines='skip'
            )
            
            actual_rows = len(self.df_full)
            self._prepare_metadata(actual_rows)
            return True, "Файл успешно загружен"
        except Exception as e:
            return False, f"Ошибка обработки: {str(e)}"

    def _prepare_metadata(self, total_rows: int):
        if self.df_full is None: return
        
        numeric_cols = self.df_full.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = self.df_full.select_dtypes(include=['object']).columns.tolist()
        
        col_stats = {}
        for col in self.df_full.columns:
            col_data = self.df_full[col]

            examples = col_data.dropna().head(3).tolist()
            examples_str = [str(x) for x in examples]

            stats = {
                "dtype": str(col_data.dtype),
                "unique": int(col_data.nunique()),
                "missing%": round(float(col_data.isnull().mean() * 100), 2),
                "examples": examples_str
            }
            
            if col in numeric_cols:
                clean_data = col_data.dropna()
                if not clean_data.empty:
                    stats["min"] = float(clean_data.min())
                    stats["max"] = float(clean_data.max())
                    stats["mean"] = float(clean_data.mean())
                    stats["std"] = float(clean_data.std())
                    stats["q1"] = float(clean_data.quantile(0.25))
                    stats["median"] = float(clean_data.median())
                    stats["q3"] = float(clean_data.quantile(0.75))
            else:
                top_val = col_data.value_counts().idxmax() if not col_data.empty else ""
                stats["top"] = str(top_val)
            
            col_stats[col] = stats

        self.metadata = {
            "file_name": os.path.basename(self.file_path),
            "total_rows": total_rows,
            "columns": {
                "all": self.df_full.columns.tolist(),
                "numeric": numeric_cols,
                "categorical": categorical_cols,
            },
            "column_statistics": col_stats,
        }

        if len(numeric_cols) >= 2:
            corr_matrix = self.df_full[numeric_cols].corr()
            correlations = []
            for i in range(len(numeric_cols)):
                for j in range(i + 1, len(numeric_cols)):
                    val = round(float(corr_matrix.iloc[i, j]), 3)
                    if abs(val) > 0.3:
                        correlations.append({
                            "col1": numeric_cols[i],
                            "col2": numeric_cols[j],
                            "correlation": val,
                        })
            correlations.sort(key=lambda x: abs(x["correlation"]), reverse=True)
            self.metadata["top_correlations"] = correlations[:10]

    def get_key_metrics(self, lang: str = "ru") -> list:
        metrics = []
        
        metrics.append({
            "label": t("metricRows", lang),
            "value": str(len(self.df_full)), 
            "color": "primary"
        })
        
        total_cells = self.df_full.size
        missing_cells = self.df_full.isnull().sum().sum()
        missing_pct = (missing_cells / total_cells) * 100 if total_cells > 0 else 0
        color = "success" if missing_pct < 1 else ("warning" if missing_pct < 10 else "danger")
        metrics.append({
            "label": t("metric_missing", lang), 
            "value": f"{missing_pct:.1f}%", 
            "color": color
        })
        
        dup_pct = (self.df_full.duplicated().sum() / len(self.df_full)) * 100
        metrics.append({
            "label": t("metric_duplicates", lang), 
            "value": f"{dup_pct:.1f}%", 
            "color": "success" if dup_pct < 5 else "warning"
        })
        
        num = len(self.metadata["columns"]["numeric"])
        cat = len(self.metadata["columns"]["categorical"])
        metrics.append({
            "label": f"{t('metric_numeric', lang)}/{t('metric_categorical', lang)}", 
            "value": f"{num}/{cat}", 
            "color": "info"
        })
        
        return metrics

    def handle_outliers(self, df: pd.DataFrame, threshold=1.5) -> Tuple[pd.DataFrame, Dict]:
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        outlier_info = {"total_outliers": 0, "columns_affected": []}
        df_clean = df.copy()

        for col in numeric_cols:
            data = df[col].dropna()
            if len(data) < 10: continue
            
            Q1 = data.quantile(0.25)
            Q3 = data.quantile(0.75)
            IQR = Q3 - Q1

            if IQR == 0: continue
            
            lower = Q1 - threshold * IQR
            upper = Q3 + threshold * IQR

            outliers_mask = (df[col] < lower) | (df[col] > upper)
            outlier_count = outliers_mask.sum()
            
            if outlier_count > 0:
                df_clean[col] = df_clean[col].clip(lower, upper)
                
                outlier_info["total_outliers"] += int(outlier_count)
                outlier_info["columns_affected"].append(col)
                
        return df_clean, outlier_info
