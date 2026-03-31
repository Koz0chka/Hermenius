const HermeniusAPI = (() => {
    const API_URL = 'http://localhost:8000/api/analyze';

    const EMBEDDED_DATASETS = {
        iris: `sepal_length,sepal_width,petal_length,petal_width,species
5.1,3.5,1.4,0.2,setosa
4.9,3.0,1.4,0.2,setosa
4.7,3.2,1.3,0.2,setosa
4.6,3.1,1.5,0.2,setosa
5.0,3.6,1.4,0.2,setosa
5.4,3.9,1.7,0.4,setosa
4.6,3.4,1.4,0.3,setosa
5.0,3.4,1.5,0.2,setosa
4.4,2.9,1.4,0.2,setosa
4.9,3.1,1.5,0.1,setosa
7.0,3.2,4.7,1.4,versicolor
6.4,3.2,4.5,1.5,versicolor
6.9,3.1,4.9,1.5,versicolor
5.5,2.3,4.0,1.3,versicolor
6.5,2.8,4.6,1.5,versicolor
5.7,2.8,4.5,1.3,versicolor
6.3,3.3,4.7,1.6,versicolor
4.9,2.4,3.3,1.0,versicolor
6.6,2.9,4.6,1.3,versicolor
5.2,2.7,3.9,1.4,versicolor
6.3,3.3,6.0,2.5,virginica
5.8,2.7,5.1,1.9,virginica
7.1,3.0,5.9,2.1,virginica
6.3,2.9,5.6,1.8,virginica
6.5,3.0,5.8,2.2,virginica
7.6,3.0,6.6,2.1,virginica
4.9,2.5,4.5,1.7,virginica
7.3,2.9,6.3,1.8,virginica
6.7,2.5,5.8,1.8,virginica
7.2,3.6,6.1,2.5,virginica`,

        students: `student_id,name,age,gender,major,gpa,study_hours,attendance,math_score,english_score
1,Алексей,20,М,Информатика,4.2,25,92,85,78
2,Мария,21,Ж,Математика,4.8,30,98,95,88
3,Иван,22,М,Физика,3.5,15,78,60,72
4,Елена,20,Ж,Информатика,4.5,28,95,90,82
5,Дмитрий,23,М,Математика,3.8,20,85,70,68
6,Анна,21,Ж,Физика,4.0,22,88,75,74
7,Сергей,22,М,Информатика,3.2,12,72,55,60
8,Ольга,20,Ж,Математика,4.7,29,96,92,90
9,Николай,24,М,Физика,3.0,10,68,50,58
10,Татьяна,21,Ж,Информатика,4.3,26,93,88,80
11,Павел,22,М,Математика,3.9,18,82,72,65
12,Юлия,20,Ж,Физика,4.1,24,90,80,76
13,Андрей,23,М,Информатика,3.6,16,80,62,70
14,Наталья,21,Ж,Математика,4.6,27,94,88,85
15,Виктор,22,М,Физика,3.3,14,75,58,62
16,Екатерина,20,Ж,Информатика,4.9,32,99,98,95
17,Александр,24,М,Математика,3.4,13,76,56,64
18,Ирина,21,Ж,Физика,4.4,25,91,85,78
19,Максим,22,М,Информатика,3.7,17,81,65,68
20,Светлана,20,Ж,Математика,4.0,21,86,74,72
21,Роман,23,М,Физика,3.1,11,70,52,58
22,Людмила,21,Ж,Информатика,4.5,28,95,89,83
23,Артём,22,М,Математика,3.6,16,79,63,66
24,Вероника,20,Ж,Физика,4.2,23,89,78,75
25,Денис,23,М,Информатика,3.8,19,84,71,69`,

        titanic: `passenger_id,survived,pclass,name,sex,age,sibsp,parch,fare,embarked
1,0,3,"Braund Mr. Owen Harris",male,22,1,0,7.25,S
2,1,1,"Cumings Mrs. John Bradley",female,38,1,0,71.28,C
3,1,3,"Heikkinen Miss. Laina",female,26,0,0,7.92,S
4,1,1,"Futrelle Mrs. Jacques Heath",female,35,1,0,53.10,S
5,0,3,"Allen Mr. William Henry",male,35,0,0,8.05,S
6,0,3,"Moran Mr. James",male,NA,0,0,8.46,Q
7,0,1,"McCarthy Mr. Timothy J",male,54,0,0,51.86,S
8,0,3,"Palsson Master. Gosta Leonard",male,2,3,1,21.08,S
9,1,3,"Johnson Mrs. Oscar W",female,27,0,2,11.13,S
10,1,2,"Nasser Mrs. Nicholas",female,14,1,0,30.07,C
11,1,3,"Sandstrom Miss. Marguerite Rut",female,4,1,1,16.70,S
12,1,1,"Bonnell Miss. Elizabeth",female,58,0,0,26.55,S
13,0,3,"Saundercock Mr. William Henry",male,20,0,0,8.05,S
14,0,3,"Andersson Mr. Anders Johan",male,39,1,5,31.28,S
15,0,3,"Vestrom Miss. Hulda Amanda Adolfina",female,14,0,0,7.85,S
16,1,2,"Hewlett Mrs. Mary",female,55,0,0,16.00,S
17,0,3,"Rice Master. Eugene",male,2,4,1,29.13,Q
18,1,2,"Williams Mr. Charles Eugene",male,NA,0,0,13.00,S
19,0,3,"Vander Planke Mrs. Julius",female,31,1,0,18.00,S
20,1,3,"Masselmani Mrs. Fatima",female,NA,0,0,7.22,C
21,0,2,"Fynney Mr. Joseph J",male,35,0,0,26.00,S
22,1,2,"Beesley Mr. Lawrence",male,34,0,0,13.00,S
23,1,3,"McGowan Miss. Anna",female,15,0,0,8.02,Q
24,1,1,"Sloper Mr. William Thompson",male,28,0,0,35.50,S
25,0,3,"Palsson Miss. Torborg Danira",female,8,3,1,21.07,S
26,1,3,"Asplund Mrs. Carl Oscar",female,38,1,5,31.49,S
27,0,3,"Emir Mr. Farred Chehab",male,NA,0,0,7.22,C
28,0,1,"Fortune Mr. Charles Alexander",male,19,3,2,263.00,S
29,1,3,"O'Brien Mrs. Thomas",female,NA,1,0,15.85,Q
30,0,3,"Adahl Mr. Johan Ernst",male,26,0,0,7.78,S`
    };

    async function analyzeFile(file, modelName = 'Llama', lang = 'ru') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model_name', modelName);
        formData.append('lang', lang);

        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Ошибка сервера: ${response.status}`);
        }

        return await response.json();
    }

    async function analyzeDataset(datasetName, modelName = 'Llama', lang = 'ru') {
        try {
            const csvContent = loadSampleDataset(datasetName);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const file = new File([blob], `${datasetName}.csv`, { type: 'text/csv' });
            return await analyzeFile(file, modelName, lang);
        } catch (error) {
            console.error('Ошибка загрузки датасета:', error);
            throw error;
        }
    }

    function loadSampleDataset(name) {
        const data = EMBEDDED_DATASETS[name.toLowerCase()];
        if (!data) throw new Error(`Датасет "${name}" не найден`);
        return data;
    }

    function storeAnalysisResult(result) {
        sessionStorage.setItem('hermenius_analysis', JSON.stringify(result));
    }

    function loadAnalysisResult() {
        const data = sessionStorage.getItem('hermenius_analysis');
        return data ? JSON.parse(data) : null;
    }

    function clearAnalysisResult() {
        sessionStorage.removeItem('hermenius_analysis');
    }

    return {
        analyzeFile,
        analyzeDataset,
        loadSampleDataset,
        storeAnalysisResult,
        loadAnalysisResult,
        clearAnalysisResult
    };
})();
