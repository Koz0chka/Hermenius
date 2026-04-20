from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.concurrency import run_in_threadpool
import time
import os
import shutil

from app.schemas.models import AnalysisResponse, FileInfo, PlotData, OutlierReport, KeyMetric
from app.services.data_processor import DataProcessor
from app.services.visualizer import Visualizer
from app.services.ai_service import AIService, AVAILABLE_GROUPS, MODEL_GROUPS, analysis_cache
from app.core.localization import t

router = APIRouter()


@router.get("/models")
async def list_models():
    """Return available model groups with their individual models."""
    groups = []
    for name in AVAILABLE_GROUPS:
        models = MODEL_GROUPS.get(name, [])
        groups.append({
            "name": name,
            "models": [m.removesuffix(":free") for m in models],
        })
    return {"groups": groups}


@router.post("/clear-cache")
async def clear_analysis_cache():
    """Clear all cached AI analysis results."""
    count = analysis_cache.clear()
    return {"status": "ok", "cleared": count}


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_data(
    file: UploadFile = File(...),
    model_name: str = Form("Nemotron"),
    lang: str = Form("ru"),
    skip_cache: bool = Form(False),
):
    start_time = time.time()
    temp_file_path = f"temp_{file.filename}"
    final_message = t("file_load_success", lang)

    try:
        file_content = await file.read()
        file_size = len(file_content)

        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_content)

        processor = DataProcessor(temp_file_path)
        success, message = await run_in_threadpool(processor.load_and_process)
        if not success:
            raise HTTPException(status_code=400, detail=message)

        metrics_raw = await run_in_threadpool(processor.get_key_metrics, lang)
        key_metrics = [KeyMetric(**m) for m in metrics_raw]

        ai_service = AIService(model_name, lang)
        ai_result = await ai_service.get_analysis_recommendations(
            processor.metadata, file_content=file_content, skip_cache=skip_cache
        )

        if "error" in ai_result:
            final_message = t("file_load_partial", lang, ai_result["error"])

        insights = ai_result.get("analysis_plan", {}).get("key_insights", [])

        plot_instructions = ai_result.get("plots", [])

        ai_error = ai_result.get("error")

        visualizer = Visualizer(lang)
        df = processor.df_full

        def generate_plots_logic():
            plots = []
            seen_titles = set()

            for instr in plot_instructions:
                plot_data = visualizer.execute_instruction(df, instr)
                if plot_data and plot_data.get("title") not in seen_titles:
                    plots.append(PlotData(**plot_data))
                    seen_titles.add(plot_data["title"])

            return plots

        all_plots = await run_in_threadpool(generate_plots_logic)

        file_info = FileInfo(
            file_name=file.filename,
            total_rows=processor.metadata["total_rows"],
            total_columns=len(processor.metadata["columns"]["all"]),
            columns=processor.metadata["columns"]["all"],
        )

        outlier_report = None
        numeric_cols = processor.df_full.select_dtypes(include=["number"]).columns
        if len(numeric_cols) > 0:
            _, out_info = processor.handle_outliers(processor.df_full[[numeric_cols[0]]])
            if out_info["total_outliers"] > 0:
                outlier_report = OutlierReport(
                    total_outliers=out_info["total_outliers"],
                    columns_affected=out_info["columns_affected"],
                    method="IQR",
                )

        elapsed = round(time.time() - start_time, 2)

        status = "error" if ai_error and not all_plots else "success"

        return AnalysisResponse(
            status=status,
            message=final_message,
            key_metrics=key_metrics,
            file_info=file_info,
            ai_insights=insights,
            plots=all_plots,
            outlier_report=outlier_report,
            processing_time_sec=elapsed,
            cached=ai_result.get("_cached", False),
            used_model=ai_result.get("used_model"),
            used_group=ai_result.get("used_group"),
        )

    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
