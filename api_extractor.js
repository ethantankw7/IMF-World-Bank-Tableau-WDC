(function () {
    var myConnector = tableau.makeConnector();

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
            { id: "gdp", alias: "GDP (current US$)", dataType: tableau.dataTypeEnum.float },
            { id: "unemployment", alias: "Unemployment Rate", dataType: tableau.dataTypeEnum.float }
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
        var countries = [
            "AFG", "ALB", "DZA", "AND", "AGO", "ATG", "ARG", "ARM", "AUS", "AUT",
            "AZE", "BHS", "BHR", "BGD", "BRB", "BLR", "BEL", "BLZ", "BEN", "BTN",
            "BOL", "BIH", "BWA", "BRA", "BRN", "BGR", "BFA", "BDI", "CPV", "KHM",
            "CMR", "CAN", "CAF", "TCD", "CHL", "CHN", "COL", "COM", "COD", "COG",
            "CRI", "HRV", "CUB", "CYP", "CZE", "DNK", "DJI", "DMA", "DOM", "ECU",
            "EGY", "SLV", "GNQ", "ERI", "EST", "SWZ", "ETH", "FJI", "FIN", "FRA",
            "GAB", "GMB", "GEO", "DEU", "GHA", "GRC", "GRD", "GTM", "GIN", "HND",
            "HUN", "ISL", "IND", "IDN", "IRN", "IRQ", "IRL", "ISR", "ITA", "JAM",
            "JPN", "JOR", "KAZ", "KEN", "KIR", "KOR", "KWT", "KGZ", "LAO", "LVA",
            "LBN", "LSO", "LTU", "LUX", "MDG", "MDV", "MEX", "FSM", "MDA", "MNG",
            "MHL", "MAR", "MOZ", "MMR", "NAM", "NRU", "NPL", "NLD", "NZL", "NIC",
            "NER", "NGA", "PRK", "MNP", "NOR", "OMN", "PAK", "PLW", "PNG", "PRT",
            "QAT", "ROU", "RUS", "RWA", "KNA", "VCT", "WSM", "STP", "SAU", "SEN",
            "SRB", "SLE", "SGP", "SVK", "SVN", "SLB", "SOM", "ZAF", "ESP", "LKA",
            "SDN", "SUR", "SWE", "CHE", "SYR", "TJK", "TZA", "THA", "TLS", "TGO",
            "TTO", "TUN", "TUR", "TKM", "UGA", "UKR", "ARE", "GBR", "USA", "URY",
            "UZB", "VUT", "VEN", "VNM", "YEM", "ZMB", "ZWE"
        ];

        // API endpoints with corrected URLs
        var endpoints = {
            public_debt: "https://api.worldbank.org/v2/country/{country}/indicator/GC.DOD.TOTL.GD.ZS?date=2000:2023&format=json",
            gender_inequality: "https://api.worldbank.org/v2/country/{country}/indicator/SG.GEN.PARL.ZS?date=2000:2023&format=json",
            electricity_access: "https://api.worldbank.org/v2/country/{country}/indicator/EG.ELC.ACCS.ZS?date=2000:2023&format=json",
            poverty_headcount: "https://api.worldbank.org/v2/country/{country}/indicator/SI.POV.DDAY?date=2000:2023&format=json",
            school_enrollment: "https://api.worldbank.org/v2/country/{country}/indicator/SE.PRM.ENRR?date=2000:2023&format=json",
            employment_ratio: "https://api.worldbank.org/v2/country/{country}/indicator/SL.UEM.TOTL.ZS?date=2000:2023&format=json",
            gdp: "https://api.worldbank.org/v2/country/{country}/indicator/NY.GDP.MKTP.CD?date=2000:2023&format=json",
            unemployment: "https://api.worldbank.org/v2/country/{country}/indicator/SL.UEM.TOTL.ZS?date=2000:2023&format=json"
        };

        var totalEndpoints = Object.keys(endpoints).length;
        var completedRequests = 0;

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

        function addDataToMaster(country, countryiso3code, date, indicator, value) {
            var key = countryiso3code + "_" + date;  // Unique key for each country/year combination

            if (!masterData[key]) {
                masterData[key] = {
                    country: country,
                    countryiso3code: countryiso3code,
                    date: parseInt(date),
                    public_debt: null,
                    gender_inequality: null,
                    electricity_access: null,
                    poverty_headcount: null,
                    school_enrollment: null,
                    employment_ratio: null,
                    gdp: null,
                    unemployment: null
                };
            }

            // Map the value to the correct column (indicator)
            if (indicator) {
                masterData[key][indicator] = value;
            }
        }

        countries.forEach(function (country) {
            var countryiso3code = country; // Assuming iso3 code is the same as the code in countries array
            
            Object.keys(endpoints).forEach(function (indicator) {
                var url = endpoints[indicator].replace(/{country}/g, country).replace(/{countryiso3code}/g, countryiso3code);
                
                $.ajax({
                    url: url,
                    type: 'GET',
                    dataType: 'json',
                    success: function (data) {
                        if (data && data[1]) {
                            data[1].forEach(function (entry) {
                                if (entry.date) {
                                    var value = parseFloat(entry.value) || null;
                                    addDataToMaster(entry.country.value, entry.countryiso3code, entry.date, indicator, value);
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
