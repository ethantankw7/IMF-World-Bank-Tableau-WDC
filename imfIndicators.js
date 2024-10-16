(function () {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function (schemaCallback) {
        var cols = [{
            id: "id",
            alias: "Indicator ID",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "label",
            alias: "Indicator Label",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "description",
            alias: "Description",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "unit",
            alias: "Unit",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "source",
            alias: "Source",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "dataset",
            alias: "Dataset",
            dataType: tableau.dataTypeEnum.string
        }];

        var tableSchema = {
            id: "imfIndicators",
            alias: "IMF Economic Indicators",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Download the data
    myConnector.getData = function (table, doneCallback) {
        var apiUrl = "https://example.com/path/to/imf/api"; // Replace with actual API URL
        
        console.log("Fetching data from API:", apiUrl);

        $.getJSON(apiUrl, function (data) {
            var indicators = data.indicators;
            var tableData = [];

            // Log the response structure for debugging
            console.log("API Response:", data);

            // Iterate over the JSON object to populate table rows
            for (var key in indicators) {
                if (indicators.hasOwnProperty(key)) {
                    var indicator = indicators[key];
                    tableData.push({
                        "id": key,
                        "label": indicator.label,
                        "description": indicator.description,
                        "unit": indicator.unit,
                        "source": indicator.source,
                        "dataset": indicator.dataset
                    });
                }
            }

            console.log("Parsed Table Data:", tableData);
            table.appendRows(tableData);
            doneCallback();
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("API request failed:", textStatus, errorThrown);
        });
    };

    tableau.registerConnector(myConnector);

    // Create event listeners for when the user submits the form
    $(document).ready(function () {
        $("#submitButton").click(function () {
            tableau.connectionName = "IMF Economic Indicators"; // This will be the data source name in Tableau
            tableau.submit(); // This sends the connector object to Tableau
        });
    });
})();
