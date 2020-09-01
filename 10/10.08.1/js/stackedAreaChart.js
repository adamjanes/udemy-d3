/*
*    stackedAreaChart.js
*    Mastering Data Visualization with D3.js
*    Project 4 - FreedomCorp Dashboard
*/

class StackedAreaChart {
  constructor(_parentElement) {
    this.parentElement = _parentElement

    this.initVis()
  }

  initVis() {
    const vis = this

    vis.MARGIN = { LEFT: 80, RIGHT: 100, TOP: 50, BOTTOM: 40 }
    vis.WIDTH = 800 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT
    vis.HEIGHT = 370 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM

    vis.svg = d3.select(vis.parentElement).append("svg")
      .attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
      .attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)

    vis.g = vis.svg.append("g")
      .attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`)

    vis.color = d3.scaleOrdinal(d3.schemePastel1)

    vis.x = d3.scaleTime().range([0, vis.WIDTH])
    vis.y = d3.scaleLinear().range([vis.HEIGHT, 0])

    vis.yAxisCall = d3.axisLeft()
    vis.xAxisCall = d3.axisBottom()
      .ticks(4)
    vis.xAxis = vis.g.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${vis.HEIGHT})`)
    vis.yAxis = vis.g.append("g")
      .attr("class", "y axis")

    vis.stack = d3.stack()
      .keys(["west", "south", "northeast", "midwest"])

    vis.area = d3.area()
      .x(d => vis.x(parseTime(d.data.date)))
      .y0(d => vis.y(d[0]))
      .y1(d => vis.y(d[1]))

    vis.addLegend()

    vis.wrangleData()
  }


  wrangleData() {
    const vis = this

    vis.variable = $("#var-select").val()
    vis.dayNest = d3.nest()
      .key(d => formatTime(d.date))
      .entries(calls)

    vis.dataFiltered = vis.dayNest
      .map(day => day.values.reduce(
        (accumulator, current) => {
            accumulator.date = day.key
            accumulator[current.team] = accumulator[current.team] + current[vis.variable]
            return accumulator
        }, {
          "northeast": 0,
          "midwest": 0,
          "south": 0,
          "west": 0
        }
      ))

    vis.updateVis()
  }

  updateVis() {
    const vis = this

    vis.t = d3.transition().duration(750)

    vis.maxDateVal = d3.max(vis.dataFiltered, d => {
      var vals = d3.keys(d).map(key => key !== 'date' ? d[key] : 0)
      return d3.sum(vals)
    })

    // update scales
    vis.x.domain(d3.extent(vis.dataFiltered, (d) => parseTime(d.date)))
    vis.y.domain([0, vis.maxDateVal])

    // update axes
    vis.xAxisCall.scale(vis.x)
    vis.xAxis.transition(vis.t).call(vis.xAxisCall)
    vis.yAxisCall.scale(vis.y)
    vis.yAxis.transition(vis.t).call(vis.yAxisCall)

    vis.teams = vis.g.selectAll(".team")
      .data(vis.stack(vis.dataFiltered))
    
    // update the path for each team
    vis.teams.select(".area")
      .attr("d", vis.area)

    vis.teams.enter().append("g")
      .attr("class", d => `team ${d.key}`)
      .append("path")
        .attr("class", "area")
        .attr("d", vis.area)
        .style("fill", d => vis.color(d.key))
        .style("fill-opacity", 0.5)
  }

  addLegend() {
    const vis = this

    const legend = vis.g.append("g")
      .attr("transform", "translate(50, -25)")

    const legendArray = [
      { label: "Northeast", color: vis.color("northeast") },
      { label: "West", color: vis.color("west") },
      { label: "South", color: vis.color("south") },
      { label: "Midwest", color: vis.color("midwest" )}
    ]

    const legendCol = legend.selectAll(".legendCol")
      .data(legendArray)
      .enter().append("g")
        .attr("class", "legendCol")
        .attr("transform", (d, i) => `translate(${i * 150}, 0)`)
        
    legendCol.append("rect")
      .attr("class", "legendRect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", d => d.color)
      .attr("fill-opacity", 0.5)

    legendCol.append("text")
      .attr("class", "legendText")
      .attr("x", 20)
      .attr("y", 10)
      .attr("text-anchor", "start")
      .text(d => d.label)
  }
}