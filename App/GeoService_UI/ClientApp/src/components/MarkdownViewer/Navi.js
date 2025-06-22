import React from "react";
import TreeView from "@mui/lab/TreeView";
import TreeItem from "@mui/lab/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./Styles.css"


const getTreeItemsFromData = treeItems => {
    return ((treeItems || {}).children || []).map(treeItemData => {
        var children;
        if (treeItemData.children && treeItemData.children.length > 0) {
            children = getTreeItemsFromData(treeItemData);
        }
        return (
            <TreeItem
                key={treeItemData.id}
                nodeId={treeItemData.id}
                label={treeItemData.name}
                children={children}
            />
        );
    });
};

export const Navi = ({ treeItems, onSelect, Selected }) => {

    return (
        <TreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            onNodeSelect={onSelect}
        >
            {getTreeItemsFromData(treeItems)}
        </TreeView>
    );
};