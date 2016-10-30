(function (factory) {
	if (typeof module === 'object' && module.exports) {
		module.exports = factory;
	} else {
		factory(Highcharts);
	}
}(function (Highcharts) {
	(function (Highcharts) {
		'use strict';

		if(typeof(window.Tree) != "function"){
			window.alert("Highcharts tree chart requires Tree plogin to be loaded first.");
			return false;
		}

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

		var seriesType = Highcharts.seriesType,
            seriesTypes = Highcharts.seriesTypes,
            noop = Highcharts.noop,
            each = Highcharts.each,
			extend = Highcharts.extend,
			merge = Highcharts.merge;

		seriesType('tree', 'pie', {},
            {
            	defaultConfig,

            	translate: function () {
            		var
			            chart = this.chart,
			            options = this.options,
						data = options.data[0],
						ren = chart.renderer,
						maxX = 0, maxY = 0,
						elements = this._elements,
						colors = chart.options.colors;

            		if (typeof (elements) === "undefined") this._elements = elements = [];
					
					var config = merge(defaultConfig, chart.userOptions.chart.config, options.config);

            		var drawNode = function (elements, node) {
            			var formatRowValue = function (value, type) {
            				var text = value.toLocaleString();
            				if (type === "money") {
            					text = (config.currencySymbolOnLeft ? config.currencySymbol : "") + text + (!config.currencySymbolOnLeft ? config.currencySymbol : "");
            				} else if (type === "percentage") {
            					text += " %";
            				}
            				return text;
            			}

            			var box = {
            				x: node.x * (config.node.width + config.node.marginX),
            				y: node.y * (config.node.height + config.node.marginY),
            				w: config.node.width,
            				h: config.node.height
            			};

            			maxX = Math.max(maxX, box.x + box.w);
            			maxY = Math.max(maxY, box.y + box.h);

            			// title, needs to be added to getBBox()
            			var titleElement = ren
				            .label(node.item.content.title, box.x, box.y + config.node.title.marginY)
				            .css({ fontSize: '14px', color: config.textColor, fontWeight: "bold" }).attr({ zIndex: 1 })
							.add();
            			// - center it
            			titleElement.attr({ x: box.x + box.w / 2 - titleElement.width / 2 });
            			elements.push(titleElement);

            			// rows
            			var rowsY = titleElement.height + config.node.title.marginY * 2;
            			for (var i = 0; i < node.item.content.data.length; i++) {
            				// legend box
            				elements.push(ren
								.rect(
									box.x,
									box.y + rowsY + config.node.row.height * i,
									config.node.row.width,
									config.node.row.height)
								.attr({ fill: colors[i], zIndex: 1 }));

            				var text = formatRowValue(node.item.content.data[i], legends[i] ? legends[i].type : null);
            				var textElement = ren
					            .label(text,
						            box.x + config.node.row.width,
						            box.y + rowsY + config.node.row.height * i)
					            .css({ fontSize: '13px', color: config.textColor }).attr({ zIndex: 1 })
								.add();
            				// - allign right
            				textElement.attr({ x: box.x + box.w - textElement.width - config.node.row.marginX });
            				elements.push(textElement);
            			}

            			// calculate node height(if not set) based on rendered content
            			if (typeof (config.node.height) === "undefined" || config.node.height === null || config.node.height < 1) {
            				config.node.height = box.h = rowsY + node.item.content.data.length * config.node.row.height;
            			}

            			// main box
            			var boxElement = elements.push(ren
							.rect(box.x, box.y, box.w, box.h)
							.attr({ fill: config.node.backgroundColor, zIndex: 0 }));

            			// draw line to parent
            			if (node.parent != null) {
            				elements.push(ren
								.path(['M', box.x + box.w / 2, box.y, 'L', box.x + box.w / 2, box.y - config.node.marginY / 2 - config.connector.width / 2])
								.attr({ 'stroke-width': config.connector.width, stroke: config.connector.color }));
            			}

            			// draw line to children
            			if (node.children.length > 0) {
            				var nodeBottomMiddle = { x: box.x + box.w / 2, y: box.y + box.h };
            				elements.push(ren
								.path(['M', nodeBottomMiddle.x, nodeBottomMiddle.y, 'L', nodeBottomMiddle.x, nodeBottomMiddle.y + config.node.marginY / 2])
								.attr({ 'stroke-width': config.connector.width, stroke: config.connector.color }));

            				// draw line over children
            				if (node.children.length > 1) {
            					elements.push(ren
									.path([
										'M', node.getRightMostChild().x * (config.node.width + config.node.marginX) + config.node.width / 2 - config.connector.width / 2, nodeBottomMiddle.y + config.node.marginY / 2,
										'L', node.getLeftMostChild().x * (config.node.width + config.node.marginX) + config.node.width / 2 + config.connector.width / 2, nodeBottomMiddle.y + config.node.marginY / 2])
									.attr({ 'stroke-width': config.connector.width, stroke: config.connector.color }));
            				}
            			}

            			each(node.children, function (node) {
            				drawNode(elements, node, colors);
            			});
            		}

					var getTree = function (treeOrData){
						return treeOrData.root ? treeOrData : new Tree(treeOrData).build();
					}

            		// clear the previous 
            		each(elements, function (element) { element.destroy(); }); elements = [];

            		if (data === null || typeof (data) === "undefined" || typeof (data.tree) === "undefined" || data.tree === null) { // error
            			elements.push(ren.label("Invalid data.", 0, 0).css({ fontSize: '14px', color: "#EE0000", fontWeight: "bold" }));
            		} else {
            			var tree = getTree(data.tree || []), legends = data.legends || [];
						
						// draw tree
            			drawNode(elements, tree.root);

            			// draw legend
            			var offsetX = 0;
            			for (var i = 0; i < Math.min(legends.length, tree.root.item.content.data.length) ; i++) {
            				elements.push(ren
								.rect(offsetX + config.legend.marginX, maxY + config.legend.marginY, config.node.row.width, config.node.row.height)
								.attr({ fill: colors[i] }));

            				offsetX += config.node.row.width + 5/*spacing between legend box and legend text*/;

            				var legendTextElement = ren
								.label(legends[i].text,
									offsetX + config.legend.marginX,
									maxY + config.legend.marginY)
								.css({ fontSize: '14px', color: config.textColor, fontWeight: "bold" }).attr({ zIndex: 1 })
								.add();
            				elements.push(legendTextElement);

            				offsetX += legendTextElement.width + 30/*spacing between legends */;
            			}
            		}

            		each(elements, function (element) {
            			if (element.added) return;
            			element.add();
            		});

					this._elements = elements;
            	},

            	drawPoints: seriesTypes.column.prototype.drawPoints,

            	drawDataLabels: function () { return; }
            });
	}(Highcharts));
}));
