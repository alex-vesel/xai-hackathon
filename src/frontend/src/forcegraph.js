// src/ForceGraph.js
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import axios from 'axios';
import './ForceGraph.css';

const ForceGraph = ({ width = 928, height = 600, graphData }) => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ visible: false, tweetId: null, x: 0, y: 0 });

  // Define refs and state
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const simulationRef = useRef();
  const nodeSelectionRef = useRef();
  const linkSelectionRef = useRef();
  const svgSelectionRef = useRef();
  const colorRef = useRef();
  const zoomRef = useRef();

  const [graphState, setGraphState] = useState(graphData);
  const [lastState, setLastState] = useState(null); // For backtracking
  const nodeIdCounter = useRef(0); // Counter for unique node IDs
  const [focusNode, setFocusNode] = useState(null); // Node to focus on after updates
  const [selectedNode, setSelectedNode] = useState(null); // Node selected for adding similar nodes
  const [isGraphRendered, setIsGraphRendered] = useState(false); // New state to track if graph is rendered

  // Update graphState when graphData prop changes
  useEffect(() => {
    setGraphState(graphData);
  }, [graphData]);

  // Show tooltip with embedded tweet
  function showTooltip(event, d) {
    const [x, y] = d3.pointer(event, svgRef.current);
    const tweetIdMatch = d.url.match(/status\/(\d+)/);
    const tweetId = tweetIdMatch ? tweetIdMatch[1] : null;
    setTooltip({ visible: true, tweetId: tweetId, x: x + 20 , y: y + 20});
  }

  // Hide tooltip
  function hideTooltip() {
    setTooltip({ visible: false, tweetId: null, x: 0, y: 0 });
  }

  useEffect(() => {
    if (!graphState.nodes.length && !graphState.links.length) {
      d3.select(svgRef.current).selectAll("*").remove();
      setIsGraphRendered(false);
      return;
    }

    colorRef.current = d3.scaleOrdinal(d3.schemeCategory10);
    nodesRef.current = graphState.nodes.map(d => ({ ...d }));
    linksRef.current = graphState.links.map(d => ({ ...d }));

    const svg = d3.select(svgRef.current)
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", "auto");

    svg.selectAll("*").remove();
    svgSelectionRef.current = svg;

    const container = svg.append('g');

    // Initialize the simulation
    const simulation = d3.forceSimulation(nodesRef.current)
      .force("link", d3.forceLink(linksRef.current).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    simulationRef.current = simulation;

    // Add zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // Create link and node selections
    linkSelectionRef.current = container.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line");

    nodeSelectionRef.current = container.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle");

    updateGraph();

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

    // After updating the graph, if focusNode is set, adjust opacity and zoom
    if (focusNode) {
      // Adjust opacity
      const connectedNodes = new Set();
      connectedNodes.add(focusNode.id);

      linksRef.current.forEach(l => {
        if (l.source.id === focusNode.id) {
          connectedNodes.add(l.target.id);
        } else if (l.target.id === focusNode.id) {
          connectedNodes.add(l.source.id);
        }
      });

      // Adjust node and link opacity
      nodeSelectionRef.current.style("opacity", n => connectedNodes.has(n.id) ? 1 : 0.1);
      linkSelectionRef.current.style("opacity", l => (l.source.id === focusNode.id || l.target.id === focusNode.id) ? 1 : 0.1);

      // Zoom into the focusNode
      const svg = svgSelectionRef.current;
      const scale = 2; // Adjust as needed
      const x = focusNode.x;
      const y = focusNode.y;

      svg.transition()
        .duration(750)
        .call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(width / 2, height / 2).scale(scale).translate(-x, -y)
        );

      // Reset focusNode
      setFocusNode(null);
    }

    setIsGraphRendered(true);

    return () => simulation.stop();

  }, [width, height, graphState, focusNode]);

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
      .attr("r", 10)
      .attr("fill", d => color(d.group || 1))
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      )
      .on("mouseover", showTooltip)
      .on("mouseout", hideTooltip)
      .on("dblclick", doubleClickedNode) // Add double-click event handler
      .on("click", (event, d) => setSelectedNode(d)); // Add click event handler to select node

    nodeEnter.append("title").text(d => d.id);

    nodeSelection = nodeEnter.merge(nodeSelection);

    nodeSelectionRef.current = nodeSelection;
    linkSelectionRef.current = linkSelection;

    // Restart the simulation with the updated nodes and links
    simulationRef.current.nodes(nodes);
    simulationRef.current.force("link").links(links);
    simulationRef.current.alpha(1).restart();
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

  // Click handler to add new nodes and focus
  function clickedNode(event, d) {
    event.stopPropagation();

    const svgElement = svgRef.current;

    // Save current state for backtracking
    const currentTransform = d3.zoomTransform(svgElement);
    const currentGraphState = {
      nodes: graphState.nodes.map(node => ({ ...node })),
      links: graphState.links.map(link => ({ ...link })),
    };
    setLastState({ transform: currentTransform, graphState: currentGraphState });

    // Add new node and link
    nodeIdCounter.current += 1;
    const newNodeId = `new-node-${nodeIdCounter.current}`;
    const newNode = {
      id: newNodeId,
      group: d.group,
      tweet: d.tweet,
      url: d.url,
    };

    const newLink = {
      source: d.id,
      target: newNodeId,
    };

    // Update graph data
    const updatedNodes = [...graphState.nodes, newNode];
    const updatedLinks = [...graphState.links, newLink];

    // Update state and set focusNode
    setGraphState({ nodes: updatedNodes, links: updatedLinks });
    setFocusNode(d);

    // Save the updated state for backtracking
    setLastState({ transform: currentTransform, graphState: { nodes: updatedNodes, links: updatedLinks } });
  }

  // Add this new function for handling double-clicks
  function doubleClickedNode(event, d) {
    event.stopPropagation();

    const svg = svgSelectionRef.current;
    const scale = 2; // Adjust the scale as needed
    const x = d.x;
    const y = d.y;

    // Highlight the node and its neighbors
    const connectedNodes = new Set();
    connectedNodes.add(d.id);

    linksRef.current.forEach(l => {
      if (l.source.id === d.id) {
        connectedNodes.add(l.target.id);
      } else if (l.target.id === d.id) {
        connectedNodes.add(l.source.id);
      }
    });

    // Change color and opacity of the node and its neighbors
    nodeSelectionRef.current
      .style("fill", n => connectedNodes.has(n.id) ? "orange" : colorRef.current(n.group || 1))
      .style("opacity", n => connectedNodes.has(n.id) ? 1 : 0.1); // Dim non-connected nodes

    linkSelectionRef.current
      .style("stroke", l => (l.source.id === d.id || l.target.id === d.id) ? "orange" : "#999")
      .style("opacity", l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.1); // Dim non-connected links

    svg.transition()
      .duration(750)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(width / 2, height / 2).scale(scale).translate(-x, -y)
      );
    // Get tweet ID from the clicked node
    const tweetIdMatch = d.url.match(/status\/(\d+)/);
    const tweetId = tweetIdMatch ? tweetIdMatch[1] : null;

    
  }

  // New function to highlight nodes by ID
  function highlightNodesById(nodeUrls) {
    const svg = svgSelectionRef.current;

    // Parse the IDs from the URLs
    const nodeIds = new Set();
    nodeUrls.forEach(url => {
      const tweetIdMatch = url.match(/status\/(\d+)/);
      if (tweetIdMatch) {
        const tweetId = tweetIdMatch[1];
        console.log(`Parsed tweet ID: ${tweetId}`);
        nodeIds.add(String(tweetId));
      }
    });

    // Highlight the specified nodes and dim others
    nodeSelectionRef.current
      .style("fill", n => nodeIds.has(n.id) ? "orange" : "gray")
      .style("opacity", n => nodeIds.has(n.id) ? 1 : 0.1); // Dim non-highlighted nodes

    linkSelectionRef.current
      .style("stroke", l => (nodeIds.has(l.source.id) && nodeIds.has(l.target.id)) ? "orange" : "gray")
      .style("opacity", l => (nodeIds.has(l.source.id) && nodeIds.has(l.target.id)) ? 1 : 0.1); // Dim non-highlighted links
  }

  // Reset function
  function handleReset() {
    const svg = d3.select(svgRef.current);

    // Reset opacity and color for nodes
    nodeSelectionRef.current
      .style("fill", d => colorRef.current(d.group || 1))
      .style("opacity", 1);

    // Reset opacity and color for links
    linkSelectionRef.current
      .style("stroke", "#999") // Reset to default stroke color
      .style("opacity", 1);

    // Zoom back out
    svg.transition()
      .duration(750)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity
      );

    // Deselect the focus node
    setFocusNode(null);
  }

  // Function to handle adding similar nodes
  async function handleAddSimilarNodes() {
    if (selectedNode) {
      try {
        const tweetIdMatch = selectedNode.url.match(/status\/(\d+)/);
        const tweetId = tweetIdMatch ? tweetIdMatch[1] : null;

        if (tweetId) {
          const response = await axios.get(`http://0.0.0.0:5001/add_similar_tweets?tweet_id=${tweetId}`);
          const newNodes = response.data;
          const updatedNodes = [...graphState.nodes, ...newNodes.nodes];
          const updatedLinks = [...graphState.links, ...newNodes.links];

          setGraphState({ nodes: updatedNodes, links: updatedLinks });
        }
      } catch (error) {
        console.error('Error adding similar nodes:', error);
      }
    }
  }

  useEffect(() => {
    const handleHighlightNodes = (event) => {
      const { tweetIds } = event.detail;
      highlightNodesById(new Set(tweetIds));
    };

    // Add event listener for custom event
    window.addEventListener('highlightNodes', handleHighlightNodes);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('highlightNodes', handleHighlightNodes);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: `${height}px`, overflow: 'hidden' }}>
      <button
        onClick={handleReset}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
      >
        &#8592; {/* Backwards arrow */}
      </button>
      {isGraphRendered && (
        <button
          onClick={handleAddSimilarNodes}
          style={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}
        >
          +
        </button>
      )}
      <svg ref={svgRef}></svg>
      {tooltip.visible && (
        <div
          className="tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            position: 'absolute',
            width: 300,
            height: 400,
            pointerEvents: 'none',
          }}
        >
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <TwitterTweetEmbed tweetId={tooltip.tweetId} options={{ width: 300, theme: 'dark' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ForceGraph;
