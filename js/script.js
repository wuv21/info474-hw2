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
                gram: contents[4] == "positive"
            });
        });

        var data_a = [{
            type: 'scatter',
            mode: 'markers',
            x: pullSubset(bacteria, 'streptomycin'),
            y: pullSubset(bacteria, 'neomycin')
        }];

        var layout_a = {
            title: "title",
            xaxis: {
                title: "x-axis",
                type: "log",
                autorange: true
            },
            yaxis: {
                title: "y-axis",
                autorange: true
            }
        };

        var data_b = [];
        var antibiotics = ['penicilin', 'streptomycin', 'neomycin'];
        antibiotics.forEach(function(antibiotic) {
            data_b.push({
                x: ['negative', 'positive'],
                y: [avgArray(pullSubsetGram(bacteria, antibiotic, false)), avgArray(pullSubsetGram(bacteria, antibiotic, true))],
                name: antibiotic,
                type: 'bar'
            });
        });

        var layout_b = {
            title: "title",
            barmode: "group",
            xaxis: {
                title: "x-axis"
            },
            yaxis: {
                type: "log",
                autorange: true,
                title: "y-axis"
            }
        };


        Plotly.newPlot('viz-a', data_a, layout_a, {staticPlot: true});
        Plotly.newPlot('viz-b', data_b, layout_b, {staticPlot: true});

    });
});