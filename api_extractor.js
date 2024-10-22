(function () {
    var myConnector = tableau.makeConnector();

    // Schema definition for the data being pulled from IMF and World Bank
    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            { id: "label", dataType: tableau.dataTypeEnum.string },
            { id: "description", alias: "Description", dataType: tableau.dataTypeEnum.string },
            { id: "source", alias: "Source", dataType: tableau.dataTypeEnum.string },
            { id: "unit", alias: "Unit", dataType: tableau.dataTypeEnum.string },
            { id: "dataset", alias: "Dataset", dataType: tableau.dataTypeEnum.string },
            { id: "indicator", alias: "Indicator", dataType: tableau.dataTypeEnum.string },
            { id: "country", dataType: tableau.dataTypeEnum.string },
            { id: "countryiso3code", dataType: tableau.dataTypeEnum.string },
            { id: "date", dataType: tableau.dataTypeEnum.int },
            { id: "value", alias: "Value", dataType: tableau.dataTypeEnum.float },
            { id: "obs_status", alias: "Observation Status", dataType: tableau.dataTypeEnum.string },
            { id: "decimal", alias: "Decimal", dataType: tableau.dataTypeEnum.int }
        ];

        var tableSchema = {
            id: "economicIndicators",
            alias: "Economic Indicators Data",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Function to fetch and process data
    myConnector.getData = function (table, doneCallback) {
        var imfEndpoints = [
            "https://www.imf.org/external/datamapper/api/v1/indicators/GDP",
            "https://www.imf.org/external/datamapper/api/v1/indicators/CPI",
            "https://www.imf.org/external/datamapper/api/v1/indicators/GXDEBT",
            "https://www.imf.org/external/datamapper/api/v1/indicators/LUR"
        ];

        var worldBankEndpoints = [
            "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json",
            "https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?format=json",
            "https://api.worldbank.org/v2/country/all/indicator/SP.DYN.LE00.IN?format=json",
            "https://api.worldbank.org/v2/country/all/indicator/SE.PRM.ENRR?format=json"
        ];

        var tableData = [];
        var totalEndpoints = imfEndpoints.length + worldBankEndpoints.length;
        var completedRequests = 0; // Track completed API requests

        // Function to check if all API requests are complete
        function checkAllRequestsDone() {
            if (completedRequests === totalEndpoints) {
                // Append rows and signal Tableau that data fetching is done
                table.appendRows(tableData);
                doneCallback();
            }
        }

        // Fetch data from IMF endpoints
        imfEndpoints.forEach(function (url) {
            $.getJSON(url, function (imfData) {
                if (imfData && imfData.data) {
                    imfData.data.forEach(function (indicator) {
                        tableData.push({
                            "label": indicator.label || "N/A",
                            "description": indicator.description || "N/A",
                            "source": "IMF",
                            "unit": indicator.unit || "N/A",
                            "dataset": "IMF",
                            "indicator": indicator.label || "N/A",
                            "country": "N/A",
                            "countryiso3code": "N/A",
                            "date": "N/A",
                            "value": null,
                            "obs_status": "N/A",
                            "decimal": 0
                        });
                    });
                }
                completedRequests++; // Increment on each successful request
                checkAllRequestsDone(); // Check if all requests are done
            }).fail(function (error) {
                console.error("IMF API fetch error", error);
                completedRequests++; // Increment even on failure
                checkAllRequestsDone();
            });
        });

        // Fetch data from World Bank endpoints
        worldBankEndpoints.forEach(function (url) {
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                success: function (wbData) {
                    if (wbData && wbData[1]) {
                        wbData[1].forEach(function (entry) {
                            tableData.push({
                                "label": "N/A",
                                "description": "N/A",
                                "source": "World Bank",
                                "unit": entry.unit || "",
                                "dataset": "World Bank",
                                "indicator": entry.indicator.value,
                                "country": entry.country.value,
                                "countryiso3code": entry.countryiso3code,
                                "date": entry.date ? parseInt(entry.date) : null,
                                "value": entry.value !== null ? parseFloat(entry.value) : null,
                                "obs_status": entry.obs_status || "",
                                "decimal": entry.decimal || 0
                            });
                        });
                    }
                    completedRequests++; // Increment on each successful request
                    checkAllRequestsDone(); // Check if all requests are done
                },
                error: function (error) {
                    console.error("World Bank API fetch error", error);
                    completedRequests++; // Increment even on failure
                    checkAllRequestsDone();
                }
            });
        });
    };

    // Register the connector
    tableau.registerConnector(myConnector);

    // Initialize Tableau and submit connection when the button is clicked
    $(document).ready(function () {
        $("#submitButton").click(function () {
            tableau.connectionName = "Economic Indicators Data"; // Set the connection name
            tableau.submit(); // This will initiate the data fetching process
        });
    });
})();
