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
                return;
            }

            var feat = resp.data,
                tableData = [];

            // Iterate over the response object and structure data for Tableau
            for (var i = 0, len = feat.length; i < len; i++) {
                tableData.push({
                    "label": feat[i].label || "N/A",
                    "description": feat[i].description || "N/A",
                    "source": feat[i].source || "N/A",
                    "unit": feat[i].unit || "N/A",
                    "dataset": feat[i].dataset || "N/A"
                });
            }

            table.appendRows(tableData);
            doneCallback();
        }).fail(function () {
            console.error("Error fetching data from API");
        });
    };

    tableau.registerConnector(myConnector);

    // Ensure Tableau is initialized before submitting the data
    $(document).ready(function () {
        tableau.init({
            onFirstInteractive: function () {
                console.log("Tableau WDC Initialized");
                $("#submitButton").prop('disabled', false);
            }
        });

        // Submit the connector when the button is clicked
        $("#submitButton").click(function () {
            tableau.connectionName = "IMF Economic Indicators";
            tableau.submit();
        });
    });
})();

