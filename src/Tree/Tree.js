var Tree = (function () {
    function Tree(treeNodes) {
        this.root = this.buildTree(treeNodes);
    }
    Tree.prototype.build = function () {
        Tree.initializeNodes(this.root);
        Tree.calculateInitialX(this.root);
        Tree.calculateFinalPositions(this.root);
        return this;
    };
    Tree.initializeNodes = function (node, depth) {
        if (depth === void 0) { depth = 0; }
        node.x = -1;
        node.y = depth;
        node.mod = 0;
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            Tree.initializeNodes(child, depth + 1);
        }
    };
    Tree.calculateInitialX = function (node) {
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
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
            }
            else {
                node.x = node.getPreviousSibling().x + Tree.nodeSize + Tree.siblingDistance;
                node.mod = node.x - node.children[0].x;
            }
        }
        else {
            var leftChild = node.getLeftMostChild(), rightChild = node.getRightMostChild(), mid = (leftChild.x + rightChild.x) / 2;
            if (node.isLeftMost()) {
                node.x = mid;
            }
            else {
                node.x = node.getPreviousSibling().x + Tree.nodeSize + Tree.siblingDistance;
                node.mod = node.x - mid;
            }
        }
        if (node.children.length > 0 && !node.isLeftMost()) {
            // Since subtrees can overlap, check for conflicts and shift tree right if needed
            Tree.checkForConflicts(node);
        }
    };
    Tree.calculateFinalPositions = function (node, modSum) {
        if (modSum === void 0) { modSum = 0; }
        node.x += modSum;
        modSum += node.mod;
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            Tree.calculateFinalPositions(child, modSum);
        }
        if (node.children.length < 1) {
            node.width = node.x;
            node.height = node.y;
        }
        else {
            node.width = node.children.sort(function (p1, p2) { return p2.width - p1.width; })[0].width;
            node.height = node.children.sort(function (p1, p2) { return p2.height - p1.height; })[0].height;
        }
    };
    Tree.checkForConflicts = function (node) {
        var nodeContour = new Dictionary([]);
        Tree.getLeftContour(node, 0, nodeContour);
        var minDistance = Tree.treeDistance + Tree.nodeSize;
        var sibling = node.getLeftMostSibling(), shiftValue = 0.0;
        while (sibling != null && sibling !== node) {
            var siblingContour = new Dictionary([]);
            Tree.getRightContour(sibling, 0, siblingContour);
            for (var level = node.y + 1; level <= Math.min(Math.max.apply(null, siblingContour.keys()), Math.max.apply(null, nodeContour.keys())); level++) {
                var distance = nodeContour[level] - siblingContour[level];
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
    };
    Tree.getLeftContour = function (node, modSum, values) {
        if (!values.containsKey(node.y))
            values.add(node.y, node.x + modSum);
        else
            values[node.y] = Math.min(values[node.y], node.x + modSum);
        modSum += node.mod;
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            Tree.getLeftContour(child, modSum, values);
        }
    };
    Tree.getRightContour = function (node, modSum, values) {
        if (!values.containsKey(node.y))
            values.add(node.y, node.x + modSum);
        else
            values[node.y] = Math.max(values[node.y], node.x + modSum);
        modSum += node.mod;
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            Tree.getRightContour(child, modSum, values);
        }
    };
    Tree.centerNodesBetween = function (leftNode, rightNode) {
        var leftIndex = leftNode.parent.children.indexOf(rightNode);
        var rightIndex = leftNode.parent.children.indexOf(leftNode);
        var numNodesBetween = (rightIndex - leftIndex) - 1;
        if (numNodesBetween > 0) {
            var distanceBetweenNodes = (leftNode.x - rightNode.x) / (numNodesBetween + 1);
            for (var i = leftIndex + 1; i < rightIndex; i++) {
                var middleNode = leftNode.parent.children[i];
                var desiredX = rightNode.x + (distanceBetweenNodes * (i - leftIndex));
                var offset = desiredX - middleNode.x;
                middleNode.x += offset;
                middleNode.mod += offset;
            }
            Tree.checkForConflicts(leftNode);
        }
    };
    // Build tree as linked list and return root node.
    Tree.prototype.buildTree = function (data) {
        var root = data.filter(function (x) { return x.parentId === null || x.parentId === 0; })[0];
        if (root === null) {
            throw new Error("Data contains no root node. Root node has 'parentId' set to null.");
        }
        var rootTreeNode = new TreeNode(root);
        rootTreeNode.children = Tree.getChildrenNodes(data, rootTreeNode);
        return rootTreeNode;
    };
    Tree.getChildrenNodes = function (data, parent) {
        var nodes = new Array();
        for (var _i = 0, _a = data.filter(function (x) { return x.parentId === parent.item.id; }); _i < _a.length; _i++) {
            var item = _a[_i];
            var treeNode = new TreeNode(item, parent);
            treeNode.children = Tree.getChildrenNodes(data, treeNode);
            nodes.push(treeNode);
        }
        return nodes;
    };
    Tree.nodeSize = 1;
    Tree.siblingDistance = 0.0;
    Tree.treeDistance = 0.0;
    return Tree;
}());
//# sourceMappingURL=Tree.js.map