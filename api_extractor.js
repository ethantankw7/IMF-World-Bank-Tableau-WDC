(function () {
    var myConnector = tableau.makeConnector();

    // Define the schema: country, year, and columns for each indicator
    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            { id: "country", dataType: tableau.dataTypeEnum.string },
            { id: "countryiso3code", dataType: tableau.dataTypeEnum.string },
            { id: "date", dataType: tableau.dataTypeEnum.int },
            { id: "public_debt", alias: "Public Debt (% of GDP)", dataType: tableau.dataTypeEnum.float },
            { id: "gender_inequality", alias: "Gender Inequality Index", dataType: tableau.dataTypeEnum.float },
            { id: "electricity_access", alias: "Access to Electricity (% of population)", dataType: tableau.dataTypeEnum.float },
            { id: "poverty_headcount", alias: "Poverty Headcount Ratio", dataType: tableau.dataTypeEnum.float },
            { id: "school_enrollment", alias: "School Enrollment Rate", dataType: tableau.dataTypeEnum.float },
            { id: "employment_ratio", alias: "Employment to Population Ratio", dataType: tableau.dataTypeEnum.float },
            { id: "corruption_perceptions", alias: "Corruption Perceptions Index", dataType: tableau.dataTypeEnum.float },
        ];

        var tableSchema = {
            id: "hdiFactors",
            alias: "HDI Factors Data",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Function to fetch and process data
    myConnector.getData = function (table, doneCallback) {
        var masterData = {};

        // API Endpoints for various indicators
        var endpoints = {
            "public_debt": "https://api.worldbank.org/v2/country/all/indicator/GC.DOD.TOTL.GD.ZS?format=json",
            "gender_inequality": "https://api.worldbank.org/v2/country/all/indicator/SG.GEN.PARL.ZS?format=json",  // Example proxy for gender inequality
            "electricity_access": "https://api.worldbank.org/v2/country/all/indicator/EG.ELC.ACCS.ZS?format=json",
            "poverty_headcount": "https://api.worldbank.org/v2/country/all/indicator/SI.POV.DDAY?format=json",
            "school_enrollment": "https://api.worldbank.org/v2/country/all/indicator/SE.PRM.ENRR?format=json",
            "employment_ratio": "https://api.worldbank.org/v2/country/all/indicator/SL.EMP.TOTL.SP.ZS?format=json",
            "corruption_perceptions": "https://api.transparency.org/cpi"  // Example (you may need another endpoint or manual upload)
        };

        var totalEndpoints = Object.keys(endpoints).length;
        var completedRequests = 0;

        // Function to check if all API requests are done
        function checkAllRequestsDone() {
            if (completedRequests === totalEndpoints) {
                var tableData = [];

                // Convert masterData to array format that Tableau accepts
                for (var key in masterData) {
                    tableData.push(masterData[key]);
                }

                // Append rows and signal Tableau that data fetching is done
                table.appendRows(tableData);
                doneCallback();
            }
        }

        // Function to add data to master table by country and date
        function addDataToMaster(country, countryiso3code, date, indicator, value) {
            var key = countryiso3code + "_" + date;  // Unique key for each country/year

            if (!masterData[key]) {
                // Initialize a row for this country/year combination
                masterData[key] = {
                    "country": country,
                    "countryiso3code": countryiso3code,
                    "date": parseInt(date),
                    "public_debt": null,
                    "gender_inequality": null,
                    "electricity_access": null,
                    "poverty_headcount": null,
                    "school_enrollment": null,
                    "employment_ratio": null,
                    "corruption_perceptions": null
                };
            }

            // Map the value to the correct column based on the indicator
            masterData[key][indicator] = value;
        }

        // Fetch data from all endpoints
        Object.keys(endpoints).forEach(function (indicator) {
            var url = endpoints[indicator];

            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                success: function (data) {
                    if (data && data[1]) {
                        data[1].forEach(function (entry) {
                            if (entry.country && entry.date) {
                                var value = parseFloat(entry.value) || null;
                                addDataToMaster(entry.country.value, entry.countryiso3code, entry.date, indicator, value);
                            }
                        });
                    }
                    completedRequests++;
                    checkAllRequestsDone();
                },
                error: function (error) {
                    console.error("API fetch error for indicator " + indicator, error);
                    completedRequests++;
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
            tableau.connectionName = "HDI Factors Data";
            tableau.submit();
        });
    });
})();
