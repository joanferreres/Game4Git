import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { GitCommit as GitCommitIcon } from "lucide-react";

interface GitCommitNodeProps {
  data: {
    label: string;
    branch: string;
    isHead: boolean;
    isSelected: boolean;
    branchNames: string[];
    isBranchHead: boolean;
    width: number;
    height: number;
    hasConflict?: boolean;
  };
}

const GitCommitNode: React.FC<GitCommitNodeProps> = ({ data }) => {
  const { 
    label, 
    branch, 
    isHead, 
    isSelected, 
    branchNames, 
    isBranchHead,
    width = 56, 
    height = 56,
    hasConflict
  } = data;
  
  // Truncate commit message for display
  const shortMessage = label.length > 20
    ? label.substring(0, 17) + '...'
    : label;

  // Determine node style based on branch
  const getBgColor = () => {
    if (isHead) return 'bg-yellow-600';
    if (hasConflict) return 'bg-orange-600';
    if (branch === 'master') return 'bg-green-600';
    return 'bg-blue-600';
  };
  
  const getTextColor = () => {
    return 'text-white';
  };
  
  const getBorderColor = () => {
    if (isHead) return 'border-yellow-500';
    if (hasConflict) return 'border-orange-500';
    if (isSelected) return 'border-white';
    return 'border-gray-500';
  };

  // Calculate font size based on node width
  const fontSize = width <= 42 ? 'text-[8px]' : width <= 48 ? 'text-[10px]' : 'text-xs';
  const iconSize = width <= 42 ? 12 : width <= 48 ? 14 : 16;
  
  // Calculate badge sizes
  const badgeClass = width <= 42 
    ? 'text-[8px] px-1 py-0.5' 
    : width <= 48 
      ? 'text-[9px] px-1.5 py-0.5' 
      : 'text-xs px-2 py-0.5';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`
              node relative flex items-center justify-center
              ${isSelected ? 'node-active' : ''}
              rounded-full border-2
              ${getBgColor()}
              ${getBorderColor()}
              ${isSelected ? 'ring-2 ring-white' : ''}
              cursor-pointer transition-colors duration-200
            `}
            style={{ width: `${width}px`, height: `${height}px` }}
          >
            <div className={`flex flex-col items-center justify-center ${getTextColor()}`}>
              <GitCommitIcon size={iconSize} />
            </div>
            
            {/* Branches */}
            {isBranchHead && (
              <div className="absolute -top-7 sm:-top-8 md:-top-9 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1">
                {branchNames.map((label) => (
                <Badge 
                  key={label} 
                    className={`${badgeClass} font-medium shadow-sm
                    ${label === 'master' ? 'bg-green-600' : 
                    label.toLowerCase().includes('someone') || label.toLowerCase().includes('else') ? 'bg-orange-600' : 'bg-blue-600'}`}
                >
                  {label}
                </Badge>
              ))}
            </div>
            )}
            
            {/* Commit message */}
            {shortMessage && (
              <div className={`absolute -bottom-6 sm:-bottom-7 md:-bottom-8 left-1/2 transform -translate-x-1/2 ${fontSize} whitespace-nowrap text-muted-foreground max-w-[80px] sm:max-w-[120px] truncate`}>
                {shortMessage}
              </div>
            )}
            
            {/* HEAD indicator */}
            {isHead && (
              <div className={`absolute top-[100%] right-0 px-1 py-0.5 rounded-sm bg-amber-500/10 text-amber-600 ${fontSize} font-semibold`}>
                HEAD
              </div>
            )}
            
            {/* Connection points */}
            <Handle
              type="target"
              position={Position.Left}
              style={{ opacity: 0 }}
              isConnectable={false}
            />
            <Handle
              type="source"
              position={Position.Right}
              style={{ opacity: 0 }}
              isConnectable={false}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
          <p className="text-xs text-muted-foreground">Branch: {branch}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GitCommitNode;
