"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalTree = exports.Node = void 0;
class Node {
    constructor(parent = null, goalData = null) {
        this.parent = parent;
        this.parentRelation = '';
        this.children = [];
        // @ts-ignore
        this.goalData = goalData;
    }
    addParent(parent) {
        this.parent = parent;
    }
    addChildren(child) {
        this.children.push(child);
    }
    addGoalData(goalData) {
        this.goalData = goalData;
    }
}
exports.Node = Node;
class GoalTree {
    constructor() {
        this.root = new Node(null);
        this._nodeSet = {};
    }
    get() {
        return this.root;
    }
    buildTree(nodes, links) {
        const nodeSet = {};
        const root = nodes.shift();
        this.root.addGoalData(root);
        nodeSet[root.id] = this.root;
        nodes.forEach((node) => {
            nodeSet[node.id] = new Node(null, node);
        });
        Object.keys(nodeSet).forEach((nodeId) => {
            const currentNode = nodeSet[nodeId];
            const parentLink = links.find(link => link.source == nodeId);
            if (parentLink) {
                currentNode.addParent(nodeSet[parentLink.target]);
                currentNode.parentRelation = parentLink.type;
            }
            const childrenLinks = links.filter(link => link.target == nodeId);
            childrenLinks.forEach(childrenLink => currentNode.addChildren(nodeSet[childrenLink.source]));
        });
        this._nodeSet = nodeSet;
    }
}
exports.GoalTree = GoalTree;
