(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            { id: "country", dataType: tableau.dataTypeEnum.string },
            { id: "countryiso3code", dataType: tableau.dataTypeEnum.string },
            { id: "date", dataType: tableau.dataTypeEnum.string }, // Changed to string
            { id: "public_debt", alias: "Public Debt (% of GDP)", dataType: tableau.dataTypeEnum.float },
            { id: "gender_inequality", alias: "Gender Inequality Index", dataType: tableau.dataTypeEnum.float },
            { id: "electricity_access", alias: "Access to Electricity (% of population)", dataType: tableau.dataTypeEnum.float },
            { id: "poverty_headcount", alias: "Poverty Headcount Ratio", dataType: tableau.dataTypeEnum.float },
            { id: "school_enrollment", alias: "School Enrollment Rate", dataType: tableau.dataTypeEnum.float },
            { id: "employment_ratio", alias: "Employment to Population Ratio", dataType: tableau.dataTypeEnum.float },
            { id: "gdp", alias: "GDP (current US$)", dataType: tableau.dataTypeEnum.float },
            { id: "unemployment", alias: "Unemployment Rate", dataType: tableau.dataTypeEnum.float },
            { id: "life_expectancy", alias: "Life Expectancy at Birth", dataType: tableau.dataTypeEnum.float },
            { id: "infant_mortality", alias: "Infant Mortality Rate", dataType: tableau.dataTypeEnum.float },
            { id: "maternal_mortality", alias: "Maternal Mortality Ratio", dataType: tableau.dataTypeEnum.float },
            { id: "poverty_rate", alias: "Poverty Rate", dataType: tableau.dataTypeEnum.float },
            { id: "access_to_electricity", alias: "Access to Electricity (%)", dataType: tableau.dataTypeEnum.float },
            { id: "employment_population_ratio", alias: "Employment to Population Ratio", dataType: tableau.dataTypeEnum.float },
        ];

        var tableSchema = {
            id: "hdiFactors",
            alias: "API Data",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    myConnector.getData = function (table, doneCallback) {
        var masterData = {};
        var countries = [...]; // Your country codes

        var endpoints = {
            // Your endpoints
        };

        var totalEndpoints = Object.keys(endpoints).length;
        var completedRequests = 0;

        function checkAllRequestsDone() {
            if (completedRequests === totalEndpoints) {
                var tableData = [];
                for (var key in masterData) {
                    tableData.push(masterData[key]);
                }
                table.appendRows(tableData);
                doneCallback();
            }
        }

        function addDataToMaster(country, countryiso3code, date, indicator, value) {
            var key = countryiso3code + "_" + date;

            if (!masterData[key]) {
                masterData[key] = {
                    country: country,
                    countryiso3code: countryiso3code,
                    date: date, // Kept as string
                    public_debt: null,
                    gender_inequality: null,
                    electricity_access: null,
                    poverty_headcount: null,
                    school_enrollment: null,
                    employment_ratio: null,
                    gdp: null,
                    unemployment: null,
                    life_expectancy: null,
                    infant_mortality: null,
                    maternal_mortality: null,
                    poverty_rate: null,
                    access_to_electricity: null,
                    employment_population_ratio: null,
                };
            }

            if (indicator && value != null) { // Check if value is not null
                masterData[key][indicator] = value;
            }
        }

        countries.forEach(function (country) {
            var countryiso3code = country;
            
            Object.keys(endpoints).forEach(function (indicator) {
                var url = endpoints[indicator].replace("{country}", country);
                
                $.ajax({
                    url: url,
                    success: function (data) {
                        if (data && data[1]) {
                            data[1].forEach(function (entry) {
                                if (entry.date) {
                                    var value = parseFloat(entry.value);
                                    if (!isNaN(value)) {
                                        addDataToMaster(entry.country.value, entry.countryiso3code, entry.date, indicator, value);
                                    }
                                }
                            });
                        }
                        completedRequests++;
                        checkAllRequestsDone();
                    },
                    error: function (error) {
                        console.error("API fetch error for indicator " + indicator + " for country " + country, error);
                        completedRequests++;
                        checkAllRequestsDone();
                    }
                });
            });
        });
    };

    tableau.registerConnector(myConnector);

    $(document).ready(function () {
        $("#submitButton").click(function () {
            tableau.connectionName = "API Data";
            tableau.submit();
        });
    });
})();
