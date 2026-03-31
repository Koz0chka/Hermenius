from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Literal

ModelEnum = Literal["Nemotron", "Step", "Z-AI", "Qwen", "Llama", "GPT"]

class KeyMetric(BaseModel):
    label: str
    value: str
    color: str

class PlotInstruction(BaseModel):
    type: str
    columns: List[str]
    title: str
    reason: str

class FileInfo(BaseModel):
    file_name: str
    total_rows: int
    total_columns: int
    columns: List[str]

class PlotData(BaseModel):
    type: str
    title: str
    subtable_name: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    reason: Optional[str] = None

class OutlierReport(BaseModel):
    total_outliers: int
    columns_affected: List[str]
    method: str

class AnalysisResponse(BaseModel):
    status: str
    message: str
    key_metrics: List[KeyMetric]
    file_info: FileInfo
    ai_insights: List[str]
    plots: List[PlotData]
    outlier_report: Optional[OutlierReport] = None
    processing_time_sec: float