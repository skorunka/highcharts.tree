# Highcharts.Tree
Tree chart for Highcharts.

## How to use

Include:
```html
	<script src="https://code.highcharts.com/highcharts.js"></script>
	<script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="tree.js"></script>
    <script src="highcharts.tree.js"></script>
```

Html:
```html
    <div id="tree"></div>
```

JavaScript:
```javascript
$(function () {
    // TreeRow(id, parentId, content)
    var treeData = [
        new TreeRow(1, null, { title: "1", data: [1, 2, 3] }),
        new TreeRow(2, 1, { title: "1.1", data: [10, 20, 30] }),
        new TreeRow(3, 1, { title: "1.2", data: [10, 20, 30] }),
        new TreeRow(4, 2, { title: "1.1.1", data: [11, 24, 34] }),
        new TreeRow(5, 2, { title: "1.1.2", data: [12, 21, 33] }),
        new TreeRow(6, 3, { title: "1.2.1", data: [23, 34, 52] }),
        new TreeRow(7, 3, { title: "1.2.2", data: [232, 24, 26] }),
        new TreeRow(8, 6, { title: "1.2.1.1", data: [102, "text", 13] }),
        new TreeRow(9, 6, { title: "1.2.1.2", data: [502, "text", 23] })
    ];

    var treeChartData = {
        tree: treeData,
        legends: [
			{ text: "Legend 1", type: "money" },
            { text: "Legend 2" },
            { text: "Legend 3", type: "percentage" }]
    };

    $("#tree")
        .highcharts({
            chart: {
                type: "tree",
                config: { currencySymbol: "$", currencySymbolOnLeft: true }
            },
            series: [{ data: [treeChartData] }],
            title: { text: false },
            credits: { enabled: false },
            exporting: { enabled: true }
        });
});
```

## Configuration

This is default configuration:
```javascript
var defaultConfig = {
	node: {
		width: 150,
		height: null, // null = auto-calculated
		marginX: 20,
		marginY: 20,
		backgroundColor: "#f2f2f2",
		title: {
			marginY: 4
		},
		row: {
			width: 20,
			height: 20,
			marginX: 4
		}
	},
	connector: {
		color: "#bcbcbc",
		width: 4
	},
	legend: {
		marginX: 0,
		marginY: 25
	},
	textColor: "#454d59",
	currencySymbol: "$",
	currencySymbolOnLeft: true,
	rows: null
}
```

It can be overriden while initializing chart:
```javascript
$("#tree")
	.highcharts({
		chart: {
			type: "tree",
			config: { currencySymbol: "EUF" }
		},
```


## Examples
Init tree with TreeRow class
https://jsfiddle.net/Skorunka/94d1g58s/

Init tree chart with JSON and tree reresh
https://jsfiddle.net/Skorunka/809kvwwz/

## Todo
If anyone interested:

* Expose as a bower/npm package
* Build and minification, merge into one file
* Better docs, more examples
* Add customizable node renderer 

## Credits
https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/
