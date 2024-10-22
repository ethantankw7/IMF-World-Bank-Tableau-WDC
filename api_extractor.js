(function () {
    var myConnector = tableau.makeConnector();

    // Define the schema: country, year, and individual columns for each indicator
    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            { id: "country", dataType: tableau.dataTypeEnum.string },
            { id: "countryiso3code", dataType: tableau.dataTypeEnum.string },
            { id: "date", dataType: tableau.dataTypeEnum.int },
            { id: "gdp", alias: "GDP", dataType: tableau.dataTypeEnum.float },
            { id: "cpi", alias: "CPI", dataType: tableau.dataTypeEnum.float },
            { id: "debt", alias: "Debt", dataType: tableau.dataTypeEnum.float },
            { id: "unemployment", alias: "Unemployment", dataType: tableau.dataTypeEnum.float },
            { id: "population", alias: "Population", dataType: tableau.dataTypeEnum.float },
            { id: "life_expectancy", alias: "Life Expectancy", dataType: tableau.dataTypeEnum.float },
            { id: "primary_school_enrollment", alias: "Primary School Enrollment", dataType: tableau.dataTypeEnum.float }
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
        var masterData = {};

        // IMF and World Bank API Endpoints for various indicators
        var endpoints = {
            "gdp": "https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?format=json",
            "cpi": "https://api.imf.org/external/datamapper/api/v1/indicators/CPI",
            "debt": "https://api.imf.org/external/datamapper/api/v1/indicators/GXDEBT",
            "unemployment": "https://api.imf.org/external/datamapper/api/v1/indicators/LUR",
            "population": "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json",
            "life_expectancy": "https://api.worldbank.org/v2/country/all/indicator/SP.DYN.LE00.IN?format=json",
            "primary_school_enrollment": "https://api.worldbank.org/v2/country/all/indicator/SE.PRM.ENRR?format=json"
        };

        var totalEndpoints = Object.keys(endpoints).length;
        var completedRequests = 0;

        // Function to check if all API requests are complete
        function checkAllRequestsDone() {
            if (completedRequests === totalEndpoints) {
                var tableData = [];

                // Convert masterData to array format Tableau can accept
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
            var key = countryiso3code + "_" + date;  // Unique key for each country/year combination

            if (!masterData[key]) {
                // Initialize a row for this country/year combination
                masterData[key] = {
                    "country": country,
                    "countryiso3code": countryiso3code,
                    "date": parseInt(date),
                    "gdp": null,
                    "cpi": null,
                    "debt": null,
                    "unemployment": null,
                    "population": null,
                    "life_expectancy": null,
                    "primary_school_enrollment": null
                };
            }

            // Map the value to the correct column (indicator)
            if (indicator === "gdp") {
                masterData[key].gdp = value;
            } else if (indicator === "cpi") {
                masterData[key].cpi = value;
            } else if (indicator === "debt") {
                masterData[key].debt = value;
            } else if (indicator === "unemployment") {
                masterData[key].unemployment = value;
            } else if (indicator === "population") {
                masterData[key].population = value;
            } else if (indicator === "life_expectancy") {
                masterData[key].life_expectancy = value;
            } else if (indicator === "primary_school_enrollment") {
                masterData[key].primary_school_enrollment = value;
            }
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
            tableau.connectionName = "Economic Indicators Data";
            tableau.submit();
        });
    });
})();
