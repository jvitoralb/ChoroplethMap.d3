import * as d3 from "https://cdn.skypack.dev/d3@7";

window.addEventListener('load', () => {
    Promise.all([
        fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json').then(response => response.json()),
        fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json').then(response => response.json())
    ]).then(values => buildGraph(values))
    .catch((err) => console.log(err))
});

function buildGraph(values) {
    const educationUser = values[0];
    const counties = values[1];

    const svgHeight = 650;
    const svgWidth = 850;
    const padding = 30;

    const path = d3.geoPath();

    const svgContainer = d3.select('#choropleth-map')
    .append('svg')
    .attr('width', svgWidth + (padding * 2))
    .attr('height', svgHeight + padding);


    function buildMap(counties, educationUser) {
        function defineColors(n) {
            for(let i = 0; i < colors.length; i++) {
                if (n >= colors[i][0]) {
                    return colors[i][1];
                }
            }
            return 'rgb(240, 248, 255)';
        }

        function filterData(arr, data) {
            return arr.filter(obj => obj.fips === data.id);
        }

        const colors = [
            [53, 'rgb(0, 84, 158)'],
            [43, 'rgb(0, 121, 226)'],
            [33, 'rgb(24, 147, 255)'],
            [23, 'rgb(73, 170, 255)'],
            [13, 'rgb(119, 192, 255)'],
            [3, 'rgb(240, 248, 255)']
        ];
        const dataset = topojson.feature(counties, counties.objects.counties).features;
        
        const tooltip = d3.select('#choropleth-map')
        .append('div')
        .attr('id', 'tooltip');

        svgContainer.append('g')
        .selectAll('path')
        .data(dataset)
        .enter()
        .append('path')

        .attr('class', 'county')
        .attr('data-fips', (d) => d.id)
        .attr('data-education', (d) => {
            let dataEducation = filterData(educationUser, d);

            return dataEducation[0].bachelorsOrHigher;
        })
        .attr('d', path)

        .attr('fill', (d) => {
            let dataEducation = filterData(educationUser, d);

            return defineColors(dataEducation[0].bachelorsOrHigher);
        })
        .style('stroke', 'black')

        .on('mouseover', (e, d) => {
            let countySelected = filterData(educationUser, d);
            let tipInfo = `${countySelected[0].area_name} - ${countySelected[0].state}<br>Bachelors: ${countySelected[0].bachelorsOrHigher}%`;

            tooltip.attr('data-education', countySelected[0].bachelorsOrHigher)
            .html(tipInfo)
            .style('top', `${e.pageY - (padding + (padding * 0.7))}px`)
            .style('left', `${e.pageX + (padding * 0.3)}px`)
            .style('visibility', 'visible');
        }).on('mouseout', () => tooltip.style('visibility', 'hidden'));


        function createLegend() {
            const legendWidth = 252;

            const legPlaceHolder = svgContainer.append('g')
            .attr('width', legendWidth)
            .attr('id', 'legend');

            const legend = legPlaceHolder.selectAll('#legend')
            .data(colors)
            .enter()
            .append('g')
            .attr('transform', (d, i) => `translate(${svgWidth / (23.5) * i}, 0)`);

            legend.append('rect')
            .attr('x', padding + 28)
            .attr('y', svgHeight - (padding + 5))
            .attr('width', 36)
            .attr('height', 30)
            .attr('fill', (d) => d[1]);

            const xLegend = d3.scaleBand()
            .range([0, legendWidth])
            .domain([[63, ''], ...colors].map(item => item[0]));

            const axis = d3.axisBottom(xLegend);

            legPlaceHolder.append('g')
            .attr('transform', `translate(${padding + 10}, ${svgHeight - 5})`)
            .call(axis);
        }
        createLegend();
    }
    buildMap(counties, educationUser);
}