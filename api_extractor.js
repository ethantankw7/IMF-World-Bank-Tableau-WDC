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
            { id: "corruption_perceptions", alias: "Corruption Perceptions Index (CPI)", dataType: tableau.dataTypeEnum.float },
            { id: "gdp", alias: "GDP (current US$)", dataType: tableau.dataTypeEnum.float },
            { id: "unemployment", alias: "Unemployment Rate", dataType: tableau.dataTypeEnum.float }
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
        var countries = ["ALL"]; // We'll add country ISO codes here

        // API Endpoints for various indicators
        var endpoints = {
            "public_debt": "https://api.worldbank.org/v2/country/{country}/indicator/GC.DOD.TOTL.GD.ZS?format=json",
            "gender_inequality": "https://api.worldbank.org/v2/country/{country}/indicator/SG.GEN.PARL.ZS?format=json", // Example proxy for gender inequality
            "electricity_access": "https://api.worldbank.org/v2/country/{country}/indicator/EG.ELC.ACCS.ZS?format=json",
            "poverty_headcount": "https://api.worldbank.org/v2/country/{country}/indicator/SI.POV.DDAY?format=json",
            "school_enrollment": "https://api.worldbank.org/v2/country/{country}/indicator/SE.PRM.ENRR?format=json",
            "employment_ratio": "https://api.worldbank.org/v2/country/{country}/indicator/SL.EMP.TOTL.SP.ZS?format=json",
            "corruption_perceptions": "https://api.worldbank.org/v2/country/{country}/indicator/CC.EST?format=json", // Control of Corruption as a proxy for CPI
            "gdp": "https://api.worldbank.org/v2/country/{country}/indicator/NY.GDP.MKTP.CD?format=json", // GDP (current US$)
            "unemployment": "https://api.worldbank.org/v2/country/{country}/indicator/SL.UEM.TOTL.ZS?format=json" // Unemployment rate
        };

        // List of country ISO codes
        // Add ISO codes of the countries you want to analyze
        countries = ["AFG", "ALB", "DZA", "AND", "AGO", "ARG", "ARM", "AUS", "AUT", "AZE", 
                     "BHS", "BHR", "BGD", "BRB", "BEL", "BLZ", "BEN", "BTN", "BOL", "BIH", 
                     "BWA", "BGR", "BFA", "BDI", "CPV", "CMR", "CAN", "CAF", "TCD", "CHE", 
                     "CHL", "CHN", "COL", "COM", "COD", "COG", "CRI", "CIV", "HRV", "CUB", 
                     "DNK", "DJI", "DMA", "DOM", "ECU", "EGY", "SLV", "GNQ", "ERI", "EST", 
                     "SWZ", "ETH", "FJI", "FIN", "FRA", "GAB", "GMB", "GEO", "DEU", "GHA", 
                     "GRC", "GRD", "GTM", "GIN", "GUY", "HTI", "HND", "HUN", "ISL", "IND", 
                     "IDN", "IRN", "IRQ", "IRL", "ISR", "ITA", "JAM", "JPN", "JOR", "KAZ", 
                     "KEN", "KIR", "KOR", "KWT", "KGZ", "LAO", "LVA", "LBN", "LSO", "LUX", 
                     "LIT", "MDG", "MYS", "MDV", "MEX", "FSM", "MDA", "MAR", "MCO", "MNG", 
                     "MNE", "MOZ", "MMR", "NAM", "NRU", "NPL", "NGA", "NIC", "NLD", "NZL", 
                     "NIK", "OMN", "PAK", "PLW", "PNG", "PRY", "PER", "PHL", "POL", "PRT", 
                     "QAT", "ROU", "RUS", "RWA", "WSM", "STP", "SAU", "SEN", "SRB", "SYC", 
                     "SLE", "SGP", "SVK", "SVN", "SLB", "SOM", "ZAF", "ESP", "LKA", "SDN", 
                     "SUR", "SWE", "CHE", "TJK", "TZA", "THA", "TLS", "TGO", "TON", "TUR", 
                     "TTO", "TUN", "TUR", "TKM", "UGA", "UKR", "ARE", "GBR", "USA", "URY", 
                     "UZB", "VUT", "VEN", "VNM", "ZMB", "ZWE"];

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

        // Function to add data to master table by country and date, filtered for 2000-2023
        function addDataToMaster(country, countryiso3code, date, indicator, value) {
            var year = parseInt(date);
            if (year >= 2000 && year <= 2023) {
                var key = countryiso3code + "_" + year; // Unique key for each country/year

                if (!masterData[key]) {
                    // Initialize a row for this country/year combination
                    masterData[key] = {
                        "country": country,
                        "countryiso3code": countryiso3code,
                        "date": year,
                        "public_debt": null,
                        "gender_inequality": null,
                        "electricity_access": null,
                        "poverty_headcount": null,
                        "school_enrollment": null,
                        "employment_ratio": null,
                        "corruption_perceptions": null,
                        "gdp": null,
                        "unemployment": null
                    };
                }

                // Map the value to the correct column based on the indicator
                masterData[key][indicator] = value;
            }
        }

        // Fetch data from all endpoints for each country
        countries.forEach(function (countryISO) {
            Object.keys(endpoints).forEach(function (indicator) {
                var url = endpoints[indicator].replace("{country}", countryISO); // Replace {country} with actual ISO code

                $.ajax({
                    url: url,
                    type: 'GET',
                    dataType: 'json',
                    success: function (data) {
                        if (data && data[1]) {
                            data[1].forEach(function (entry) {
                                addDataToMaster(entry.country, entry.countryiso3code, entry.date, indicator, entry.value);
                            });
                        }
                        completedRequests++;
                        checkAllRequestsDone();
                    },
                    error: function () {
                        completedRequests++;
                        checkAllRequestsDone();
                    }
                });
            });
        });
    };

    tableau.registerConnector(myConnector);
})();
