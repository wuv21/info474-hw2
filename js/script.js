$(document).ready(function() {
    'use strict';

    // Get data from csv file
    function getData() {
        return $.ajax('data/antibiotics_data.csv');
    }

    // Returns an array of a given, specific property from each object in a given array.
    function pullSubset(data, col) {
        var sub = [];
        data.forEach(function(x) {
            sub.push(x[col]);
        });

        return sub;
    }

    // Returns an array of a given, specific property from each object in a given array given gram staining status
    function pullSubsetGram(data, col, gram) {
        var sub = [];
        data.forEach(function(x) {
            if (x.gram == gram) {
                sub.push(x[col]);
            }
        });

        return sub;
    }

    // Returns the sum of a given array
    function sumArray(arr) {
        var sum = arr.reduce(function(a, b) {
            return a + b;
        });

        return sum;
    }

    // Returns the average of a given array
    function avgArray(arr) {
        return sumArray(arr) / arr.length;
    }

    // Returns the standard deviation of a given array
    function stdArray(arr) {
        var avg = avgArray(arr);
        var std = 0;
        arr.forEach(function(x) {
            std += Math.pow(x - avg, 2);
        });

        std = std / (arr.length - 1);
        return Math.sqrt(std);
    }

    // main code to retrieve data and create visualizations
    $.when(getData()).done(function(resp) {
        // delimited by newlines;
        // first line is headers
        var data = resp.split('\n').splice(1);

        // parsing and massaging data into array of bacteria species
        var bacteria = [];
        data.forEach(function (row) {
            var contents = row.split(',');
            bacteria.push({
                species: contents[0],
                penicillin: Number(contents[1]),
                streptomycin: Number(contents[2]),
                neomycin: Number(contents[3]),
                gram: contents[4].charAt(0) === 'p'
            });
        });

        // Visualization #1
        // getting the data and setting properties
        var data_a = [];
        var trace_types = ['streptomycin', 'neomycin'];
        trace_types.forEach(function(type) {
            data_a.push({
                x: pullSubset(bacteria, 'penicillin'),
                y: pullSubset(bacteria, type),
                name: type,
                type: 'scatter',
                mode: 'markers'
            });
        });

        // layout settings for visualization #1
        var layout_a = {
            title: "Antibiotic Potency Relative to Penicillin",
            xaxis: {
                title: "Penicillin MIC (log scale)",
                type: "log",
                autorange: true
            },
            yaxis: {
                title: "Streptomycin or neomycin MIC (log scale)",
                type: "log",
                autorange: true
            }
        };

        // Visualization #2
        // getting the data and setting properties
        var data_b = [];
        var antibiotics = ['penicillin', 'streptomycin', 'neomycin'];
        antibiotics.forEach(function(antibiotic) {
            var set_a = pullSubsetGram(bacteria, antibiotic, false);
            var set_b = pullSubsetGram(bacteria, antibiotic, true);

            data_b.push({
                x: ['negative', 'positive'],
                y: [avgArray(set_a), avgArray(set_b)],
                //error_y: {
                //    type: 'data',
                //    array: [stdArray(set_a), stdArray(set_b)],
                //    visible: true
                //},
                name: antibiotic,
                type: 'bar'
            });
        });

        // layout settings for visualization #2
        var layout_b = {
            title: "Average Potency of Antibiotics versus Gram Staining",
            barmode: "group",
            xaxis: {
                title: "Gram stain result"
            },
            yaxis: {
                type: "log",
                autorange: true,
                title: "Average Minimum Inhibitory Concentration (log scale)"
            }
        };

        // Visualization #3
        // getting the data and setting properties
        var data_c = [];
        bacteria.forEach(function(b) {
            if (b.penicillin >= 800) {
                data_c.push({
                    x: antibiotics,
                    y: [b.penicillin, b.streptomycin, b.neomycin],
                    name: b.species,
                    type: 'scatter',
                    mode: 'lines+markers'
                });
            }
        });

        // layout settings for visualization #3
        var layout_c = {
            title: "Effectiveness of Other Antibiotics for Species with More Resistance to Penicillin",
            xaxis: {
                title: "Antibiotics"
            },
            yaxis: {
                title: "MIC (log scale)",
                type: "log",
                autorange: true
            }
        };

        // Initialize all visualizations
        Plotly.newPlot('viz-a', data_a, layout_a, {staticPlot: true});
        Plotly.newPlot('viz-b', data_b, layout_b, {staticPlot: true});
        Plotly.newPlot('viz-c', data_c, layout_c, {staticPlot: true});

    });
});