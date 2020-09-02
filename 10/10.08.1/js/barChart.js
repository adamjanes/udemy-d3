/*
*    barChart.js
*    Mastering Data Visualization with D3.js
*    Project 4 - FreedomCorp Dashboard
*/

class BarChart {
  constructor(_parentElement, _variable, _title) {
    this.parentElement = _parentElement
    this.variable = _variable
    this.title = _title

    this.initVis()
  }

  initVis() {
    const vis = this

    vis.MARGIN = { LEFT: 60, RIGHT: 50, TOP: 30, BOTTOM: 30 }
    vis.WIDTH = 350 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT
    vis.HEIGHT = 130 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM

    vis.svg = d3.select(vis.parentElement).append("svg")
      .attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
      .attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)

    vis.g = vis.svg.append("g")
      .attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`)

    vis.linePath = vis.g.append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke-width", "3px")

    vis.x = d3.scaleBand()
      .domain(["electronics", "furniture", "appliances", "materials"])
      .range([0, vis.WIDTH])
      .padding(0.5)

    vis.y = d3.scaleLinear().range([vis.HEIGHT, 0])

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    }

    vis.yAxisCall = d3.axisLeft()
      .ticks(4);
    vis.xAxisCall = d3.axisBottom()
      .tickFormat(d => "" + capitalizeFirstLetter(d))
    vis.xAxis = vis.g.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${vis.HEIGHT})`)
    vis.yAxis = vis.g.append("g")
      .attr("class", "y axis")

    vis.g.append("text")
      .attr("class", "title")
      .attr("y", -15)
      .attr("x", -50)
      .attr("font-size", "12px")
      .attr("text-anchor", "start")
      .text(vis.title)

    vis.wrangleData()
  }


  wrangleData() {
    const vis = this

    vis.dataFiltered = nestedCalls.map(category => {
      return {
        category: category.key,
        size: (category.values.reduce((accumulator, current) => 
          accumulator + current[vis.variable], 0) / category.values.length)
      }
    })

    vis.updateVis()
  }

  updateVis() {
    const vis = this

    vis.t = d3.transition().duration(1000)

    // update scales
    vis.y.domain([0, d3.max(vis.dataFiltered, d => Number(d.size))])

    // update axes
    vis.xAxisCall.scale(vis.x)
    vis.xAxis.transition(vis.t).call(vis.xAxisCall)
    vis.yAxisCall.scale(vis.y)
    vis.yAxis.transition(vis.t).call(vis.yAxisCall)

    vis.rects = vis.g.selectAll("rect")
      .data(vis.dataFiltered, d => d.category)

    vis.rects.exit()
      .attr("class", "exit")
      .transition(vis.t)
        .attr("height", 0)
        .attr("y", vis.HEIGHT)
        .style("fill-opacity", "0.1")
        .remove()

    vis.rects
      .attr("class", "update")
      .transition(vis.t)
        .attr("y", d => vis.y(d.size))
        .attr("height", d => (vis.HEIGHT - vis.y(d.size)))
        .attr("x", d => vis.x(d.category))
        .attr("width", vis.x.bandwidth)

    vis.rects.enter().append("rect")
      .attr("class", "enter")
      .attr("y", d => vis.y(d.size))
      .attr("height", d => (vis.HEIGHT - vis.y(d.size)))
      .attr("x", d => vis.x(d.category))
      .attr("width", vis.x.bandwidth)
      .attr("fill", "#ccc")
  }
}