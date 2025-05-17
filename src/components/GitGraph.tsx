import React, { useCallback, useMemo } from "react";
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

// Position constants
const NODE_WIDTH = 56;
const NODE_HEIGHT = 56;
const HORIZONTAL_SPACING = 180;
const VERTICAL_SPACING = 100;

const GitGraph: React.FC = () => {
  const { repository, selectedCommitId, selectCommit } = useGitStore();
  const { t } = useTranslation();
  
  const { nodes, edges } = useMemo(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    if (!repository.commits.length) return { nodes: newNodes, edges: newEdges };

    // Sort commits by timestamp (older first)
    const sortedCommits = [...repository.commits].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    const commitMap: Record<string, GitCommit> = {};
    sortedCommits.forEach(commit => (commitMap[commit.id] = commit));

    // Track which commit belongs to which branch
    const commitBranch: Record<string, string> = {};
    
    // Map commitId to its position
    const nodePositions: Record<string, { x: number; y: number }> = {};
    
    // Track branch Y-positions
    const branchLanes: Record<string, number> = {
      "master": 0 // Master branch is always on lane 0
    };
    
    // Track X position of last commit on each lane
    const laneLastX: Record<number, number> = {
      0: -HORIZONTAL_SPACING // Start master lane at X=0 (after adding spacing for first commit)
    };
    
    let nextLaneY = VERTICAL_SPACING; // Next available lane (Y position)

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
        laneLastX[nextLaneY] = -HORIZONTAL_SPACING; // Initialize lane's last X position
        nextLaneY += VERTICAL_SPACING;
      }
    });

    // Helper function to determine which branch a commit belongs to
    const determineBranchForCommit = (commit: GitCommit): string => {
      // If this commit is the head of any branch, it belongs to that branch
      const headBranches = branchHeads[commit.id] || [];
      
      // First check if this commit is the head of any branch
      if (headBranches.length > 0) {
        // Prioritize master if it's a head of master
        if (headBranches.includes("master")) return "master";
        // Otherwise, use the first branch it's head of
        return headBranches[0];
      }
      
      // If this is a merge commit, consider it part of the target branch
      if (commit.parentIds.length > 1) {
        // Find the active branch at the time this commit was created
        const activeBranch = repository.branches.find(b => b.isActive && b.commitId === commit.id);
        if (activeBranch) return activeBranch.name;
        
        // Try to find a branch that has this commit as its head
        const branchHead = repository.branches.find(b => b.commitId === commit.id);
        if (branchHead) return branchHead.name;
        
        // If still undetermined, assume it's in the same branch as the first parent
        const firstParentBranch = commitBranch[commit.parentIds[0]];
        if (firstParentBranch) return firstParentBranch;
      }
      
      // For non-merge commits with one parent
      if (commit.parentIds.length === 1) {
        const parentId = commit.parentIds[0];
        const parentBranch = commitBranch[parentId];
        
        // Check if this commit is the head of a branch
        const currentBranch = repository.branches.find(b => b.commitId === commit.id);
        if (currentBranch) return currentBranch.name;
        
        // Find the active branch at commit time
        const activeBranch = repository.branches.find(b => b.isActive);
        
        // Important: Check the branch ancestry
        // This is the key fix: Every commit in a non-master branch should stay in that branch
        // until a merge happens
        if (activeBranch && activeBranch.name !== "master") {
          // Check if the parent commit belongs to the same branch
          const parentInActiveBranch = commitMap[parentId] && 
                                      commitBranch[parentId] === activeBranch.name;
          
          // Check if this is part of an active branch's history
          if (parentInActiveBranch || 
              (repository.branches.find(b => b.name === activeBranch.name)?.commitId === commit.id)) {
            return activeBranch.name;
          }
          
          // Check if parent is from a different branch - this could be a branch point
          if (parentBranch && parentBranch !== activeBranch.name) {
            // This commit is on a different branch than its parent
            return activeBranch.name;
          }
        }
        
        // If parent exists and we didn't determine another branch, use parent's branch
        if (parentBranch) return parentBranch;
      }
      
      // Initial commit or fallback to master
      return "master";
    };

    // First pass: Determine which branch each commit belongs to
    sortedCommits.forEach(commit => {
      commitBranch[commit.id] = determineBranchForCommit(commit);
    });

    // Second pass: Position commits
    sortedCommits.forEach(commit => {
      const branch = commitBranch[commit.id];
      
      // Ensure the branch has a lane assigned
      if (branchLanes[branch] === undefined && branch !== "master") {
        branchLanes[branch] = nextLaneY;
        laneLastX[nextLaneY] = -HORIZONTAL_SPACING; // Initialize lane's last X position
        nextLaneY += VERTICAL_SPACING;
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
          commitX = parentPos.x + HORIZONTAL_SPACING;
          
          // But maintain the vertical position based on its branch
          // This is key: we're ignoring parentPos.y and using the branch's assigned lane
          commitY = branchLanes[branch];
          
          // For the first commit in a branch (branch point), make sure it's positioned correctly
          if (branch !== parentBranch) {
            // If this is the first commit in a different branch than its parent,
            // make sure it's at least as far right as any other commit in this lane
            commitX = Math.max(commitX, (laneLastX[commitY] || 0) + HORIZONTAL_SPACING);
          } else {
            // For commits continuing on the same branch, position after the latest commit on that branch
            commitX = Math.max(commitX, (laneLastX[commitY] || 0) + HORIZONTAL_SPACING);
          }
        } else {
          // Fallback if parent position not available (shouldn't happen with sorted commits)
          commitX = (laneLastX[commitY] || 0) + HORIZONTAL_SPACING;
        }
      } else {
        // Merge commit - position after all parents
        let maxParentX = 0;
        
        // Find the maximum X position of all parents
        commit.parentIds.forEach(parentId => {
          const parentPos = nodePositions[parentId];
          if (parentPos) {
            maxParentX = Math.max(maxParentX, parentPos.x);
          }
        });
        
        // Position merge commit after the furthest parent
        commitX = maxParentX + HORIZONTAL_SPACING;
      }
      
      // Update lane's last X position
      laneLastX[commitY] = commitX;
      
      // Store position
      nodePositions[commit.id] = { x: commitX, y: commitY };
      
      // Create node
      newNodes.push({
        id: commit.id,
        type: "commit",
        position: { x: commitX, y: commitY },
        data: {
          commit,
          isHead: commit.id === repository.HEAD,
          isSelected: commit.id === selectedCommitId,
          branchLabels: branchHeads[commit.id] || [],
        },
      });
      
      // Create edges to parents
      commit.parentIds.forEach(parentId => {
        if (nodePositions[parentId]) {
          const parentBranch = commitBranch[parentId];
          const parentPos = nodePositions[parentId];
          const commitPos = nodePositions[commit.id];
          
          // Determine edge type and color based on relationship
          let edgeType = ConnectionLineType.SmoothStep;
          let stroke = "#555"; // Default color
          let animated = false;
          let strokeWidth = 2.5;
          
          // Is this a cross-branch edge?
          const isCrossBranch = parentBranch !== branch;
          
          // Is this a merge edge? (commit has multiple parents)
          const isMergeEdge = commit.parentIds.length > 1;
          
          // Vertical distance between nodes
          const verticalDistance = Math.abs(commitPos.y - parentPos.y);
          
          // Choose edge appearance based on the relationship
          if (parentBranch === "master") {
            stroke = "#22c55e"; // Green for master
          } else if (!isCrossBranch && branch !== "master") {
            // Determine branch type based on name
            if (branch.toLowerCase().includes("someone") || branch.toLowerCase().includes("else")) {
              stroke = "#f97316"; // Orange for "Someone Else's Work"
            } else {
              stroke = "#3b82f6"; // Blue for "Your Work"
            }
          } else {
            // This is either a branch-point or a merge
            stroke = "#9333ea"; // Purple for cross-branch
            
            // If it's a significant vertical jump, make it more obvious
            if (verticalDistance > 0) {
              strokeWidth = 3;
              // Animate merge edges for visual distinction
              if (isMergeEdge) {
                animated = true;
              }
            }
          }
          
          // Create edge
          newEdges.push({
            id: `${parentId}->${commit.id}`,
            source: parentId,
            target: commit.id,
            type: edgeType,
            animated: animated,
            style: {
              strokeWidth: strokeWidth,
              stroke: stroke,
            },
          });
        }
      });
    });

    return { nodes: newNodes, edges: newEdges };
  }, [repository, selectedCommitId]);

  const onNodeClick = useCallback(
    (_, node) => {
      selectCommit(node.id);
    },
    [selectCommit]
  );

  return (
    <Card className="w-full h-full overflow-hidden">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm">{t('gitGraph.title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-48px)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          minZoom={0.2}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          attributionPosition="bottom-right"
          connectionLineType={ConnectionLineType.SmoothStep}
          className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
        >
          <Background gap={16} color="#aaa" variant={BackgroundVariant.Dots} />
          <Controls className="bg-card shadow-md border-border" />
          <Panel position="top-right" className="bg-card shadow-md border-border rounded-md p-2">
            <div className="text-xs flex gap-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span>{t('gitGraph.master')}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                <span>{t('gitGraph.yourWork')}</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                <span>{t('gitGraph.head')}</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </CardContent>
    </Card>
  );
};

export default GitGraph;
