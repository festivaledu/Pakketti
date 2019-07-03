//#region Chart.JS Helper
class Charts {
	static _cleanAttr(t) {
		delete t.chart, delete t.dataset, delete t.datasetOptions, delete t.labels, delete t.options;
	}
	
	static doughnut(element) {
		var attrData = Object.assign({}, element.dataset),
			data = attrData.dataset ? eval(attrData.dataset) : {},
			datasetOptions = attrData.datasetOptions ? eval(`(${attrData.datasetOptions})`) : {},
			labels = attrData.labels ? eval(attrData.labels) : {},
			options = attrData.options ? eval(`(${attrData.options})`) : {};
		
		this._cleanAttr(attrData);
		
		var datasets = Object.assign({
				data: data,
				borderWidth: 0,
				hoverBorderColor: "transparent"
			}, datasetOptions),
			options = Object.assign({
				cutoutPercentage: 80,
				legend: { display: false },
				animation: {
					animateRotate: false,
					duration: 0
				}
			}, options);
		
		return new Chart(element.getContext("2d"), {
			type: "doughnut",
			data: {
				datasets: [datasets],
				labels: labels
			},
			options: options
		});
	}
	static donut(element) {
		return this.doughnut(element);
	}
	
	static sparkline(element) {
		var attrData = Object.assign({}, element.dataset),
			data = attrData.dataset ? eval(attrData.dataset) : {},
			datasetOptions = attrData.datasetOptions ? eval(`(${attrData.datasetOptions})`) : {},
			labels = attrData.labels ? eval(attrData.labels) : {},
			options = attrData.options ? eval(`(${attrData.options})`) : {},
			data = {
				labels: labels,
				datasets: data.map((obj, index) => Object.assign({
					data: obj,
					fill: false,
					backgroundColor: "rgba(255, 255, 255, 0.3)",
					borderColor: "#FFFFFF",
					pointBorderColor: "#FFFFFF",
					lineTension: 0.4,
					pointRadius: 0
				}, datasetOptions[index]))
			};
		
		this._cleanAttr(attrData);
		
		var options = Object.assign({
			animation: { duration: 0 },
			legend: { display: false },
			scales: {
				xAxes: [{ display: false }],
				yAxes: [{
					display: false,
					ticks: { beginAtZero: true }
				}],
			},
			tooltips: { enabled: false },
			layout: {
				padding: { 
					top: 2,
					bottom: 2
				}
			}
		}, options);
		
		return new Chart(element.getContext("2d"), {
			type: "line",
			data: data,
			options: options
		});
	}
	
	static line(element) {
		var attrData = Object.assign({}, element.dataset),
			data = attrData.dataset ? eval(attrData.dataset) : {},
			datasetOptions = attrData.datasetOptions ? eval(`(${attrData.datasetOptions})`) : {},
			labels = attrData.labels ? eval(attrData.labels) : {},
			options = attrData.options ? eval(`(${attrData.options})`) : {},
			isDark = attrData.isDark,
			data = {
				labels: labels,
				datasets: data.map((obj, index) => Object.assign({
					data: obj,
					fill: false,
					backgroundColor: isDark ? "rgba(28, 168, 221, 0.03" : "rgba(66, 165, 245, 0.2)",
					borderColor: "#42A5F5",
					pointBorderColor: "#FFFFFF",
					lineTension: 0.4,
					pointRadius: 0,
					pointHoverRadius: 0,
					pointHitRadius: 20
				}, datasetOptions[index]))
			}
			
		this._cleanAttr(attrData);
	
		var options = Object.assign({
			maintainAspectRatio: false,
			animation: { duration: 0 },
			legend: { display: false },
			scales: {
				xAxes: [{ 
					gridLines: { display: false },
					ticks: {
						fontColor: isDark ? "#rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.4)",
						fontSize: 14
					}
				 }],
				yAxes: [{
					gridLines: {
						color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
						zeroLineColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
						drawBorder: false
					},
					ticks: {
						beginAtZero: false,
						fixedStepSize: 1000,
						fontColor: isDark ? "#rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.4)",
						fontSize: 14
					}
				}],
			},
			tooltips: {
				enabled: true,
				bodyFontSize: 14,
				callbacks: {
					title: () => "",
					labelColor: () => ({
						backgroundColor: "#42A5F5",
						borderColor: "#42A5F5",
					})
				}
			}
		}, options);
		
		return new Chart(element.getContext("2d"), {
			type: "line",
			data: data,
			options: options
		});
	}
	
	static bar(element) {
		var attrData = Object.assign({}, element.dataset),
			data = attrData.dataset ? eval(attrData.dataset) : {},
			datasetOptions = attrData.datasetOptions ? eval(`(${attrData.datasetOptions})`) : {},
			labels = attrData.labels ? eval(attrData.labels) : {},
			options = attrData.options ? eval(`(${attrData.options})`) : {},
			isDark = attrData.isDark,
			data = {
				labels: labels,
				datasets: data.map((obj, index) => Object.assign({
					data: obj,
					fill: false,
					backgroundColor: index % 2 ? "#42A5F5" : "#1BC98E",
					borderColor: "transparent",
				}, datasetOptions[index]))
			}
			
		this._cleanAttr(attrData);
		
		var options = Object.assign({
			maintainAspectRatio: false,
			animation: { duration: 0 },
			legend: { display: false },
			scales: {
				xAxes: [{ 
					gridLines: { display: false },
					ticks: {
						fontColor: isDark ? "#rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.4)",
						fontSize: 14
					}
				 }],
				yAxes: [{
					gridLines: {
						color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
						zeroLineColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
						drawBorder: false
					},
					ticks: {
						fixedStepSize: 25,
						fontColor: isDark ? "#rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.4)",
						fontSize: 14
					}
				}],
			},
			tooltips: {
				enabled: true,
				bodyFontSize: 14,
				callbacks: {
					title: () => "",
					labelColor: () => ({
						backgroundColor: "#42A5F5",
						borderColor: "#42A5F5",
					})
				}
			}
		}, options);
		
		return new Chart(element.getContext("2d"), {
			type: "bar",
			data: data,
			options: options
		});
	}
}



let isVisible = (elem) => {
	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
}

document.addEventListener("redraw.bs.charts", () => {
	document.querySelectorAll("[data-chart]").forEach(element => {
		if (isVisible(element) && !element.classList.contains("js-chart-drawn")) {
			Charts[element.getAttribute("data-chart")](element);
			element.classList.add("js-chart-drawn");
		}
	});
});
document.dispatchEvent(new Event("redraw.bs.charts"));
//#endregion



//#region Tablesorter Parser
(() => {
	if (!$ || !$.tablesorter) return;
	
	$.tablesorter.addParser({
		id: "mmm-dd-yyyy",
		is: function(s) {
			return /^([A-Za-z]{3}) ([0-9]{1,2}), ([0-9]{4})$/.test(s);
		},
		format: function(s) {
			var result = s.match(/^([A-Za-z]{3}) ([0-9]{1,2}), ([0-9]{4})$/);
			let months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
	
			if (result) {
				let date = new Date("01/01/1970 01:00");
				date.setFullYear(result[3]);
				date.setMonth(months.indexOf(result[1].toLowerCase()));
				date.setDate(result[2]);
				date.setHours(1);
	
				return date.getTime();
			}
	
			return s;
		},
		type: "numeric"
	});
	
	$('[data-sort="table"]').tablesorter({
		sortList: [[1, 0]]
	});
})();
//#endregion