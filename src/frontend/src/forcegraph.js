// src/ForceGraph.js
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import data from './data.json'; // Assume you have a data.json file with "nodes" and "links" arrays

const ForceGraph = ({ width = 928, height = 600 }) => {
  const svgRef = useRef();

  useEffect(() => {
    // Set up the color scale and chart dimensions
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const links = data.links.map(d => ({ ...d }));
    const nodes = data.nodes.map(d => ({ ...d }));

    // Select the SVG element
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", "auto");

    // Remove any previous content
    svg.selectAll("*").remove();

    // Create a container 'g' element for zooming and panning
    const container = svg.append('g');

    // Set up the simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    // Draw links
    const link = container.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    // Draw nodes
    const node = container.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 5)
      .attr("fill", d => color(d.group))
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      )
      .on("mouseover", mouseoverNode)   // Add mouseover event
      .on("mouseout", mouseoutNode)     // Add mouseout event
      .on("click", clickedNode);        // Add click event for zoom

    // Add titles to nodes
    node.append("title").text(d => d.id);

    // Update the position of the nodes and links on each tick
    function ticked() {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    }

    // Drag event handlers
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

    // Zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5]) // Set the zoom scale limits
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Highlight function when hovering over a node
    function mouseoverNode(event, d) {
      d3.select(event.currentTarget).attr('stroke', '#000').attr('stroke-width', 3);

      // Highlight connected links
      link
        .attr("stroke", l => (l.source === d || l.target === d) ? '#000' : '#999')
        .attr("stroke-width", l => (l.source === d || l.target === d) ? 3 : Math.sqrt(l.value));

      // Highlight connected nodes
      node
        .attr("fill", n => (links.some(l => (l.source === n && l.target === d) || (l.source === d && l.target === n))) ? '#000' : color(n.group));
    }

    // Remove the highlight when the mouse moves away
    function mouseoutNode(event, d) {
      d3.select(event.currentTarget).attr('stroke', '#fff').attr('stroke-width', 1.5);

      link.attr("stroke", "#999").attr("stroke-width", d => Math.sqrt(d.value));

      node.attr("fill", d => color(d.group));
    }

    // Zoom into a node and its neighbors when clicked
    function clickedNode(event, d) {
      // Find the connected nodes and links
      const connectedNodes = new Set();
      connectedNodes.add(d.id); // Include the clicked node

      links.forEach(l => {
        if (l.source.id === d.id) {
          connectedNodes.add(l.target.id);
        } else if (l.target.id === d.id) {
          connectedNodes.add(l.source.id);
        }
      });

      // Highlight only the connected nodes and links
      node.style("opacity", n => connectedNodes.has(n.id) ? 1 : 0.1);
      link.style("opacity", l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.1);

      // Get the position of the click in SVG coordinate space
      const [x, y] = d3.pointer(event, svg.node());

      // Apply the zoom transform, scaling around the clicked point
      svg.transition()
        .duration(750)
        .call(
          zoom.scaleBy,
          2, // Zoom in by a factor of 2 (adjust as needed)
          [x, y] // Center of zoom is the clicked point
        );
    }

    return () => simulation.stop(); // Clean up the simulation on component unmount

  }, [width, height]);

  return <svg ref={svgRef}></svg>;
};

export default ForceGraph;