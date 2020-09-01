/*
*    donutChart.js
*    Mastering Data Visualization with D3.js
*    10.5 - Handling events across objects
*/

class DonutChart {
	constructor(_parentElement, _variable) {
		this.parentElement = _parentElement
		this.variable = _variable

		this.initVis()
	}

	initVis() {
    const vis = this

		vis.MARGIN = { LEFT: 0, RIGHT: 0, TOP: 40, BOTTOM: 0 }
		vis.WIDTH = 250 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT
    vis.HEIGHT = 250 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM
    vis.RADIUS = Math.min(vis.WIDTH, vis.HEIGHT) / 2
		
		vis.svg = d3.select(vis.parentElement).append("svg")
			.attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
			.attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)
		
		vis.g = vis.svg.append("g")
      .attr("transform", `translate(${vis.MARGIN.LEFT + (vis.WIDTH / 2)},
        ${vis.MARGIN.TOP + (vis.HEIGHT / 2)})`)
    
    vis.pie = d3.pie()
      .padAngle(0.03)
      .value(d => d.data[vis.variable])
      .sort(null)
    
    vis.arc = d3.arc()
      .innerRadius(vis.RADIUS - 60)
      .outerRadius(vis.RADIUS - 30)

    vis.g.append("text")
      .attr("y", -(vis.HEIGHT / 2))
      .attr("x", -(vis.WIDTH / 2))
      .attr("font-size", "15px")
      .attr("text-anchor", "start")
      .text(vis.variable == "market_cap" ? "Market Capitalization" 
        : "24 Hour Trading Volume")

		vis.wrangleData()
	}

	wrangleData() {
		const vis = this

    vis.activeCoin = $("#coin-select").val()

		vis.updateVis()
	}

	updateVis() {
    const vis = this

    vis.t = d3.transition().duration(750)
    vis.path = vis.g.selectAll("path")
    vis.data0 = vis.path.data()
    vis.data1 = vis.pie(donutData)
  
    // JOIN elements with new data.
    vis.path = vis.path.data(vis.data1, key)
  
    // EXIT old elements from the screen.
    vis.path.exit()
      .datum((d, i) => findNeighborArc(i, vis.data1, vis.data0, key) || d)
      .transition(vis.t)
        .attrTween("d", arcTween)
        .remove()
    
    // UPDATE elements still on the screen.
    vis.path.transition(vis.t)
      .attrTween("d", arcTween)
      .attr("fill-opacity", (d) => (d.data.coin === vis.activeCoin) ? 1 : 0.3)
  
    // ENTER new elements in the array.
    vis.path.enter().append("path")
      .each(function(d, i) { this._current = findNeighborArc(i, vis.data0, vis.data1, key) || d }) 
      .attr("fill", d => color(d.data.coin))
      .attr("fill-opacity", (d) => (d.data.coin === vis.activeCoin) ? 1 : 0.3)
      .on("click", arcClicked)
      .transition(vis.t)
        .attrTween("d", arcTween)
  
    function key(d) {
      return d.data.coin
    }
  
    function findNeighborArc(i, data0, data1, key) {
      let d
      return (d = findPreceding(i, data0, data1, key)) ? {startAngle: d.endAngle, endAngle: d.endAngle}
        : (d = findFollowing(i, data0, data1, key)) ? {startAngle: d.startAngle, endAngle: d.startAngle}
        : null
    }
  
    function findPreceding(i, data0, data1, key) {
      const m = data0.length
      while (--i >= 0) {
        const k = key(data1[i])
        for (let j = 0; j < m; ++j) {
          if (key(data0[j]) === k) return data0[j]
        }
      }
    }
  
    function findFollowing(i, data0, data1, key) {
      const n = data1.length
      const m = data0.length
      while (++i < n) {
        const k = key(data1[i])
        for (let j = 0; j < m; ++j) {
          if (key(data0[j]) === k) return data0[j]
        }
      }
    }
  
    function arcTween(d) {
      const i = d3.interpolate(this._current, d)
      this._current = i(1)
      return (t) => vis.arc(i(t))
    }
	}
}
