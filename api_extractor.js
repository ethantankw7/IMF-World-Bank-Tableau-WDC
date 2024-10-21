(function () {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function (schemaCallback) {
        // IMF Economic Indicators Schema
        var imfCols = [
            { id: "label", dataType: tableau.dataTypeEnum.string },
            { id: "description", alias: "Description", dataType: tableau.dataTypeEnum.string },
            { id: "source", alias: "Source", dataType: tableau.dataTypeEnum.string },
            { id: "unit", alias: "Unit", dataType: tableau.dataTypeEnum.string },
            { id: "dataset", alias: "Dataset", dataType: tableau.dataTypeEnum.string },
            { id: "country", dataType: tableau.dataTypeEnum.string },
            { id: "countryiso3code", dataType: tableau.dataTypeEnum.string },
            { id: "date", dataType: tableau.dataTypeEnum.date },
            { id: "value", dataType: tableau.dataTypeEnum.float }
        ];

        var imfTableSchema = {
            id: "imfIndicators",
            alias: "IMF Economic Indicators Data",
            columns: imfCols
        };

        // Register the schema for IMF
        schemaCallback([imfTableSchema]);
    };

    // Download data from IMF and World Bank APIs
    myConnector.getData = function (table, doneCallback) {
        var imfApiUrl = "https://www.imf.org/external/datamapper/api/v1/indicators";
        var wbApiBaseUrl = "https://api.worldbank.org/v2/country/all/indicator/";

        var imfDataFetched = false;
        var tableData = [];

        // Fetch IMF data
        $.getJSON(imfApiUrl, function (resp) {
            if (!resp || !resp.data) {
                console.error("Invalid response from IMF API");
                doneCallback(); // Ensure doneCallback is always called
                return;
            }

            var indicators = resp.data;

            // Parse IMF data for each indicator
            var fetchPromises = indicators.map(function (indicator) {
                var indicatorUrl = `${wbApiBaseUrl}${indicator.key}?format=json&date=2000:2020`;

                return $.getJSON(indicatorUrl).then(function (wbData) {
                    if (wbData && wbData[1]) {
                        var entries = wbData[1];

                        // Process the World Bank data
                        entries.forEach(function (entry) {
                            tableData.push({
                                "label": indicator.label || "N/A",
                                "description": indicator.description || "N/A",
                                "source": indicator.source || "N/A",
                                "unit": indicator.unit || "N/A",
                                "dataset": indicator.dataset || "N/A",
                                "country": entry.country.value,
                                "countryiso3code": entry.countryiso3code,
                                "date": entry.date ? new Date(entry.date).getFullYear() : null,
                                "value": entry.value !== null ? parseFloat(entry.value) : null
                            });
                        });
                    }
                }).fail(function () {
                    console.error(`Error fetching data for indicator ${indicator.key}`);
                });
            });

            // Wait for all fetch requests to complete
            $.when.apply($, fetchPromises).done(function () {
                table.appendRows(tableData);
                imfDataFetched = true;
                doneCallback(); // Call the callback after all requests complete
            });
        }).fail(function () {
            console.error("Error fetching IMF data");
            doneCallback(); // Ensure doneCallback is called even in case of failure
        });
    };

    tableau.registerConnector(myConnector);

    // Wait for document ready to initialize
    $(document).ready(function () {
        $("#submitButton").prop('disabled', true);

        // Register event listener for the submit button
        $("#submitButton").click(function () {
            tableau.connectionName = "IMF and World Bank Data"; // Set data source name
            tableau.submit(); // This sends the connector object to Tableau
        });

        // Initialize Tableau WDC
        tableau.init({
            onFirstInteractive: function () {
                console.log("Tableau WDC Initialized");
                $("#submitButton").prop('disabled', false); // Enable the submit button
            }
        });
    });
})();
