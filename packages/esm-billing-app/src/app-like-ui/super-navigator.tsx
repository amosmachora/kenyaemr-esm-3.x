import { CarbonIconType } from '@carbon/react/icons';
import { Route } from './utils';

export class SuperNavigatorNode {
  icon: CarbonIconType | string;
  text: string;
  link: string;
  children: SuperNavigatorNode[];

  constructor(icon: CarbonIconType | string, text: string, link: string) {
    this.icon = icon;
    this.text = text;
    this.link = link;
    this.children = [];
  }
}

export class SuperNavigator {
  root: SuperNavigatorNode = null;

  constructor(routes: Route[]) {
    if (routes.length === 0) {
      return;
    }
    const baseRoute: Route = routes.sort((routeA, routeB) => routeA.link.length - routeB.link.length).at(0);
    this.root = new SuperNavigatorNode(baseRoute.icon, baseRoute.text, baseRoute.link);

    const everyOtherRoute = routes.slice(1);

    for (let i = 0; i < everyOtherRoute.length; i++) {
      const route = everyOtherRoute[i];
      this.insertRoute(route);
    }
  }

  findNodeByLink(link: string, root: SuperNavigatorNode): SuperNavigatorNode | null {
    if (link === root.link) {
      return root;
    }

    for (const child of root.children) {
      const result = this.findNodeByLink(link, child);

      if (result) {
        return result;
      }
    }

    return null;
  }

  insertRoute(route: Route) {
    // `${openmrsBase}openmrs/spa/home/providers`
    const linkWithoutLastPart = route.link.slice(0, route.link.lastIndexOf('/')); // ${openmrsBase}openmrs/spa/home
    const parent = this.findNodeByLink(linkWithoutLastPart, this.root);
    parent.children.push(new SuperNavigatorNode(route.icon, route.text, route.link));
  }
}
