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
            { id: "dataset", alias: "Dataset", dataType: tableau.dataTypeEnum.string }
        ];

        var tableSchema = {
            id: "imfIndicators",
            alias: "IMF Economic Indicators Data",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Download the data from IMF API
    myConnector.getData = function (table, doneCallback) {
        var apiUrl = "https://www.imf.org/external/datamapper/api/v1/indicators";

        $.getJSON(apiUrl, function (resp) {
            if (!resp || !resp.data) {
                console.error("Invalid response from API");
                doneCallback(); // Ensure doneCallback is always called
                return;
            }

            var indicators = resp.data,
                tableData = [];

            // Iterate over the response object and structure data for Tableau
            for (var i = 0, len = indicators.length; i < len; i++) {
                tableData.push({
                    "label": indicators[i].label || "N/A",
                    "description": indicators[i].description || "N/A",
                    "source": indicators[i].source || "N/A",
                    "unit": indicators[i].unit || "N/A",
                    "dataset": indicators[i].dataset || "N/A"
                });
            }

            table.appendRows(tableData);
            doneCallback();
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Error fetching data from API: ", textStatus, errorThrown);
            doneCallback(); // Ensure doneCallback is called even in case of failure
        });
    };

    tableau.registerConnector(myConnector);

    // Wait for document ready to initialize
    $(document).ready(function () {
        $("#submitButton").prop('disabled', true);

        // Register event listener for the submit button
        $("#submitButton").click(function () {
            tableau.connectionName = "IMF Economic Indicators"; // Set data source name
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
