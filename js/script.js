$(document).ready(function() {
    'use strict';

    // Get data from csv file
    function getData() {
        return $.ajax('data/antibiotics_data.csv');
    }

    function pullSubset(data, col) {
        var sub = [];
        data.forEach(function(x) {
            sub.push(x[col]);
        });

        return sub;
    }

    function pullSubsetGram(data, col, gram) {
        var sub = [];
        data.forEach(function(x) {
            if (x.gram == gram) {
                sub.push(x[col]);
            }
        });

        return sub;
    }

    function sumArray(arr) {
        var sum = arr.reduce(function(a, b) {
            return a + b;
        });

        return sum;
    }

    function avgArray(arr) {
        return sumArray(arr) / arr.length;
    }

    function stdArray(arr) {
        var avg = avgArray(arr);
        var std = 0;
        arr.forEach(function(x) {
            std += Math.pow(x - avg, 2);
        });

        std = std / (arr.length - 1);
        return Math.sqrt(std);
    }

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
                penicilin: Number(contents[1]),
                streptomycin: Number(contents[2]),
                neomycin: Number(contents[3]),
                gram: contents[4].charAt(0) === 'p'
            });
        });

        console.log(bacteria);

        var data_a = [];
        var trace_types = ['streptomycin', 'neomycin'];
        trace_types.forEach(function(type) {
            data_a.push({
                x: pullSubset(bacteria, 'penicilin'),
                y: pullSubset(bacteria, type),
                name: type,
                type: 'scatter',
                mode: 'markers'
            });
        });

        var layout_a = {
            title: "Antibiotic Potency Relative to Penicilin",
            xaxis: {
                title: "Penicilin MIC (log scale)",
                type: "log",
                autorange: true
            },
            yaxis: {
                title: "Streptomycin or neomycin MIC (log scale)",
                type: "log",
                autorange: true
            }
        };

        var data_b = [];
        var antibiotics = ['penicilin', 'streptomycin', 'neomycin'];
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

        var data_c = [{
            x: pullSubset(bacteria, 'penicilin'),
            y: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            // name: 'a',
            type: 'scatter',
            mode: 'markers'
        }];

        var layout_c = {
            title: "Viz 3",
            xaxis: {
                title: "viz 3",
                type: "log",
                autorange: true
            },
            yaxis: {
                title: "blah",
                showgrid: false,
                zeroline: false
                // type: "log",
                // autorange: true
            }
        };


        Plotly.newPlot('viz-a', data_a, layout_a, {staticPlot: true});
        Plotly.newPlot('viz-b', data_b, layout_b, {staticPlot: true});
        Plotly.newPlot('viz-c', data_c, layout_c, {staticPlot: true});

    });
});