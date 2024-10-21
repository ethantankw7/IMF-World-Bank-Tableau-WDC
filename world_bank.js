(function () {
    var myConnector = tableau.makeConnector();

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

    myConnector.getData = function (table, doneCallback) {
        var apiUrl = "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json";

        $.ajax({
            url: apiUrl,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                var tableData = [];
                var entries = data[1]; // The second element contains the data array

                // Iterate over the data entries
                entries.forEach(function (entry) {
                    tableData.push({
                        "indicator": entry.indicator.value,
                        "country": entry.country.value,
                        "countryiso3code": entry.countryiso3code,
                        "date": entry.date ? new Date(entry.date).getFullYear() : null,
                        "value": entry.value !== null ? parseFloat(entry.value) : null,
                        "unit": entry.unit || "",
                        "obs_status": entry.obs_status || "",
                        "decimal": entry.decimal || 0
                    });
                });

                table.appendRows(tableData);
                doneCallback();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error fetching data from API", textStatus, errorThrown);
                doneCallback();
            }
        });
    };

    tableau.registerConnector(myConnector);

    $(document).ready(function () {
        $("#submitButton").click(function () {
            tableau.connectionName = "World Bank Population Data";
            tableau.submit();
        });
    });
})();
