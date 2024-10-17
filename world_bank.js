(function () {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            { id: "indicator", dataType: tableau.dataTypeEnum.string },
            { id: "country", dataType: tableau.dataTypeEnum.string },
            { id: "countryiso3code", dataType: tableau.dataTypeEnum.string },
            { id: "date", dataType: tableau.dataTypeEnum.date },
            { id: "value", dataType: tableau.dataTypeEnum.float },
            { id: "unit", dataType: tableau.dataTypeEnum.string },
            { id: "obs_status", dataType: tableau.dataTypeEnum.string },
            { id: "decimal", dataType: tableau.dataTypeEnum.int }
        ];

        var tableSchema = {
            id: "worldBankPopulationData",
            alias: "World Bank Population Data",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Download the data from the World Bank API
    myConnector.getData = function (table, doneCallback) {
        var apiUrl = "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=xml"; // Fetch XML data

        $.ajax({
            url: apiUrl,
            type: 'GET',
            dataType: 'xml',
            success: function (data) {
                var tableData = [];

                // Iterate over the <wb:data> elements in the XML response
                $(data).find("data").each(function () {
                    var indicator = $(this).find("indicator").text();
                    var country = $(this).find("country").text();
                    var countryiso3code = $(this).find("countryiso3code").text();
                    var date = $(this).find("date").text();
                    var value = $(this).find("value").text();
                    var unit = $(this).find("unit").text();
                    var obs_status = $(this).find("obs_status").text();
                    var decimal = parseInt($(this).find("decimal").text());

                    // Push the data into the array
                    tableData.push({
                        "indicator": indicator,
                        "country": country,
                        "countryiso3code": countryiso3code,
                        "date": date ? new Date(date) : null,
                        "value": value ? parseFloat(value) : null,
                        "unit": unit,
                        "obs_status": obs_status,
                        "decimal": decimal
                    });
                });

                table.appendRows(tableData);
                doneCallback();
            },
            error: function () {
                console.error("Error fetching data from API");
                doneCallback();
            }
        });
    };

    tableau.registerConnector(myConnector);

    // Create event listeners for when the user submits the form
    $(document).ready(function () {
        $("#submitButton").click(function () {
            tableau.connectionName = "World Bank Population Data"; // This will be the data source name in Tableau
            tableau.submit(); // This sends the connector object to Tableau
        });
    });
})();
