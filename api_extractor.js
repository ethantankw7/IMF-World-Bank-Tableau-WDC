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
        var countries = [
            "AFG", "ALB", "DZA", "ASM", "AND", "AGO", "AIA", "ATA", "ATG", "ARG", 
            "ARM", "ABW", "AUS", "AUT", "AZE", "BHS", "BHR", "BGD", "BRB", "BLR", 
            "BEL", "BLZ", "BEN", "BMU", "BTN", "BOL", "BES", "BIH", "BWA", "BVT", 
            "BRA", "IOT", "BRN", "BGR", "BFA", "BDI", "CPV", "KHM", "CMR", "CAN", 
            "CAF", "TCD", "CHL", "CHN", "CXR", "CCK", "COL", "COM", "COD", "COG", 
            "COK", "CRI", "CIV", "HRV", "CUB", "CUW", "CYP", "CZE", "DNK", "DJI", 
            "DMA", "DOM", "ECU", "EGY", "SLV", "GNQ", "ERI", "EST", "SWZ", "ETH", 
            "FLK", "FRO", "FJI", "FIN", "FRA", "GUF", "PYF", "ATF", "GAB", "GMB", 
            "GEO", "DEU", "GHA", "GIB", "GRC", "GRL", "GRD", "GLP", "GUM", "GTM", 
            "GGY", "GIN", "GNB", "GUY", "HTI", "HMD", "VAT", "HND", "HKG", "HUN", 
            "ISL", "IND", "IDN", "IRN", "IRQ", "IRL", "IMN", "ISR", "ITA", "JAM", 
            "JPN", "JEY", "JOR", "KAZ", "KEN", "KIR", "PRK", "KOR", "KWT", "KGZ", 
            "LAO", "LVA", "LBN", "LSO", "LBR", "LBY", "LIE", "LTU", "LUX", "MAC", 
            "MDG", "MWI", "MYS", "MDV", "MLI", "MLT", "MHL", "MTQ", "MRT", "MUS", 
            "MYT", "MEX", "FSM", "MDA", "MCO", "MNG", "MNE", "MSR", "MAR", "MOZ", 
            "MMR", "NAM", "NRU", "NPL", "NLD", "NCL", "NZL", "NIC", "NER", "NGA", 
            "NIU", "NFK", "MKD", "MNP", "NOR", "OMN", "PAK", "PLW", "PSE", "PAN", 
            "PNG", "PRY", "PER", "PHL", "PCN", "POL", "PRT", "PRI", "QAT", "REU", 
            "ROU", "RUS", "RWA", "BLM", "SHN", "KNA", "LCA", "MAF", "SPM", "VCT", 
            "WSM", "SMR", "STP", "SAU", "SEN", "SRB", "SYC", "SLE", "SGP", "SXM", 
            "SVK", "SVN", "SLB", "SOM", "ZAF", "SGS", "SSD", "ESP", "LKA", "SDN", 
            "SUR", "SJM", "SWE", "CHE", "SYR", "TWN", "TJK", "TZA", "THA", "TLS", 
            "TGO", "TKL", "TON", "TTO", "TUN", "TUR", "TKM", "TCA", "TUV", "UGA", 
            "UKR", "ARE", "GBR", "USA", "URY", "UZB", "VUT", "VEN", "VNM", "VGB", 
            "VIR", "WLF", "ESH", "YEM", "ZMB", "ZWE"
        ];

        var endpoints = {
            public_debt: "https://api.worldbank.org/v2/country/{country}/indicator/GC.DOD.TOTL.GD.ZS?date=2000:2022&format=json",
            gender_inequality: "https://api.worldbank.org/v2/country/{country}/indicator/SG.GEN.PARL.ZS?date=2000:2022&format=json",
            electricity_access: "https://api.worldbank.org/v2/country/{country}/indicator/EG.ELC.ACCS.ZS?date=2000:2022&format=json",
            poverty_headcount: "https://api.worldbank.org/v2/country/{country}/indicator/SI.POV.DDAY?date=2000:2022&format=json",
            school_enrollment: "https://api.worldbank.org/v2/country/{country}/indicator/SE.PRM.ENRR?date=2000:2022&format=json",
            employment_ratio: "https://api.worldbank.org/v2/country/{country}/indicator/SL.UEM.TOTL.ZS?date=2000:2022&format=json",
            gdp: "https://api.worldbank.org/v2/country/{country}/indicator/NY.GDP.MKTP.CD?date=2000:2022&format=json",
            unemployment: "https://api.worldbank.org/v2/country/{country}/indicator/SL.UEM.TOTL.ZS?date=2000:2022&format=json",
            life_expectancy: "https://api.worldbank.org/v2/country/{country}/indicator/SP.DYN.LE00.IN?date=2000:2022&format=json",
            infant_mortality: "https://api.worldbank.org/v2/country/{country}/indicator/SH.DYN.MORT?date=2000:2022&format=json",
            maternal_mortality: "https://api.worldbank.org/v2/country/{country}/indicator/SH.STA.MMRT?date=2000:2022&format=json",
            poverty_rate: "https://api.worldbank.org/v2/country/{country}/indicator/SI.POV.DDAY?date=2000:2022&format=json",
            access_to_electricity: "https://api.worldbank.org/v2/country/{country}/indicator/EG.ELC.ACCS.ZS?date=2000:2022&format=json",
            employment_population_ratio: "https://api.worldbank.org/v2/country/{country}/indicator/SL.EMP.TOTL.SP.ZS?date=2000:2022&format=json",
        };

        var totalEndpoints = countries.length * Object.keys(endpoints).length;
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
                    date: parseInt(date),
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

            if (indicator) {
                masterData[key][indicator] = value;
            }
        }

        countries.forEach(function (country) {
            var countryiso3code = country;

            Object.keys(endpoints).forEach(function (indicator) {
                var url = endpoints[indicator].replace(/{country}/g, countryiso3code);

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
                        console.error("API fetch error for indicator " + indicator + " for country " + countryiso3code, error);
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
            tableau.connectionName = "Human Development Index Data";
            tableau.submit();
        });
    });
})();
