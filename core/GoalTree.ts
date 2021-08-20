import { link } from 'fs';
import { GoalModel, GoalNode, GoalNodeTree, Link } from './definitions/goal-model.types';


interface NodeSet {
  [index: string]: Node
}

export class Node {
  parent: Node | null
  children: Node[]
  goalData: GoalNode
  parentRelation: string;

  constructor(parent: Node | null = null, goalData: GoalNode | null = null) {
    this.parent = parent
    this.parentRelation = '';
    this.children = []
    // @ts-ignore
    this.goalData = goalData
  }

  addParent(parent: Node) {
    this.parent = parent;
  }

  addChildren(child: Node) {
    this.children.push(child)
  }

  addGoalData(goalData: GoalNode) {
    this.goalData = goalData
  }
}

export class GoalTree {

  root: Node;
  _nodeSet: NodeSet;
  constructor() {
    this.root = new Node(null)
    this._nodeSet = {}
  }

  get() {
    return this.root;
  }
  buildTree(nodes: GoalNode[], links: Link[]) {

    const nodeSet: NodeSet = {}

    const root = nodes.shift() as GoalNode

    this.root.addGoalData(root)
    nodeSet[root.id] = this.root;

    nodes.forEach((node) => {
      nodeSet[node.id] = new Node(null, node);
    })

    Object.keys(nodeSet).forEach((nodeId) => {
      const currentNode = nodeSet[nodeId];

      const parentLink = links.find(link => link.source == nodeId)
      if (parentLink) {
        currentNode.addParent(nodeSet[parentLink.target])
        currentNode.parentRelation = parentLink.type
      }

      const childrenLinks = links.filter(link => link.target == nodeId)
      childrenLinks.forEach(childrenLink => currentNode.addChildren(nodeSet[childrenLink.source]))

    });

    this._nodeSet = nodeSet
  }
}
