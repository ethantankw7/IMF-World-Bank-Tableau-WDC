(function () {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema for the data
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
            { id: "date", dataType: tableau.dataTypeEnum.date },
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

    // Fetch and process the data
    myConnector.getData = function (table, doneCallback) {
        var imfApiUrl = "https://www.imf.org/external/datamapper/api/v1/indicators";
        var worldBankApiUrl = "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json";
        var tableData = [];

        // Fetch IMF data
        $.getJSON(imfApiUrl, function (imfData) {
            if (imfData && imfData.data) {
                var indicators = imfData.data;

                indicators.forEach(function (indicator) {
                    tableData.push({
                        "label": indicator.label || "N/A",
                        "description": indicator.description || "N/A",
                        "source": indicator.source || "IMF",
                        "unit": indicator.unit || "N/A",
                        "dataset": "IMF",
                        "indicator": "N/A",
                        "country": "N/A",
                        "countryiso3code": "N/A",
                        "date": "N/A",
                        "value": null,
                        "obs_status": "N/A",
                        "decimal": 0
                    });
                });
            }

            // Fetch World Bank data
            $.ajax({
                url: worldBankApiUrl,
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
                                "date": entry.date ? new Date(entry.date).getFullYear() : null,
                                "value": entry.value !== null ? parseFloat(entry.value) : null,
                                "obs_status": entry.obs_status || "",
                                "decimal": entry.decimal || 0
                            });
                        });
                    }

                    table.appendRows(tableData);
                    doneCallback();
                },
                error: function (error) {
                    console.error("World Bank API fetch error", error);
                    doneCallback();
                }
            });
        }).fail(function (error) {
            console.error("IMF API fetch error", error);
            doneCallback();
        });
    };

    // Register the connector
    tableau.registerConnect
