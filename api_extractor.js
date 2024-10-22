(function () {
    var myConnector = tableau.makeConnector();

    // Schema definition for the data being pulled from IMF and World Bank
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

        // IMF API Endpoints
        var imfEndpoints = {
            "gdp": "https://www.imf.org/external/datamapper/api/v1/indicators/GDP",
            "cpi": "https://www.imf.org/external/datamapper/api/v1/indicators/CPI",
            "debt": "https://www.imf.org/external/datamapper/api/v1/indicators/GXDEBT",
            "unemployment": "https://www.imf.org/external/datamapper/api/v1/indicators/LUR"
        };

        // World Bank API Endpoints
        var worldBankEndpoints = {
            "population": "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json",
            "gdp": "https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?format=json",
            "life_expectancy": "https://api.worldbank.org/v2/country/all/indicator/SP.DYN.LE00.IN?format=json",
            "primary_school_enrollment": "https://api.worldbank.org/v2/country/all/indicator/SE.PRM.ENRR?format=json"
        };

        var totalEndpoints = Object.keys(imfEndpoints).length + Object.keys(worldBankEndpoints).length;
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

            masterData[key][indicator] = value;
        }

        // Fetch data from IMF endpoints
        Object.keys(imfEndpoints).forEach(function (indicator) {
            var url = imfEndpoints[indicator];
            $.getJSON(url, function (imfData) {
                if (imfData && imfData.data) {
                    imfData.data.forEach(function (entry) {
                        if (entry.country && entry.date) {
                            addDataToMaster(entry.country, entry.countryiso3code, entry.date, indicator, parseFloat(entry.value) || null);
                        }
                    });
                }
                completedRequests++;
                checkAllRequestsDone();
            }).fail(function (error) {
                console.error("IMF API fetch error", error);
                completedRequests++;
                checkAllRequestsDone();
            });
        });

        // Fetch data from World Bank endpoints
        Object.keys(worldBankEndpoints).forEach(function (indicator) {
            var url = worldBankEndpoints[indicator];
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                success: function (wbData) {
                    if (wbData && wbData[1]) {
                        wbData[1].forEach(function (entry) {
                            if (entry.country && entry.date) {
                                addDataToMaster(entry.country.value, entry.countryiso3code, entry.date, indicator, parseFloat(entry.value) || null);
                            }
                        });
                    }
                    completedRequests++;
                    checkAllRequestsDone();
                },
                error: function (error) {
                    console.error("World Bank API fetch error", error);
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
            tableau.connectionName = "Economic Indicators Data";  // Set the connection name
            tableau.submit();  // This will initiate the data fetching process
        });
    });
})();
