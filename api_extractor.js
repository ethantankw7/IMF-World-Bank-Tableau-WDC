<!DOCTYPE html>
<html>
<head>
    <title>HDI Factors WDC</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script type="text/javascript">
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
                    "LBN", "LSO", "LTU", "LUX", "MDG", "MWI", "MYS", "MDV", "MEX", "FSM",
                    "MDA", "MNG", "MNE", "MAR", "MOZ", "MMR", "NAM", "NRU", "NPL", "NLD",
                    "NZL", "NIC", "NER", "NGA", "NIU", "NOR", "OMN", "PAK", "PLW", "PNG",
                    "PRY", "PER", "PHL", "POL", "PRT", "QAT", "ROU", "RUS", "RWA", "STP",
                    "WSM", "SMR", "SEN", "SRB", "SYC", "SLE", "SGP", "SVK", "SVN", "SLB",
                    "SOM", "ZAF", "ESP", "LKA", "SDN", "SUR", "SWE", "CHE", "SYR", "TJK",
                    "TZA", "THA", "TLS", "TGO", "TTO", "TUN", "TUR", "TKM", "UGA", "UKR",
                    "ARE", "GBR", "USA", "URY", "UZB", "VUT", "VEN", "VNM", "YEM", "ZMB",
                    "ZWE"
                ];

                var endpoints = {
                    "public_debt": "https://api.worldbank.org/v2/country/{country}/indicator/GC.DOD.TOTL.GD.ZS?format=json",
                    "gender_inequality": "https://api.worldbank.org/v2/country/{country}/indicator/SG.GEN.PARL.ZS?format=json",
                    "electricity_access": "https://api.worldbank.org/v2/country/{country}/indicator/EG.ELC.ACCS.ZS?format=json",
                    "poverty_headcount": "https://api.worldbank.org/v2/country/{country}/indicator/SI.POV.DDAY?format=json",
                    "school_enrollment": "https://api.worldbank.org/v2/country/{country}/indicator/SE.PRM.ENRR?format=json",
                    "employment_ratio": "https://api.worldbank.org/v2/country/{country}/indicator/SL.EMP.TOTL.SP.ZS?format=json",
                    "corruption_perceptions": "https://api.worldbank.org/v2/country/{country}/indicator/CC.EST?format=json",
                    "gdp": "https://api.worldbank.org/v2/country/{country}/indicator/NY.GDP.MKTP.CD?format=json",
                    "unemployment": "https://api.worldbank.org/v2/country/{country}/indicator/SL.UEM.TOTL.ZS?format=json"
                };

                var totalRequests = Object.keys(endpoints).length;
                var completedRequests = 0;

                function checkAllRequestsDone() {
                    if (completedRequests === totalRequests) {
                        var tableData = Object.values(masterData);
                        table.appendRows(tableData);
                        doneCallback();
                    }
                }

                function addDataToMaster(country, countryiso3code, date, indicator, value) {
                    var year = parseInt(date);
                    if (year >= 2000 && year <= 2023) {
                        var key = countryiso3code + "_" + year;
                        if (!masterData[key]) {
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
                        masterData[key][indicator] = value;
                    }
                }

                countries.forEach(function (countryISO) {
                    Object.keys(endpoints).forEach(function (indicator) {
                        var url = endpoints[indicator].replace("{country}", countryISO);

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
                                console.error(`Error fetching data for ${countryISO}`);
                                completedRequests++;
                                checkAllRequestsDone();
                            }
                        });
                    });
                });
            };

            tableau.registerConnector(myConnector);

            // Initialize Tableau and submit connection when the button is clicked
            $(document).ready(function () {
                $("#submitButton").click(function () {
                    tableau.connectionName = "API Data";
                    tableau.submit();
                });
            });
        })();
    </script>
