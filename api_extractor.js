(function () {
    var myConnector = tableau.makeConnector();

    // Schema definition for the data being pulled from IMF and World Bank
    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            { id: "country", dataType: tableau.dataTypeEnum.string },
            { id: "countryiso3code", dataType: tableau.dataTypeEnum.string },
            { id: "date", dataType: tableau.dataTypeEnum.int },
            { id: "indicator", alias: "Indicator", dataType: tableau.dataTypeEnum.string },
            { id: "value", alias: "Value", dataType: tableau.dataTypeEnum.float },
            { id: "source", alias: "Source", dataType: tableau.dataTypeEnum.string },
            { id: "unit", alias: "Unit", dataType: tableau.dataTypeEnum.string },
            { id: "dataset", alias: "Dataset", dataType: tableau.dataTypeEnum.string }
        ];

        var tableSchema = {
            id: "economicIndicators",
            alias: "Economic Indicators Data Combined",
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
                        if (indicator.country && indicator.date) {
                            tableData.push({
                                "country": indicator.country || "N/A",
                                "countryiso3code": indicator.countryiso3code || "N/A",
                                "date": parseInt(indicator.date) || null,
                                "indicator": indicator.label || "N/A",
                                "value": parseFloat(indicator.value) || null,
                                "source": "IMF",
                                "unit": indicator.unit || "N/A",
                                "dataset": "IMF"
                            });
                        }
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
                            if (entry.country && entry.date) {
                                tableData.push({
                                    "country": entry.country.value,
                                    "countryiso3code": entry.countryiso3code,
                                    "date": parseInt(entry.date),
                                    "indicator": entry.indicator.value,
                                    "value": entry.value !== null ? parseFloat(entry.value) : null,
                                    "source": "World Bank",
                                    "unit": entry.unit || "",
                                    "dataset": "World Bank"
                                });
                            }
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
