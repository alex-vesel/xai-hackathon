// src/ForceGraph.js
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import data from './data.json';  // Import the JSON file

const ForceGraph = ({ width = 600, height = 400 }) => {
  const svgRef = useRef();

  useEffect(() => {
    // Clear previous SVG content to avoid duplicates
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create simulation with forces
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Create link elements
    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .enter().append("line")
      .attr("stroke-width", 2);

    // Create node elements
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(data.nodes)
      .enter().append("circle")
      .attr("r", 10)
      .attr("fill", "steelblue")
      .call(drag(simulation));

    // Add labels to nodes
    const label = svg.append("g")
      .selectAll("text")
      .data(data.nodes)
      .enter().append("text")
      .attr("dy", -3)
      .attr("text-anchor", "middle")
      .text(d => d.id);

    // Update positions on each tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    // Drag functionality
    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

  }, [width, height]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default ForceGraph;