from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.concurrency import run_in_threadpool
import time, os, shutil

from app.schemas.models import AnalysisResponse, FileInfo, PlotData, OutlierReport, KeyMetric
from app.services.data_processor import DataProcessor
from app.services.visualizer import Visualizer
from app.services.ai_service import AIService
from app.core.localization import t

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_data(
    file: UploadFile = File(...),
    model_name: str = Form("Llama"),
    lang: str = Form("ru")
):
    start_time = time.time()
    temp_file_path = f"temp_{file.filename}"
    final_message = t("file_load_success", lang)

    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        processor = DataProcessor(temp_file_path)
        success, message = await run_in_threadpool(processor.load_and_process)
        if not success:
            raise HTTPException(status_code=400, detail=message)

        metrics_raw = await run_in_threadpool(processor.get_key_metrics, lang)
        key_metrics = [KeyMetric(**m) for m in metrics_raw]

        ai_service = AIService(model_name, lang)
        ai_result = await ai_service.get_analysis_recommendations(processor.metadata)

        if "error" in ai_result:
            final_message = t("file_load_partial", lang, ai_result["error"])
        
        insights = ai_result.get("analysis_plan", {}).get("key_insights", [])
 
        plot_instructions = ai_result.get("plots", [])

        if not plot_instructions:
             plot_instructions = ai_result.get("subtable_recommendations", [])

        visualizer = Visualizer(lang)
        
        def generate_plots_logic():
            plots = []
            seen_titles = set()
            
            if not plot_instructions:
                numeric = processor.df_full.select_dtypes(include=['number']).columns.tolist()
                if len(numeric) >= 2:
                    instruction = {"type": "heatmap", "columns": numeric}
                    plot_data = visualizer.execute_instruction(processor.df_full, instruction)
                    if plot_data: plots.append(PlotData(**plot_data))
            else:
                for instr in plot_instructions:
                    if "selected_columns" in instr:
                        cols = instr.get("selected_columns", [])
                        p_types = instr.get("recommended_plots", [])
                        for p_type in p_types:
                            instr_new = {"type": p_type, "columns": cols}
                            plot_data = visualizer.execute_instruction(processor.df_full, instr_new)
                            if plot_data and plot_data['title'] not in seen_titles:
                                plots.append(PlotData(**plot_data))
                                seen_titles.add(plot_data['title'])
                    else:
                        plot_data = visualizer.execute_instruction(processor.df_full, instr)
                        if plot_data and plot_data['title'] not in seen_titles:
                            plots.append(PlotData(**plot_data))
                            seen_titles.add(plot_data['title'])
                            
            return plots

        all_plots = await run_in_threadpool(generate_plots_logic)

        file_info = FileInfo(
            file_name=file.filename,
            total_rows=processor.metadata['total_rows'],
            total_columns=len(processor.metadata['columns']['all']),
            columns=processor.metadata['columns']['all']
        )

        outlier_report = None
        numeric_cols = processor.df_full.select_dtypes(include=['number']).columns
        if len(numeric_cols) > 0:
             _, out_info = processor.handle_outliers(processor.df_full[[numeric_cols[0]]])
             if out_info["total_outliers"] > 0:
                 outlier_report = OutlierReport(
                     total_outliers=out_info["total_outliers"],
                     columns_affected=out_info["columns_affected"],
                     method="IQR"
                 )

        return AnalysisResponse(
            status="success",
            message=final_message,
            key_metrics=key_metrics,
            file_info=file_info,
            ai_insights=insights,
            plots=all_plots,
            outlier_report=outlier_report,
            processing_time_sec=round(time.time() - start_time, 2)
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)