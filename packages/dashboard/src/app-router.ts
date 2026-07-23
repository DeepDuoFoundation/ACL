export interface DashboardRoute {
  path: string;
  title: string;
  description: string;
  componentName: string;
}

export const DASHBOARD_ROUTES: DashboardRoute[] = [
  {
    path: "/",
    title: "Platform Overview",
    description: "Executive KPIs, active swarm jobs, and cluster status",
    componentName: "OverviewView",
  },
  {
    path: "/epe",
    title: "EPE & Contour Viewer",
    description: "Interactive Edge Placement Error heatmap and PV-band plots",
    componentName: "EPEViewer",
  },
  {
    path: "/pareto",
    title: "Multi-Objective Pareto Front",
    description: "7-Objective trade-off curve across CD, EPE, PW, and cost",
    componentName: "ParetoFrontView",
  },
  {
    path: "/kg",
    title: "Knowledge Graph Explorer",
    description: "Cross-tape-out pattern genealogy and causal network graph",
    componentName: "KnowledgeGraphExplorer",
  },
  {
    path: "/hitl",
    title: "HITL Approval Queue",
    description: "Human-in-the-Loop decision review and mask release sign-offs",
    componentName: "HITLApprovalQueue",
  },
  {
    path: "/reports",
    title: "Autonomous Report Generator",
    description: "7-type automated engineering report generator and downloader",
    componentName: "ReportGeneratorView",
  },
];

export class AppRouterRegistry {
  getRoutes(): DashboardRoute[] {
    return [...DASHBOARD_ROUTES];
  }

  getRouteByPath(path: string): DashboardRoute | undefined {
    return DASHBOARD_ROUTES.find((r) => r.path === path);
  }
}
