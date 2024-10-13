// src/ForceGraph.js
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import useScript from './useScript';

const ForceGraph = ({ width = 928, height = 600, graphData }) => {
  const svgRef = useRef();

  // Define refs
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const historyRef = useRef([]);
  const newNodeCounterRef = useRef(0);

  const simulationRef = useRef();
  const nodeSelectionRef = useRef();
  const linkSelectionRef = useRef();
  const svgSelectionRef = useRef();
  const colorRef = useRef();

  // Add a ref for the tooltip
  const tooltipRef = useRef();

  // Use the custom useScript hook to load Twitter widgets
  useScript('https://platform.twitter.com/widgets.js');

  useEffect(() => {
    if (!graphData.nodes.length && !graphData.links.length) {
      // If graphData is empty, clear the SVG and return
      d3.select(svgRef.current).selectAll("*").remove();
      return;
    }

    // Initialize color scale
    colorRef.current = d3.scaleOrdinal(d3.schemeCategory10);

    // Initialize nodes and links
    nodesRef.current = graphData.nodes.map(d => ({ ...d }));
    linksRef.current = graphData.links.map(d => ({ ...d }));

    // Select and configure the SVG element
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", "auto");

    svg.selectAll("*").remove();

    svgSelectionRef.current = svg;

    const container = svg.append('g');

    // Initialize simulation
    simulationRef.current = d3.forceSimulation(nodesRef.current)
      .force("link", d3.forceLink(linksRef.current).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    // Initialize selections
    linkSelectionRef.current = container.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line");

    nodeSelectionRef.current = container.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle");

    // Set up zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Initial graph rendering
    updateGraph();

    // Define ticked function inside useEffect to access simulation state
    function ticked() {
      linkSelectionRef.current
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      nodeSelectionRef.current
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    }

    // Clean up on unmount
    return () => simulationRef.current.stop();

  }, [width, height, graphData]);

  // Define functions outside useEffect

  function updateGraph() {
    const nodes = nodesRef.current;
    const links = linksRef.current;
    let nodeSelection = nodeSelectionRef.current;
    let linkSelection = linkSelectionRef.current;
    const color = colorRef.current;

    // Update links
    linkSelection = linkSelection.data(links, d => `${d.source.id}-${d.target.id}`);
    linkSelection.exit().remove();

    const linkEnter = linkSelection.enter().append("line")
      .attr("stroke-width", d => Math.sqrt(d.value || 1));

    linkSelection = linkEnter.merge(linkSelection);

    // Update nodes
    nodeSelection = nodeSelection.data(nodes, d => d.id);
    nodeSelection.exit().remove();

    const nodeEnter = nodeSelection.enter().append("circle")
      .attr("r", 5)
      .attr("fill", d => color(d.group || 1))
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      )
      .on("mouseover", mouseoverNode)
      .on("mouseout", mouseoutNode)
      .on("click", clickedNode);

    nodeEnter.append("title").text(d => d.id);

    nodeSelection = nodeEnter.merge(nodeSelection);

    // Update refs
    nodeSelectionRef.current = nodeSelection;
    linkSelectionRef.current = linkSelection;
  }

  function dragstarted(event, d) {
    const simulation = simulationRef.current;
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    const simulation = simulationRef.current;
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function mouseoverNode(event, d) {
    const links = linksRef.current;
    const nodeSelection = nodeSelectionRef.current;
    const linkSelection = linkSelectionRef.current;
    const color = colorRef.current;

    d3.select(event.currentTarget).attr('stroke', '#000').attr('stroke-width', 3);

    linkSelection
      .attr("stroke", l => (l.source === d || l.target === d) ? '#000' : '#999')
      .attr("stroke-width", l => (l.source === d || l.target === d) ? 3 : Math.sqrt(l.value || 1));

    nodeSelection
      .attr("fill", n => (links.some(l => (l.source === n && l.target === d) || (l.source === d && l.target === n))) ? '#000' : color(n.group || 1));

    // Show tooltip with embedded tweet
    showTooltip(event, d);
  }

  function mouseoutNode(event, d) {
    const nodeSelection = nodeSelectionRef.current;
    const linkSelection = linkSelectionRef.current;
    const color = colorRef.current;

    d3.select(event.currentTarget).attr('stroke', '#fff').attr('stroke-width', 1.5);

    linkSelection.attr("stroke", "#999").attr("stroke-width", d => Math.sqrt(d.value || 1));

    nodeSelection.attr("fill", d => color(d.group || 1));

    // Hide tooltip
    hideTooltip();
  }

  function getAdditionalNodes(d) {
    // Increment the counter
    newNodeCounterRef.current++;

    // Return a new node with a unique ID
    const newNode = {
      id: `om_${newNodeCounterRef.current}`,
      group: d.group || 1,
      tweet: d.tweet, // You may need to adjust this based on your actual data
      url: d.url
    };
    return [newNode];
  }

  function clickedNode(event, d) {
    event.stopPropagation();

    const nodes = nodesRef.current;
    const links = linksRef.current;
    const history = historyRef.current;
    const simulation = simulationRef.current;
    const nodeSelection = nodeSelectionRef.current;
    const linkSelection = linkSelectionRef.current;

    // Save a deep copy of current nodes and links to history
    history.push({
      nodes: nodes.map(node => ({ ...node })),
      links: links.map(link => ({
        ...link,
        source: typeof link.source === 'object' ? link.source.id : link.source,
        target: typeof link.target === 'object' ? link.target.id : link.target,
      })),
    });

    // Proceed with adding new nodes and links
    const newNodes = getAdditionalNodes(d);

    newNodes.forEach(newNode => {
      nodes.push(newNode);
      links.push({ source: d.id, target: newNode.id, value: 1 });
    });

    // Update the simulation
    simulation.nodes(nodes);
    simulation.force("link").links(links);

    // Restart the simulation
    simulation.alpha(1).restart();

    // Update the graph
    updateGraph();

    // Reset opacity of all nodes and links
    nodeSelection.style("opacity", 1);
    linkSelection.style("opacity", 1);

    // Find the connected nodes and links
    const connectedNodes = new Set();
    connectedNodes.add(d.id);

    links.forEach(l => {
      if (l.source.id === d.id) {
        connectedNodes.add(l.target.id);
      } else if (l.target.id === d.id) {
        connectedNodes.add(l.source.id);
      }
    });

    nodeSelection.style("opacity", n => connectedNodes.has(n.id) ? 1 : 0.1);
    linkSelection.style("opacity", l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.1);

    // Zoom into the clicked node
    const svg = svgSelectionRef.current;
    const zoom = d3.zoom().scaleExtent([0.5, 5]);

    const [x, y] = d3.pointer(event, svg.node());
    svg.transition()
      .duration(750)
      .call(
        zoom.scaleBy,
        2,
        [x, y]
      );
  }

  function handleBacktrack() {
    const nodes = nodesRef.current;
    const links = linksRef.current;
    const history = historyRef.current;
    const simulation = simulationRef.current;
    const nodeSelection = nodeSelectionRef.current;
    const linkSelection = linkSelectionRef.current;

    if (history.length === 0) {
      // No previous state to backtrack to
      return;
    }

    // Pop the last state from the history stack
    const lastState = history.pop();

    // Restore nodes and links
    nodesRef.current = lastState.nodes;
    linksRef.current = lastState.links.map(link => ({
      ...link,
      source: nodesRef.current.find(node => node.id === link.source),
      target: nodesRef.current.find(node => node.id === link.target),
    }));

    // Update the simulation
    simulation.nodes(nodesRef.current);
    simulation.force("link").links(linksRef.current);

    // Restart the simulation
    simulation.alpha(1).restart();

    // Update the graph
    updateGraph();

    // Reset opacity of all nodes and links
    nodeSelection.style("opacity", 1);
    linkSelection.style("opacity", 1);
  }

  // Function to show tooltip with embedded tweet
  function showTooltip(event, d) {
    const tooltip = tooltipRef.current;

    // Clear previous content
    tooltip.innerHTML = '';

    // Set the innerHTML to the node's tweet HTML
    tooltip.innerHTML = d.tweet;

    // Position the tooltip
    const [x, y] = d3.pointer(event, svgRef.current);
    tooltip.style.left = `${x + 20}px`;
    tooltip.style.top = `${y + 20}px`;
    tooltip.style.display = 'block';

    // Load the tweet
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load(tooltip);
    }
  }

  // Function to hide tooltip
  function hideTooltip() {
    const tooltip = tooltipRef.current;
    tooltip.style.display = 'none';
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={handleBacktrack}>Backtrack</button>
      <svg ref={svgRef}></svg>
      {/* Tooltip div */}
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          display: 'none',
          pointerEvents: 'none',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '4px',
          zIndex: 10,
          maxWidth: '350px',
        }}
      ></div>
    </div>
  );
};

export default ForceGraph;
