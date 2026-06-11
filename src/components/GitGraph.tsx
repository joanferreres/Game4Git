import React, { useCallback, useMemo, useRef, useTransition } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  NodeTypes,
  ConnectionLineType,
  Node,
  Edge,
  Panel,
  BackgroundVariant
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useGitStore from "@/store/gitStore";
import GitCommitNode from "./GitCommitNode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCommit } from "@/types/git";
import { useTranslation } from "react-i18next";

// Define custom node types
const nodeTypes: NodeTypes = {
  commit: GitCommitNode,
};

// Position constants - responsive values based on screen size
const NODE_WIDTH = 56;
const NODE_HEIGHT = 56;
const HORIZONTAL_SPACING = 180;
const VERTICAL_SPACING = 100;

// Helper to get responsive spacing
const getResponsiveSpacing = () => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth < 640) { // mobile
      return {
        horizontal: 120,
        vertical: 70,
        nodeWidth: 42,
        nodeHeight: 42,
      };
    } else if (window.innerWidth < 1024) { // tablet
      return {
        horizontal: 150,
        vertical: 85,
        nodeWidth: 48,
        nodeHeight: 48,
      };
    }
  }
  
  // desktop default
  return {
    horizontal: HORIZONTAL_SPACING,
    vertical: VERTICAL_SPACING,
    nodeWidth: NODE_WIDTH,
    nodeHeight: NODE_HEIGHT,
  };
};

const GitGraph: React.FC = () => {
  const { repository, selectedCommitId, selectCommit } = useGitStore();
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();
  
  // Cache for branch lanes and commit positions to ensure stability
  const branchLanesCache = useRef<Record<string, number>>({
    "master": 0
  });
  const commitBranchCache = useRef<Record<string, string>>({});
  
  const { nodes, edges } = useMemo(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    if (!repository.commits.length) return { nodes: newNodes, edges: newEdges };

    // Get responsive spacing for current screen size
    const { horizontal, vertical, nodeWidth, nodeHeight } = getResponsiveSpacing();

    // Sort commits by timestamp (older first)
    const sortedCommits = [...repository.commits].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    const commitMap: Record<string, GitCommit> = {};
    sortedCommits.forEach(commit => (commitMap[commit.id] = commit));

    // Track which commit belongs to which branch
    // Initialize with cached branch assignments if available
    const commitBranch: Record<string, string> = { ...commitBranchCache.current };
    
    // Map commitId to its position
    const nodePositions: Record<string, { x: number; y: number }> = {};
    
    // Track branch Y-positions - use cached positions to maintain stability
    const branchLanes: Record<string, number> = { ...branchLanesCache.current };
    
    // Track X position of last commit on each lane
    const laneLastX: Record<number, number> = {};
    Object.values(branchLanes).forEach(laneY => {
      laneLastX[laneY] = -horizontal;
    });
    
    let nextLaneY = vertical;
    // Find the highest lane Y value to continue from
    if (Object.values(branchLanes).length > 0) {
      nextLaneY = Math.max(...Object.values(branchLanes)) + vertical;
    }

    // Map commit IDs to branches they are the head of
    const branchHeads: Record<string, string[]> = {};
    repository.branches.forEach(branch => {
      if (!branchHeads[branch.commitId]) {
        branchHeads[branch.commitId] = [];
      }
      branchHeads[branch.commitId].push(branch.name);
      
      // Assign initial branch Y positions (except master which is already set)
      if (branch.name !== "master" && branchLanes[branch.name] === undefined) {
        branchLanes[branch.name] = nextLaneY;
        laneLastX[nextLaneY] = -horizontal; // Initialize lane's last X position
        nextLaneY += vertical;
      }
    });

    // Helper function to determine which branch a commit belongs to
    const determineBranchForCommit = (commit: GitCommit): string => {
      // Check if we have a cached assignment for this commit
      if (commitBranchCache.current[commit.id]) {
        return commitBranchCache.current[commit.id];
      }
      
      // First check if this commit is the head of any branch
      const headBranches = branchHeads[commit.id] || [];
      if (headBranches.length > 0) {
        // Prioritize master if it's a head of master
        if (headBranches.includes("master")) return "master";
        // Otherwise, use the first branch it's head of
        return headBranches[0];
      }
      
      // If this is a merge commit, consider it part of the target branch
      if (commit.parentIds.length > 1) {
        // Try to find which branch has this commit as its head
        const branchHead = repository.branches.find(b => b.commitId === commit.id);
        if (branchHead) return branchHead.name;
        
        // Default to the first parent's branch
        const firstParentBranch = commitBranch[commit.parentIds[0]];
        if (firstParentBranch) return firstParentBranch;
      }
      
      // For regular commits with one parent
      if (commit.parentIds.length === 1) {
        const parentId = commit.parentIds[0];
        const parentBranch = commitBranch[parentId];
        
        // Check if this commit is the head of a branch
        const currentBranch = repository.branches.find(b => b.commitId === commit.id);
        if (currentBranch) return currentBranch.name;
        
        // If parent exists, use parent's branch - this ensures commits stay in their original branch
        if (parentBranch) return parentBranch;
        
        // If no parent branch found, try to use active branch (for new commits)
        const activeBranch = repository.branches.find(b => b.isActive);
        if (activeBranch) return activeBranch.name;
        }
        
      // Initial commit or fallback
      return "master";
    };

    // First pass: Determine which branch each commit belongs to
    sortedCommits.forEach(commit => {
      commitBranch[commit.id] = determineBranchForCommit(commit);
      // Cache this assignment for future stability
      commitBranchCache.current[commit.id] = commitBranch[commit.id];
    });
    
    // Update branch lanes cache for future renders
    branchLanesCache.current = { ...branchLanes };

    // Second pass: Position commits
    sortedCommits.forEach(commit => {
      const branch = commitBranch[commit.id];
      
      // Ensure the branch has a lane assigned
      if (branchLanes[branch] === undefined && branch !== "master") {
        branchLanes[branch] = nextLaneY;
        laneLastX[nextLaneY] = -horizontal; // Initialize lane's last X position
        nextLaneY += vertical;
      }
      
      // Always use the branch's lane for Y position
      const laneY = branchLanes[branch] !== undefined ? branchLanes[branch] : 0;
      let commitY = laneY;
      let commitX = 0;
      
      // Calculate X position
      if (commit.parentIds.length === 0) {
        // Initial commit - position at the start
        commitX = 0;
      } else if (commit.parentIds.length === 1) {
        // Regular commit with one parent
        const parentId = commit.parentIds[0];
        const parentPos = nodePositions[parentId];
        const parentBranch = commitBranch[parentId];
        
        if (parentPos) {
          // Always position the commit after its parent horizontally
          commitX = parentPos.x + horizontal;
          
          // But maintain the vertical position based on its branch
          // This is key: we're ignoring parentPos.y and using the branch's assigned lane
          commitY = branchLanes[branch];
          
          // For the first commit in a branch (branch point), make sure it's positioned correctly
          if (branch !== parentBranch) {
            // If this is the first commit in a different branch than its parent,
            // make sure it's at least as far right as any other commit in this lane
            commitX = Math.max(commitX, (laneLastX[commitY] || 0) + horizontal);
          } else {
            // For commits continuing on the same branch, position after the latest commit on that branch
            commitX = Math.max(commitX, (laneLastX[commitY] || 0) + horizontal);
          }
        } else {
          // Fallback if parent not positioned (shouldn't happen with sorted commits)
          commitX = laneLastX[commitY] + horizontal;
        }
      } else if (commit.parentIds.length > 1) {
        // This is a merge commit
        // Position after the latest parent in the target branch
        const parents = commit.parentIds.map(id => {
          const pos = nodePositions[id];
          return { id, x: pos ? pos.x : 0 };
        });
        
        const maxParentX = Math.max(...parents.map(p => p.x));
        commitX = maxParentX + horizontal;
        
        // Use the lane of the selected branch for this commit
        commitY = branchLanes[branch];
        
        // Ensure it's after the last commit in its lane
        commitX = Math.max(commitX, (laneLastX[commitY] || 0) + horizontal);
      }
      
      // Update the latest X position for this lane
      laneLastX[commitY] = commitX;
      
      // Store this node's position
      nodePositions[commit.id] = { x: commitX, y: commitY };
      
      // Create node
      const isBranchHead = repository.branches.some(
        b => b.commitId === commit.id
      );
      
      const branchNames = repository.branches
        .filter(b => b.commitId === commit.id)
        .map(b => b.name);

      const remoteRefNames = repository.remoteReferences
        .filter((ref) => ref.commitId === commit.id)
        .map((ref) => ref.name.replace(/^origin\//, "origin/"));
      
      const isHead = repository.HEAD === commit.id;
      
      // Determine if this commit is a merge commit with resolved conflicts
      const hadConflict = commit.hasConflict || 
        (commit.parentIds.length > 1 && commit.message.includes('Merge branch'));
      
      newNodes.push({
        id: commit.id,
        type: "commit",
        position: { x: commitX, y: commitY },
        data: {
          label: commit.message.slice(0, 20),
          branch,
          isHead,
          isBranchHead,
          branchNames,
          remoteRefNames,
          isSelected: selectedCommitId === commit.id,
          width: nodeWidth,
          height: nodeHeight,
          hasConflict: hadConflict
        },
        style: {
          width: nodeWidth,
          height: nodeHeight,
        },
      });
      
      // Create edges to parents
      commit.parentIds.forEach(parentId => {
        const parentPos = nodePositions[parentId];
        if (parentPos) {
          const parentBranch = commitBranch[parentId];
          
          // Determine if this is a merge edge or a regular edge
          const isMergeEdge = branch !== parentBranch;
          
          newEdges.push({
            id: `${commit.id}-${parentId}`,
            source: parentId,
            target: commit.id,
            style: {
              stroke: isMergeEdge ? "#ff9800" : "#888",
              strokeWidth: isMergeEdge ? 1.5 : 1,
              strokeDasharray: isMergeEdge ? "5 5" : "none",
            },
            
            // Use a bezier curve for merges, and a straight line for direct commits
            type: isMergeEdge ? "smoothstep" : "default",
          });
        }
      });
    });

    return { nodes: newNodes, edges: newEdges };
  }, [repository, selectedCommitId]);

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Use startTransition to mark this update as non-urgent
      // This improves INP by not blocking the main thread
      startTransition(() => {
        selectCommit(node.id);
      });
    },
    [selectCommit, startTransition]
  );

  return (
    <Card className="w-full h-full">
      <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm sm:text-base font-medium">
          {t('git.commitGraph', "Commit Graph")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden h-[calc(100%-2.5rem)]">
        <div className="w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            maxZoom={2}
            minZoom={0.2}
            zoomOnScroll={true}
            panOnScroll={true}
            onNodeClick={handleNodeClick}
            connectionLineType={ConnectionLineType.SmoothStep}
            className="bg-muted/20"
            fitViewOptions={{
              padding: 0.2,
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#aaa" size={1.5} variant={BackgroundVariant.Dots} />
            <Controls
              showInteractive={false}
              className="react-flow__panel react-flow__controls vertical bg-card border-border shadow-md z-10"
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem',
                borderRadius: '0.375rem',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                border: '1px solid var(--border)',
                backdropFilter: 'blur(8px)',
              }}
            />
           
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
};

export default GitGraph;
