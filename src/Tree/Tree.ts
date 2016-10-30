class Tree<T extends TreeRow> {
	private static nodeSize = 1;
	private static siblingDistance = 0.0;
	private static treeDistance = 0.0;

	public root: TreeNode<T>;

	constructor(treeNodes: Array<T>) {
		this.root = this.buildTree(treeNodes);
	}

	public build() {
		Tree.initializeNodes(this.root);
		Tree.calculateInitialX(this.root);
		Tree.calculateFinalPositions(this.root);

		return this;
	}

	private static initializeNodes<T extends TreeRow>(node: TreeNode<T>, depth: number = 0) {
		node.x = -1;
		node.y = depth;
		node.mod = 0;

		for (const child of node.children) {
			Tree.initializeNodes(child, depth + 1);
		}
	}

	private static calculateInitialX<T extends TreeRow>(node: TreeNode<T>) {
		for (const child of node.children) {
			 Tree.calculateInitialX(child);
		}

		if (node.isLeaf()) {
			// if there is a previous sibling in this set, set X to prevous sibling + designated distance
			if (!node.isLeftMost())
				node.x = node.getPreviousSibling().x + Tree.nodeSize + Tree.siblingDistance;
			else
				// if this is the first node in a set, set X to 0
				node.x = 0;
		}
		else if (node.children.length === 1) {
			// if this is the first node in a set, set it's X value equal to it's child's X value
			if (node.isLeftMost()) {
				node.x = node.children[0].x;
			} else {
				node.x = node.getPreviousSibling().x + Tree.nodeSize + Tree.siblingDistance;
				node.mod = node.x - node.children[0].x;
			}
		} else {
			const leftChild = node.getLeftMostChild(), rightChild = node.getRightMostChild(), mid = (leftChild.x + rightChild.x) / 2;

			if (node.isLeftMost()) {
				node.x = mid;
			} else {
				node.x = node.getPreviousSibling().x + Tree.nodeSize + Tree.siblingDistance;
				node.mod = node.x - mid;
			}
		}

		if (node.children.length > 0 && !node.isLeftMost()) {
			// Since subtrees can overlap, check for conflicts and shift tree right if needed
			Tree.checkForConflicts(node);
		}
	}

	private static calculateFinalPositions<T extends TreeRow>(node: TreeNode<T>, modSum: number = 0) {
		node.x += modSum;
		modSum += node.mod;

		for (const child of node.children) {
			Tree.calculateFinalPositions(child, modSum);
		}

		if (node.children.length < 1) {
			node.width = node.x;
			node.height = node.y;
		}
		else {
			node.width = node.children.sort((p1, p2) => p2.width - p1.width)[0].width;
			node.height = node.children.sort((p1, p2) => p2.height - p1.height)[0].height;
		}
	}

	private static checkForConflicts<T extends TreeRow>(node: TreeNode<T>) {
		const nodeContour: IDictionary = new Dictionary([]);

		Tree.getLeftContour(node, 0, nodeContour);

		const minDistance = Tree.treeDistance + Tree.nodeSize;
		let sibling = node.getLeftMostSibling(), shiftValue = 0.0;
		while (sibling != null && sibling !== node) {
			const siblingContour: IDictionary = new Dictionary([]);
			Tree.getRightContour(sibling, 0, siblingContour);

			for (let level = node.y + 1; level <= Math.min(Math.max.apply(null, siblingContour.keys()), Math.max.apply(null, nodeContour.keys())); level++) {
				const distance = nodeContour[level] - siblingContour[level];
				if (distance + shiftValue < minDistance) {
					shiftValue = minDistance - distance;
				}
			}

			if (shiftValue > 0) {
				node.x += shiftValue;
				node.mod += shiftValue;

				Tree.centerNodesBetween(node, sibling);

				shiftValue = 0;
			}

			sibling = sibling.getNextSibling();
		}
	}

	private static getLeftContour<T extends TreeRow>(node: TreeNode<T>, modSum: number, values: IDictionary) {
		if (!values.containsKey(node.y))
			values.add(node.y, node.x + modSum);
		else
			values[node.y] = Math.min(values[node.y], node.x + modSum);

		modSum += node.mod;

		for (const child of node.children) {
			Tree.getLeftContour(child, modSum, values);
		}
	}

	private static getRightContour<T extends TreeRow>(node: TreeNode<T>, modSum: number, values: IDictionary) {
		if (!values.containsKey(node.y))
			values.add(node.y, node.x + modSum);
		else
			values[node.y] = Math.max(values[node.y], node.x + modSum);

		modSum += node.mod;
		for (const child of node.children) {
			Tree.getRightContour(child, modSum, values);
		}
	}

	private static centerNodesBetween(leftNode: TreeNode<TreeRow>, rightNode: TreeNode<TreeRow>) {
		const leftIndex = leftNode.parent.children.indexOf(rightNode);
		const rightIndex = leftNode.parent.children.indexOf(leftNode);
		const numNodesBetween = (rightIndex - leftIndex) - 1;

		if (numNodesBetween > 0) {
			const distanceBetweenNodes = (leftNode.x - rightNode.x) / (numNodesBetween + 1);
			for (let i = leftIndex + 1; i < rightIndex; i++) {
				const middleNode = leftNode.parent.children[i];
				const desiredX = rightNode.x + (distanceBetweenNodes * (i - leftIndex));
				const offset = desiredX - middleNode.x;
				middleNode.x += offset;
				middleNode.mod += offset;
			}

			Tree.checkForConflicts(leftNode);
		}
	}

	// Build tree as linked list and return root node.
	private buildTree(data: Array<T>): TreeNode<T> {
		const root = data.filter(x => { return x.parentId === null || x.parentId === 0; })[0];
		if (root === null) {
			throw new Error("Data contains no root node. Root node has 'parentId' set to null.");
		}
		
		const rootTreeNode = new TreeNode<T>(root);
		rootTreeNode.children = Tree.getChildrenNodes<T>(data, rootTreeNode);

		return rootTreeNode;
	}

	private static getChildrenNodes<T extends TreeRow>(data: Array<T>, parent: TreeNode<T>): Array<TreeNode<T>> {
		const nodes = new Array<TreeNode<T>>();
		for (const item of data.filter(x => x.parentId === parent.item.id)) {
			const treeNode = new TreeNode<T>(item, parent);
			treeNode.children = Tree.getChildrenNodes(data, treeNode);
			nodes.push(treeNode);
		}

		return nodes;
	}
}
