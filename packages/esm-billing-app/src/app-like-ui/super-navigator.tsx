import { CarbonIconType } from '@carbon/react/icons';
import { KnownRoute } from './known-routes';

export class SuperNavigator {
  root: SuperNavigatorNode;

  constructor(routes: KnownRoute[]) {
    const sortedRoutes = routes.sort((a, b) => a.text.length - b.text.length);
    let baseRouteLink = this.getBaseRoute(sortedRoutes.map((route) => route.link));

    const baseRoute = sortedRoutes.find((route) => route.link === baseRouteLink);
    this.root = new SuperNavigatorNode({ icon: baseRoute.icon, link: baseRoute.link, text: baseRoute.text });

    sortedRoutes.forEach((route) => {
      if (route.link !== baseRouteLink) {
        this.addRouteToTree(this.root, route);
      }
    });
  }

  getBaseRoute(strings: string[]) {
    if (strings.length === 0) {
      return '';
    }

    let baseRoute = strings[0];

    for (let i = 1; i < strings.length; i++) {
      while (!strings[i].startsWith(baseRoute)) {
        baseRoute = baseRoute.slice(0, -1);
        if (baseRoute === '') {
          return '';
        }
      }
    }

    return baseRoute;
  }

  addRouteToTree(parent: SuperNavigatorNode, route: KnownRoute) {
    const childNode = parent.findChild(route.link);

    if (childNode) {
      this.addRouteToTree(childNode, route);
    } else if (route.link.startsWith(parent.link)) {
      const newNode = new SuperNavigatorNode({
        icon: route.icon,
        link: route.link,
        text: route.text,
      });
      parent.addChild(newNode);
    }
  }

  getRootChildren() {
    return this.root.children;
  }
}

export class SuperNavigatorNode {
  link: string;
  icon: CarbonIconType;
  text: string;
  children: SuperNavigatorNode[] = [];
  parent: SuperNavigatorNode | null = null;

  constructor(data: { link: string; icon: CarbonIconType; text: string }) {
    this.link = data.link;
    this.icon = data.icon;
    this.text = data.text;
  }

  findChild(link: string): SuperNavigatorNode | undefined {
    return this.children.find((child) => link.startsWith(child.link));
  }

  getSiblings(): Array<SuperNavigatorNode> {
    if (!this.parent) {
      return [];
    }

    return this.parent.children;
  }

  getChildNodes(): Array<SuperNavigatorNode> {
    return this.children;
  }

  addChild(node: SuperNavigatorNode) {
    node.parent = this;
    this.children.push(node);
  }

  isLeafNode(): boolean {
    return this.children.length === 0;
  }
}
