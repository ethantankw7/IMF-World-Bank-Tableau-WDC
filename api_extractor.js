(function () {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
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
            alias: "Economic Indicators Data (IMF and World Bank)",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Download the data from both IMF and World Bank APIs
    myConnector.getData = function (table, doneCallback) {
        var imfApiUrl = "https://www.imf.org/external/datamapper/api/v1/indicators";
        var worldBankApiUrl = "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json";

        var tableData = [];

        // Fetch IMF data
        $.getJSON(imfApiUrl, function (resp) {
            if (resp && resp.data) {
                var indicators = resp.data;

                // Process IMF data
                indicators.forEach(function (indicator) {
                    tableData.push({
                        "label": indicator.label || "N/A",
                        "description": indicator.description || "N/A",
                        "source": indicator.source || "N/A",
                        "unit": indicator.unit || "N/A",
                        "dataset": indicator.dataset || "IMF",
                        "indicator": "N/A",
                        "country": "N/A",
                        "countryiso3code": "N/A",
                        "date": "N/A",
                        "value": null,
                        "obs_status": "N/A",
                        "decimal": 0
                    });
                });

                // Fetch World Bank data after IMF data
                $.ajax({
                    url: worldBankApiUrl,
                    type: 'GET',
                    dataType: 'json',
                    success: function (data) {
                        if (data && data[1]) {
                            var entries = data[1];

                            // Process World Bank data
                            entries.forEach(function (entry) {
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

                        // Append all data and finish
                        table.appendRows(tableData);
                        doneCallback();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error("Error fetching World Bank data: ", textStatus, errorThrown);
                        table.appendRows(tableData); // Append IMF data even if World Bank fails
                        doneCallback();
                    }
                });
            } else {
                console.error("Invalid IMF API response");
                doneCallback();
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Error fetching IMF data: ", textStatus, errorThrown);
            doneCallback();
        });
    };

    // Register connector
    tableau.registerConnector(myConnector);

    // Setup event listener for the submit button
    $(document).ready(function () {
        $("#submitButton").click(function () {
            tableau.connectionName = "Economic Indicators Data (IMF and World Bank)";
            tableau.submit();
        });
    });
})();
