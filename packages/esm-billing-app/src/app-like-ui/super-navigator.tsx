import { CarbonIconType } from '@carbon/react/icons';
import { Route } from './utils';

export type SuperNavigatorIconType = 'hard-coded' | 'loaded' | 'letter' | 'svg';

export class SuperNavigatorIcon {
  icon: CarbonIconType | string;
  type: SuperNavigatorIconType;

  constructor(icon: CarbonIconType | string, type: SuperNavigatorIconType) {
    this.icon = icon;
    this.type = type;
  }
}

export class SuperNavigatorNode {
  icon: SuperNavigatorIcon;
  text: string;
  link: string;
  children: SuperNavigatorNode[];

  constructor(icon: CarbonIconType | string, iconType: SuperNavigatorIconType, text: string, link: string) {
    this.icon = new SuperNavigatorIcon(icon, iconType);
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
    this.root = new SuperNavigatorNode(baseRoute.icon, baseRoute.iconType, baseRoute.text, baseRoute.link);

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
    parent.children.push(new SuperNavigatorNode(route.icon, route.iconType, route.text, route.link));
  }
}
