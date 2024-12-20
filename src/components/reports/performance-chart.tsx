import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { format } from 'date-fns';
import { PerformanceData } from '@/types/report';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PerformanceChartProps {
  data: PerformanceData[];
  title: string;
  unit: string;
}

export function PerformanceChart({ data, title, unit }: PerformanceChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current || !containerRef.current || !data.length) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Setup dimensions
    const margin = { top: 20, right: 60, bottom: 50, left: 60 };
    const width = containerRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.date)) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.value) * 0.9,
        d3.max(data, d => d.value) * 1.1
      ] as [number, number])
      .range([height, 0]);

    // Create line generator
    const line = d3.line<PerformanceData>()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    svg.append('g')
      .call(d3.axisLeft(yScale));

    // Add y-axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(unit);

    // Add the line path
    const path = svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Calculate total length for animation
    const totalLength = path.node()?.getTotalLength() || 0;

    // Animate the line drawing
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    // Add data points
    const dots = svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'dot')
      .attr('transform', d => `translate(${xScale(new Date(d.date))},${yScale(d.value)})`);

    // Add circles for data points
    dots.append('circle')
      .attr('r', 5)
      .attr('fill', d => {
        switch (d.performanceLevel) {
          case 'excellent':
            return '#22c55e';
          case 'median':
            return '#eab308';
          default:
            return '#ef4444';
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Find best performance
    const bestPerformance = data.reduce((best, current) => 
      current.value > best.value ? current : best
    );

    // Highlight best performance
    svg.append('circle')
      .attr('cx', xScale(new Date(bestPerformance.date)))
      .attr('cy', yScale(bestPerformance.value))
      .attr('r', 8)
      .attr('fill', 'none')
      .attr('stroke', '#22c55e')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3,3');

    // Add tooltip
    const tooltip = d3.select(tooltipRef.current);
    
    dots
      .on('mouseover', (event, d) => {
        const [x, y] = d3.pointer(event);
        
        tooltip
          .style('display', 'block')
          .style('left', `${x + margin.left + 10}px`)
          .style('top', `${y + margin.top - 10}px`)
          .html(`
            <div class="font-medium">${format(new Date(d.date), 'MMM d, yyyy')}</div>
            <div>${d.value} ${unit}</div>
            <div class="capitalize">${d.performanceLevel.replace('_', ' ')}</div>
          `);
      })
      .on('mouseout', () => {
        tooltip.style('display', 'none');
      });

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 5])
      .extent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        const newXScale = event.transform.rescaleX(xScale);
        svg.select('.x-axis').call(d3.axisBottom(newXScale));
        
        path.attr('d', line.x(d => newXScale(new Date(d.date))));
        
        dots.attr('transform', d => 
          `translate(${newXScale(new Date(d.date))},${yScale(d.value)})`
        );
      });

    svg.call(zoom as any);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const newWidth = containerRef.current.clientWidth - margin.left - margin.right;
      
      svg
        .attr('width', newWidth + margin.left + margin.right)
        .select('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      
      xScale.range([0, newWidth]);
      
      svg.select('.x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));
      
      path.attr('d', line);
      
      dots.attr('transform', d => 
        `translate(${xScale(new Date(d.date))},${yScale(d.value)})`
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, unit]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      
      <div ref={containerRef} className="relative">
        <svg ref={svgRef} className="w-full" />
        <div
          ref={tooltipRef}
          className="absolute hidden bg-white p-2 rounded-lg shadow-lg border border-gray-200 text-sm"
          style={{ pointerEvents: 'none' }}
        />
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const svg = d3.select(svgRef.current);
            svg.call((d3.zoom() as any).transform, d3.zoomIdentity);
          }}
        >
          Reset Zoom
        </Button>
      </div>
    </div>
  );
}